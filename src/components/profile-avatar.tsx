"use client";
import { useState } from "react";
export function ProfileAvatar({userId,name,size="default",version}:{
 userId?:string|null;name?:string|null;size?:"default"|"large"|"xl";version?:string|null;
}){
 const [failed,setFailed]=useState(false);
 const src=userId ? "/api/avatar?userId="+encodeURIComponent(userId)+(version?"&v="+encodeURIComponent(version):"") : "";
 return <span className={`prof-avatar prof-avatar-${size}`} aria-label={name||"사용자"}>
  <span className="prof-avatar-initial">{String(name||"?").slice(0,1).toUpperCase()}</span>
  {src&&!failed&&<img key={src} src={src} alt="" loading="lazy" onError={()=>setFailed(true)}/>}
 </span>;
}
