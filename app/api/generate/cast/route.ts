import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { suggestCasting } from '@/lib/openrouter';

// Allow up to 60 seconds for AI generation
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { characters } = body;

    if (!characters || characters.length === 0) {
      return NextResponse.json(
        { error: 'Characters are required' },
        { status: 400 }
      );
    }

    const suggestions = await suggestCasting(characters);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Cast suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cast suggestions' },
      { status: 500 }
    );
  }
}

