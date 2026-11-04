import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const {supabase,userId}=await requireUser();const {count}=await supabase.from("notifications").select("id",{count:"exact",head:true}).eq("recipient_id",userId).is("read_at",null);return <AppShell userId={userId} unreadCount={count??0}>{children}</AppShell>}
