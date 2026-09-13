import type { LucideProps } from "lucide-react";

export default function HorseRidingIcon({
  color = "currentColor",
  size = 24,
  strokeWidth = 2,
  absoluteStrokeWidth,
  ...props
}: LucideProps) {
  const resolvedStrokeWidth =
    absoluteStrokeWidth && typeof size === "number"
      ? (Number(strokeWidth) * 24) / size
      : strokeWidth;

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={resolvedStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15.5" cy="5.25" r="1.75" />
      <path d="M13.25 8.25 10.5 11l-2.75 1.25" />
      <path d="M12.5 8.75 15.5 11l3.5.25" />
      <path d="M9 12.25 6.5 10.75 4 11.5" />
      <path d="M8.75 12.5 10 15.25l3.5.25 2.75-2" />
      <path d="M10 15.25 8.25 18.5" />
      <path d="M13.5 15.5 14.5 19" />
      <path d="M4.5 13.5 7 16l4.5-.25 3.5.25 3.25-2.5" />
      <path d="M3.5 12.5 2.5 15l1 2.5 3.25.5 2.5 2.5" />
      <path d="M17.5 13.5 20 14.75l1.5 3.25" />
    </svg>
  );
}
