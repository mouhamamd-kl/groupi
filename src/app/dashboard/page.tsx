import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import ActivityChart from "@/components/dashboard/ActivityChart";
import FunnelSteps from "@/components/dashboard/FunnelSteps";
import HoursChart from "@/components/dashboard/HoursChart";
import RolesChart from "@/components/dashboard/RolesChart";
import {
  getActivitySeries,
  getFunnel,
  getHourHistogram,
  getTopRoles,
  getTotals,
  getWeekdayHistogram,
  pruneEvents,
} from "@/lib/analytics-queries";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

interface TileProps {
  label: string;
  value: number;
}

function Tile({ label, value }: TileProps) {
  return (
    <div className="dash-tile">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isAdmin(session?.user?.email)) {
    notFound();
  }

  await pruneEvents();

  const [activity, totals, roles, hours, weekdays, funnel] = await Promise.all([
    getActivitySeries(),
    getTotals(),
    getTopRoles(),
    getHourHistogram(),
    getWeekdayHistogram(),
    getFunnel(),
  ]);

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <h1>لوحة التحكم</h1>
          <p>نظرة عامة على نشاط موقع زميل — آخر 30 يومًا</p>
        </div>

        <Link href="/" className="dash-back">
          العودة إلى الموقع
        </Link>
      </header>

      <section className="dash-tiles" aria-label="الإجماليات">
        <Tile label="زيارة للصفحة الرئيسية" value={totals.views} />
        <Tile label="منشور جديد" value={totals.posts} />
        <Tile label="محاولة تواصل" value={totals.contacts} />
        <Tile label="حساب جديد" value={totals.signups} />
      </section>

      <div className="dash-grid">
        <section className="dash-card dash-card-full" aria-label="النشاط اليومي">
          <h2>النشاط اليومي</h2>
          <p className="dash-card-sub">آخر 14 يومًا — زيارات ومنشورات وتواصل</p>
          <ActivityChart data={activity} />
        </section>

        <section className="dash-card" aria-label="التخصصات الأكثر نشاطًا">
          <h2>التخصصات الأكثر نشاطًا</h2>
          <p className="dash-card-sub">آخر 30 يومًا — حسب المنشورات والتواصل</p>
          <RolesChart data={roles} />
        </section>

        <section className="dash-card" aria-label="أوقات النشاط">
          <h2>أوقات النشاط</h2>
          <p className="dash-card-sub">آخر 30 يومًا — موزعة على الساعات والأيام</p>
          <HoursChart hours={hours} weekdays={weekdays} />
        </section>

        <section className="dash-card dash-card-full" aria-label="مسار التحويل">
          <h2>مسار التحويل</h2>
          <p className="dash-card-sub">
            آخر 30 يومًا — من نشر الإعلان حتى بدء التواصل
          </p>
          <FunnelSteps funnel={funnel} />
        </section>
      </div>

      <footer className="dash-note">
        هذه الإحصاءات مجمّعة ولا تحتوي على أي بيانات شخصية تُعرّف المستخدمين.
      </footer>
    </div>
  );
}