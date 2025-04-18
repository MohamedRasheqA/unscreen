import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Webhook received:', data);

    if (data.data.attributes.status === 'done') {
      console.log('Processing complete:', data.data.attributes.result_url);
      // You could store this in a database or use server-sent events to notify the client
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}