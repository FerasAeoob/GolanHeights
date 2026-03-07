import Image from "next/image";


export default function HeroSection() {
    return (
        /* h-screen: sets height to 100vh for mobile (default)
           Everything else (sm, md, lg) will inherit h-screen unless you override it.
        */
        <div className="relative box-border w-full h-screen overflow-hidden">
            <Image
                src="https://res.cloudinary.com/dsjzcazdi/image/upload/v1772793800/348d5747-937d-4aa4-8dd6-32f9ed35191b_rh5rmz.webp"
                alt="Hero"
                fill
                priority
                className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <h1 className="text-white text-4xl md:text-6xl font-bold text-center px-4">
                    Welcome to Golan Heights
                </h1>
            </div>
        </div>
    );
}