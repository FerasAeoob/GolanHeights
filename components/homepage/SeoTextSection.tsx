import React from 'react';

export default function SeoTextSection({ dict }: { dict: Record<string, any> }) {
    if (!dict.seo) return null;

    return (
        <section className="flex flex-col items-center justify-center mt-4 mb-20">
            <div className="flex flex-col items-center justify-center w-full max-w-[1200px] lg:max-w-[1400px] px-4">
                
                {/* Header */}
                <div className="flex flex-col items-center mx-auto w-full gap-3 mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        {dict.seo.travelGuideTitle}
                    </h2>
                    <p className="relative text-lg md:text-xl text-slate-600 max-w-4xl">
                        {dict.seo.travelGuideText}
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full box-border p-2 sm:p-1">
                    
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 flex flex-col w-full h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {dict.seo.natureTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base">
                            {dict.seo.natureText}
                        </p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 flex flex-col w-full h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {dict.seo.foodTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base">
                            {dict.seo.foodText}
                        </p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 flex flex-col w-full h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {dict.seo.staysTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base">
                            {dict.seo.staysText}
                        </p>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 flex flex-col w-full h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {dict.seo.viewpointsTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base">
                            {dict.seo.viewpointsText}
                        </p>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 p-6 md:p-8 rounded-2xl shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 flex flex-col w-full h-full">
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {dict.seo.villagesTitle}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base max-w-5xl">
                            {dict.seo.villagesText}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
