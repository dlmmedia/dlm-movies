'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectMetadata } from '@/types/project';
import { 
  Plus, 
  FileText, 
  Trash2, 
  MoreVertical, 
  Clock,
  Film,
  Loader2,
  Sparkles,
  FolderOpen
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return;
    }

    setDeleting(projectId);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleting(null);
      setShowMenu(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Screenplays</h1>
              <p className="text-neutral-400 mt-1">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-3 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Screenplay
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-neutral-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No screenplays yet</h2>
            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
              Start by selecting movies as inspiration and let AI generate your first screenplay.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Screenplay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all"
              >
                {/* Poster/Thumbnail */}
                <Link href={`/project/${project.id}`}>
                  <div className="relative aspect-[16/10] bg-neutral-800">
                    {project.posterUrl ? (
                      <Image
                        src={project.posterUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                        <FileText className="w-12 h-12 text-neutral-700" />
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/project/${project.id}`} className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-yellow-400 transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    
                    {/* Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === project.id ? null : project.id)}
                        className="p-1 text-neutral-500 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showMenu === project.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 z-10">
                          <Link
                            href={`/project/${project.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-neutral-700 transition-colors"
                            onClick={() => setShowMenu(null)}
                          >
                            <FileText className="w-4 h-4" />
                            Open
                          </Link>
                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleting === project.id}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-neutral-700 transition-colors"
                          >
                            {deleting === project.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* New project card */}
            <Link
              href="/"
              className="group flex items-center justify-center aspect-[4/3] bg-neutral-900/50 border-2 border-dashed border-neutral-800 rounded-xl hover:border-yellow-400/50 hover:bg-neutral-900 transition-all"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-400/20 transition-colors">
                  <Plus className="w-6 h-6 text-neutral-500 group-hover:text-yellow-400" />
                </div>
                <span className="text-neutral-500 group-hover:text-white transition-colors">
                  New screenplay
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

