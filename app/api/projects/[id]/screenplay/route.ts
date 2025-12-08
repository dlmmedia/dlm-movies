import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProject, getScreenplay, saveScreenplay } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get screenplay
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify project ownership
    const project = await getProject(session.userId, id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const screenplay = await getScreenplay(id);
    
    return NextResponse.json({ screenplay });
  } catch (error) {
    console.error('Error fetching screenplay:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenplay' },
      { status: 500 }
    );
  }
}

// PUT - Update screenplay
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { screenplay } = await request.json();
    
    // Verify project ownership
    const project = await getProject(session.userId, id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedScreenplay = {
      ...screenplay,
      projectId: id,
      updatedAt: new Date().toISOString(),
    };

    await saveScreenplay(updatedScreenplay);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating screenplay:', error);
    return NextResponse.json(
      { error: 'Failed to update screenplay' },
      { status: 500 }
    );
  }
}

