'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl; // Redirect to the result URL
        } else {
          router.push('/processing?id=' + data.id); // Redirect to a processing page
        }
      } else {
        alert('Error uploading file');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-blue animate-blob-slow opacity-20 absolute top-1/4 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-indigo animate-blob-slow animation-delay-2000 opacity-20 absolute top-1/2 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-purple animate-blob-slow animation-delay-4000 opacity-20 absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50 to-transparent"></div>
        
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-300 rounded-full opacity-30 animate-ping animation-delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-indigo-300 rounded-full opacity-30 animate-ping animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-purple-300 rounded-full opacity-30 animate-ping animation-delay-5000"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-6 relative z-20">
        {/* Left Card - Instructions */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-blue-400/20 hover:-translate-y-1 animate-fadeIn-left z-10 relative backdrop-blur-sm bg-white/95">
          <div className="text-center p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 animate-gradient"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                How It Works
              </h1>
              <p className="text-blue-100">Follow these simple steps to convert your videos</p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-8">
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">1</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">Upload Your Video</h3>
                  <p className="mt-1 text-gray-600">Choose a video file from your device or enter a URL from YouTube, Vimeo, or any other video hosting site.</p>
                  <p className="mt-2 text-sm text-blue-600">Supported formats: MP4, MOV, AVI, WEBM (max 500MB)</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">2</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">Select Output Format</h3>
                  <p className="mt-1 text-gray-600">Choose your desired output format from our available options.</p>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside ml-2">
                    <li><span className="font-semibold">Pro Bundle</span>: Get all formats in one package</li>
                    <li><span className="font-semibold">GIF</span>: Animated GIF (limited to 20 seconds)</li>
                    <li><span className="font-semibold">MP4</span>: Standard video with black background</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">3</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">Process & Download</h3>
                  <p className="mt-1 text-gray-600">Click "Convert Video" and wait for processing to complete. Your converted video will be ready to download!</p>
                  <p className="mt-2 text-sm text-blue-600">Processing typically takes 1-3 minutes depending on file size.</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transform transition-all duration-300 hover:scale-105">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 animate-bounce" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Pro Tips</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>For the best results, upload high-quality videos with clear subjects and contrasting backgrounds.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Card - Form */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-indigo-400/20 hover:-translate-y-1 animate-fadeIn-right animation-delay-150 relative backdrop-blur-sm bg-white/95">
          <div className="text-center p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 animate-gradient"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Converter
              </h1>
              <p className="text-blue-100">Transform your videos with just a few clicks</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50/30 transform hover:scale-[1.02]">
                <label 
                  htmlFor="videoFile" 
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Select video file:
                </label>
                <input 
                  name="video" 
                  type="file" 
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all duration-300" 
                  id="videoFile"
                />
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label 
                  htmlFor="videoUrl" 
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Or input video URL:
                </label>
                <input 
                  type="text" 
                  name="url" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300" 
                  id="videoUrl" 
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label 
                  htmlFor="formatSelect" 
                  className="block text-sm font-medium mb-2 text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  Format:
                </label>
                <select 
                  name="format" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white bg-no-repeat bg-right transition-all duration-300" 
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" fill=\"%236B7280\"><path fill-rule=\"evenodd\" d=\"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\" clip-rule=\"evenodd\" /></svg>')", backgroundSize: "20px 20px", backgroundPosition: "right 10px center" }}
                  id="formatSelect"
                >
                  <option value="pro_bundle">Pro Bundle</option>
                  <option value="gif">GIF (maximum 20 seconds)</option>
                  <option value="mp4">MP4 (black background)</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Convert Video
                  </span>
                )}
              </button>
            </form>
            
            <div className="text-center mt-8 pt-6 border-t">
              <Link 
                href="/videos" 
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Show my unscreen videos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to your global.css file or at the top of your page component
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradientFlow 5s ease infinite;
}
`;