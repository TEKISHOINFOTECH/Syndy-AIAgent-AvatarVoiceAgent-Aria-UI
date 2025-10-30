import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const roomName = `avatar-room-${Date.now()}`;
    const participantName = `user-${Date.now()}`;

    // Get environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

    // Request token from backend
    const response = await fetch(
      `${backendUrl}/getToken?name=${participantName}&room=${roomName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Token request failed: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const token = await response.text();

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate token' },
      { status: 500 }
    );
  }
}
