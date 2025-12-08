import { put, del, list, head } from '@vercel/blob';
import { Project, ProjectMetadata, User } from '@/types/project';
import { Screenplay, CastMember, GeneratedAsset } from '@/types/screenplay';

const BLOB_PREFIX = {
  projects: 'projects',
  screenplays: 'screenplays',
  cast: 'cast',
  assets: 'assets',
  users: 'users',
  index: 'index',
};

// ============================================
// PROJECT OPERATIONS
// ============================================

export async function saveProject(project: Project): Promise<string> {
  const path = `${BLOB_PREFIX.projects}/${project.userId}/${project.id}.json`;
  const blob = await put(path, JSON.stringify(project), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  // Update user's project index
  await updateProjectIndex(project.userId, {
    id: project.id,
    userId: project.userId,
    title: project.title,
    posterUrl: project.posterUrl,
    status: project.status,
    updatedAt: project.updatedAt,
  });
  
  return blob.url;
}

export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  try {
    const path = `${BLOB_PREFIX.projects}/${userId}/${projectId}.json`;
    const { blobs } = await list({ prefix: path });
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return null;
  }
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const path = `${BLOB_PREFIX.projects}/${userId}/${projectId}.json`;
  await del(path);
  
  // Also delete associated screenplay, cast, and assets
  await deleteScreenplay(projectId);
  await deleteProjectCast(projectId);
  await deleteProjectAssets(projectId);
  
  // Update index
  await removeFromProjectIndex(userId, projectId);
}

export async function getUserProjects(userId: string): Promise<ProjectMetadata[]> {
  try {
    const indexPath = `${BLOB_PREFIX.index}/${userId}/projects.json`;
    const { blobs } = await list({ prefix: indexPath });
    
    if (blobs.length === 0) return [];
    
    const response = await fetch(blobs[0].url);
    const index = await response.json();
    return index.projects || [];
  } catch {
    return [];
  }
}

async function updateProjectIndex(userId: string, metadata: ProjectMetadata): Promise<void> {
  const projects = await getUserProjects(userId);
  const existingIndex = projects.findIndex(p => p.id === metadata.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = metadata;
  } else {
    projects.push(metadata);
  }
  
  const indexPath = `${BLOB_PREFIX.index}/${userId}/projects.json`;
  await put(indexPath, JSON.stringify({ projects }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function removeFromProjectIndex(userId: string, projectId: string): Promise<void> {
  const projects = await getUserProjects(userId);
  const filtered = projects.filter(p => p.id !== projectId);
  
  const indexPath = `${BLOB_PREFIX.index}/${userId}/projects.json`;
  await put(indexPath, JSON.stringify({ projects: filtered }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ============================================
// SCREENPLAY OPERATIONS
// ============================================

export async function saveScreenplay(screenplay: Screenplay): Promise<string> {
  const path = `${BLOB_PREFIX.screenplays}/${screenplay.projectId}.json`;
  const blob = await put(path, JSON.stringify(screenplay), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

export async function getScreenplay(projectId: string): Promise<Screenplay | null> {
  try {
    const path = `${BLOB_PREFIX.screenplays}/${projectId}.json`;
    const { blobs } = await list({ prefix: path });
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return null;
  }
}

export async function deleteScreenplay(projectId: string): Promise<void> {
  const path = `${BLOB_PREFIX.screenplays}/${projectId}.json`;
  try {
    await del(path);
  } catch {
    // Ignore if doesn't exist
  }
}

// ============================================
// CAST OPERATIONS
// ============================================

export async function saveCastMember(member: CastMember): Promise<string> {
  const path = `${BLOB_PREFIX.cast}/${member.projectId}/${member.id}.json`;
  const blob = await put(path, JSON.stringify(member), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

export async function getProjectCast(projectId: string): Promise<CastMember[]> {
  try {
    const path = `${BLOB_PREFIX.cast}/${projectId}/`;
    const { blobs } = await list({ prefix: path });
    
    const castMembers = await Promise.all(
      blobs
        .filter(b => b.pathname.endsWith('.json'))
        .map(async (blob) => {
          const response = await fetch(blob.url);
          return response.json();
        })
    );
    
    return castMembers;
  } catch {
    return [];
  }
}

export async function deleteProjectCast(projectId: string): Promise<void> {
  try {
    const path = `${BLOB_PREFIX.cast}/${projectId}/`;
    const { blobs } = await list({ prefix: path });
    
    await Promise.all(blobs.map(blob => del(blob.url)));
  } catch {
    // Ignore errors
  }
}

// ============================================
// ASSET OPERATIONS (posters, portraits, etc.)
// ============================================

export async function saveAsset(
  projectId: string,
  assetId: string,
  data: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<string> {
  const extension = contentType.includes('png') ? 'png' : 'jpg';
  const path = `${BLOB_PREFIX.assets}/${projectId}/${assetId}.${extension}`;
  
  const blob = await put(path, data, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  return blob.url;
}

export async function saveAssetMetadata(asset: GeneratedAsset): Promise<void> {
  const path = `${BLOB_PREFIX.assets}/${asset.projectId}/metadata/${asset.id}.json`;
  await put(path, JSON.stringify(asset), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getProjectAssets(projectId: string): Promise<GeneratedAsset[]> {
  try {
    const path = `${BLOB_PREFIX.assets}/${projectId}/metadata/`;
    const { blobs } = await list({ prefix: path });
    
    const assets = await Promise.all(
      blobs
        .filter(b => b.pathname.endsWith('.json'))
        .map(async (blob) => {
          const response = await fetch(blob.url);
          return response.json();
        })
    );
    
    return assets;
  } catch {
    return [];
  }
}

export async function deleteProjectAssets(projectId: string): Promise<void> {
  try {
    const path = `${BLOB_PREFIX.assets}/${projectId}/`;
    const { blobs } = await list({ prefix: path });
    
    await Promise.all(blobs.map(blob => del(blob.url)));
  } catch {
    // Ignore errors
  }
}

// ============================================
// USER OPERATIONS (Simple Auth)
// ============================================

export async function saveUser(user: User): Promise<string> {
  const path = `${BLOB_PREFIX.users}/${user.id}.json`;
  const blob = await put(path, JSON.stringify(user), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  // Also save email index for lookup
  const emailIndexPath = `${BLOB_PREFIX.users}/by-email/${encodeURIComponent(user.email)}.json`;
  await put(emailIndexPath, JSON.stringify({ userId: user.id }), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  return blob.url;
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const path = `${BLOB_PREFIX.users}/${userId}.json`;
    const { blobs } = await list({ prefix: path });
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const emailIndexPath = `${BLOB_PREFIX.users}/by-email/${encodeURIComponent(email)}.json`;
    const { blobs } = await list({ prefix: emailIndexPath });
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    const { userId } = await response.json();
    
    return getUserById(userId);
  } catch {
    return null;
  }
}

// ============================================
// EXPORT OPERATIONS
// ============================================

export async function saveExport(
  projectId: string,
  format: string,
  data: Buffer | Blob | string,
  filename: string
): Promise<string> {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    fdx: 'application/xml',
    fountain: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  const path = `${BLOB_PREFIX.assets}/${projectId}/exports/${filename}`;
  const blob = await put(path, data, {
    access: 'public',
    contentType: contentTypes[format] || 'application/octet-stream',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  
  return blob.url;
}

