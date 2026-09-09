"use client";

import { useState } from "react";
import { getInitials, type Post } from "@/lib/types";

interface ContactModalProps {
  post: Post;
  onClose: () => void;
}

export default function ContactModal({ post, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const handle = post.contact.replace(/^@/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(handle);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = handle;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="overlay show"
      id="contactOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">تواصل</div>

            <h3>
              تواصل مع<br />
              هذا الطالب.
            </h3>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="contact-content">
          <div className="contact-person">
            {post.avatar ? (
              <img
                className="contact-avatar contact-avatar-img"
                src={post.avatar}
                alt=""
              />
            ) : (
              <div className="contact-avatar">{getInitials(post.name)}</div>
            )}

            <div>
              <div className="contact-name">{post.name}</div>

              {post.type === "team" && post.project && (
                <div className="contact-project">{post.project}</div>
              )}
            </div>
          </div>

          <div className="contact-box">
            <div className="contact-label">تيليجرام</div>

            <div className="contact-value">@{handle}</div>

            <div className="contact-actions">
              <button
                type="button"
                className={`copy-button ${copied ? "copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "تم النسخ ✓" : "نسخ المعرف"}
              </button>

              <a
                className="contact-open"
                href={`https://t.me/${handle}`}
                target="_blank"
                rel="noreferrer"
              >
                فتح في تيليجرام
              </a>
            </div>
          </div>

          {post.type === "member" && post.github && (
            <div className="contact-box contact-box-github">
              <div className="contact-label">GitHub</div>

              <div className="contact-value">{post.github}</div>

              <div className="contact-actions">
                <a
                  className="contact-open"
                  href={post.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  فتح في GitHub
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}