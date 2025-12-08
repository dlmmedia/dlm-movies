import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveProject, getUserProjects, saveScreenplay, saveCastMember } from '@/lib/storage';
import { Project } from '@/types/project';
import { Screenplay, CastMember } from '@/types/screenplay';
import { v4 as uuidv4 } from 'uuid';

// GET - List user's projects
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getUserProjects(session.userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { project, screenplay, characters } = body;

    if (!project) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    // Save project
    const fullProject: Project = {
      ...project,
      userId: session.userId,
    };
    await saveProject(fullProject);

    // Save screenplay if provided
    if (screenplay) {
      // Ensure each element has a unique ID
      const elementsWithIds = (screenplay.elements || []).map((el: { type: string; content: string; sceneNumber?: number }) => ({
        ...el,
        id: uuidv4(),
      }));
      
      const fullScreenplay: Screenplay = {
        id: uuidv4(),
        projectId: project.id,
        title: screenplay.title,
        author: session.name,
        elements: elementsWithIds,
        pageCount: Math.ceil((elementsWithIds.length || 0) / 55), // Rough estimate
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveScreenplay(fullScreenplay);
    }

    // Save cast members if provided
    if (characters && Array.isArray(characters)) {
      for (const character of characters) {
        const castMember: CastMember = {
          id: uuidv4(),
          projectId: project.id,
          characterName: character.name,
          description: character.description,
          role: character.role || 'supporting',
          arcSummary: character.arc,
          actorType: character.actorType || '',
        };
        await saveCastMember(castMember);
      }
    }

    return NextResponse.json({ 
      success: true,
      projectId: project.id,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

