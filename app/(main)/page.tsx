// app/page.tsx
import Image from "next/image";
import CategoryCard from "@/components/homecomps/categorycard";
import categories from "@/public/cate-pics/categories";
import HeroSection from "@/components/homecomps/herosection";

export default function HomePage() {
    return (
        <>

            <div>

                {/* hero section */}
                <div>
                    <HeroSection />
                </div>
                {/* categories section */}
                <div>


                </div>
                {/* featured section */}
                <div>


                </div>





            </div>


        </>
    );
}