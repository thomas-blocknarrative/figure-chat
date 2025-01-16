import { NextResponse } from 'next/server';
import { getMessages } from '@/app/lib/db';

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-forwarded-for') || 'anonymous';
    const messages = await getMessages(userId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 