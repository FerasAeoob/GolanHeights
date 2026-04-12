export default function ProfileSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="w-28 h-28 rounded-full bg-slate-300" />
                    {/* Text */}
                    <div className="flex flex-col items-center sm:items-start gap-3 flex-1">
                        <div className="h-7 w-48 rounded-lg bg-slate-300" />
                        <div className="h-4 w-36 rounded bg-slate-300" />
                        <div className="flex gap-2 mt-1">
                            <div className="h-6 w-20 rounded-full bg-slate-300" />
                            <div className="h-6 w-16 rounded-full bg-slate-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-2xl bg-slate-100 p-6 space-y-4">
                        <div className="h-5 w-32 rounded bg-slate-300" />
                        <div className="space-y-3">
                            <div className="h-4 w-full rounded bg-slate-200" />
                            <div className="h-4 w-3/4 rounded bg-slate-200" />
                            <div className="h-4 w-1/2 rounded bg-slate-200" />
                        </div>
                    </div>
                </div>
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl bg-slate-100 p-6 space-y-4">
                        <div className="h-5 w-40 rounded bg-slate-300" />
                        <div className="space-y-4">
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                        </div>
                        <div className="h-11 w-36 rounded-xl bg-slate-300 mt-2" />
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-6 space-y-4">
                        <div className="h-5 w-36 rounded bg-slate-300" />
                        <div className="space-y-4">
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                            <div className="h-10 w-full rounded-xl bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
