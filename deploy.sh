#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Create a deployment directory
echo "Creating deployment directory..."
mkdir -p deploy

# Copy necessary files
echo "Copying files..."
cp -r .next deploy/
cp -r public deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp .env.production deploy/

# Create a README with instructions
echo "Creating deployment instructions..."
cat > deploy/README.txt << EOL
Deployment Instructions:
1. Upload all these files to your Hostinger hosting root directory
2. In Hostinger control panel, enable Node.js
3. Set up the following environment variables:
   - NODE_ENV=production
   - NEXT_PUBLIC_API_URL=https://api.prescriptai.in
4. Install dependencies: npm install --production
5. Start the application: npm start

Note: Make sure your domain and SSL are properly configured in Hostinger.
EOL

echo "Done! Your deployment files are ready in the 'deploy' directory."
echo "Upload the contents of the 'deploy' directory to your Hostinger hosting." 