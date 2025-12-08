import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { streamGenerateScreenplay } from '@/lib/openrouter';
import { ReferenceMovie } from '@/types/screenplay';

// Use Node.js runtime for longer timeout support
export const runtime = 'nodejs';
// Allow up to 60 seconds for screenplay generation (Pro plan limit)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      referenceMovies, 
      customPrompt, 
      tone, 
      length = 'short',
    } = body as {
      referenceMovies: ReferenceMovie[];
      customPrompt?: string;
      tone?: string;
      length?: 'short' | 'feature' | 'pilot';
    };

    if (!referenceMovies || referenceMovies.length === 0) {
      return NextResponse.json(
        { error: 'At least one reference movie is required' },
        { status: 400 }
      );
    }

    // Always use streaming to avoid timeout issues
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerateScreenplay(
            referenceMovies,
            customPrompt,
            tone,
            length
          )) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Generation failed';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

