"use client";

import { getInitials, type Post } from "@/lib/types";

interface ContactModalProps {
  post: Post;
  onClose: () => void;
}

export default function ContactModal({ post, onClose }: ContactModalProps) {
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
            <div className="contact-avatar">{getInitials(post.name)}</div>

            <div>
              <div className="contact-name">{post.name}</div>

              <div className="contact-project">{post.project}</div>
            </div>
          </div>

          <div className="contact-box">
            <div className="contact-label">وسيلة التواصل</div>

            <div className="contact-value">{post.contact}</div>
          </div>
        </div>
      </div>
    </div>
  );
}