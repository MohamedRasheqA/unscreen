import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';
import path from 'path';

const UNSCREEN_API_VIDEOS_URL = "https://api.unscreen.com/v1.0/videos";
const API_KEY = process.env.UNSCREEN_API_KEY || "PikRdjv8QN3T7AVjACbrtBzK";
const WEBHOOK_HOST = process.env.WEBHOOK_HOST || "";
export const maxDuration = 300;
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const videoUrl = formData.get('url') as string | null;
    const format = formData.get('format') as string;

    // Create a new FormData for the API request
    const apiFormData = new FormData();

    // Handle file upload
    if (videoFile && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      const filename = "original" + path.extname(videoFile.name);
      apiFormData.append("video_file", buffer, filename);
    }

    // Handle URL
    if (videoUrl && videoUrl.trim() !== '') {
      apiFormData.append("video_url", videoUrl);
    }

    // Add format
    apiFormData.append("format", format);

    // Add background color for MP4
    if (format === "mp4") {
      apiFormData.append("background_color", "000000");
    }

    // Add webhook if available
    if (WEBHOOK_HOST) {
      console.log("WEBHOOK_HOST set, using webhooks");
      apiFormData.append("webhook_url", WEBHOOK_HOST + '/api/webhook');
    } else {
      console.log("WEBHOOK_HOST not set, using polling");
    }

    // Set headers
    const headers = apiFormData.getHeaders();
    headers['X-Api-Key'] = API_KEY;

    // Make API request
    const response = await axios({
      method: 'post',
      url: UNSCREEN_API_VIDEOS_URL,
      data: apiFormData,
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const videoData = response.data;
    
    if (WEBHOOK_HOST === "") {
      // Start polling and return response when done
      const resultUrl = await pollUntilDone(videoData.data.links.self);
      return NextResponse.json({ redirectUrl: resultUrl });
    } else {
      // Return video ID for client-side polling
      return NextResponse.json({ 
        id: videoData.data.id,
        status: 'processing'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}

// Poll until video processing is complete
async function pollUntilDone(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: url,
          headers: { 'X-Api-Key': API_KEY },
        });

        if (response.data.data.attributes.status === 'done') {
          resolve(response.data.data.attributes.result_url);
        } else {
          // Wait and try again
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
}