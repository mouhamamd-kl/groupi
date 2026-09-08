import { getInitials, type Post } from "@/lib/types";

interface FeedProps {
  title: string;
  count: string;
  posts: Post[];
  onContact: (post: Post) => void;
}

export default function Feed({ title, count, posts, onContact }: FeedProps) {
  return (
    <section>
      <div className="feed-header">
        <h2 className="feed-title">{title}</h2>

        <div className="feed-count">{count}</div>
      </div>

      <div className="posts">
        {posts.length === 0 ? (
          <div className="empty">
            <strong>لا توجد منشورات بعد.</strong>
            كن أول شخص ينشر إعلانًا.
          </div>
        ) : (
          posts.map((post, index) => {
            const initials = getInitials(post.name);
            const typeLabel = post.type === "team" ? "فريق" : "طالب";
            const roleLabel = post.type === "team" ? "يبحث عن" : "متاح كـ";

            return (
              <article
                key={`${post.name}-${index}`}
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
                    {roleLabel} · {post.role}
                  </div>

                  <h2>{post.project}</h2>

                  <div className="post-project">
                    <span></span>
                    مشروع جامعي
                  </div>

                  <p className="post-description">{post.description}</p>
                </div>

                <div className="post-footer">
                  <div className="person">
                    <div className="avatar">{initials}</div>

                    <div className="person-info">
                      <div className="person-name">{post.name}</div>

                      <div className="person-meta">
                        {post.meta} · {post.time}
                      </div>
                    </div>
                  </div>

                  <button
                    className="contact-button"
                    onClick={() => onContact(post)}
                  >
                    تواصل <span className="arrow">←</span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}