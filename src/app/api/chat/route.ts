import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Store IP addresses and their request counts
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const DAILY_LIMIT = 20;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    // Get or create record for this IP
    let record = requestCounts.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
    }
    
    // Check if limit exceeded
    if (record.count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        error: `Daily limit reached. Try again in ${Math.ceil((record.resetTime - now) / (1000 * 60 * 60))} hours.` 
      }, { status: 429 });
    }
    
    // Increment count
    record.count++;
    requestCounts.set(ip, record);

    const { messages, systemPrompt } = await req.json();
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    if (response.content[0].type === 'text') {
      return NextResponse.json({ 
        response: response.content[0].text,
        remainingMessages: DAILY_LIMIT - record.count
      });
    }

    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}