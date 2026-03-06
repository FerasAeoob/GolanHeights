import Image from "next/image";


export default function HeroSection() {
    return (

        <div className="relative w-full h-[100vh] sm:h-[80vh] md:h-screen overflow-hidden">
            <Image
                src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1772793800/348d5747-937d-4aa4-8dd6-32f9ed35191b_rh5rmz.webp"
                alt="Hero"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-white text-4xl md:text-6xl font-bold text-center">
                    Welcome to Golan Heights
                </h1>
            </div>
        </div>
    );
}