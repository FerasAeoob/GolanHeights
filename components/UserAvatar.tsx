

interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    email?: string | null;
    size?: number; // Size in pixels
    className?: string;
}

// A curated list of premium gradients so avatars look modern and clean
const avatarGradients = [
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-emerald-400 to-teal-600",
    "bg-gradient-to-br from-rose-400 to-red-600",
    "bg-gradient-to-br from-amber-400 to-orange-600",
    "bg-gradient-to-br from-cyan-400 to-blue-600",
    "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    "bg-gradient-to-br from-lime-400 to-green-600",
];

/**
 * Generates a consistent hash from a string to pick from the avatar gradients array.
 * We avoid Math.random() so the user gets the exact same color every time they log in.
 */
function getDeterministicGradient(identifier: string): string {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        // Bitwise rotation + character code
        hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Make sure we have a positive index
    const index = Math.abs(hash) % avatarGradients.length;
    return avatarGradients[index];
}

export default function UserAvatar({
    src,
    name,
    email,
    size = 40,
    className = "",
}: UserAvatarProps) {
    const defaultPlaceholder = "?";
    
    // 1. If we have a real image, just use next/image
    if (src) {
        return (
            <div
                className={`relative overflow-hidden rounded-full shadow-sm shrink-0 border border-black/5 ${className}`}
                style={{ width: size, height: size }}
            >
                <img
                    src={src}
                    alt={name || "User Avatar"}
                    className="h-full w-full object-cover"
                />
            </div>
        );
    }

    // 2. Otherwise drop to the automatic gradient avatar
    
    // We prefer the name to grab the first letter, fallback to email, fallback to '?'
    const rawLabel = name || email || defaultPlaceholder;
    const firstLetter = rawLabel.charAt(0).toUpperCase();

    // We prefer hashing the email (unique) but fallback to name
    const identifierToHash = email || name || "default";
    const gradientClass = getDeterministicGradient(identifierToHash);

    // Dynamic text size based on the standard container size
    const fontSize = Math.max(12, size * 0.4);

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-full shadow-sm text-white font-semibold select-none border border-black/5 ${gradientClass} ${className}`}
            style={{ 
                width: size, 
                height: size, 
                fontSize: `${fontSize}px` 
            }}
            title={name || email || "User Avatar"}
        >
            {firstLetter}
        </div>
    );
}
