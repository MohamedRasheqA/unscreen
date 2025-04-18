import { NextResponse } from 'next/server';
import axios from 'axios';

const UNSCREEN_API_VIDEOS_URL = "https://api.unscreen.com/v1.0/videos";
const API_KEY = process.env.UNSCREEN_API_KEY || "PikRdjv8QN3T7AVjACbrtBzK";

export async function GET() {
  try {
    const response = await axios({
      method: 'get',
      url: UNSCREEN_API_VIDEOS_URL,
      headers: { 'X-Api-Key': API_KEY },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}