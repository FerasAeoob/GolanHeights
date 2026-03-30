import { LucideIcon } from "lucide-react";

export default function HeroInfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className=" mt-3 gap-2 px-4 py-3 min-h-[150px] justify-center flex flex-col gap-1 w-[300px] md:w-[450px]  bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg">

            <div >
                <Icon className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-white text-l md:text-2xl font-bold">{title}</p>
                <p className="text-white text-sm md:text-l">{description}</p>
            </div>

        </div>
    );
}