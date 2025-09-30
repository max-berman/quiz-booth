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
exports.ssrHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const renderer_1 = require("./renderer");
const firestore_ssr_1 = require("./utils/firestore-ssr");
exports.ssrHandler = functions.https.onRequest(async (req, res) => {
    try {
        const path = req.path;
        // Set security headers
        res.set('X-Frame-Options', 'DENY');
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        // Fetch data based on route
        const pageData = await (0, firestore_ssr_1.fetchPageData)(path, req.query);
        // Render React components to string
        const { html, metaTags } = await (0, renderer_1.renderPage)(path, pageData);
        // Generate final HTML
        const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    <link rel="stylesheet" href="/assets/index.css">
    <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
    <link rel="apple-touch-icon" href="/assets/quiz-booth-icon.png">
</head>
<body>
    <div id="root">${html}</div>
    <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
        res.status(200).send(finalHtml);
    }
    catch (error) {
        console.error('SSR Error:', error);
        // Fallback to client-side rendering
        res.redirect(302, '/index.html');
    }
});
//# sourceMappingURL=index.js.map