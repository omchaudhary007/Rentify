"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CloudinaryImage } from "@/types/user";

export function ProductGallery({
  images,
  name,
}: {
  images: CloudinaryImage[] | undefined;
  name: string;
}) {
  const urls = (images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url));
  const [selected, setSelected] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = urls.length;

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, Math.max(total - 1, 0)));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setSelected(clamped);
  };

  if (total === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-panel border border-border bg-secondary">
        <div className="text-center">
          <span className="font-display text-6xl text-primary/35">{name.slice(0, 1)}</span>
          <p className="mt-2 text-xs text-muted-foreground">No photo available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden sm:block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-panel border border-border bg-secondary">
          <Image
            src={urls[selected]}
            alt={`${name} — photo ${selected + 1} of ${total}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          {total > 1 ? (
            <span className="absolute bottom-3 right-3 rounded-pill bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background backdrop-blur">
              {selected + 1} / {total}
            </span>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-3" role="group" aria-label="Product photos">
            {urls.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border bg-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected === index
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border hover:border-primary/40",
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="sm:hidden">
        <div
          ref={trackRef}
          onScroll={(event) => {
            const track = event.currentTarget;
            if (track.clientWidth === 0) return;
            const index = Math.round(track.scrollLeft / track.clientWidth);
            if (index !== selected) setSelected(index);
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-panel border border-border bg-secondary"
          aria-label="Product photos"
        >
          {urls.map((url, index) => (
            <div
              key={url}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
              aria-label={`Photo ${index + 1} of ${total}`}
            >
              <Image
                src={url}
                alt={`${name} — photo ${index + 1} of ${total}`}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {total > 1 ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" role="group" aria-label="Choose photo">
              {urls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  aria-pressed={selected === index}
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    "size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected === index ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-xs text-muted-foreground tabular">
                {selected + 1} / {total}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous photo"
                disabled={selected === 0}
                onClick={() => scrollToIndex(selected - 1)}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next photo"
                disabled={selected === total - 1}
                onClick={() => scrollToIndex(selected + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
