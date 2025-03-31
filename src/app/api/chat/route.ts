import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    const requestData = await request.json();

    // Handle text-to-speech request
    if (requestData.text && !requestData.messages) {
      const speechResponse = await openai.audio.speech.create({
        model: 'tts-1',
        input: requestData.text,
        voice: 'alloy',
      });

      const audioArrayBuffer = await speechResponse.arrayBuffer();

      return new Response(audioArrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });
    }

    // Handle normal chat requests
    if (requestData.messages) {
      const completion = await openai.chat.completions.create({
        model: 'ft:gpt-3.5-turbo-0125:personal:the-prophet:BCr6XIKL',
        messages: requestData.messages,
        stream: false,
      });

      return NextResponse.json(completion.choices[0].message);
    }

    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
