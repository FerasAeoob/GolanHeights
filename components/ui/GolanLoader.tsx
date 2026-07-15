import Image from "next/image";

import blueMountain from "@/public/branding/golan-blue-mountain.png";
import yellowSymbol from "@/public/branding/golan-yellow-symbol.png";

export default function GolanLoader() {
  return (
    <div
      className="flex min-h-screen min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[var(--background)]"
      role="status"
      aria-label="Loading Golan Wiki"
    >
      <span className="sr-only">Loading Golan Wiki</span>

      <div className="golan-loader__stage" aria-hidden="true">
        <Image
          className="golan-loader__piece golan-loader__mountain"
          src={blueMountain}
          alt=""
          aria-hidden="true"
          sizes="(min-width: 1240px) 158px, (min-width: 880px) 12.72vw, 112px"
          preload
        />
        <Image
          className="golan-loader__piece golan-loader__yellow"
          src={yellowSymbol}
          alt=""
          aria-hidden="true"
          sizes="(min-width: 1240px) 298px, (min-width: 880px) 24vw, 211px"
          preload
        />
      </div>
    </div>
  );
}
