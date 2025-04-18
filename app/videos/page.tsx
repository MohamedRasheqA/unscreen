'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VideoData {
  id: string;
  attributes: {
    status: string;
    result_url: string;
    created_at: string;
    format: string;
  };
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data.data || []);
      } catch (err) {
        setError('Error loading videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8 pb-4 border-b">
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-photo-film mr-2"></i>My Unscreen Videos
          </h1>
          <p className="text-gray-600">List of your processed videos</p>
        </div>

        <div className="mb-6">
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to Converter
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
            <p className="mt-2">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No videos found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-md p-4 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">ID: {video.id.slice(0, 8)}...</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    video.attributes.status === 'done' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.attributes.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Format: {video.attributes.format}</p>
                  <p>Created: {new Date(video.attributes.created_at).toLocaleString()}</p>
                </div>
                {video.attributes.status === 'done' && (
                  <a 
                    href={video.attributes.result_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-2"
                  >
                    <i className="fas fa-download mr-2"></i>Download Result
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}