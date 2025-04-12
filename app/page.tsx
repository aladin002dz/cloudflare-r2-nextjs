"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getR2ImageUrl, getUploadUrl } from "./actions";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInitialImage = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        // Use the server action instead of the API route
        const data = await getR2ImageUrl('image2.png');
        setImageUrl(data.url); // Set state with the presigned URL from the response
      } catch (err) {
        console.error("Error fetching initial image URL:", err);
        setError("Could not fetch image URL. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialImage();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setUploadStatus(null);

    // Create a preview URL for the selected image
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Clean up the object URL when it's no longer needed
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      setUploadStatus("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Getting upload URL...");

    try {
      // 1. Get the presigned URL from our server action
      const data = await getUploadUrl(selectedImage.name, selectedImage.type);
      const { url: presignedUrl, fileName } = data;
      setUploadStatus("Uploading image...");

      // 2. Upload the file directly to R2 using the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedImage,
        headers: {
          'Content-Type': selectedImage.type, // Must match the ContentType used to generate the presigned URL
        },
      });

      if (uploadResponse.ok) {
        setUploadStatus(`Upload successful! File name: ${fileName}`);
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Fetch the presigned URL for the newly uploaded image to display it
        try {
          const getImageData = await getR2ImageUrl(fileName);
          setImageUrl(getImageData.url); // Use the presigned URL from the server action
        } catch (fetchError) {
          console.error("Error fetching presigned URL for display:", fetchError);
          setError("Error displaying uploaded image.");
        }

      } else {
        setUploadStatus(`Upload failed: ${uploadResponse.statusText}`);
        console.error('Upload to R2 failed:', uploadResponse.status, uploadResponse.statusText);
      }
    } catch (err: unknown) {
      let errorMessage = 'Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setUploadStatus(`Upload failed: ${errorMessage}`);
      console.error("Error during upload process:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Cloudflare R2 Image Display</h1>

        {/* Image Upload Section */}
        <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-4 bg-white shadow-md mb-6">
          <h2 className="text-xl mb-4">Upload Image to R2 Bucket</h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                Select Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-100 file:text-gray-700
                  hover:file:bg-gray-200"
                disabled={isUploading}
              />
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative h-48 w-full border border-gray-200 rounded-md overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Image preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedImage?.name} ({selectedImage ? (selectedImage.size / 1024).toFixed(2) : 0} KB)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !selectedImage}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>

            {uploadStatus && (
              <div className={`mt-2 text-sm ${uploadStatus.includes("failed") ? "text-red-500" : "text-green-500"}`}>
                {uploadStatus}
              </div>
            )}
          </form>
        </div>

        {/* R2 Image Display Section */}
        <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-4 bg-white shadow-md">
          <h2 className="text-xl mb-4">Image from R2 Bucket</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-gray-100">
              <p>Loading image...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 bg-red-50 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="relative h-64 w-full">
              {imageUrl && (
                // Using Next.js Image component for better performance
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt="Image from Cloudflare R2"
                    fill
                    style={{ objectFit: 'contain' }}
                    onError={() => setError("Failed to load image")}
                    unoptimized // Required for dynamic URLs from API routes
                  />
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-sm text-gray-600">
            {imageUrl && `Image: ${imageUrl.split('=')[1] || 'cld-sample-3.jpg'}`}
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://developers.cloudflare.com/r2/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Cloudflare R2
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          Displaying images from Cloudflare R2 storage
        </p>
      </footer>
    </div>
  );
}
