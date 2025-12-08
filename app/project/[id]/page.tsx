'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { tmdb } from '@/lib/tmdb';
import ScreenplayEditor from '@/components/screenplay/ScreenplayEditor';
import CastGrid from '@/components/cast/CastGrid';
import { Project } from '@/types/project';
import { Screenplay, CastMember, ScreenplayElement } from '@/types/screenplay';
import { v4 as uuidv4 } from 'uuid';
import { 
  FileText, 
  Users, 
  Image as ImageIcon, 
  Film, 
  Download,
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

type TabType = 'script' | 'cast' | 'visuals' | 'references' | 'export';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('script');
  const [project, setProject] = useState<Project | null>(null);
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [referenceMovies, setReferenceMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch project data
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        setProject(data.project);
        
        // Ensure all screenplay elements have unique IDs
        if (data.screenplay) {
          const screenplayWithIds = {
            ...data.screenplay,
            elements: (data.screenplay.elements || []).map((el: ScreenplayElement) => ({
              ...el,
              id: el.id || uuidv4(),
            })),
          };
          setScreenplay(screenplayWithIds);
        } else {
          setScreenplay(data.screenplay);
        }
        
        setCast(data.cast || []);

        // Fetch reference movie details
        if (data.project?.referenceMovieIds?.length) {
          const movies = await Promise.all(
            data.project.referenceMovieIds.map((movieId: number) =>
              fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
                .then(res => res.json())
                .catch(() => null)
            )
          );
          setReferenceMovies(movies.filter(Boolean));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, router]);

  // Save screenplay
  const handleSave = async () => {
    if (!screenplay) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${id}/screenplay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenplay }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setError('Failed to save screenplay');
    } finally {
      setSaving(false);
    }
  };

  // Update screenplay elements
  const handleElementsChange = (elements: any[]) => {
    if (screenplay) {
      setScreenplay({
        ...screenplay,
        elements,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const tabs = [
    { id: 'script', label: 'Script', icon: FileText },
    { id: 'cast', label: 'Cast', icon: Users },
    { id: 'visuals', label: 'Visuals', icon: ImageIcon },
    { id: 'references', label: 'References', icon: Film },
    { id: 'export', label: 'Export', icon: Download },
  ] as const;

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading project...</span>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link href="/dashboard" className="text-yellow-400 hover:text-yellow-300">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Project Header */}
      <div className="border-b border-neutral-800 bg-black/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{project.title}</h1>
                <p className="text-sm text-neutral-400">{project.logline}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'script' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* Script Tab */}
        {activeTab === 'script' && screenplay && (
          <div className="py-8">
            <ScreenplayEditor
              elements={screenplay.elements}
              onChange={handleElementsChange}
            />
          </div>
        )}

        {/* Cast Tab */}
        {activeTab === 'cast' && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Cast</h2>
              <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Sparkles className="w-4 h-4" />
                Generate Portraits
              </button>
            </div>
            <CastGrid cast={cast} projectId={id} onUpdate={setCast} />
          </div>
        )}

        {/* Visuals Tab */}
        {activeTab === 'visuals' && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Visuals</h2>
              <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors">
                <Sparkles className="w-4 h-4" />
                Generate Poster
              </button>
            </div>
            
            {project.posterUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                  <Image
                    src={project.posterUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
                <ImageIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No poster yet</h3>
                <p className="text-neutral-400 mb-6">Generate an AI poster for your screenplay</p>
                <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors mx-auto">
                  <Sparkles className="w-5 h-5" />
                  Generate Poster
                </button>
              </div>
            )}
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reference Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {referenceMovies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 mb-2">
                    {movie.poster_path && (
                      <Image
                        src={tmdb.getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:opacity-75 transition-opacity"
                      />
                    )}
                  </div>
                  <h3 className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Export Screenplay</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {[
                { format: 'pdf', label: 'PDF', description: 'Industry-standard format', icon: '📄' },
                { format: 'fdx', label: 'Final Draft', description: 'For Final Draft software', icon: '🎬' },
                { format: 'fountain', label: 'Fountain', description: 'Plain text markup', icon: '⛲' },
                { format: 'docx', label: 'Word Document', description: 'Microsoft Word format', icon: '📝' },
              ].map((option) => (
                <button
                  key={option.format}
                  onClick={() => window.open(`/api/projects/${id}/export?format=${option.format}`, '_blank')}
                  className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-400/50 hover:bg-neutral-800 transition-all text-left"
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <p className="text-white font-semibold">{option.label}</p>
                    <p className="text-sm text-neutral-400">{option.description}</p>
                  </div>
                  <Download className="w-5 h-5 text-neutral-500 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

