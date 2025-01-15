import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    return NextResponse.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}