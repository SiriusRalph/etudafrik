import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import heroCampus from "@/assets/hero-campus.jpg";
import { cn } from "@/lib/utils";

// Campus photos used when a school has no cover or its cover fails to load.
const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=80",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80",
  "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=1400&q=80",
];

// Same school always gets the same fallback photo.
const pickFallback = (seed: string) => {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
};

interface SchoolCoverProps {
  src?: string | null;
  seed: string;
  alt: string;
  className?: string;
}

export const SchoolCover = ({ src, seed, alt, className }: SchoolCoverProps) => {
  // Try the school's own cover, then a stock campus photo, then the bundled image.
  const sources = [src, pickFallback(seed), heroCampus].filter(Boolean) as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [src, seed]);

  return (
    <img
      src={sources[index]}
      alt={alt}
      loading="lazy"
      onError={() => setIndex((i) => Math.min(i + 1, sources.length - 1))}
      className={cn("absolute inset-0 w-full h-full object-cover", className)}
    />
  );
};

interface SchoolLogoProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

export const SchoolLogo = ({ src, alt, className, iconClassName }: SchoolLogoProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return <GraduationCap className={cn("text-primary", iconClassName)} />;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
};
