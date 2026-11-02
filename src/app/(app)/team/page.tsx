import { requireUser } from "@/lib/auth";
import { TeamCreator } from "@/components/team-creator";
import { TeamApplyButton } from "@/components/team-apply-button";
import { RecommendationActions } from "@/components/recommendation-actions";
import { directionMatch } from "@/lib/match";

export default async function TeamPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: teams }, { data: mine }, { data: td }, { data: feedback }] = await Promise.all([
    supabase.from("teams").select("id,name,mission,domain,current_stage,owner_id,team_members(count),team_roles(title,is_open)").eq("discoverable", true).limit(30),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("team_direction_profiles").select("*"),
    supabase.from("recommendation_feedback").select("target_id,state").eq("user_id", userId).eq("target_type", "team"),
  ]);

  const tmap = new Map((td ?? []).map((x: any) => [x.team_id, x]));
  const fmap = new Map((feedback ?? []).map((x: any) => [x.target_id, x.state]));
  const visibleTeams = (teams ?? []).filter((t: any) => fmap.get(t.id) !== "dismissed");

  return (
    <>
      <header className="utility-head team-head-simple">
        <div><h1>TEAM</h1><p>함께 해낼 사람들.</p></div>
        <TeamCreator userId={userId} />
      </header>

      {!visibleTeams.length ? (
        <div className="empty"><h3>아직 TEAM이 없습니다.</h3><p>무엇을 함께 해낼지 정하면 TEAM을 만들 수 있습니다.</p></div>
      ) : visibleTeams.map((t: any) => {
        const m = directionMatch(mine, tmap.get(t.id) ?? null);
        const openRoles = (t.team_roles || []).filter((r: any) => r.is_open).map((r: any) => r.title).slice(0, 3);
        return (
          <article className="match-card" key={t.id}>
            <div className="match-card-top">
              <div className="grow"><div className="mini-label">{String(t.domain).toUpperCase()}</div><h2>{t.name}</h2></div>
              {m && <span className="match-badge">{m.total}%</span>}
            </div>
            <p className="match-mission">{t.mission}</p>
            <div className="match-meta">
              {t.current_stage && <span>{t.current_stage}</span>}
              <span>{t.team_members?.[0]?.count ?? 0}명</span>
              {openRoles.length > 0 && <span>{openRoles.join(" · ")} 모집</span>}
            </div>
            <div className="match-card-actions">
              <div>{t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} /> : <span className="badge">내 TEAM</span>}</div>
              {t.owner_id !== userId && <RecommendationActions userId={userId} targetType="team" targetId={t.id} initialState={(fmap.get(t.id) as "saved" | "dismissed" | undefined) ?? null} />}
            </div>
          </article>
        );
      })}
    </>
  );
}
