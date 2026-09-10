import { getInitials, type Post } from "@/lib/types";
import { getSpecializationLabel } from "@/lib/specializations";

interface FeedEmptyAction {
  label: string;
  onClick: () => void;
}

interface FeedProps {
  title: string;
  count: string;
  posts: Post[];
  animKey: string;
  onContact: (post: Post) => void;
  currentUserId: string | null;
  onDelete: (postId: number) => void;
  onEdit?: (post: Post) => void;
  onReactivate?: (post: Post) => void;
  emptyTitle?: string | null;
  emptyHint?: string | null;
  emptyAction?: FeedEmptyAction | null;
}

export default function Feed({
  title,
  count,
  posts,
  animKey,
  onContact,
  currentUserId,
  onDelete,
  onEdit,
  onReactivate,
  emptyTitle,
  emptyHint,
  emptyAction,
}: FeedProps) {
  const showEmpty = emptyTitle !== undefined || emptyHint !== undefined;

  return (
    <section>
      <div className="feed-header">
        <h2 className="feed-title">{title}</h2>

        <div className="feed-count" key={count} aria-live="polite">
          {count}
        </div>
      </div>

      <div className="posts" key={animKey}>
        {posts.length === 0 ? (
          showEmpty ? (
            <div className="empty">
              {emptyTitle && <strong>{emptyTitle}</strong>}
              {emptyHint && <span>{emptyHint}</span>}

              {emptyAction && (
                <button
                  type="button"
                  className="empty-action"
                  onClick={emptyAction.onClick}
                >
                  {emptyAction.label}
                </button>
              )}
            </div>
          ) : (
            <div className="empty">
              <strong>لا توجد منشورات بعد.</strong>
              كن أول شخص ينشر إعلانًا.
            </div>
          )
        ) : (
          posts.map((post, index) => {
            const initials = getInitials(post.name);
            const typeLabel = post.type === "team" ? "فريق" : "طالب";
            const roleLabel = post.type === "team" ? "يبحث عن" : "متاح كـ";
            const isOwner = currentUserId != null && post.userId === currentUserId;

            return (
              <article
                key={post.id}
                className={`post ${post.type}${post.archived && isOwner ? " post-archived" : ""}`}
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <div className="post-top">
                  <div className="post-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="post-type">
                    <span className="post-type-dot"></span>
                    {typeLabel}
                  </div>

                  {isOwner && post.archived && (
                    <div className="post-archived-badge">مؤرشف</div>
                  )}
                </div>

                <div>
                  <div className="post-role">
                    <span className="post-role-label">{roleLabel}</span>

                    {post.roles.map((role) => (
                      <span key={role} className="post-role-pill">
                        {role}
                      </span>
                    ))}

                    {post.specialization &&
                      getSpecializationLabel(post.specialization) && (
                        <span className="post-spec-pill">
                          {getSpecializationLabel(post.specialization)}
                        </span>
                      )}

                    {post.yearLabel && (
                      <span className="post-role-year">· {post.yearLabel}</span>
                    )}
                  </div>

                  {post.type === "team" && post.project && (
                    <>
                      <h2>{post.project}</h2>

                      <div className="post-project">
                        <span></span>
                        مشروع جامعي
                      </div>
                    </>
                  )}

                  {post.description && (
                  <p className="post-description">{post.description}</p>
                )}
                </div>

                <div className="post-footer">
                  <div className="person">
                    {post.avatar ? (
                      <img
                        className="avatar avatar-img"
                        src={post.avatar}
                        alt=""
                      />
                    ) : (
                      <div className="avatar">{initials}</div>
                    )}

                    <div className="person-info">
                      <div className="person-name">{post.name}</div>

                      <div className="person-meta">
                        {post.meta} · {post.time}
                      </div>
                    </div>
                  </div>

                  <div className="post-actions">
                    {isOwner && post.archived && onReactivate && (
                      <button
                        className="reactivate-button"
                        onClick={() => onReactivate(post)}
                      >
                        إعادة تنشيط
                      </button>
                    )}

                    {currentUserId && post.userId === currentUserId && (
                      <>
                        {onEdit && (
                          <button
                            className="edit-button"
                            onClick={() => onEdit(post)}
                          >
                            تعديل
                          </button>
                        )}

                        <button
                          className="delete-button"
                          onClick={() => onDelete(post.id)}
                        >
                          حذف
                        </button>
                      </>
                    )}

                    {!post.archived && post.type === "member" && post.github && (
                      <a
                        className="github-button"
                        href={post.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        title="GitHub"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                      </a>
                    )}

                    {!post.archived && (
                      <button
                        className="contact-button"
                        onClick={() => onContact(post)}
                      >
                        تواصل <span className="arrow">←</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}