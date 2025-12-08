import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getProject, getScreenplay } from '@/lib/storage';
import { toFountain } from '@/lib/exporters/fountain';
import { toFDX } from '@/lib/exporters/fdx';
import { toScreenplayText } from '@/lib/exporters/pdf';
import { toRTF } from '@/lib/exporters/docx';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';

    // Verify project ownership
    const project = await getProject(session.userId, id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const screenplay = await getScreenplay(id);
    if (!screenplay) {
      return NextResponse.json({ error: 'Screenplay not found' }, { status: 404 });
    }

    // Generate filename
    const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    let content: string;
    let contentType: string;
    let extension: string;

    switch (format) {
      case 'fountain':
        content = toFountain(screenplay);
        contentType = 'text/plain';
        extension = 'fountain';
        break;

      case 'fdx':
        content = toFDX(screenplay);
        contentType = 'application/xml';
        extension = 'fdx';
        break;

      case 'docx':
        // Use RTF as a Word-compatible format
        content = toRTF(screenplay);
        contentType = 'application/rtf';
        extension = 'rtf';
        break;

      case 'pdf':
      default:
        // For PDF, we return a text representation
        // In production, you'd use a PDF library
        content = toScreenplayText(screenplay);
        contentType = 'text/plain';
        extension = 'txt';
        break;
    }

    const filename = `${safeTitle}.${extension}`;

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export screenplay' },
      { status: 500 }
    );
  }
}

