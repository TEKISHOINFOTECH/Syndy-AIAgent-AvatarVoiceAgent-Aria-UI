import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 200 }
      );
    }

    // Filter out system messages and format for backend
    const formattedTranscript = transcript
      .filter((msg: any) => msg.type !== 'system')
      .map((msg: any) => ({
        timestamp: msg.timestamp,
        speaker: msg.speaker,  // ✅ FIXED: was msg.sender, should be msg.speaker
        message: msg.message,
        type: msg.type,
      }));

    if (formattedTranscript.length === 0) {
      return NextResponse.json(
        { error: 'No user/avatar messages to save' },
        { status: 200 }
      );
    }

    console.log(`� Sending ${formattedTranscript.length} messages to backend for LLM extraction and save`);

    // Call backend - it will use LLM to extract name/company and save to DB
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    
    console.log(`🔗 Calling backend at: ${backendUrl}/update-client-chat`);
    
    // Send transcript to backend - backend will extract name/company using LLM
    const response = await fetch(`${backendUrl}/update-client-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        chat_history: formattedTranscript,
        use_llm_extraction: true  // Tell backend to use LLM extraction
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save transcript to backend');
    }

    const result = await response.json();

    console.log(`✅ Backend responded - Name: ${result.name}, Company: ${result.company}`);

    return NextResponse.json({
      success: result.success || true,
      name: result.name,
      company: result.company,
      message_count: result.messages_saved || formattedTranscript.length,
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save transcript' },
      { status: 200 }
    );
  }
}
