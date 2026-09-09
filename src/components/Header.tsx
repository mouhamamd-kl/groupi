"use client";

import AuthStatus from "@/components/AuthStatus";

interface HeaderProps {
  currentView: "teams" | "members" | "mine";
  onSwitchView: (view: "teams" | "members" | "mine") => void;
  onOpenPostModal: () => void;
  isAdmin: boolean;
}

export default function Header({
  currentView,
  onSwitchView,
  onOpenPostModal,
  isAdmin,
}: HeaderProps) {
  return (
    <header>
      <a href="#" className="logo">
        <div className="logo-mark"></div>
        زميل
      </a>

      <nav className="nav">
        <button
          className={`nav-button ${currentView === "teams" ? "active" : ""}`}
          data-view="teams"
          onClick={() => onSwitchView("teams")}
        >
          فرق تبحث عن عضو
        </button>

        <button
          className={`nav-button ${currentView === "members" ? "active" : ""}`}
          data-view="members"
          onClick={() => onSwitchView("members")}
        >
          طلاب يبحثون عن فريق
        </button>

        <button
          className={`nav-button ${currentView === "mine" ? "active" : ""}`}
          data-view="mine"
          onClick={() => onSwitchView("mine")}
        >
          منشوراتي
        </button>

        {isAdmin && (
          <a href="/dashboard" className="nav-button nav-link">
            لوحة التحكم
          </a>
        )}
      </nav>

      <div className="header-action">
        {process.env.NEXT_PUBLIC_GITHUB_URL && (
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="github-star"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>

            <span className="github-star-label">Star us on GitHub</span>
          </a>
        )}

        <AuthStatus />

        <button className="post-button" onClick={onOpenPostModal}>
          <span>+</span>
          أضف منشورًا
        </button>
      </div>
    </header>
  );
}
