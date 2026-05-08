import { useState } from "react";

interface Props {
  src?: string | null;
  alt: string;
  size?: number;
}

export function CoinThumb({ src, alt, size = 18 }: Props) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    const initials = alt.slice(0, 2).toUpperCase();
    return (
      <span
        className="flex items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase text-muted-foreground"
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        {initials}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      className="rounded-full bg-muted/50"
    />
  );
}
