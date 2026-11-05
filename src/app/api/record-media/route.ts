import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") || "";
  if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(path)) {
    return new NextResponse(null, { status: 404 });
  }
  const [ownerId, recordId] = path.split("/");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) return new NextResponse(null, { status: 401 });
  const { data: record } = await supabase.from("records").select("id,author_id,media")
    .eq("id",recordId).eq("author_id",ownerId).maybeSingle();
  if (!record || !Array.isArray(record.media) ||
    !record.media.some((image: {path?: string}) => image.path === path)) {
    return new NextResponse(null, { status: 404 });
  }
  const { data: blob, error } = await supabase.storage.from("record-media").download(path);
  if (error || !blob) return new NextResponse(null, { status: 404 });
  const type = path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : path.endsWith(".gif") ? "image/gif" : "image/jpeg";
  return new NextResponse(await blob.arrayBuffer(), { headers: {
    "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}
