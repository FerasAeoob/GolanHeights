import React from 'react';

export default function SeoTextSection({ dict }: { dict: Record<string, any> }) {
    if (!dict.seo) return null;

    return (
        <section className="w-full flex justify-center py-16 px-4">
            <div className="w-full max-w-[1200px] lg:max-w-[1400px]">
                <article className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="md:col-span-2 text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            {dict.seo.travelGuideTitle}
                        </h2>
                        <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed">
                            {dict.seo.travelGuideText}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                            {dict.seo.natureTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {dict.seo.natureText}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-bold text-orange-800 mb-4">
                            {dict.seo.foodTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {dict.seo.foodText}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-bold text-indigo-800 mb-4">
                            {dict.seo.staysTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {dict.seo.staysText}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-bold text-blue-800 mb-4">
                            {dict.seo.viewpointsTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {dict.seo.viewpointsText}
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 md:p-12 rounded-3xl shadow-sm ring-1 ring-emerald-100">
                        <h3 className="text-2xl font-bold text-emerald-900 mb-4">
                            {dict.seo.villagesTitle}
                        </h3>
                        <p className="text-emerald-800/90 leading-relaxed text-lg max-w-4xl">
                            {dict.seo.villagesText}
                        </p>
                    </div>
                </article>
            </div>
        </section>
    );
}
