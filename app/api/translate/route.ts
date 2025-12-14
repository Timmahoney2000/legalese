import { NextResponse } from 'next/server';
import { extractLegalTerms, searchDictionaryByEmbedding } from '@/lib/dictionary';
import { translateWithOpenAI } from '@/lib/openai';
import { checkRateLimit, getClientIP, formatResetTime } from '@/lib/rateLimit';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10');
    const rateLimit = checkRateLimit(clientIP, maxRequests);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You've reached the maximum of ${maxRequests} translations per day. Please try again in ${formatResetTime(rateLimit.resetTime)}.`,
          resetTime: rateLimit.resetTime,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }
    
    const { documentText, fileName } = await req.json();
    
    if (!documentText || typeof documentText !== 'string') {
      return new Response('Invalid document text', { status: 400 });
    }
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'Configuration error',
        message: 'OpenAI API key is not configured. Please contact the administrator.',
      }, { status: 503 });
    }
    
    // Extract legal terms from the document
    const legalTerms = extractLegalTerms(documentText);
    
    // Search for definitions using vector similarity
    const termDefinitions = await searchDictionaryByEmbedding(legalTerms);
    
    // Build context from retrieved definitions
    let definitionsContext = '';
    
    for (const [term, matches] of termDefinitions.entries()) {
      if (matches.length > 0 && matches[0].score > 0.7) {
        const match = matches[0];
        definitionsContext += `\n**${match.term}**: ${match.definition}\n`;
      }
    }
    
    // Stream the translation using OpenAI
    const stream = await translateWithOpenAI({
      documentText,
      fileName,
      definitions: definitionsContext,
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to translate document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}