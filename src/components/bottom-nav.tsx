"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  ["/","홈","⌂"],["/team","TEAM","◎"],["/opportunity","기회","↗"],["/messages","메시지","◫"],["/profile","내 삶","◯"]
] as const;
export function BottomNav(){
 const path=usePathname();
 return <nav className="bottom-nav">{items.map(([href,label,icon])=>{
   const active=href==="/"?path==="/":path.startsWith(href);
   return <Link key={href} href={href} className={active?"active":""}><span className="nav-icon">{icon}</span><span>{label}</span></Link>
 })}</nav>
}
