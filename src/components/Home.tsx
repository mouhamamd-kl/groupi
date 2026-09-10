"use client";

import { use, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Feed from "@/components/Feed";
import CreatePostModal from "@/components/CreatePostModal";
import ContactModal from "@/components/ContactModal";
import FilterPills from "@/components/FilterPills";
import NudgeModal from "@/components/NudgeModal";
import { authClient } from "@/lib/auth-client";
import { SPECIALIZATIONS, SPEC_YEARS } from "@/lib/specializations";
import type { NewPostInput, Post, Role, Year } from "@/lib/types";

interface HomeProps {
  posts: Promise<Post[]>;
  createPost: (data: NewPostInput) => Promise<Post>;
  editPost: (postId: number, data: NewPostInput) => Promise<Post>;
  currentUserId: string | null;
  deletePost: (postId: number) => Promise<void>;
  roles: Role[];
  years: Year[];
  isAdmin: boolean;
  logContact: (postId: number) => Promise<void>;
  pendingNudge: Post | null;
  answerNudge: (postId: number, found: boolean) => Promise<void>;
  reactivatePost: (postId: number) => Promise<void>;
}

export default function Home({
  posts,
  createPost,
  editPost,
  currentUserId,
  deletePost,
  roles,
  years,
  isAdmin,
  logContact,
  pendingNudge,
  answerNudge,
  reactivatePost,
}: HomeProps) {
  const initialPosts = use(posts);
  const [postList, setPostList] = useState<Post[]>(initialPosts);
  const [nudgePost, setNudgePost] = useState<Post | null>(pendingNudge);
  const [currentView, setCurrentView] = useState<"teams" | "members" | "mine">(
    "teams"
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"new" | "old">("new");
  const [showPostModal, setShowPostModal] = useState(false);
  const [contactPost, setContactPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    post: Post;
    index: number;
  } | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ post: Post; index: number } | null>(null);

  useEffect(() => {
    pendingRef.current = pendingDelete;
  }, [pendingDelete]);

  const filteredPosts = postList.filter(
    (post) =>
      (currentView === "teams"
        ? post.type === "team" && !post.archived
        : currentView === "members"
          ? post.type === "member" && !post.archived
          : currentUserId != null && post.userId === currentUserId) &&
      (selectedRoles.length === 0 ||
        post.roleValues.some((value) => selectedRoles.includes(value))) &&
      (selectedYears.length === 0 ||
        (post.year !== null && selectedYears.includes(post.year))) &&
      (selectedSpecs.length === 0 ||
        (post.specialization !== null &&
          selectedSpecs.includes(post.specialization)))
  );

  const feedTitle =
    currentView === "teams"
      ? "فرق تبحث عن عضو"
      : currentView === "members"
        ? "طلاب يبحثون عن فريق"
        : "منشوراتي";

  const visiblePosts = [...filteredPosts].sort((a, b) => {
    const timeDiff =
      Date.parse(b.createdAt || "") - Date.parse(a.createdAt || "");

    if (!Number.isNaN(timeDiff) && timeDiff !== 0) {
      return sortOrder === "new" ? timeDiff : -timeDiff;
    }

    return sortOrder === "new" ? b.id - a.id : a.id - b.id;
  });

  const feedCount = `${String(visiblePosts.length).padStart(2, "0")} POSTS`;

  const feedAnimKey = `${currentView}|${sortOrder}|${selectedRoles.join(",")}|${selectedYears.join(",")}|${selectedSpecs.join(",")}`;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPostModal(false);
        setEditingPost(null);
        setContactPost(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (deleteTimer.current) {
        clearTimeout(deleteTimer.current);
        deleteTimer.current = null;
      }
      if (pendingRef.current) {
        deletePost(pendingRef.current.post.id).catch(() => {});
        pendingRef.current = null;
      }
    };
  }, [deletePost]);

  const switchView = (view: "teams" | "members" | "mine") => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRole = (value: string | number) => {
    setSelectedRoles((prev) =>
      prev.includes(String(value))
        ? prev.filter((role) => role !== String(value))
        : [...prev, String(value)]
    );
  };

  const clearRoles = () => {
    setSelectedRoles([]);
  };

  const toggleYear = (value: string | number) => {
    const year = Number(value);
    const next = selectedYears.includes(year)
      ? selectedYears.filter((item) => item !== year)
      : [...selectedYears, year];

    setSelectedYears(next);

    if (!next.some((item) => SPEC_YEARS.includes(item))) {
      setSelectedSpecs([]);
    }
  };

  const clearYears = () => {
    setSelectedYears([]);
    setSelectedSpecs([]);
  };

  const toggleSpec = (value: string | number) => {
    const spec = String(value);

    setSelectedSpecs((prev) =>
      prev.includes(spec)
        ? prev.filter((item) => item !== spec)
        : [...prev, spec]
    );
  };

  const clearSpecs = () => {
    setSelectedSpecs([]);
  };

  const handleCreatePost = async (data: NewPostInput) => {
    const created = await createPost(data);
    setPostList((prev) => [created, ...prev]);
    switchView(created.type === "team" ? "teams" : "members");
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = async (postId: number, data: NewPostInput) => {
    const updated = await editPost(postId, data);
    setPostList((prev) => prev.map((post) => (post.id === postId ? updated : post)));
    setEditingPost(null);
  };

  const handleDelete = (postId: number) => {
    if (pendingDelete) {
      const prev = pendingDelete.post;
      if (deleteTimer.current) {
        clearTimeout(deleteTimer.current);
        deleteTimer.current = null;
      }
      setPendingDelete(null);
      deletePost(prev.id).catch(() => {
        setPostList((list) =>
          list.some((item) => item.id === prev.id) ? list : [prev, ...list]
        );
      });
    }

    const target = postList.find((post) => post.id === postId);
    if (!target) return;
    const index = postList.findIndex((post) => post.id === postId);

    setPostList((prev) => prev.filter((post) => post.id !== postId));
    setPendingDelete({ post: target, index: index === -1 ? 0 : index });

    deleteTimer.current = setTimeout(async () => {
      deleteTimer.current = null;
      setPendingDelete((current) =>
        current?.post.id === postId ? null : current
      );
      try {
        await deletePost(postId);
      } catch {
        setPostList((prev) => {
          if (prev.some((post) => post.id === target.id)) return prev;
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, target);
          return next;
        });
      }
    }, 5000);
  };

const handleUndoDelete = () => {
  if (deleteTimer.current) {
    clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
  }
  if (!pendingDelete) return;
  const { post, index } = pendingDelete;
  setPendingDelete(null);
  setPostList((prev) => {
    if (prev.some((item) => item.id === post.id)) return prev;
    const next = [...prev];
    next.splice(Math.min(index, next.length), 0, post);
    return next;
  });
};

const handleNudgeAnswer = async (found: boolean) => {
  const target = nudgePost;
  if (!target) return;
  setNudgePost(null);
  try {
    await answerNudge(target.id, found);
    if (found) {
      setPostList((prev) =>
        prev.map((post) =>
          post.id === target.id ? { ...post, archived: true } : post
        )
      );
    }
  } catch {
    // Ignore; the modal already closed.
  }
};

const handleReactivate = async (post: Post) => {
  try {
    await reactivatePost(post.id);
    setPostList((prev) =>
      prev.map((item) =>
        item.id === post.id ? { ...item, archived: false } : item
      )
    );
  } catch {
    // Ignore transient failures.
  }
};

const closePostModal = () => {
    setShowPostModal(false);
  };

  const closeContactModal = () => {
    setContactPost(null);
  };

  return (
    <>
      <Header
        currentView={currentView}
        onSwitchView={switchView}
        onOpenPostModal={() => setShowPostModal(true)}
        isAdmin={isAdmin}
      />

      <main>
        <Hero />

        <div className="filter-pills">
          <FilterPills
            items={roles}
            selected={selectedRoles}
            onToggle={toggleRole}
            onClear={clearRoles}
            label="تصفية حسب التخصص"
          />

          <FilterPills
            items={years}
            selected={selectedYears}
            onToggle={toggleYear}
            onClear={clearYears}
            label="تصفية حسب السنة"
          />

          {selectedYears.some((year) => SPEC_YEARS.includes(year)) && (
            <FilterPills
              items={SPECIALIZATIONS}
              selected={selectedSpecs}
              onToggle={toggleSpec}
              onClear={clearSpecs}
              label="تصفية حسب تخصص السنة"
            />
          )}

          <div
            className="filter-row"
            role="group"
            aria-label="ترتيب المنشورات"
          >
            <button
              type="button"
              className={`filter-pill ${sortOrder === "new" ? "active" : ""}`}
              aria-pressed={sortOrder === "new"}
              onClick={() => setSortOrder("new")}
            >
              الأحدث أولاً
            </button>

            <button
              type="button"
              className={`filter-pill ${sortOrder === "old" ? "active" : ""}`}
              aria-pressed={sortOrder === "old"}
              onClick={() => setSortOrder("old")}
            >
              الأقدم أولاً
            </button>
          </div>
        </div>

        <Feed
          title={feedTitle}
          count={feedCount}
          posts={visiblePosts}
          animKey={feedAnimKey}
          onContact={(post) => {
            setContactPost(post);
            logContact(post.id).catch(() => {});
          }}
          currentUserId={currentUserId}
          onDelete={handleDelete}
          onEdit={handleEditPost}
          onReactivate={handleReactivate}
          emptyTitle={
            currentView === "mine"
              ? currentUserId
                ? "لم تنشر أي إعلان بعد"
                : "سجّل الدخول لرؤية منشوراتك"
              : undefined
          }
          emptyHint={
            currentView === "mine"
              ? currentUserId
                ? "أضف إعلانك الأول ليراه الجميع."
                : "بعد الدخول ستجد إعلانك وأدوات التعديل هنا."
              : undefined
          }
          emptyAction={
            currentView === "mine"
              ? {
                  label: currentUserId
                    ? "أضف منشورك الأول"
                    : "تسجيل الدخول",
                  onClick: () =>
                    currentUserId
                      ? setShowPostModal(true)
                      : authClient.signIn.social({ provider: "google" }),
                }
              : undefined
          }
        />
      </main>

      <Footer />

      {pendingDelete && (
        <div className="toast-wrap" role="status" aria-live="polite">
          <div className="toast">
            <span>تم حذف المنشور</span>

            <button
              type="button"
              className="toast-action"
              onClick={handleUndoDelete}
            >
              تراجع
            </button>
          </div>
        </div>
      )}

      {showPostModal && (
        <CreatePostModal
          onClose={closePostModal}
          onSubmit={handleCreatePost}
          roles={roles}
          years={years}
        />
      )}

      {editingPost && (
        <CreatePostModal
          onClose={() => setEditingPost(null)}
          onSubmit={handleCreatePost}
          onUpdate={handleUpdatePost}
          initial={editingPost}
          roles={roles}
          years={years}
        />
      )}

      {contactPost && (
        <ContactModal post={contactPost} onClose={closeContactModal} />
      )}

      {nudgePost && (
        <NudgeModal
          post={nudgePost}
          onAnswer={handleNudgeAnswer}
          onClose={() => setNudgePost(null)}
        />
      )}
    </>
  );
}