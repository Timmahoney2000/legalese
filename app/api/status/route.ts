import { NextResponse } from 'next/server';
import { verifyOpenAIConnection } from '@/lib/openai';
import { verifyPineconeConnection } from '@/lib/pinecone';
import { getClientIP, checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
    const isOpenAIWorking = isOpenAIConfigured ? await verifyOpenAIConnection() : false;
    
    const isPineconeConfigured = !!process.env.PINECONE_API_KEY;
    const isPineconeWorking = isPineconeConfigured ? await verifyPineconeConnection() : false;
    
    // Get rate limit status
    const clientIP = getClientIP(req);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');
    const rateLimit = checkRateLimit(clientIP, maxRequests, 0);
    
    return NextResponse.json({
      openai: {
        configured: isOpenAIConfigured,
        working: isOpenAIWorking,
        model: 'gpt-4o-mini',
      },
      pinecone: {
        configured: isPineconeConfigured,
        working: isPineconeWorking,
        index: process.env.PINECONE_INDEX || 'legal-dictionary',
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        max: maxRequests,
        resetTime: rateLimit.resetTime,
      },
      ready: isOpenAIWorking && isPineconeWorking,
    });
  } catch (error) {
    return NextResponse.json({
      openai: {
        configured: false,
        working: false,
        model: 'gpt-4o-mini',
      },
      pinecone: {
        configured: false,
        working: false,
        index: '',
      },
      rateLimit: {
        remaining: 0,
        max: 0,
        resetTime: Date.now(),
      },
      ready: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}