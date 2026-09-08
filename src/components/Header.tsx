"use client";

interface HeaderProps {
  currentView: "teams" | "members";
  onSwitchView: (view: "teams" | "members") => void;
  onOpenPostModal: () => void;
}

export default function Header({
  currentView,
  onSwitchView,
  onOpenPostModal,
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
      </nav>

      <div className="header-action">
        <button className="post-button" onClick={onOpenPostModal}>
          <span>+</span>
          أضف منشورًا
        </button>
      </div>
    </header>
  );
}
