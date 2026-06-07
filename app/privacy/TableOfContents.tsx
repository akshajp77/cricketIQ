"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./sections";

export function TableOfContents() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-3">
        On this page
      </p>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`block text-sm py-1.5 px-3 rounded-md transition-colors border-l-2 ${
            active === s.id
              ? "border-[#00D4AA] text-[#00D4AA] bg-[#00D4AA]/5"
              : "border-transparent text-[#9CA3AF] hover:text-white hover:bg-white/5"
          }`}
        >
          {s.title}
        </a>
      ))}
    </nav>
  );
}
