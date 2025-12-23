"use client";

import { useState } from "react";

type Lang = "en" | "fa";
type Theme = "dark" | "light";

const content = {
  en: {
    dir: "ltr",
    name: "Mohamad Mohebi",
    intro:
      "Web developer with over two years of experience designing and building modern web applications using React and Next.js.",
    mainProjectTitle: "ChessCanon",
    mainProjectDesc: `ChessCanon is my largest project, a comprehensive platform for learning and practicing different aspects of chess. The entire project was designed and developed by me from start to finish over the course of approximately two years.
The system is split into three separate codebases: the main website, the chessboard module and its underlying logic, and a desktop application to automatically find puzzles. ChessCanon is a full-stack web application featuring a complete backend and api system, relational databases, an active user community, and server-side security considerations.
`,
    mockTitle: "Mock Projects (React Skills Showcase)",
    contact: "Contact",
  },
  fa: {
    dir: "rtl",
    name: "محمد محبی",
    intro:
      "توسعه‌دهنده وب با بیش از دو سال تجربه در طراحی و پیاده‌سازی وب‌اپلیکیشن‌های مدرن با React و Next.js.",
    mainProjectTitle: "ChessCanon",
    mainProjectDesc: `
      چسکنن بزرگ‌ترین پروژه‌ی من است؛ یک پلتفرم جامع برای آموزش و تمرین جنبه‌های مختلف شطرنج. این پروژه به‌صورت کامل (صفر تا صد) توسط من و طی حدود دو سال طراحی و پیاده‌سازی شده است.
چسکنن از سه کدبیس مجزا تشکیل می‌شود: وب‌سایت اصلی، ماژول صفحه شطرنج و لاجیک مربوط به آن، و یک نرم‌افزار دسکتاپ برای جستجو و یافتن خودکار پازل ها. این پروژه یک وب‌اپلیکیشن کامل با بک اند و api اختصاصی، دیتابیس‌های ریلیشنال، جامعه‌ی کاربری پویا و ملاحظات امنیتی در سطح سرور است.

      `,
    mockTitle: "پروژه های ماکت (نمایش مهارت های React)",
    contact: "تماس",
  },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("dark");

  const t = content[lang];
  const isDark = theme === "dark";
  const fontClass = lang === "fa" ? "font-fa" : "font-en";

  return (
    <main
      dir={t.dir}
      className={`min-h-screen p-6 ${fontClass} ${
        isDark
          ? "bg-neutral-950 text-neutral-100"
          : "bg-neutral-50 text-neutral-900"
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-20">
        {/* Top controls */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "fa" : "en")}
            className={`text-sm cursor-pointer px-3 py-1 border rounded ${
              isDark
                ? "border-neutral-700 hover:border-neutral-300"
                : "border-neutral-300 hover:border-neutral-700"
            }`}
          >
            {lang === "en" ? "فارسی" : "English"}
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`text-2xl cursor-pointer px-3 py-1 border rounded ${
              isDark
                ? "border-neutral-700 hover:border-neutral-300"
                : "border-neutral-300 hover:border-neutral-700"
            }`}
          >
            {isDark ? "☀︎" : "☾"}
          </button>
        </div>

        {/* Hero */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">{t.name}</h1>
          <p
            className={`max-w-2xl ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {t.intro}
          </p>
        </section>

        {/* Main project */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold ">
            <a
              href="https://chesscanon.com"
              target="_blank"
              className="decoration-0 cursor-pointer"
            >
              {t.mainProjectTitle}
            </a>
          </h2>

          <div
            className={`rounded-xl p-8 border ${
              isDark
                ? "border-neutral-800 bg-neutral-900/40"
                : "border-neutral-200 bg-white"
            }`}
          >
            <p
              className={`max-w-3xl ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              {t.mainProjectDesc}{" "}
              <a
                href="https://chesscanon.com"
                target="_blank"
                className="mx-5 decoration-0 cursor-pointer text-blue-400"
              >
                {lang === "en" ? "Visit ChessCanon" : "بازدید از چسکنن"}
              </a>
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Next.js",
                "Next-Auth",
                "JavaScript",
                "TypeScript",
                "PostgreSQL",
                "Chess Engine",
              ].map(tech => (
                <span
                  key={tech}
                  className={`text-xs px-3 py-1 rounded ${
                    isDark
                      ? "bg-neutral-800 text-neutral-300"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Mock projects */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">{t.mockTitle}</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MockProject
              link="/movie-explorer"
              title="Movie Explorer"
              desc={[
                "Data Fetching",
                "Handling Race Conditions",
                "Custom Hooks",
                "Debouncing Inputs",
                "Derived State",
                "LocalStorage Persist",
                "Memoization with useMemo and memo",
              ]}
              dark={isDark}
            />
            <MockProject
              link="/todo-list"
              title="Todo App with Advanced Features"
              desc={[
                "Reducers",
                "Custom Hooks",
                "Derived State",
                "LocalStorage Persist",
                "Memoization with useMemo and useCallback",
                "DOM Manipulation with Refs",
              ]}
              dark={isDark}
            />
            <MockProject
              link="/stale-while-revalidate"
              title="Stale-While-Revalidate"
              desc={[
                "Stale-while-revalidate pattern",
                "Custom Hooks",
                "Data Fetching",
                "LocalStorage Persist",
                "Handling Race Conditions",
              ]}
              dark={isDark}
            />
            <MockProject
              link="/optimistic-list"
              title="Optimistic List"
              desc={[
                "Optimistic UI Updates",
                "Revert-on-Failure Logic",
                "Temporal State",
                "Async Cancellation",
                "Handling Race Conditions",
                "Custom Hooks",
              ]}
              dark={isDark}
            />
            <MockProject
              link="/serverside-pagination"
              title="Serverside Pagination"
              desc={[
                "Server-Driven Pagination",
                "Async request race prevention",
                "Debouncing Inputs",
                "Memoization with memo",
              ]}
              dark={isDark}
            />
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold">{t.contact}</h2>
          <p
            className={`mt-2 ${
              isDark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            <a
              href="mailto:you@example.com"
              className="text-blue-500 hover:underline"
            >
              d.mohebi1993@gamil.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

function MockProject({
  link,
  title,
  desc,
  dark,
}: {
  link: string;
  title: string;
  desc: string[];
  dark: boolean;
}) {
  return (
    <a
      dir="ltr"
      href={link}
      target="_blank"
      className={`block rounded-lg p-5 border cursor-pointer ${
        dark
          ? "border-neutral-800 hover:border-neutral-600"
          : "border-neutral-300 hover:border-neutral-400"
      }`}
    >
      <h3 className="font-medium">{title}</h3>
      <ul
        className={`text-sm mt-2  px-5 ${
          dark ? "text-neutral-400" : "text-neutral-600"
        }`}
      >
        {desc.map(des => (
          <li className="list-disc" key={des}>
            {des}
          </li>
        ))}
      </ul>
    </a>
  );
}
