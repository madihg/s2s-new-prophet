import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const { text } = await request.json();

      // Handle text-to-speech request
      if (text) {
        const speechResponse = await openai.audio.speech.create({
          model: 'tts-1',
          input: text,
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
    } else if (contentType?.includes('multipart/form-data')) {
      // Handle audio transcription request (if applicable)
      // Add transcription logic here if necessary
    }

    // Handle normal chat requests
    const { messages } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'ft:gpt-3.5-turbo-0125:personal:the-prophet:BCr6XIKL',
      messages,
      stream: false,
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
