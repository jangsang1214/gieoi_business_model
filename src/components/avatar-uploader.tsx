"use client";
import {useEffect,useState,type ChangeEvent} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {ProfileAvatar} from "@/components/profile-avatar";
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export function AvatarUploader({userId,name,initialPath}:{userId:string;name:string;initialPath:string|null}){
 const [path,setPath]=useState(initialPath);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [version,setVersion]=useState(String(Date.now()));
 const router=useRouter();
 async function upload(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value="";
  if(!file)return;
  const ext=extensions[file.type];
  if(!ext||file.size===0||file.size>3*1024*1024){setError("JPG, PNG, WEBP만 가능하며 3MB 이하여야 합니다.");return;}
  setBusy(true);setError("");
  const supabase=createClient();
  const nextPath=`${userId}/${crypto.randomUUID()}.${ext}`;
  const {error:uploadError}=await supabase.storage.from("profile-avatars").upload(nextPath,file,{contentType:file.type,upsert:false});
  if(uploadError){setError("사진 업로드에 실패했습니다. 다시 시도해 주세요.");setBusy(false);return;}
  const {data,error:saveError}=await supabase.from("profiles").update({avatar_url:nextPath}).eq("id",userId).select("id").maybeSingle();
  if(saveError||!data){
    await supabase.storage.from("profile-avatars").remove([nextPath]);
    setError("프로필 사진을 저장하지 못했습니다.");setBusy(false);return;
  }
  setPath(nextPath);setVersion(String(Date.now()));
  if(path){const {error:removeError}=await supabase.storage.from("profile-avatars").remove([path]);if(removeError)console.warn("Old avatar cleanup failed",removeError.message);}
  setBusy(false);router.refresh();
 }
 async function remove(){
  if(!path||busy)return;
  setBusy(true);setError("");
  const supabase=createClient();
  const {data,error:failed}=await supabase.from("profiles").update({avatar_url:null}).eq("id",userId).select("id").maybeSingle();
  if(failed||!data){setError("사진 삭제에 실패했습니다.");setBusy(false);return;}
  await supabase.storage.from("profile-avatars").remove([path]);
  setPath(null);setBusy(false);router.refresh();
 }
 return <div className="avatar-uploader-v19">
   <ProfileAvatar key={path||"empty"} userId={path?userId:null} name={name} size="xl" version={version}/>
   <div className="avatar-uploader-controls-v19">
     <label className="btn secondary" htmlFor="prof-avatar-file">{busy?"저장 중...":"사진 변경"}</label>
     <input id="prof-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload}/>
     {path&&<button type="button" className="quiet-link" onClick={remove} disabled={busy}>사진 삭제</button>}
     <small>JPG · PNG · WEBP / 3MB 이하</small>
     {error&&<span role="alert" className="error notice">{error}</span>}
   </div>
 </div>;
}
