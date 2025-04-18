'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_UNSCREEN_API_KEY || "PikRdjv8QN3T7AVjACbrtBzK";
const UNSCREEN_API_VIDEOS_URL = "https://api.unscreen.com/v1.0/videos";

export default function ProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id');
  
  const [status, setStatus] = useState('processing');
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided');
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `${UNSCREEN_API_VIDEOS_URL}/${videoId}`,
          headers: { 'X-Api-Key': API_KEY },
        });

        const videoStatus = response.data.data.attributes.status;
        setStatus(videoStatus);

        if (videoStatus === 'done') {
          setResultUrl(response.data.data.attributes.result_url);
        } else if (videoStatus === 'failed') {
          setError('Video processing failed');
        } else {
          // Continue polling
          setTimeout(pollStatus, 3000);
        }
      } catch (err) {
        console.error('Error polling status:', err);
        setError('Error checking video status');
      }
    };

    pollStatus();
  }, [videoId]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8 pb-4 border-b">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-video mr-2"></i>Video Processing
          </h1>
        </div>

        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        ) : status === 'done' ? (
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-check-circle text-green-500 text-4xl mr-3"></i>
              <h2 className="text-2xl font-bold">Processing Complete!</h2>
            </div>
            <p className="mb-6">Your video has been successfully processed and is ready for download.</p>
            <a 
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
            >
              <i className="fas fa-download mr-2"></i>Download Your Video
            </a>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-spinner fa-spin text-blue-500 text-4xl mr-3"></i>
              <h2 className="text-2xl font-bold">Processing...</h2>
            </div>
            <p className="mb-6">Your video is currently being processed. This may take a few minutes.</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">Please don't close this window</p>
          </div>
        )}

        <div>
          <Link
            href="/"
            className="inline-block px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <i className="fas fa-home mr-2"></i>Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}