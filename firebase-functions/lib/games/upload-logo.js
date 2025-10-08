"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameImage = exports.handleImageUploadComplete = exports.generateImageUploadUrl = exports.MAX_FILE_SIZE = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("firebase-admin/storage");
// Supported image types for upload
const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml"
];
// Maximum file size (5MB) - for client-side validation
// Note: Actual file size validation should be done client-side before upload
exports.MAX_FILE_SIZE = 5 * 1024 * 1024;
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
};
/**
 * Generate a signed URL for secure image upload
 * Validates that the user owns the game before allowing upload
 */
exports.generateImageUploadUrl = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to upload images");
    }
    const { gameId, fileName, uploadType } = data;
    const userId = context.auth.uid;
    // Validate input
    if (!gameId || !fileName || !uploadType) {
        throw new functions.https.HttpsError("invalid-argument", "Game ID, file name, and upload type are required");
    }
    // Validate upload type
    if (!UPLOAD_TYPES[uploadType]) {
        throw new functions.https.HttpsError("invalid-argument", `Invalid upload type. Must be one of: ${Object.keys(UPLOAD_TYPES).join(", ")}`);
    }
    // Extract file extension and validate file type
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
    if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
        throw new functions.https.HttpsError("invalid-argument", `Unsupported file type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`);
    }
    try {
        // Check if the game exists and user owns it
        const gameDoc = await admin.firestore().collection("games").doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Game not found");
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError("permission-denied", "You don't have permission to upload images for this game");
        }
        // Get storage path for this upload type
        const uploadConfig = UPLOAD_TYPES[uploadType];
        const filePath = `${uploadConfig.path}/${gameId}/${fileName}`;
        // Generate a signed URL for upload
        const bucket = (0, storage_1.getStorage)().bucket();
        const file = bucket.file(filePath);
        // Check if we're running in emulator environment
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' ||
            process.env.FIRESTORE_EMULATOR_HOST !== undefined;
        let signedUrl;
        if (isEmulator) {
            // For emulator environment, we need to handle uploads differently
            // The emulator doesn't support signed URLs properly, so we'll use a direct upload approach
            // Create a special URL that the client can use for direct upload
            // Use the project ID as the bucket name for emulator
            signedUrl = `http://localhost:9199/v0/b/trivia-games-7a81b.appspot.com/o?name=${encodeURIComponent(filePath)}&uploadType=media`;
        }
        else {
            // For production, use signed URLs
            const [signedUrlResult] = await file.getSignedUrl({
                version: "v4",
                action: "write",
                expires: Date.now() + 15 * 60 * 1000,
                contentType: "image/*", // Only allow image files
            });
            signedUrl = signedUrlResult;
        }
        return {
            signedUrl,
            filePath,
            uploadType,
            fieldName: uploadConfig.field
        };
    }
    catch (error) {
        console.error("Error generating upload URL:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate upload URL");
    }
});
/**
 * Handle image upload completion and update game document
 */
exports.handleImageUploadComplete = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { gameId, filePath, uploadType, fieldName } = data;
    const userId = context.auth.uid;
    try {
        // Verify ownership again for security
        const gameDoc = await admin.firestore().collection("games").doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Game not found");
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError("permission-denied", "You don't have permission to update this game");
        }
        // Generate public URL for the uploaded image
        const bucket = (0, storage_1.getStorage)().bucket();
        const file = bucket.file(filePath);
        // Check if we're running in emulator environment
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' ||
            process.env.FIRESTORE_EMULATOR_HOST !== undefined;
        let publicUrl;
        if (isEmulator) {
            // For emulator environment, use emulator URL
            publicUrl = `http://localhost:9199/trivia-games-7a81b.appspot.com/${filePath}`;
        }
        else {
            // For production, use actual storage URL
            // Make the file publicly readable
            await file.makePublic();
            publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        }
        // Update the game document with the appropriate field
        const updateData = {
            updatedAt: admin.firestore.FieldValue ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
        };
        // Handle different upload types
        if (uploadType === "ASSET") {
            // For assets, we might want to store them in an array or map
            // For now, we'll store the latest asset URL
            updateData[fieldName] = publicUrl;
        }
        else {
            // For single images like logo, background, banner
            updateData[fieldName] = publicUrl;
        }
        await admin.firestore().collection("games").doc(gameId).update(updateData);
        return {
            success: true,
            imageUrl: publicUrl,
            uploadType,
            fieldName
        };
    }
    catch (error) {
        console.error("Error handling image upload completion:", error);
        throw new functions.https.HttpsError("internal", "Failed to complete image upload");
    }
});
/**
 * Delete an uploaded image
 */
exports.deleteGameImage = functions.https.onCall(async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { gameId, filePath, uploadType } = data;
    const userId = context.auth.uid;
    try {
        // Verify ownership
        const gameDoc = await admin.firestore().collection("games").doc(gameId).get();
        if (!gameDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Game not found");
        }
        const gameData = gameDoc.data();
        if ((gameData === null || gameData === void 0 ? void 0 : gameData.userId) !== userId) {
            throw new functions.https.HttpsError("permission-denied", "You don't have permission to delete images for this game");
        }
        // Delete the file from storage
        const bucket = (0, storage_1.getStorage)().bucket();
        const file = bucket.file(filePath);
        await file.delete();
        // Update the game document to remove the image reference
        const uploadConfig = UPLOAD_TYPES[uploadType];
        const updateData = {
            updatedAt: admin.firestore.FieldValue ? admin.firestore.FieldValue.serverTimestamp() : new Date(),
            [uploadConfig.field]: null
        };
        await admin.firestore().collection("games").doc(gameId).update(updateData);
        return {
            success: true,
            message: "Image deleted successfully"
        };
    }
    catch (error) {
        console.error("Error deleting image:", error);
        throw new functions.https.HttpsError("internal", "Failed to delete image");
    }
});
//# sourceMappingURL=upload-logo.js.map