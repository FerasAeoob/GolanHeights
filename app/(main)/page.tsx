import '../globals.css';
import CategoryCard from "@/components/homecomps/categorycard";
import categories from "@/components/cate-pics/categories"; // Ensure this is the array
import HeroSection from "@/components/homecomps/herosection";

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="pb-10">
                <HeroSection />
            </section>

            {/* Categories Section */}
            <section className="flex flex-col items-center justify-center  ">
                    <div className="flex flex-col items-center justify-center mb-8 w-full  lg:max-w-[70%] ">


                    <div className="flex flex-col items-center justify-center mb-8 w-[85%]">
                        <h3 className="text-green-900  font-medium uppercase tracking-widest text-lg text-center">
                            Discover
                        </h3>
                        <h2 className=" text-3xl md:text-4xl font-bold text-slate-900 mb-3 mt-3 text-center">
                            Explore by Category
                        </h2>
                        <p className="relative text-lg md:text-xl text-center">From ancient ruins to adventure sports, the Golan Heights offers something for every traveler.</p>
                    </div>

                    {/* Grid - Removed <li> and used direct mapping */}
                    <div className="flex flex-wrap justify-center gap-4 max-w-dvw w-full  mx-auto px-4 box-border  ">
                        {categories.map((cat) => (
                            <div
                                key={cat.slug}
                                className="
                /* Mobile: 2 per row (approx 45%) */
                w-[45%]
                /* Tablet: Still 2 per row, but maybe you want 3? (w-[30%]) */
                md:w-[45%] md:max-w-[45%] md:
                /* Desktop: 3 per row */
                lg:w-[30%]
                /* THE 'STOP' POINT: Individual cards won't exceed this width */
                max-w-[350px]


            "
                            >
                                <CategoryCard category={cat} />
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Featured Section */}
            <section className="flex flex-col items-center justify-center mt-12">
                <div className="flex flex-col items-center justify-center mb-8 w-full  lg:max-w-[70%] ">
                    <div>
                        <h3 className="text-green-900  font-medium uppercase tracking-widest text-lg text-center">
                            Highlights
                        </h3>
                        <h2 className=" text-3xl md:text-4xl font-bold text-slate-900 mb-3 mt-3 text-center">
                            Featured Events
                        </h2>



                    </div>
                    <div>

                    </div>

                </div>
                {/* Your featured content will go here */}
            </section>
        </main>
    );
}