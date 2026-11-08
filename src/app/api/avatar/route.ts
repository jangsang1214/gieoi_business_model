import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(req:NextRequest){
 const userId=req.nextUrl.searchParams.get("userId")||"";
 if(!/^[0-9a-f-]{36}$/i.test(userId))return new NextResponse(null,{status:404});
 const supabase=await createClient();
 const {data:auth}=await supabase.auth.getClaims();
 if(!auth?.claims?.sub)return new NextResponse(null,{status:401});
 const {data:profile}=await supabase.from("profiles").select("id,avatar_url").eq("id",userId).maybeSingle();
 const path=profile?.avatar_url;
 if(!path||!path.startsWith(userId+"/")||!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(path))return new NextResponse(null,{status:404});
 const {data:file,error}=await supabase.storage.from("profile-avatars").download(path);
 if(error||!file)return new NextResponse(null,{status:404});
 const type=path.endsWith(".png")?"image/png":path.endsWith(".webp")?"image/webp":"image/jpeg";
 return new NextResponse(await file.arrayBuffer(),{headers:{"Content-Type":type,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
