import Link from "next/link";
import { Heart } from "lucide-react";

interface EmptyStateProps {
    dict: Record<string, any>;
    lang: string;
}

export default function FavoritesEmptyState({ dict, lang }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-100/50 rounded-full blur-xl scale-150 animate-pulse" />
                <div className="relative bg-white border border-red-100 p-6 rounded-full shadow-sm text-red-400">
                    <Heart size={48} strokeWidth={1.5} />
                </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                {dict.favoritesPage?.emptyTitle || "Nothing saved yet"}
            </h2>
            
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                {dict.favoritesPage?.emptySubtitle || 
                "As you explore, click the heart icon to save places you'd love to visit."}
            </p>
            
            <Link 
                href={`/${lang}/places`}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ease-out"
            >
                {dict.favoritesPage?.exploreCTA || "Explore Places"}
            </Link>
        </div>
    );
}
