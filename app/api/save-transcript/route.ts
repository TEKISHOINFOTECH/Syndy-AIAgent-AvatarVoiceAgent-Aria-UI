import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Filter out system messages and format for backend
    const formattedTranscript = transcript
      .filter((msg: any) => msg.type !== 'system')
      .map((msg: any) => ({
        timestamp: msg.timestamp,
        speaker: msg.sender,
        message: msg.message,
        type: msg.type,
      }));

    if (formattedTranscript.length === 0) {
      return NextResponse.json(
        { error: 'No user/avatar messages to save' },
        { status: 400 }
      );
    }

    // Call backend to save transcript
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/save-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_history: formattedTranscript }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save transcript to backend');
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save transcript' },
      { status: 500 }
    );
  }
}
