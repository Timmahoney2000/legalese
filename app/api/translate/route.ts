import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractLegalTerms, searchDictionaryByEmbedding } from '@/lib/dictionary';
import { translateWithOpenAI } from '@/lib/openai';
import { incrementUsage, getUsageStats } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please sign in to use the translator.',
        },
        { status: 401 }
      );
    }

    // Check usage limits
    const usage = getUsageStats(session.user.email);
    
    if (!usage) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has reached their limit
    if (usage.limit !== 999999 && usage.used >= usage.limit) {
      const resetDate = new Date(usage.resetDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      return NextResponse.json(
        {
          error: 'Limit reached',
          message: `You've reached your ${usage.plan.toLowerCase()} plan limit of ${usage.limit} translations. Your limit resets on ${resetDate}. Upgrade your plan for more translations.`,
          upgradeUrl: '/pricing',
        },
        { status: 429 }
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
    
    // Increment usage count BEFORE translation
    const incremented = incrementUsage(session.user.email);
    
    if (!incremented) {
      return NextResponse.json(
        {
          error: 'Failed to update usage',
          message: 'An error occurred. Please try again.',
        },
        { status: 500 }
      );
    }

    // Stream the translation using OpenAI
    const stream = await translateWithOpenAI({
      documentText,
      fileName,
      definitions: definitionsContext,
    });
    
    // Get updated usage stats
    const updatedUsage = getUsageStats(session.user.email);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Usage-Used': updatedUsage?.used.toString() || '0',
        'X-Usage-Limit': updatedUsage?.limit.toString() || '0',
        'X-Usage-Plan': updatedUsage?.plan || 'FREE',
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