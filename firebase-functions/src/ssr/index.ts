import * as functions from 'firebase-functions';
import { renderPage } from './renderer';
import { fetchPageData } from './utils/firestore-ssr';

export const ssrHandler = functions.https.onRequest(async (req, res) => {
  try {
    const path = req.path;

    // Set security headers
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Fetch data based on route
    const pageData = await fetchPageData(path, req.query);

    // Render React components to string
    const { html, metaTags } = await renderPage(path, pageData);

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

  } catch (error) {
    console.error('SSR Error:', error);
    // Fallback to client-side rendering
    res.redirect(302, '/index.html');
  }
});
