"use client";

import { useState, type ReactNode } from "react";

type ProfileSection = { id: string; label: string; content: ReactNode };
export function ProfileTabs({ sections }: { sections: ProfileSection[] }) {
  const [active,setActive]=useState(sections[0]?.id||"record");
  const selected=sections.find(x=>x.id===active)||sections[0];
  if(!selected) return null;

  return <div className="profile-tabs-v16">
    <nav className="profile-tab-nav-v16" role="tablist" aria-label="프로필 활동 유형">
      {sections.map(section=><button type="button" key={section.id}
        id={`profile-tab-${section.id}`}
        role="tab" aria-selected={selected.id===section.id}
        aria-controls={`profile-panel-${section.id}`}
        className={selected.id===section.id?"active":""}
        onClick={()=>setActive(section.id)}>{section.label}</button>)}
    </nav>
    <div role="tabpanel" id={`profile-panel-${selected.id}`}
      aria-labelledby={`profile-tab-${selected.id}`} className="profile-tab-panel-v16">
      {selected.content}
    </div>
  </div>;
}
