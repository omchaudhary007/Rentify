import Image from "next/image";

import { cn } from "@/lib/utils";
import type { CloudinaryImage } from "@/types/user";

export function ProductImage({
  images,
  name,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  index = 0,
}: {
  images: CloudinaryImage[] | undefined;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  index?: number;
}) {
  const image = images?.[index]?.url ?? images?.find((item) => item.url)?.url ?? null;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-secondary",
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="font-display text-4xl text-primary/35" aria-hidden="true">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span className="sr-only">No photo available</span>
        </div>
      )}
    </div>
  );
}
