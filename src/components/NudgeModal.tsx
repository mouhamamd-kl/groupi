"use client";

import type { Post } from "@/lib/types";

interface NudgeModalProps {
  post: Post;
  onAnswer: (found: boolean) => void;
  onClose: () => void;
}

export default function NudgeModal({
  post,
  onAnswer,
  onClose,
}: NudgeModalProps) {
  const isMember = post.type === "member";

  return (
    <div
      className="overlay show"
      id="nudgeOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">فحص الإعلان</div>

            <h3>{isMember ? "هل وجدت فريقًا؟" : "هل وجدت عضو الفريق؟"}</h3>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="nudge-text">
          <p>
            مرّت ثلاثة أيام على إعلانك
            {post.project ? ` "${post.project}"` : ""}.
          </p>

          <p>
            {isMember
              ? "إذا انضممت إلى فريق، أرشِف الإعلان حتى لا يبقى ظاهرًا للجميع."
              : "إذا اكتمل فريقك، أرشِف الإعلان حتى لا يبقى ظاهرًا للجميع."}
          </p>
        </div>

        <div className="nudge-actions">
          <button
            type="button"
            className="nudge-button nudge-button-yes"
            onClick={() => onAnswer(true)}
          >
            نعم، انتهيت — أرشِفه
          </button>

          <button
            type="button"
            className="nudge-button nudge-button-no"
            onClick={() => onAnswer(false)}
          >
            لا، ما زلت أبحث
          </button>
        </div>
      </div>
    </div>
  );
}