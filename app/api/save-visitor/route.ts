import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone } = body;

    if (!name || !company || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const payload = {
      name,
      company,
      email,
      phone,
      timestamp: new Date().toISOString(),
    };

    console.log(`📝 Saving visitor: ${name} from ${company}`);

    // Forward to backend — non-blocking, don't fail if backend is unreachable
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    try {
      const response = await fetch(`${backendUrl}/save-visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`⚠ Backend returned ${response.status} for save-visitor`);
      } else {
        console.log(`✅ Visitor data saved to backend`);
      }
    } catch (backendError) {
      console.warn('⚠ Could not reach backend for save-visitor:', backendError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-visitor:', error);
    return NextResponse.json({ success: true }); // Non-blocking — always succeed for the user
  }
}
