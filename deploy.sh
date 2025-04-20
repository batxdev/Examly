#!/bin/bash

# Make script exit when a command fails
set -e

echo "🚀 Preparing for Vercel deployment..."

# Deploy Server
echo "📡 Deploying server..."
cd server
echo "Installing Vercel CLI if not already installed..."
npm install -g vercel
echo "Deploying server to Vercel..."
vercel --prod

# Get the deployment URL
SERVER_URL=$(vercel ls --prod -j | grep url | head -1 | awk -F'"' '{print $4}')
echo "✅ Server deployed to: $SERVER_URL"

# Deploy Client with the correct API URL
echo "🖥️ Deploying client..."
cd ../client

# Update the .env file with the server URL
echo "VITE_API_URL=$SERVER_URL" > .env.production

echo "Installing Vercel CLI if not already installed..."
npm install -g vercel
echo "Deploying client to Vercel..."
vercel --prod

# Get the client deployment URL
CLIENT_URL=$(vercel ls --prod -j | grep url | head -1 | awk -F'"' '{print $4}')
echo "✅ Client deployed to: $CLIENT_URL"

echo "🎉 Deployment complete!"
echo "Server: $SERVER_URL"
echo "Client: $CLIENT_URL"

echo "⚠️ Important: Make sure to update the CLIENT_URL environment variable in your server deployment settings to: $CLIENT_URL" 