import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript, visitorName, visitorEmail, productDiscussed } =
      await request.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Filter out system messages and format for storage
    const formattedMessages = transcript
      .filter((msg: any) => msg.type !== 'system')
      .map((msg: any) => ({
        timestamp: msg.timestamp,
        speaker: msg.speaker,
        message: msg.message,
        type: msg.type,
      }));

    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: 'No user/avatar messages to save' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

    console.log(
      `📝 Saving transcript (${formattedMessages.length} msgs) for ${visitorName} → ${backendUrl}/save-transcript`
    );

    const response = await fetch(`${backendUrl}/save-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        product_discussed: productDiscussed,
        messages: formattedMessages,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Backend returned ${response.status}`
      );
    }

    const result = await response.json();
    console.log(`✅ Transcript saved — ${result.messages_saved} messages`);

    return NextResponse.json({
      success: true,
      messages_saved: result.messages_saved,
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save transcript',
      },
      { status: 500 }
    );
  }
}
