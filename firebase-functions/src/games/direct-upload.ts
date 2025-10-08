import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";
import Busboy from "busboy";

// Supported image types for upload
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml"
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Valid upload types and their storage paths
const UPLOAD_TYPES = {
  LOGO: {
    path: "game-logos",
    field: "logoUrl"
  },
  BACKGROUND: {
    path: "game-backgrounds",
    field: "backgroundUrl"
  },
  BANNER: {
    path: "game-banners",
    field: "bannerUrl"
  },
  ASSET: {
    path: "game-assets",
    field: "customAssets"
  }
} as const;

type UploadType = keyof typeof UPLOAD_TYPES;

/**
 * Direct file upload through Firebase Function to avoid CORS issues
 * This function accepts multipart form data with the file
 */
export const directImageUpload = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method not allowed. Only POST requests are supported.'
    });
    return;
  }

  // Extract authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized. Bearer token required.'
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse multipart form data
    const busboy = Busboy({ headers: req.headers });

    let gameId: string | null = null;
    let uploadType: UploadType | null = null;
    let fileName: string | null = null;
    let fileBuffer: Buffer | null = null;
    let mimeType: string | null = null;

    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'gameId') gameId = val;
      if (fieldname === 'uploadType') uploadType = val as UploadType;
      if (fieldname === 'fileName') fileName = val;
    });

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType: fileMimeType } = info;

      if (fieldname === 'file') {
        fileName = fileName || filename;
        mimeType = fileMimeType;

        const chunks: Buffer[] = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      }
    });

    busboy.on('finish', async () => {
      try {
        // Validate required fields
        if (!gameId || !uploadType || !fileName || !fileBuffer || !mimeType) {
          res.status(400).json({
            error: 'Missing required fields: gameId, uploadType, fileName, and file are required.'
          });
          return;
        }

        // Validate upload type
        if (!UPLOAD_TYPES[uploadType]) {
          res.status(400).json({
            error: `Invalid upload type. Must be one of: ${Object.keys(UPLOAD_TYPES).join(", ")}`
          });
          return;
        }

        // Validate file type
        if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
          res.status(400).json({
            error: `Unsupported file type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
          });
          return;
        }

        // Validate file size
        if (fileBuffer.length > MAX_FILE_SIZE) {
          res.status(400).json({
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
          });
          return;
        }

        // Check if the game exists and user owns it
        const gameDoc = await admin.firestore().collection("games").doc(gameId).get();

        if (!gameDoc.exists) {
          res.status(404).json({
            error: "Game not found"
          });
          return;
        }

        const gameData = gameDoc.data();
        if (gameData?.userId !== userId) {
          res.status(403).json({
            error: "You don't have permission to upload images for this game"
          });
          return;
        }

        // Get storage path for this upload type
        const uploadConfig = UPLOAD_TYPES[uploadType];
        const filePath = `${uploadConfig.path}/${gameId}/${fileName}`;

        // Upload file to Cloud Storage
        const bucket = getStorage().bucket();
        const file = bucket.file(filePath);

        // For emulator, we need to use HTTP instead of HTTPS
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' ||
          process.env.FIRESTORE_EMULATOR_HOST !== undefined;

        try {
          await file.save(fileBuffer, {
            metadata: {
              contentType: mimeType,
              metadata: {
                uploadedBy: userId,
                gameId: gameId,
                uploadType: uploadType,
                uploadedAt: new Date().toISOString()
              }
            }
          });

          // Make the file publicly readable
          await file.makePublic();

          let publicUrl: string;

          if (isEmulator) {
            // For emulator environment, use emulator URL
            publicUrl = `http://localhost:9199/trivia-games-7a81b.appspot.com/${filePath}`;
          } else {
            // For production, use actual storage URL
            publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          }

          // Update the game document with the image URL
          const updateData: any = {
            updatedAt: admin.firestore.FieldValue ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
            [uploadConfig.field]: publicUrl
          };

          await admin.firestore().collection("games").doc(gameId).update(updateData);

          // Return success response
          res.status(200).json({
            success: true,
            imageUrl: publicUrl,
            uploadType,
            fieldName: uploadConfig.field,
            filePath
          });

        } catch (uploadError) {
          console.error("Storage upload error:", uploadError);

          // If it's an SSL error in emulator, try a fallback approach
          if (isEmulator && (uploadError as any).code === 'EPROTO') {
            console.log("SSL error detected, trying alternative upload method...");

            // For emulator, we can use a simpler approach - write directly to emulator storage
            // This is a workaround for the SSL issue
            const storage = getStorage();
            const emulatorBucket = storage.bucket('trivia-games-7a81b.appspot.com');

            // Configure for emulator
            (emulatorBucket as any).storage.customEndpoint = 'http://localhost:9199';
            (emulatorBucket as any).storage.apiEndpoint = 'http://localhost:9199';

            const emulatorFile = emulatorBucket.file(filePath);

            await emulatorFile.save(fileBuffer, {
              metadata: {
                contentType: mimeType,
                metadata: {
                  uploadedBy: userId,
                  gameId: gameId,
                  uploadType: uploadType,
                  uploadedAt: new Date().toISOString()
                }
              }
            });

            await emulatorFile.makePublic();

            const emulatorUrl = `http://localhost:9199/trivia-games-7a81b.appspot.com/${filePath}`;

            // Update the game document with the image URL
            const updateData: any = {
              updatedAt: admin.firestore.FieldValue ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
              [uploadConfig.field]: emulatorUrl
            };

            await admin.firestore().collection("games").doc(gameId).update(updateData);

            // Return success response
            res.status(200).json({
              success: true,
              imageUrl: emulatorUrl,
              uploadType,
              fieldName: uploadConfig.field,
              filePath
            });
          } else {
            throw uploadError;
          }
        }

      } catch (error) {
        console.error("Error processing upload:", error);
        res.status(500).json({
          error: "Failed to process upload"
        });
      }
    });

    busboy.on('error', (error) => {
      console.error("Busboy error:", error);
      res.status(400).json({
        error: "Failed to parse form data"
      });
    });

    // Pipe the request to busboy
    busboy.end(req.rawBody);

  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      error: "Invalid authentication token"
    });
  }
});
