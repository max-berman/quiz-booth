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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactForm = void 0;
const functions = __importStar(require("firebase-functions"));
const sparkpost_1 = __importDefault(require("sparkpost"));
const zod_1 = require("zod");
const cors_1 = __importDefault(require("cors"));
// Contact form validation schema
const contactFormSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    subject: zod_1.z.string().min(1, 'Subject is required'),
    message: zod_1.z.string().min(10, 'Message must be at least 10 characters'),
});
// Initialize SparkPost client
const sparkpostApiKey = ((_a = functions.config().sparkpost) === null || _a === void 0 ? void 0 : _a.api_key) || process.env.SPARKPOST_API_KEY;
const client = sparkpostApiKey ? new sparkpost_1.default(sparkpostApiKey) : null;
// Configure CORS
const corsHandler = (0, cors_1.default)({ origin: true });
exports.sendContactForm = functions.https.onRequest(async (req, res) => {
    // Handle CORS preflight
    corsHandler(req, res, async () => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }
        try {
            const data = req.body;
            // Validate input data
            const validationResult = contactFormSchema.safeParse(data);
            if (!validationResult.success) {
                res.status(400).json({
                    error: 'Invalid form data',
                    details: validationResult.error.errors
                });
                return;
            }
            const { name, email, subject, message } = validationResult.data;
            // Check if SparkPost is configured
            if (!client) {
                res.status(500).json({
                    error: 'Email service not configured'
                });
                return;
            }
            // Send email via SparkPost
            await client.transmissions.send({
                content: {
                    from: 'noreply@mail.naknick.com',
                    subject: `Contact Form - QuizBooth: ${subject}`,
                    html: `
            <html>
              <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Sent from QuizBooth contact form</small></p>
              </body>
            </html>
          `,
                    text: `
            New Contact Form Submission
            
            Subject: ${subject}
            Name: ${name}
            Email: ${email}
            Message: ${message}
            
            Sent from QuizBooth contact form
          `,
                },
                recipients: [{ address: 'max@naknick.com' }],
            });
            // Log successful submission
            functions.logger.info('Contact form submitted successfully', {
                email,
                subject,
                timestamp: new Date().toISOString(),
            });
            res.status(200).json({ status: 'success', message: 'Message sent successfully' });
        }
        catch (error) {
            functions.logger.error('Failed to send contact form email', error);
            res.status(500).json({
                error: 'Failed to send message. Please try again later.'
            });
        }
    });
});
//# sourceMappingURL=contact.js.map