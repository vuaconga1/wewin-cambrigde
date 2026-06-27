"use client";

import Image from "next/image";

type Props = {
  icon?: string;
  emoji?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function WordVisual({
  icon,
  emoji,
  alt,
  className = "",
  imageClassName = "h-16 w-16 object-contain md:h-20 md:w-20",
}: Props) {
  if (icon) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Image
          src={icon}
          alt={alt}
          width={120}
          height={120}
          className={imageClassName}
          unoptimized
        />
      </div>
    );
  }

  return <div className={className}>{emoji || "📝"}</div>;
}