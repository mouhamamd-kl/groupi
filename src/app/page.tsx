"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Feed from "@/components/Feed";
import CreatePostModal from "@/components/CreatePostModal";
import ContactModal from "@/components/ContactModal";
import type { Post } from "@/lib/types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([
    {
      type: "team",
      project: "تطبيق للهواتف",
      role: "مطور Backend",
      description:
        "نحن 3 طلاب نعمل على بناء تطبيق للهواتف ونحتاج إلى مطور Backend للانضمام إلى الفريق وإكمال المشروع.",
      name: "عمر حسن",
      contact: "omar@example.com",
      meta: "علوم الحاسب · السنة الرابعة",
      time: "منذ ساعتين",
    },
    {
      type: "team",
      project: "الذكاء الاصطناعي",
      role: "مصمم UI/UX",
      description:
        "نبحث عن مصمم يساعدنا في تصميم الواجهة وتجربة المستخدم لمشروع التخرج الخاص بالذكاء الاصطناعي.",
      name: "سارة علي",
      contact: "sara@example.com",
      meta: "هندسة البرمجيات · السنة الرابعة",
      time: "منذ 5 ساعات",
    },
    {
      type: "team",
      project: "متجر إلكتروني",
      role: "مطور Frontend",
      description:
        "لدينا الـ Backend وقاعدة البيانات جاهزان. نحتاج إلى مطور Frontend لديه خبرة في React.",
      name: "يوسف عادل",
      contact: "youssef@example.com",
      meta: "علوم الحاسب · السنة الثالثة",
      time: "أمس",
    },
    {
      type: "member",
      project: "تطبيق للهواتف",
      role: "مطور Backend",
      description:
        "أبحث عن فريق يعمل على تطبيق للهواتف. أستطيع التعامل مع APIs وقواعد البيانات وFirebase.",
      name: "أحمد محمد",
      contact: "ahmed@example.com",
      meta: "علوم الحاسب · السنة الرابعة",
      time: "منذ ساعة",
    },
    {
      type: "member",
      project: "مشروع التخرج",
      role: "مصمم UI/UX",
      description:
        "أبحث عن فريق يحتاج إلى المساعدة في أبحاث المستخدمين والـ Wireframes وتصميم الواجهات.",
      name: "مريم خالد",
      contact: "mariam@example.com",
      meta: "نظم المعلومات · السنة الرابعة",
      time: "منذ 4 ساعات",
    },
    {
      type: "member",
      project: "تطبيق ويب",
      role: "مطور Frontend",
      description:
        "مطور Frontend لدي خبرة في HTML وCSS وJavaScript، وأبحث عن فريق لمشروع جامعي.",
      name: "كريم مصطفى",
      contact: "karim@example.com",
      meta: "علوم الحاسب · السنة الثالثة",
      time: "أمس",
    },
  ]);

  const [currentView, setCurrentView] = useState<"teams" | "members">("teams");
  const [showPostModal, setShowPostModal] = useState(false);
  const [contactPost, setContactPost] = useState<Post | null>(null);

  const filteredPosts = posts.filter((post) =>
    currentView === "teams" ? post.type === "team" : post.type === "member"
  );

  const feedTitle =
    currentView === "teams" ? "فرق تبحث عن عضو" : "طلاب يبحثون عن فريق";

  const feedCount = `${String(filteredPosts.length).padStart(2, "0")} POSTS`;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPostModal(false);
        setContactPost(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const switchView = (view: "teams" | "members") => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPost = (data: Omit<Post, "meta" | "time">) => {
    setPosts((prev) => [
      {
        ...data,
        meta: "طالب جامعي",
        time: "الآن",
      },
      ...prev,
    ]);

    switchView(data.type === "team" ? "teams" : "members");
  };

  const openContactModal = (post: Post) => {
    setContactPost(post);
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
      />

      <main>
        <Hero />

        <Feed
          title={feedTitle}
          count={feedCount}
          posts={filteredPosts}
          onContact={openContactModal}
        />
      </main>

      <Footer />

      {showPostModal && (
        <CreatePostModal onClose={closePostModal} onSubmit={createPost} />
      )}

      {contactPost && (
        <ContactModal post={contactPost} onClose={closeContactModal} />
      )}
    </>
  );
}
