// netlify/functions/chat.js

/**
 * Node.js Backend for SimpleChatBot using Express and Netlify Functions.
 *
 * This file implements the backend logic for the SimpleChatBot application,
 * designed to run as a serverless Netlify Function. It adheres to the
 * technical plan's requirements for simplicity, robustness, and Netlify integration.
 *
 * It uses Express for routing and middleware capabilities, wrapped by `serverless-http`
 * to make it compatible with Netlify's serverless function environment.
 *
 * Dependencies:
 * - express: For creating the API endpoint and handling requests.
 * - cors: For enabling Cross-Origin Resource Sharing, crucial for frontend-backend communication.
 * - serverless-http: To adapt the Express application to the Netlify Functions signature.
 *
 * To install dependencies, run:
 * `npm install express cors serverless-http`
 * in your project's root directory (or within the `netlify/functions` directory if preferred,
 * but root is generally recommended for Netlify's build process).
 */

// --- Module Imports ---
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

// --- Express App Initialization ---
// Create an instance of the Express application.
const app = express();

// --- Middleware Configuration ---

/**
 * 1. CORS (Cross-Origin Resource Sharing) Middleware
 *
 * Purpose: Allows the frontend application (which might be served from a different origin
 * during local development or if deployed on a subdomain) to make HTTP requests to this
 * Netlify Function without being blocked by browser security policies.
 *
 * Configuration:
 * - `cors()` with no arguments enables CORS for all origins, which is suitable for
 *   this "incredibly simple" public demo. For production, consider restricting `origin`
 *   to your specific frontend domain(s).
 */
app.use(cors());

/**
 * 2. JSON Body Parser Middleware
 *
 * Purpose: Parses incoming request bodies that are in JSON format.
 * It populates `req.body` with the parsed JavaScript object, making it easy
 * to access data sent from the frontend (e.g., `req.body.message`).
 *
 * Configuration:
 * - `express.json()` is a built-in Express middleware for this purpose.
 */
app.use(express.json());

// --- API Endpoints Definition ---

/**
 * Endpoint 1: Chat Interaction
 *
 * Method: POST
 * Path: `/api/chat`
 * Description: Processes a user's message and returns a hardcoded bot response.
 *
 * Request Body (JSON):
 * {
 *     "message": "Hello bot, how are you?"
 * }
 *
 * Response (JSON):
 * - Success (200 OK):
 *   { "reply": "Hello there! I'm a simple bot. I received your message: '...'. How can I help further?" }
 * - Error (400 Bad Request): If 'message' is missing or invalid.
 *   { "error": "Message content is required." }
 * - Error (500 Internal Server Error): For unexpected server-side issues.
 *   { "error": "An unexpected error occurred." }
 */
app.post('/api/chat', async (req, res) => {
    try {
        // --- Request Validation ---
        // Extract the 'message' field from the request body.
        const { message } = req.body;

        // Validate if 'message' exists, is a string, and is not empty after trimming whitespace.
        if (!message || typeof message !== 'string' || message.trim() === '') {
            console.warn('Validation Error: Message content is required or invalid.');
            // Return a 400 Bad Request status with an informative error message.
            return res.status(400).json({ error: 'Message content is required.' });
        }

        // --- Core Bot Logic (Hardcoded) ---
        // This implements the "very basic, hardcoded logic to generate a response".
        // No external AI models or complex NLP are used, as per the specification.
        const botReply = `Hello there! I'm a simple bot. I received your message: '${message}'. How can I help further?`;

        // --- Success Response ---
        // Log the interaction for debugging/monitoring in Netlify logs.
        console.log(`Received message: "${message}", Responding with: "${botReply}"`);
        // Send a 200 OK status with the bot's reply in a JSON object.
        return res.status(200).json({ reply: botReply });

    } catch (error) {
        // --- Error Handling for Unexpected Issues ---
        // This catch block handles any unforeseen errors that might occur during the
        // processing of the request (e.g., issues with JSON parsing if `express.json()`
        // failed, or other runtime exceptions).
        console.error('Server Error: An unexpected error occurred during chat processing.', error);
        // Return a 500 Internal Server Error status with a generic error message.
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// --- Netlify Function Export ---

/**
 * Exports the Express application wrapped by `serverless-http`.
 *
 * This `exports.handler` is the entry point for Netlify Functions.
 * `serverless-http` acts as an adapter, translating the Netlify Function's
 * `event` and `context` objects into standard Node.js `req` and `res` objects
 * that Express understands, and then translating Express's response back
 * into the format expected by Netlify Functions.
 *
 * This allows us to write standard Express code while deploying it in a
 * serverless environment.
 */
exports.handler = serverless(app);

// --- Optional: Local Development Server (for direct Node.js execution) ---
// This block is commented out by default as Netlify Dev (netlify-cli) handles
// local function emulation. However, it can be uncommented if you wish to run
// this Express app directly via `node netlify/functions/chat.js` for standalone testing.
/*
if (process.env.NODE_ENV === 'development' && !process.env.NETLIFY_DEV) {
    const port = process.env.PORT || 3000; // Default to port 3000
    app.listen(port, () => {
        console.log(`Local Express server running on http://localhost:${port}/api/chat`);
        console.log('Use a tool like Postman or a simple fetch in browser console to test:');
        console.log(`fetch('http://localhost:${port}/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'test' }) }).then(res => res.json()).then(console.log)`);
    });
}
*/