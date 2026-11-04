import { createMediaUrl, type RecordImage } from "@/lib/record-media";

export function RecordMedia({ media, variant = "feed" }: { media?: unknown; variant?: "feed" | "grid" | "profile" }) {
  const images: RecordImage[] = Array.isArray(media)
    ? media.filter((item): item is RecordImage => Boolean(item && typeof item === "object" && "path" in item && typeof item.path === "string"))
    : [];
  const valid = images.map((item) => ({ ...item, url: createMediaUrl(item.path) })).filter((item) => Boolean(item.url)).slice(0, 4);
  if (!valid.length) return null;
  return <div className={`record-media record-media-${variant} count-${valid.length}`}>
    {valid.map(({ path, url }, index) => <a href={url} target="_blank" rel="noopener noreferrer" key={path} aria-label={`사진 ${index + 1} 크게 보기`} className="record-media-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`기록 사진 ${index + 1}`} loading="lazy" decoding="async" />
    </a>)}
  </div>;
}
