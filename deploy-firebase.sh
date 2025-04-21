#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Initialize Firebase (if not already done)
if [ ! -f ".firebaserc" ]; then
    echo "Please login to Firebase first:"
    firebase login
    
    echo "Initializing Firebase..."
    firebase init hosting
fi

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Done! Your application is now deployed to Firebase."
echo "To connect your custom domain (prescriptai.in):"
echo "1. Go to Firebase Console -> Hosting -> Add custom domain"
echo "2. Enter your domain: prescriptai.in"
echo "3. Verify domain ownership"
echo "4. Update DNS records as instructed by Firebase" 