# LMS MERN Stack Application

A Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Deployment Guide for Vercel

This application is configured for deployment on Vercel with separate deployments for the client and server.

### Prerequisites

- Vercel account
- MongoDB Atlas account
- Cloudinary account (for media storage)
- Stripe account (for payments)

### Deploying the Client (Frontend)

1. **Set up environment variables on Vercel**:

   - Create a new project on Vercel
   - Add the following environment variable:
     - `VITE_API_URL`: URL of your deployed backend API (e.g., `https://lms-mernstack-server.vercel.app`)

2. **Deploy to Vercel**:

   ```bash
   cd client
   vercel deploy
   ```

   Alternatively, connect your GitHub repository to Vercel for automatic deployments.

3. **Production build settings**:
   The `vercel.json` configuration is already set up with:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: `vite`
   - Rewrites configuration for SPA routing

### Deploying the Server (Backend)

1. **Set up environment variables on Vercel**:

   - Create a new project on Vercel
   - Add all environment variables from `.env.example`, including:
     - `MONGO_URI`: MongoDB Atlas connection string
     - `SECRET_KEY`: JWT secret key
     - `CLOUD_NAME`, `API_KEY`, `API_SECRET`: Cloudinary credentials
     - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`: Stripe credentials
     - `CLIENT_URL`: URL of your deployed frontend (e.g., `https://lms-mernstack.vercel.app`)

2. **Deploy to Vercel**:

   ```bash
   cd server
   vercel deploy
   ```

   Alternatively, connect your GitHub repository to Vercel for automatic deployments.

3. **Production build settings**:
   The `vercel.json` configuration is already set up with:
   - Node.js serverless function configuration
   - Route handling for the API

### Important Considerations

1. **MongoDB Atlas Configuration**:

   - Ensure your MongoDB Atlas cluster allows connections from Vercel's IP addresses (or allow connections from anywhere for testing)
   - Use connection pooling for better performance

2. **CORS Settings**:

   - The server is configured to accept requests from the specified `CLIENT_URL` environment variable
   - Make sure this value matches your deployed client URL

3. **File Uploads**:

   - All file uploads use Cloudinary, so no server storage is needed
   - Ensure your Cloudinary plan has sufficient capacity

4. **Cookie Settings**:

   - For authentication with cookies to work across domains, you may need to adjust the cookie settings in the authentication logic

5. **Serverless Function Limitations**:
   - Vercel serverless functions have a maximum execution time of 10 seconds in the free tier
   - Consider this limitation for long-running operations

## Local Development

1. Clone the repository
2. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Fill in your local development values
3. Install dependencies and start the development servers:

```bash
# Terminal 1 - Server
cd server
npm install
npm run dev

# Terminal 2 - Client
cd client
npm install
npm run dev
```
