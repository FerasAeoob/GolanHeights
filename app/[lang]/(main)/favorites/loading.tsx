export default function FavoritesLoading() {
    return (
        <section className="lg:max-w-[1400px] max-w-[1200px] mt-35 mx-auto px-4 pb-20">
            {/* Header Skeleton */}
            <div className="mb-12 border-b border-gray-100 pb-8 flex flex-col items-center md:items-start text-center md:text-start">
                <div className="h-10 bg-gray-200 rounded-md w-64 mb-3 animate-pulse"></div>
                <div className="h-5 bg-gray-100 rounded-md w-80 animate-pulse"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i} 
                        className="flex relative h-100 sm:h-80 w-full rounded-2xl bg-gray-50 overflow-hidden shadow-sm border border-gray-100 animate-pulse"
                    >
                        {/* Image Placeholder */}
                        <div className="absolute top-0 left-0 right-0 bottom-40 sm:bottom-32 bg-gray-200" />
                        
                        {/* Content Area Placeholder */}
                        <div className="mt-auto z-20 w-full h-40 sm:h-32 p-4 bg-white flex flex-col justify-end gap-3">
                            {/* Title line */}
                            <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                            {/* Location line */}
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            {/* Description lines */}
                            <div className="space-y-2 mt-2">
                                <div className="h-3 bg-gray-100 rounded w-full"></div>
                                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
