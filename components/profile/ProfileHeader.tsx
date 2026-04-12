import UserAvatar from "@/components/UserAvatar";
import { Calendar, Shield, Sparkles } from "lucide-react";

interface ProfileHeaderProps {
    user: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        image?: string;
        role: "user" | "admin" | "business";
        plan: "free" | "vip";
        createdAt?: string;
    };
    dict: Record<string, any>;
    lang: string;
}

export default function ProfileHeader({ user, dict, lang }: ProfileHeaderProps) {
    const p = dict?.profile || {};
    const roleLabel = p?.roles?.[user.role] || user.role;
    const planLabel = p?.plans?.[user.plan] || user.plan;

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString(
              lang === "he" ? "he-IL" : lang === "ar" ? "ar" : "en-US",
              { year: "numeric", month: "long", day: "numeric" }
          )
        : "";

    return (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 p-1">
            {/* Inner glass card */}
            <div className="rounded-[22px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 p-6 sm:p-8">
                {/* Decorative glow */}
                <div className="absolute top-0 end-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="ring-4 ring-emerald-500/20 rounded-full">
                            <UserAvatar
                                src={user.image}
                                name={user.name}
                                email={user.email}
                                size={112}
                                className="shadow-2xl"
                            />
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-1 end-1 w-5 h-5 bg-emerald-500 border-[3px] border-slate-900 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col items-center sm:items-start gap-1.5 flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white truncate max-w-full">
                            {user.name}
                        </h1>
                        <p className="text-sm text-white/50 truncate max-w-full">{user.email}</p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                                <Shield size={12} />
                                {roleLabel}
                            </span>
                            {user.plan === "vip" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                    <Sparkles size={12} />
                                    {planLabel}
                                </span>
                            )}
                            {user.plan === "free" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
                                    {planLabel}
                                </span>
                            )}
                        </div>

                        {/* Member since */}
                        {memberSince && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/30">
                                <Calendar size={12} />
                                <span>{p?.memberSince || "Member Since"}: {memberSince}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
