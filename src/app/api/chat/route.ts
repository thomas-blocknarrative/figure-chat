import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getMessages, saveMessage } from '@/app/lib/db';

export async function GET(req: Request) {
  const userId = req.headers.get('x-forwarded-for') || 'anonymous';
  const messages = await getMessages(userId);
  return NextResponse.json({ messages });
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Store IP addresses and their request counts
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const DAILY_LIMIT = 20;

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    // Get or create record for this IP
    let record = requestCounts.get(userId);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
    }
    
    // Check if limit exceeded
    if (record.count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        error: `Daily limit reached. Try again in ${Math.ceil((record.resetTime - now) / (1000 * 60 * 60))} hours.` 
      }, { status: 429 });
    }

    const { messages, systemPrompt, figureId } = await req.json();

    // Validate required fields
    if (!messages || !systemPrompt || !figureId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Claude's response
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    // Save user message
    await saveMessage(userId, {
      text: messages[messages.length - 1].content,
      sender: 'user',
      timestamp: now,
      figureId
    });

    // Save assistant message
    await saveMessage(userId, {
      text: response.content[0].text,
      sender: 'assistant',
      timestamp: now + 1, // Add 1ms to ensure correct ordering
      figureId
    });
    
    // Increment count only after successful response
    record.count++;
    requestCounts.set(userId, record);

    return NextResponse.json({ 
      response: response.content[0].text,
      remainingMessages: DAILY_LIMIT - record.count
    });
  } catch (error: any) {
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: error?.message || 'Failed to get response'
    }, { status: 500 });
  }
}