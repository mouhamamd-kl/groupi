"use client";

import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/types";

export default function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="auth-chip auth-chip-skeleton"></div>;
  }

  if (!session?.user) {
    return (
      <button
        className="auth-chip"
        onClick={() => authClient.signIn.social({ provider: "google" })}
      >
        تسجيل الدخول
      </button>
    );
  }

  return (
    <div className="auth-user">
      {session.user.image ? (
        <img
          className="auth-avatar auth-avatar-img"
          src={session.user.image}
          alt=""
        />
      ) : (
        <span className="auth-avatar">
          {getInitials(session.user.name ?? "")}
        </span>
      )}

      <span className="auth-name">{session.user.name}</span>

      <button className="auth-signout" onClick={() => authClient.signOut()}>
        خروج
      </button>
    </div>
  );
}