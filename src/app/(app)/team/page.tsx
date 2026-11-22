import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TeamCreator } from "@/components/team-creator";
import { TeamApplyButton } from "@/components/team-apply-button";
import { RecommendationActions } from "@/components/recommendation-actions";
import { directionMatch } from "@/lib/match";
import { getLocale } from "@/lib/i18n-server";

export default async function TeamPage() {
  const { supabase, userId } = await requireUser();
  const locale = await getLocale();
  const en = locale === "en";
  const [{ data: teams }, { data: mine }, { data: td }, { data: feedback }, { data: applications }] = await Promise.all([
    supabase.from("teams").select("id,name,mission,domain,current_stage,owner_id,team_members(count),team_roles(title,is_open)").eq("discoverable", true).limit(30),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("team_direction_profiles").select("*"),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "team"),
    supabase.from("team_applications").select("team_id,status,created_at").eq("applicant_id", userId).order("created_at", { ascending: false }),
  ]);

  const tmap = new Map((td ?? []).map((x: any) => [x.team_id, x]));
  const fmap = new Map((feedback ?? []).map((x: any) => [x.target_id, x.state]));
  const applicationMap = new Map<string, "pending" | "accepted" | "rejected" | "withdrawn">();
  for (const app of applications ?? []) if (!applicationMap.has(app.team_id)) applicationMap.set(app.team_id, app.status);
  const visibleTeams = (teams ?? []).filter((t: any) => fmap.get(t.id) !== "dismissed");

  return <>
    <header className="utility-head team-head-simple"><div><h1>TEAM</h1><p>{en
      ? "Create a TEAM, recruit members, apply to join others and review applications."
      : "TEAM을 만들고 멤버를 모집하거나, 다른 TEAM에 가입 신청할 수 있습니다."}</p></div><TeamCreator userId={userId} locale={locale} /></header>
    {!visibleTeams.length ? <div className="empty"><h3>{en ? "No TEAMs yet" : "아직 TEAM이 없습니다."}</h3><p>{en ? "Create a TEAM to describe your project and recruit members." : "새 TEAM을 만들어 프로젝트 목표를 소개하고 팀원을 모집해 보세요."}</p></div> : visibleTeams.map((t: any) => {
      const m = directionMatch(mine, tmap.get(t.id) ?? null);
      const openRoles = (t.team_roles || []).filter((r: any) => r.is_open).map((r: any) => r.title).slice(0, 3);
      return <article className="match-card" key={t.id}>
        <Link href={`/team/${t.id}`} className="match-card-link">
          <div className="match-card-top"><div className="grow"><div className="mini-label">{String(t.domain).toUpperCase()}</div><h2>{t.name}</h2></div>{m && <span className="match-badge">{m.total}%</span>}</div>
          <p className="match-mission">{t.mission}</p>
          <div className="match-meta">{t.current_stage && <span>{t.current_stage}</span>}<span>{t.team_members?.[0]?.count ?? 0}명</span>{openRoles.length > 0 && <span>{openRoles.join(" · ")} 모집</span>}</div>
        </Link>
        <div className="match-card-actions"><div>{t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} initialStatus={applicationMap.get(t.id) ?? null} /> : <Link href={`/team/${t.id}`} className="btn secondary">TEAM 관리</Link>}</div>{t.owner_id !== userId && <RecommendationActions userId={userId} targetType="team" targetId={t.id} initialState={(fmap.get(t.id) as "saved" | "dismissed" | undefined) ?? null} />}</div>
      </article>;
    })}
  </>;
}
