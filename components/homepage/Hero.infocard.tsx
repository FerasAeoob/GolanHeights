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
        <div className="flex-1 flex flex-col gap-3 p-5  min-h-[160px] bg-white/6 backdrop-blur-[4px] rounded-3xl shadow-lg border border-white/5 transition-all hover:bg-white/15">
            <div className="flex items-center justify-start">
                <Icon className="text-emerald-400 w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-white text-lg md:text-xl font-bold leading-tight">
                    {title}
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}