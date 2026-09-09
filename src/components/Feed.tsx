import { getInitials, type Post } from "@/lib/types";

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

            return (
              <article
                key={post.id}
                className={`post ${post.type}`}
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
                </div>

                <div>
                  <div className="post-role">
                    <span className="post-role-label">{roleLabel}</span>

                    {post.roles.map((role) => (
                      <span key={role} className="post-role-pill">
                        {role}
                      </span>
                    ))}

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

                  <p className="post-description">{post.description}</p>
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

                    <button
                      className="contact-button"
                      onClick={() => onContact(post)}
                    >
                      تواصل <span className="arrow">←</span>
                    </button>
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