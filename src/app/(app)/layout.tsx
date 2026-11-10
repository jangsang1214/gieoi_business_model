import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const {supabase,userId}=await requireUser();const {count}=await supabase.from("notifications").select("id",{count:"exact",head:true}).eq("recipient_id",userId).is("read_at",null);const locale = await getLocale();return <AppShell locale={locale} userId={userId} unreadCount={count??0}>{children}</AppShell>}
