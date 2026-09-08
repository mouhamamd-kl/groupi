"use client";

import { FormEvent } from "react";
import type { Post, PostType } from "@/lib/types";

type NewPostData = Omit<Post, "meta" | "time">;

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (data: NewPostData) => void;
}

export default function CreatePostModal({
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const type = String(data.get("type") || "team") as PostType;
    const project = String(data.get("project") || "").trim();
    const role = String(data.get("role") || "").trim();
    const description = String(data.get("description") || "").trim();
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();

    if (!project || !role || !description || !name || !contact) return;

    onSubmit({ type, project, role, description, name, contact });
    form.reset();
    onClose();
  };

  return (
    <div
      className="overlay show"
      id="postOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">منشور جديد</div>

            <h3>
              ماذا<br />
              تبحث عنه؟
            </h3>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postType">أنا</label>

            <select id="postType" name="type" required defaultValue="team">
              <option value="team">فريق يبحث عن عضو</option>

              <option value="member">طالب يبحث عن فريق</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project">المشروع</label>

              <input
                id="project"
                name="project"
                type="text"
                placeholder="مثال: تطبيق للهواتف"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">التخصص المطلوب</label>

              <input
                id="role"
                name="role"
                type="text"
                placeholder="مثال: مطور Backend"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">الوصف</label>

            <textarea
              id="description"
              name="description"
              placeholder="اكتب ما الذي تحتاج إليه..."
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">الاسم</label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="مثال: أحمد محمد"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">وسيلة التواصل</label>

              <input
                id="contact"
                name="contact"
                type="text"
                placeholder="البريد الإلكتروني / واتساب"
                required
              />
            </div>
          </div>

          <button className="submit-button" type="submit">
            نشر الإعلان
          </button>
        </form>
      </div>
    </div>
  );
}