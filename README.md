# Display Cloudflare R2 Image

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Compatible-blue?logo=cloudflare)](https://developers.cloudflare.com/r2/)
[![AWS S3 SDK](https://img.shields.io/badge/AWS_S3_SDK-3.0.0-orange?logo=amazon-aws)](https://github.com/aws/aws-sdk-js-v3)

A modern web application prototype that demonstrates image storage and retrieval using **Cloudflare R2** storage service. Built with Next.js, React, and TypeScript.

## Screenshot

![App Screenshot](./assets/screenshot.png)

_Image upload interface and display from Cloudflare R2 bucket_

## Features

- 🖼️ **Image Display**: Display images stored in Cloudflare R2 with optimized loading
- 🖼️ **Image Upload**: Upload images to Cloudflare R2 storage with preview functionality
- 🔄 **Real-time Preview**: Preview images before uploading
- 📊 **Upload Status**: Real-time feedback on upload progress and status
- 🔒 **Secure Storage**: Images are securely stored in Cloudflare R2
- 🌙 **Basic Dark Mode**: System color scheme detection for basic dark mode support with @media (prefers-color-scheme: dark)

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Storage**: Cloudflare R2
- **AWS SDK**: @aws-sdk/client-s3 (for S3-compatible API interactions with Cloudflare R2)

## Required Libraries

The project relies on the following key libraries for Cloudflare R2 integration:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

These packages are essential because:

- `@aws-sdk/client-s3`: Provides the S3 client for interacting with Cloudflare R2 (which uses S3-compatible API)
- `@aws-sdk/s3-request-presigner`: Enables generating pre-signed URLs for direct uploads to R2

## Setting up Cloudflare R2

1. Sign up for a Cloudflare account at [cloudflare.com](https://cloudflare.com)
2. Navigate to the R2 section in your Cloudflare dashboard
3. Create a new R2 bucket:
   - Click "Create bucket"
   - Give your bucket a unique name
   - Choose a region (if applicable)
4. Create API tokens:
   - Go to "Manage R2 API Tokens"
   - Click "Create API Token"
   - Select the appropriate permissions (read/write access)
   - Save the Access Key ID and Secret Access Key

## Environment Variables

Create a `.env` file with the following variables:

```env
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint_url_here
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name_here
```

## CORS Configuration

Configure CORS on your R2 bucket. This is essential for allowing uploads directly from your web application's domain.

**Go to your R2 bucket `settings -> CORS Policy`.**

Add a policy like this (adjust AllowedOrigins to match your development and production domains):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000", // Your dev environment
      "https://your-production-domain.com" // Your production domain
    ],
    "AllowedMethods": [
      "PUT",
      "GET" // Often useful for retrieving later
    ],
    "AllowedHeaders": [
      "Content-Type", // Required for setting file type
      "*" // Or list specific headers if needed
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 4000
  }
]
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `example.env` and add your Cloudflare R2 credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
