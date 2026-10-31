
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

import {
  getPublicNotices,
  type Notice,
} from "@/services/notice.service";

type Category = "Academic" | "Examination" | "Events" | "General";

const categories = [
  "All",
  "Academic",
  "Examination",
  "Events",
  "General",
] as const;

type CategoryFilter = (typeof categories)[number];

function getCategory(notice: Notice): Category {
  const text = `${notice.title} ${notice.content}`.toLowerCase();

  if (/exam|examination|assessment|admit card|timetable/.test(text)) {
    return "Examination";
  }

  if (/fest|event|cultural|sports day|celebration|workshop/.test(text)) {
    return "Events";
  }

  if (/result|semester|academic|assignment|lecture|syllabus/.test(text)) {
    return "Academic";
  }

  return "General";
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAudienceLabel(audience: Notice["audience"]) {
  switch (audience) {
    case "students":
      return "Students";
    case "teachers":
      return "Teachers";
    default:
      return "Everyone";
  }
}

const categoryStyle: Record<Category, string> = {
  Academic: "bg-[#E5E6DA] text-[#214D38]",
  Examination: "bg-[#F2E7D8] text-[#80552D]",
  Events: "bg-[#EAE5D3] text-[#75613A]",
  General: "bg-[#EFEEE5] text-[#526458]",
};

export default function NoticesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const {
    data: notices = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["public-notices"],
    queryFn: getPublicNotices,
    retry: 1,
  });

  const filteredNotices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notices
      .filter(
        (notice) =>
          category === "All" || getCategory(notice) === category
      )
      .filter((notice) => {
        const searchableText = [
          notice.title,
          notice.content,
          notice.createdBy?.name ?? "",
          notice.course?.name ?? "",
          notice.course?.code ?? "",
          getAudienceLabel(notice.audience),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(term);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [notices, category, search]);

  const studentNotices = notices.filter(
    (notice) =>
      notice.audience === "all" || notice.audience === "students"
  );

  const courseNotices = studentNotices.filter(
    (notice) => Boolean(notice.course)
  );

  return (
    <main className="min-h-screen bg-[#F7F5EE] text-[#20382C]">
      <PublicHeader />

      {/* Page introduction */}
      <section className="border-b border-[#214D38]/10 bg-[#EFEEE5]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-20 lg:px-8">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
            <span className="h-px w-9 bg-[#A18B5C]" />
            Student information centre
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-[#214D38] sm:text-5xl lg:text-6xl">
            Notices &amp; Announcements
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5E6C61] sm:text-lg">
            Stay informed about examination schedules, academic updates,
            college events and important announcements.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm font-medium text-[#526458]">
            <span className="h-px w-8 bg-[#A18B5C]" />
            Learning · Growth · Excellence
          </div>
        </div>
      </section>

      {/* Notice statistics */}
      <section className="mx-auto max-w-7xl px-5 pt-10 lg:px-8 lg:pt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A7547]">
              Notices available
            </p>
            <p className="mt-4 font-serif text-4xl text-[#214D38]">
              {isLoading ? "—" : studentNotices.length}
            </p>
            <p className="mt-2 text-sm text-[#667267]">
              Announcements for the college community
            </p>
          </div>

          <div className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A7547]">
              Course-specific notices
            </p>
            <p className="mt-4 font-serif text-4xl text-[#214D38]">
              {isLoading ? "—" : courseNotices.length}
            </p>
            <p className="mt-2 text-sm text-[#667267]">
              Announcements linked to a course
            </p>
          </div>

          <div className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A7547]">
              Categories
            </p>
            <p className="mt-4 font-serif text-4xl text-[#214D38]">
              {categories.length - 1}
            </p>
            <p className="mt-2 text-sm text-[#667267]">
              Ways to browse announcements
            </p>
          </div>
        </div>
      </section>

      {/* Search and category filters */}
      <section className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">
        <div className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] p-5 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A7547]">
              Find information
            </p>
            <label
              htmlFor="notice-search"
              className="mt-3 block text-lg font-bold text-[#214D38]"
            >
              Search notices
            </label>
            <p className="mt-1 text-sm leading-6 text-[#667267]">
              Search by title, content, course or author.
            </p>
          </div>

          <input
            id="notice-search"
            type="search"
            placeholder="Search announcements..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-5 w-full rounded-xl border border-[#D8DCCF] bg-[#F7F5EE] px-4 py-3.5 text-sm text-[#20382C] outline-none transition placeholder:text-[#92998F] focus:border-[#214D38] focus:bg-white focus:ring-4 focus:ring-[#214D38]/10"
          />

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#667267]">
              Browse by category
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    category === item
                      ? "border-[#214D38] bg-[#214D38] text-[#F7F5EE]"
                      : "border-[#214D38]/15 bg-transparent text-[#526458] hover:border-[#214D38]/40 hover:bg-[#EFEEE5] hover:text-[#214D38]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest notices */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A7547]">
              Stay informed
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#214D38] sm:text-4xl">
              Latest notices
            </h2>
          </div>

          <span className="text-sm text-[#667267]">
            {isLoading ? "Loading..." : `${filteredNotices.length} found`}
          </span>
        </div>

        {isFetching && !isLoading && (
          <p className="mb-4 text-sm text-[#667267]" role="status">
            Refreshing notices...
          </p>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] px-5 py-16 text-center">
            <p className="font-semibold text-[#214D38]">
              Loading notices...
            </p>
            <p className="mt-2 text-sm text-[#667267]">
              Fetching the latest announcements.
            </p>
          </div>
        ) : isError ? (
          <div
            className="rounded-2xl border border-[#E4C7B9] bg-[#FDFCF7] px-5 py-16 text-center"
            role="alert"
          >
            <p className="font-serif text-2xl text-[#214D38]">
              Could not load notices
            </p>
            <p className="mt-3 text-sm text-[#667267]">
              {error instanceof Error
                ? error.message
                : "Please check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 rounded-full bg-[#214D38] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173A29]"
            >
              Try again
            </button>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#214D38]/25 bg-[#FDFCF7] px-5 py-16 text-center">
            <p className="font-serif text-2xl text-[#214D38]">
              No notices found
            </p>
            <p className="mt-3 text-sm text-[#667267]">
              Try a different search or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 inline-flex items-center gap-2 border-b border-[#214D38]/40 pb-1 text-sm font-bold text-[#214D38] transition hover:border-[#214D38]"
            >
              Clear filters <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredNotices.map((notice) => {
              const noticeCategory = getCategory(notice);
              const date = new Date(notice.createdAt);
              const validDate = !Number.isNaN(date.getTime());

              return (
                <article
                  key={notice._id}
                  className="rounded-2xl border border-[#214D38]/10 bg-[#FDFCF7] p-5 transition hover:border-[#A18B5C]/60 hover:shadow-lg sm:p-7"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-xl border border-[#214D38]/10 bg-[#EFEEE5] text-[#214D38]">
                      <span className="font-serif text-2xl">
                        {validDate
                          ? date.getDate().toString().padStart(2, "0")
                          : "—"}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8A7547]">
                        {validDate
                          ? date.toLocaleDateString("en-IN", {
                              month: "short",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyle[noticeCategory]}`}
                        >
                          {noticeCategory}
                        </span>

                        <span className="rounded-full bg-[#EFEEE5] px-3 py-1 text-xs font-semibold text-[#526458]">
                          {getAudienceLabel(notice.audience)}
                        </span>

                        {notice.course && (
                          <span className="rounded-full border border-[#A18B5C]/30 bg-[#F2EBDD] px-3 py-1 text-xs font-semibold text-[#75613A]">
                            {notice.course.code}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-xl leading-snug text-[#214D38] sm:text-2xl">
                        {notice.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5E6C61]">
                        {notice.content}
                      </p>

                      <p className="mt-4 text-xs leading-5 text-[#7C857A]">
                        Published {formatDate(notice.createdAt)}
                        {" · "}
                        {notice.createdBy?.name ?? "College administration"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="shrink-0 self-start rounded-full border border-[#214D38]/25 px-5 py-2.5 text-sm font-bold text-[#214D38] transition hover:border-[#214D38] hover:bg-[#214D38] hover:text-white"
                    >
                      Read details <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Notice details modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102D20]/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedNotice(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#214D38]/10 bg-[#F9F8F2] p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${categoryStyle[getCategory(selectedNotice)]}`}
              >
                {getCategory(selectedNotice)}
              </span>

              <button
                type="button"
                aria-label="Close notice details"
                onClick={() => setSelectedNotice(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl text-[#526458] transition hover:bg-[#EFEEE5] hover:text-[#214D38]"
              >
                ×
              </button>
            </div>

            <h2
              id="notice-dialog-title"
              className="mt-5 font-serif text-3xl leading-tight text-[#214D38]"
            >
              {selectedNotice.title}
            </h2>

            <p className="mt-3 text-sm text-[#7C857A]">
              Published {formatDate(selectedNotice.createdAt)}
            </p>

            <div className="my-6 h-px bg-[#214D38]/15" />

            <p className="whitespace-pre-wrap text-sm leading-7 text-[#526458]">
              {selectedNotice.content}
            </p>

            <div className="mt-6 space-y-3 border-t border-[#214D38]/10 pt-5 text-sm text-[#667267]">
              <p>
                <span className="font-semibold text-[#214D38]">Audience:</span>{" "}
                {getAudienceLabel(selectedNotice.audience)}
              </p>

              {selectedNotice.course && (
                <p>
                  <span className="font-semibold text-[#214D38]">Course:</span>{" "}
                  {selectedNotice.course.name} ({selectedNotice.course.code})
                </p>
              )}

              <p>
                <span className="font-semibold text-[#214D38]">Posted by:</span>{" "}
                {selectedNotice.createdBy?.name ?? "College administration"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotice(null)}
              className="mt-8 w-full rounded-full bg-[#214D38] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#173A29]"
            >
              Close
            </button>
          </section>
        </div>
      )}

      <PublicFooter />
    </main>
  );
}
