"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set isLoading to true when component mounts
    setIsLoading(true);
    
    // Create URL for the API endpoint
    const apiUrl = `/api/r2-image?image=cld-sample-3.jpg`;
    
    // Set the image URL
    setImageUrl(apiUrl);
    setIsLoading(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setUploadStatus(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setUploadStatus("Please select an image to upload");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");
      
      const formData = new FormData();
      formData.append("file", selectedImage);
      
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus(`Upload successful! File name: ${data.fileName}`);
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Display the newly uploaded image
        setImageUrl(`/api/r2-image?image=${data.fileName}`);
      } else {
        setUploadStatus(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      setUploadStatus("Upload failed. Please try again.");
      console.error("Error uploading image:", err);
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
