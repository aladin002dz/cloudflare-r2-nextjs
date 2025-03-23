"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set isLoading to true when component mounts
    setIsLoading(true);
    
    // Create URL for the API endpoint
    const apiUrl = `/api/r2-image?image=cld-sample-3.jpg`;
    
    // Set the image URL
    setImageUrl(apiUrl);
    setIsLoading(false);
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Cloudflare R2 Image Display</h1>
        
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
            Image name: cld-sample-3.jpg
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
