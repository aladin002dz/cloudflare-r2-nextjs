import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

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
    const fileName = url.searchParams.get('filename');
    const fileType = url.searchParams.get('filetype');

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing filename or filetype query parameter' },
        { status: 400 }
      );
    }

    // Sanitize or validate filename and filetype if necessary

    // Create a command to put the object to the bucket
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      ContentType: fileType,
    });

    // Generate a presigned URL for PUT requests (upload)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Return the presigned URL and filename
    return NextResponse.json({
      url: presignedUrl,
      fileName: fileName,
      message: 'Presigned URL generated successfully for upload'
    });

  } catch (error) {
    console.error('Error generating presigned URL for upload:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
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
