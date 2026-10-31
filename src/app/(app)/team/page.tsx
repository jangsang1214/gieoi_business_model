import { requireUser } from "@/lib/auth";
import { TeamCreator } from "@/components/team-creator";
import { TeamApplyButton } from "@/components/team-apply-button";
import { directionMatch } from "@/lib/match";

export default async function TeamPage() {
  const { supabase, userId } = await requireUser();
  const [{ data: teams }, { data: mine }, { data: td }] = await Promise.all([
    supabase.from("teams").select("id,name,mission,domain,current_stage,owner_id,team_members(count),team_roles(title,is_open)").eq("discoverable", true).limit(30),
    supabase.from("direction_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("team_direction_profiles").select("*"),
  ]);
  const tmap = new Map((td ?? []).map((x: any) => [x.team_id, x]));

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-top">
          <div><div className="eyebrow">TEAM / DIRECTION MATCH</div><h1>같이 좋아하는 사람보다,<br />같이 갈 사람.</h1></div>
          <TeamCreator userId={userId} />
        </div>
        <p>Goal, Proof, 역량과 활동 리듬을 비교해 실제로 함께 움직일 TEAM을 발견합니다.</p>
      </section>

      {!teams?.length ? (
        <div className="empty"><h3>아직 발견할 TEAM이 없습니다.</h3><p>첫 TEAM을 만들면 그 Journey와 Proof가 사람을 모으기 시작합니다.</p></div>
      ) : teams.map((t: any) => {
        const m = directionMatch(mine, tmap.get(t.id) ?? null);
        return (
          <div className="card" key={t.id}>
            <div className="row">
              <div className="grow"><div className="kicker">{String(t.domain).toUpperCase()}</div><h2>{t.name}</h2><div className="meta">{t.current_stage || "Moving"}</div></div>
              {m && <div className="score">{m.total}<span style={{fontSize:10,color:"var(--muted2)"}}>%</span></div>}
            </div>
            <p>{t.mission}</p>
            {m && <div className="reason"><b>왜 추천됐나요?</b><ul><li>미래 방향 {m.future}%</li><li>Proof 깊이 {m.proof}%</li><li>보완 역량 {m.complement}%</li><li>활동 리듬 {m.rhythm}%</li></ul></div>}
            <div className="row" style={{ marginTop: 14 }}>
              {t.owner_id !== userId ? <TeamApplyButton teamId={t.id} userId={userId} /> : <span className="badge">내 TEAM</span>}
              <span className="badge">{t.team_members?.[0]?.count ?? 0} PEOPLE</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
