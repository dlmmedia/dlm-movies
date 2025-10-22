import { Metadata } from 'next';
import Link from 'next/link';
import { Film, Gift, Briefcase, GraduationCap, Heart, Ghost, Sparkles, Trophy, Rocket, Users } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Curated Movie Lists',
  description: 'Hand-picked movie collections for every mood, season, and occasion.',
};

const curatedLists = [
  { id: 'christmas', title: 'Christmas Movies', icon: Gift, description: 'Holiday classics and festive favorites', color: 'from-red-600 to-green-600' },
  { id: 'entrepreneurs', title: 'Movies for Entrepreneurs', icon: Briefcase, description: 'Inspiring business and startup stories', color: 'from-blue-600 to-purple-600' },
  { id: 'students', title: 'Movies for Students', icon: GraduationCap, description: 'Coming-of-age and college films', color: 'from-yellow-500 to-orange-500' },
  { id: 'romance', title: 'Romantic Classics', icon: Heart, description: 'Timeless love stories', color: 'from-pink-500 to-red-500' },
  { id: 'horror', title: 'Horror Must-Watch', icon: Ghost, description: 'Spine-chilling thrillers', color: 'from-gray-700 to-gray-900' },
  { id: 'inspirational', title: 'Inspirational Movies', icon: Sparkles, description: 'Uplifting and motivating films', color: 'from-cyan-500 to-blue-600' },
  { id: 'award-winners', title: 'Award Winners', icon: Trophy, description: 'Oscar and Emmy winners', color: 'from-yellow-400 to-yellow-600' },
  { id: 'sci-fi', title: 'Sci-Fi Masterpieces', icon: Rocket, description: 'Mind-bending futuristic tales', color: 'from-purple-600 to-indigo-600' },
  { id: 'action-packed', title: 'Action-Packed Thrillers', icon: Film, description: 'Edge-of-your-seat excitement', color: 'from-orange-600 to-red-600' },
  { id: 'family-fun', title: 'Family Fun', icon: Users, description: 'Movies for all ages', color: 'from-green-500 to-emerald-600' },
];

export default function CuratedListsPage() {
  return (
    <>
      <main className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-1.5 h-12 bg-yellow-400 rounded-full"></span>
              Curated Lists
            </h1>
            <p className="text-neutral-300 text-lg">
              Discover hand-picked collections for every mood and occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedLists.map((list) => {
              const Icon = list.icon;
              return (
                <Link
                  key={list.id}
                  href={`/curated/${list.id}`}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-8 transition-transform hover:scale-105 hover:shadow-2xl"
                  style={{ backgroundImage: `linear-gradient(to bottom right, ${list.color.split(' ').join(', ')})` }}
                >
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 text-white mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{list.title}</h2>
                    <p className="text-white/90">{list.description}</p>
                  </div>
                  
                  {/* Overlay effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
