'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

interface VideoData {
  id: string;
  attributes: {
    status: string;
    result_url: string;
    created_at: string;
    format: string;
    name?: string;
  };
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fetch videos initially
  useEffect(() => {
    fetchVideos();
    
    // Set up polling for processing videos
    const intervalId = setInterval(() => {
      fetchVideos(false);
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to fetch videos
  const fetchVideos = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      const newVideos = data.data || [];
      
      // Check for newly completed videos
      if (videos.length > 0) {
        const currentProcessingIds = new Set(
          videos
            .filter(v => v.attributes.status !== 'done')
            .map(v => v.id)
        );
        
        const newlyCompleted = newVideos.filter((video: VideoData) => 
          currentProcessingIds.has(video.id) && 
          video.attributes.status === 'done'
        );
        
        if (newlyCompleted.length > 0) {
          // Show notification for newly completed videos
          setNotification({
            message: `${newlyCompleted.length} video${newlyCompleted.length > 1 ? 's' : ''} successfully converted!`,
            type: 'success'
          });
          
          // Auto-dismiss notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      }
      
      // Update processing IDs for next check
      setProcessingIds(new Set(
        newVideos
          .filter((v: VideoData) => v.attributes.status !== 'done')
          .map((v: VideoData) => v.id)
      ));
      
      // Sort videos by date (newest first)
      newVideos.sort((a: VideoData, b: VideoData) => {
        const dateA = new Date(a.attributes.created_at).getTime();
        const dateB = new Date(b.attributes.created_at).getTime();
        return dateB - dateA;
      });
      
      setVideos(newVideos);
    } catch (err) {
      console.error(err);
      if (showLoading) {
        setError('Error loading videos');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Return relative time if less than 7 days old
      const isRecent = (Date.now() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
      
      if (isRecent) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'PPP p'); // Format: Mar 9, 2023, 3:45 PM
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  // Dismiss notification
  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md animate-slideIn ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
          'bg-blue-50 border-blue-500 text-blue-800'
        } border-l-4 p-4 rounded-r-lg shadow-lg`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={dismissNotification}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === 'success' ? 'text-green-600 hover:bg-green-100' :
                    notification.type === 'error' ? 'text-red-600 hover:bg-red-100' :
                    'text-blue-600 hover:bg-blue-100'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === 'success' ? 'focus:ring-green-500' :
                    notification.type === 'error' ? 'focus:ring-red-500' :
                    'focus:ring-blue-500'
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-blue animate-blob-slow opacity-20 absolute top-1/4 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-indigo animate-blob-slow animation-delay-2000 opacity-20 absolute top-1/2 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-purple animate-blob-slow animation-delay-4000 opacity-20 absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-20 animate-fadeIn-up">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-blue-400/20">
          <div className="text-center mb-8 pb-4 border-b relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5 animate-gradient"></div>
            <h1 className="text-3xl font-extrabold mb-2 text-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              My Video Library
            </h1>
            <p className="text-gray-600">All your processed videos in one place</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link 
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Converter
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
              <p className="mt-2 text-sm text-red-600">Please try again later or contact support if the issue persists.</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <p className="mt-4 text-lg text-gray-600">No videos found</p>
              <p className="mt-2 text-gray-500">Convert your first video to get started</p>
              <Link 
                href="/"
                className="mt-6 inline-flex items-center px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video, index) => {
                const isRecentlyCompleted = video.attributes.status === 'done' && 
                  (new Date().getTime() - new Date(video.attributes.created_at).getTime() < 60000); // Within last minute
                
                return (
                  <div 
                    key={video.id} 
                    className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] animate-fadeIn ${
                      isRecentlyCompleted ? 'ring-2 ring-green-500 animate-pulse-success' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`h-2 ${
                      video.attributes.status === 'done' 
                        ? 'bg-gradient-to-r from-green-400 to-green-500' 
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    }`}></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-mono text-xs text-gray-500">ID: {video.id.slice(0, 8)}...</span>
                          <h3 className="font-medium text-gray-900 mt-1">
                            {video.attributes.format === 'pro_bundle' ? 'Pro Bundle' : 
                             video.attributes.format === 'gif' ? 'GIF Animation' : 
                             video.attributes.format === 'mp4' ? 'MP4 Video' : 
                             video.attributes.format}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          video.attributes.status === 'done' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {video.attributes.status === 'done' ? 'Completed' : 'Processing'}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <time dateTime={video.attributes.created_at} title={new Date(video.attributes.created_at).toLocaleString()}>
                          {formatDate(video.attributes.created_at)}
                        </time>
                      </div>
                      
                      {video.attributes.status === 'done' ? (
                        <a 
                          href={video.attributes.result_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-md transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Result
                        </a>
                      ) : (
                        <div className="flex items-center justify-center py-2 px-4 bg-gray-100 text-gray-700 rounded-md">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Video...
                        </div>
                      )}
                      
                      {/* Success indicator for newly completed videos */}
                      {isRecentlyCompleted && (
                        <div className="mt-3 flex items-center justify-center text-green-600 bg-green-50 py-2 rounded-md animate-fadeIn">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Successfully Converted!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}