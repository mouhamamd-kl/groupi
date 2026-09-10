"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  requiresSpecialization,
  SPECIALIZATIONS,
} from "@/lib/specializations";
import type { NewPostInput, Post, PostType, Role, Year } from "@/lib/types";

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (data: NewPostInput) => Promise<void>;
  roles: Role[];
  years: Year[];
  initial?: Post | null;
  onUpdate?: (postId: number, data: NewPostInput) => Promise<void>;
}

export default function CreatePostModal({
  onClose,
  onSubmit,
  roles,
  years,
  initial,
  onUpdate,
}: CreatePostModalProps) {
  const { data: session, isPending } = authClient.useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postType, setPostType] = useState<PostType>(initial?.type ?? "team");
  const [year, setYear] = useState(initial?.year ?? 0);

  const isEdit = Boolean(initial);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const type = String(data.get("type") || "team") as PostType;
    const project =
      type === "team" ? String(data.get("project") || "").trim() || null : null;
    const roles =
      type === "team"
        ? [String(data.get("role") || "").trim()]
        : data
            .getAll("role")
            .map((value) => String(value).trim())
            .filter(Boolean);
    const telegram = String(data.get("contact") || "").trim();
    const year = Number(data.get("year") || 0);
    const description = String(data.get("description") || "").trim();
    const name = String(data.get("name") || "").trim();
    const github = String(data.get("github") || "").trim() || null;
    const specialization =
      data.get("specialization") && requiresSpecialization(year)
        ? String(data.get("specialization")).trim()
        : null;

    if (
      roles.length === 0 ||
      !year ||
      !name ||
      !telegram ||
      (requiresSpecialization(year) && !specialization)
    )
      return;

    setPending(true);
    setError(null);

    try {
      const payload: NewPostInput = {
        type,
        project,
        roles,
        year,
        description,
        name,
        contact: telegram,
        github,
        specialization,
      };

      if (isEdit && initial && onUpdate) {
        await onUpdate(initial.id, payload);
      } else {
        await onSubmit(payload);
        form.reset();
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "حدث خطأ أثناء النشر. حاول مرة أخرى."
      );
    } finally {
      setPending(false);
    }
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
            <div className="modal-eyebrow">
              {isEdit ? "تعديل المنشور" : "منشور جديد"}
            </div>

            <h3>
              {isEdit ? (
                <>
                  عدّل<br />
                  إعلانك
                </>
              ) : (
                <>
                  ماذا<br />
                  تبحث عنه؟
                </>
              )}
            </h3>
          </div>

          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {isPending ? (
          <div className="auth-gate">…</div>
        ) : !session?.user ? (
          <div className="auth-gate">
            <p>سجّل الدخول بحساب Google لنشر إعلانك</p>

            <button
              className="submit-button"
              onClick={() => authClient.signIn.social({ provider: "google" })}
            >
              تسجيل الدخول عبر Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="postType">أنا</label>

            <select
              id="postType"
              name="type"
              required
              value={postType}
              onChange={(event) => setPostType(event.target.value as PostType)}
            >
              <option value="team">فريق يبحث عن عضو</option>

              <option value="member">طالب يبحث عن فريق</option>
            </select>
          </div>

          {postType === "team" ? (
            <>
              <div className="form-group">
                <label>التخصص المطلوب</label>

                <div className="role-pills role-pills-team">
                  {roles.map((role) => (
                    <label key={role.value} className="role-pill">
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        required
                        defaultChecked={initial?.roleValues[0] === role.value}
                      />

                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="project">المشروع (اختياري)</label>

                  <input
                    id="project"
                    name="project"
                    type="text"
                    placeholder="مثال: تطبيق للهواتف"
                    defaultValue={initial?.project ?? ""}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">السنة</label>

                  <select
                    id="year"
                    name="year"
                    required
                    value={year === 0 ? "" : year}
                    onChange={(event) => setYear(Number(event.target.value))}
                  >
                    <option value="" disabled>
                      اختر السنة...
                    </option>

                    {years.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>تخصصي</label>

                <div className="role-pills">
                  {roles.map((role) => (
                    <label key={role.value} className="role-pill">
                      <input
                        type="checkbox"
                        name="role"
                        value={role.value}
                        defaultChecked={initial?.roleValues.includes(role.value)}
                      />

                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="year">السنة</label>

                <select
                  id="year"
                  name="year"
                  required
                  value={year === 0 ? "" : year}
                  onChange={(event) => setYear(Number(event.target.value))}
                >
                  <option value="" disabled>
                    اختر السنة...
                  </option>

                  {years.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="github">رابط GitHub (اختياري)</label>

                <input
                  id="github"
                  name="github"
                  type="text"
                  placeholder="مثال: someone أو someone/repo"
                  dir="ltr"
                  defaultValue={initial?.github ?? ""}
                />
              </div>
            </>
          )}

          {(requiresSpecialization(year) && year !== 0) && (
            <div className="form-group">
              <label htmlFor="specialization">التخصص</label>

              <select
                id="specialization"
                name="specialization"
                required
                defaultValue={initial?.specialization ?? ""}
              >
                <option value="" disabled>
                  اختر التخصص...
                </option>

                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">الوصف (اختياري)</label>

            <textarea
              id="description"
              name="description"
              placeholder="اكتب ما الذي تحتاج إليه..."
              defaultValue={initial?.description ?? ""}
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
                defaultValue={initial?.name ?? session.user.name ?? ""}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">معرف تيليجرام</label>

              <input
                id="contact"
                name="contact"
                type="text"
                placeholder="@username"
                dir="ltr"
                defaultValue={initial?.contact ?? ""}
                required
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="submit-button" type="submit" disabled={pending}>
            {pending
              ? isEdit
                ? "جاري الحفظ…"
                : "جاري النشر…"
              : isEdit
                ? "حفظ التعديلات"
                : "نشر الإعلان"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}