'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_UNSCREEN_API_KEY || "PikRdjv8QN3T7AVjACbrtBzK";
const UNSCREEN_API_VIDEOS_URL = "https://api.unscreen.com/v1.0/videos";

// Simple game component for users to play while waiting
function CatchGame({ isActive }: { isActive: boolean }) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 80 });
  
  // Define an interface for the game items
  interface GameItem {
    id: number;
    x: number;
    y: number;
    speed: number;
    type: string;
  }
  
  // Initialize with proper type
  const [items, setItems] = useState<GameItem[]>([]);
  
  // Use NodeJS.Timeout type for the interval refs
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const itemLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setItems([]);
    
    // Create item spawn loop
    itemLoopRef.current = setInterval(() => {
      if (!gameAreaRef.current) return;
      
      const width = gameAreaRef.current.offsetWidth;
      setItems(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * (width - 30),
        y: 0,
        speed: 1 + Math.random() * 2,
        type: Math.random() > 0.8 ? 'special' : 'normal'
      }]);
    }, 1200);
    
    // Create game loop
    gameLoopRef.current = setInterval(() => {
      setItems(prevItems => {
        // Move items down
        const updatedItems = prevItems
          .map(item => ({
            ...item,
            y: item.y + item.speed
          }))
          .filter(item => {
            // Remove items that hit the ground
            const hitGround = item.y > 90;
            return !hitGround;
          });
          
        // Check for collisions with the catcher
        const collectedItems = prevItems.filter(item => {
          const inXRange = Math.abs(item.x - position.x) < 30;
          const inYRange = Math.abs(item.y - position.y) < 10;
          return inXRange && inYRange;
        });
        
        // Update score based on collected items
        if (collectedItems.length > 0) {
          setScore(prev => prev + collectedItems.reduce((acc, item) => 
            acc + (item.type === 'special' ? 5 : 1), 0));
        }
        
        // Return items that weren't collected and haven't hit ground
        return updatedItems.filter(item => 
          !collectedItems.some(collected => collected.id === item.id));
      });
    }, 50);
  };
  
  // Stop the game
  const stopGame = () => {
    setGameStarted(false);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (itemLoopRef.current) {
      clearInterval(itemLoopRef.current);
    }
  };
  
  // Handle mouse/touch movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameStarted) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - gameArea.left) / gameArea.width) * 100;
    setPosition(prev => ({...prev, x: Math.max(0, Math.min(100, relativeX))}));
  };
  
  // Handle touch movement for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameAreaRef.current || !gameStarted) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const relativeX = ((touch.clientX - gameArea.left) / gameArea.width) * 100;
    setPosition(prev => ({...prev, x: Math.max(0, Math.min(100, relativeX))}));
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (itemLoopRef.current) {
        clearInterval(itemLoopRef.current);
      }
    };
  }, []);
  
  // Stop game when component becomes inactive
  useEffect(() => {
    if (!isActive && gameStarted) {
      stopGame();
    }
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <div className="border rounded-lg p-4 bg-white/90 backdrop-blur-sm mt-6 shadow-md">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Pass the time while your video processes:</h3>
      
      {!gameStarted ? (
        <div className="text-center py-8">
          <button 
            onClick={startGame}
            className="py-2 px-6 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            Play Catch Game
          </button>
          <p className="mt-2 text-sm text-gray-600">Move your cursor to catch the falling items!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-medium">Score: {score}</div>
            <button 
              onClick={stopGame}
              className="py-1 px-4 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 transition-colors"
            >
              End Game
            </button>
          </div>
          
          <div 
            ref={gameAreaRef}
            className="relative h-[200px] border border-gray-200 rounded bg-gradient-to-b from-blue-50 to-indigo-50 overflow-hidden"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* Game items */}
            {items.map(item => (
              <div 
                key={item.id}
                className={`absolute h-6 w-6 rounded-full ${
                  item.type === 'special' 
                    ? 'bg-yellow-400 animate-pulse' 
                    : 'bg-blue-500'
                }`}
                style={{ 
                  left: `${item.x}px`, 
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Player catcher */}
            <div 
              className="absolute bottom-0 h-10 w-16 bg-indigo-600 rounded-t-lg"
              style={{ 
                left: `${position.x}%`, 
                bottom: `10%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessMessage({ videoUrl }: { videoUrl: string }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Add confetti effect
    const createConfetti = () => {
      const confettiCount = 200;
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      document.body.appendChild(confettiContainer);
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const color = ['#FF6B6B', '#4ECDC4', '#FFD166', '#44AF69', '#6A4C93'][Math.floor(Math.random() * 5)];
        
        confetti.className = 'fixed rounded-md';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 5 + 5}px`;
        confetti.style.background = color;
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.opacity = `${Math.random() + 0.5}`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        
        confettiContainer.appendChild(confetti);
      }
      
      // Clean up after animation
      setTimeout(() => {
        if (confettiContainer?.parentNode) {
          document.body.removeChild(confettiContainer);
        }
      }, 5000);
    };
    
    createConfetti();
    
    // Add a style for the confetti animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        0% { transform: translateY(-10px) rotate(0); }
        100% { transform: translateY(105vh) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl transform animate-bounceIn">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 text-green-600 mb-6 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Great Success!</h2>
        <p className="text-gray-600 mb-6">Your video has been successfully processed and is ready for download.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105"
          >
            Download Video
          </a>
          <button
            onClick={() => setVisible(false)}
            className="bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id');
  
  const [status, setStatus] = useState('processing');
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (!videoId) {
      console.error('Processing error: No video ID provided');
      setError('No video ID provided');
      return;
    }

    console.log(`Starting processing for video ID: ${videoId}`);

    const pollStatus = async () => {
      try {
        console.log(`Polling status for video ID: ${videoId}`);
        const response = await axios({
          method: 'get',
          url: `${UNSCREEN_API_VIDEOS_URL}/${videoId}`,
          headers: { 'X-Api-Key': API_KEY },
        });

        const videoData = response.data.data;
        const videoStatus = videoData.attributes.status;
        console.log(`Current video status: ${videoStatus}`);
        setStatus(videoStatus);

        if (videoStatus === 'done') {
          console.log('Video processing complete!');
          setResultUrl(videoData.attributes.result_url);
          setShowSuccessMessage(true);
          
          // Also store the completed video in local storage
          try {
            console.log('Saving video to local storage');
            const response = await fetch('/api/videos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: videoId,
                attributes: videoData.attributes
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to save video to local storage');
            } else {
              console.log('Successfully saved video to local storage');
            }
          } catch (err) {
            console.error('Error saving video:', err);
          }
          
        } else if (videoStatus === 'failed') {
          console.error(`Video processing failed for ID: ${videoId}`);
          setError('Video processing failed');
        } else {
          // Continue polling
          console.log(`Video still processing (${videoStatus}), polling again in 3 seconds`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-blue animate-blob-slow opacity-20 absolute top-1/4 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-indigo animate-blob-slow animation-delay-2000 opacity-20 absolute top-1/2 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="blob blob-purple animate-blob-slow animation-delay-4000 opacity-20 absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl"></div>
        
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-blue-400/20 animate-fadeIn">
          <div className="text-center mb-8 pb-4 border-b border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-5 animate-gradient"></div>
            <h1 className="text-3xl font-extrabold mb-2 text-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video Processing
            </h1>
            <p className="text-gray-500 mt-2">ID: {videoId?.slice(0, 10) || 'Unknown'}...</p>
          </div>

          {error ? (
            <div className="rounded-lg bg-red-50 p-6 mb-6 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-red-800">Processing Error</h2>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/"
                  className="inline-flex items-center px-5 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Return to Home
                </Link>
              </div>
            </div>
          ) : status === 'done' ? (
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Complete!</h2>
              <p className="text-gray-600 mb-8">Your video has been successfully processed and is ready for download.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Your Video
                </a>
                
                <Link 
                  href="/videos"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  View All Videos
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              <div className="mb-6 relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-progress-indeterminate rounded-full"></div>
                </div>
              </div>
              
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Video</h2>
              <p className="text-gray-600 mb-3">This may take a few minutes depending on the size of your video.</p>
              <p className="text-sm text-gray-500 italic mb-6">Please don't close this window. You'll be notified when processing is complete.</p>
              
              <button 
                onClick={() => setShowGame(!showGame)}
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-300"
              >
                {showGame ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hide Game
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play a Game While Waiting
                  </>
                )}
              </button>
              
              <CatchGame isActive={showGame} />
            </div>
          )}
        </div>
      </div>
      
      {/* Success message popup with confetti */}
      {showSuccessMessage && (
        <SuccessMessage videoUrl={resultUrl} />
      )}
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}