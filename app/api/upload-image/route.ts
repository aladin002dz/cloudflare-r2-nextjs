import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

// Function to generate a unique filename
function generateUniqueFileName(originalFileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalFileName.split('.').pop();
  const fileNameWithoutExtension = originalFileName.slice(0, originalFileName.lastIndexOf('.'));

  return `${fileNameWithoutExtension}-${timestamp}-${randomString}.${fileExtension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize the S3 client with Cloudflare R2 credentials
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Get filename and filetype from query params
    const url = new URL(request.url);
    const originalFileName = url.searchParams.get('filename');
    const fileType = url.searchParams.get('filetype');

    console.log('Received request for:', { originalFileName, fileType });

    if (!originalFileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing filename or filetype query parameter' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(originalFileName);
    console.log('Generated unique filename:', uniqueFileName);

    // Create a command to put the object to the bucket
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // Generate a presigned URL for PUT requests (upload)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Generated presigned URL successfully');

    // Return the presigned URL and filename
    return NextResponse.json({
      url: presignedUrl,
      fileName: uniqueFileName,
      message: 'Presigned URL generated successfully for upload'
    });

  } catch (error) {
    console.error('Detailed error in upload-image route:', error);
    return NextResponse.json(
      { error: `Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Keep body parsing disabled, as the upload happens directly to R2 via the presigned URL
export const config = {
  api: {
    bodyParser: false,
  },
};
