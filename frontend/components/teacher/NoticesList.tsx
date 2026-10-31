
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getNotices,
  type Notice,
} from "@/services/notice.service";

import styles from "./NoticesList.module.css";

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAudienceLabel(audience: Notice["audience"]) {
  switch (audience) {
    case "teachers":
      return "Teachers";
    case "students":
      return "Students";
    case "all":
      return "Everyone";
    default:
      return "Everyone";
  }
}

export default function NoticesList() {
  const [search, setSearch] = useState("");

  const {
    data: notices = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["notices"],
    queryFn: getNotices,
    retry: 1,
  });

  const filteredNotices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notices.filter((notice) => {
      return (
        notice.title.toLowerCase().includes(term) ||
        notice.content.toLowerCase().includes(term) ||
        notice.createdBy?.name?.toLowerCase().includes(term) ||
        notice.course?.code?.toLowerCase().includes(term)
      );
    });
  }, [notices, search]);

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Notices</h2>
            <p>Important announcements and updates.</p>
          </div>
        </div>
        <div className={styles.message} role="status">
          Loading notices...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Notices</h2>
            <p>Important announcements and updates.</p>
          </div>
        </div>

        <div className={styles.error} role="alert">
          <p>Failed to load notices.</p>
          <p>
            {error instanceof Error
              ? error.message
              : "Please check your connection and try again."}
          </p>
          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Notices</h2>
          <p>Important announcements and updates for you.</p>
        </div>

        <span className={styles.count}>
          {filteredNotices.length}{" "}
          {filteredNotices.length === 1 ? "notice" : "notices"}
        </span>
      </div>

      <div className={styles.search}>
        <input
          type="search"
          aria-label="Search notices"
          placeholder="Search notices, courses or authors..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {isFetching && <span role="status">Updating...</span>}
      </div>

      {filteredNotices.length === 0 ? (
        <div className={styles.empty}>
          <h3>{search ? "No matching notices" : "No notices"}</h3>
          <p>
            {search
              ? "Try another search term."
              : "There are no announcements available for you right now."}
          </p>
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filteredNotices.map((notice: Notice) => (
            <article key={notice._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <h3>{notice.title}</h3>
                  <p className={styles.date}>
                    {formatDate(notice.createdAt)}
                  </p>
                </div>

                <span className={styles.audience}>
                  {getAudienceLabel(notice.audience)}
                </span>
              </div>

              <p className={styles.content}>{notice.content}</p>

              <div className={styles.meta}>
                <span>
                  Posted by{" "}
                  <strong>
                    {notice.createdBy?.name ?? "College administration"}
                  </strong>
                </span>

                {notice.course && (
                  <span>
                    Course: <strong>{notice.course.code}</strong>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


// "use client";

// import { useQuery } from "@tanstack/react-query";

// import {
//   getNotices,
//   Notice,
// } from "@/services/notice.service";

// import styles from "./NoticesList.module.css";

// function formatDate(date: string) {
//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// }

// function getAudienceLabel(audience: Notice["audience"]) {
//   switch (audience) {
//     case "teachers":
//       return "Teachers";

//     case "students":
//       return "Students";

//     default:
//       return "Everyone";
//   }
// }

// export default function NoticesList() {
//   const {
//     data: notices = [],
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["notices"],
//     queryFn: getNotices,
//   });

//   if (isLoading) {
//     return (
//       <section className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div>
//             <h2>Notices</h2>
//             <p>Important announcements and updates.</p>
//           </div>
//         </div>

//         <div className={styles.message}>
//           Loading notices...
//         </div>
//       </section>
//     );
//   }

//   if (isError) {
//     return (
//       <section className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div>
//             <h2>Notices</h2>
//             <p>Important announcements and updates.</p>
//           </div>
//         </div>

//         <div className={styles.error}>
//           Failed to load notices.
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <div>
//           <h2>Notices</h2>
//           <p>
//             Important announcements and updates for
//             teachers.
//           </p>
//         </div>

//         <span className={styles.count}>
//           {notices.length}{" "}
//           {notices.length === 1 ? "notice" : "notices"}
//         </span>
//       </div>

//       {notices.length === 0 ? (
//         <div className={styles.empty}>
//           <h3>No notices</h3>
//           <p>
//             There are no announcements available for you
//             right now.
//           </p>
//         </div>
//       ) : (
//         <div className={styles.list}>
//           {notices.map((notice) => (
//             <article
//               key={notice._id}
//               className={styles.card}
//             >
//               <div className={styles.cardTop}>
//                 <div>
//                   <h3>{notice.title}</h3>

//                   <p className={styles.date}>
//                     {formatDate(notice.createdAt)}
//                   </p>
//                 </div>

//                 <span className={styles.audience}>
//                   {getAudienceLabel(notice.audience)}
//                 </span>
//               </div>

//               <p className={styles.content}>
//                 {notice.content}
//               </p>

//               <div className={styles.meta}>
//                 <span>
//                   Posted by{" "}
//                   <strong>{notice.createdBy.name}</strong>
//                 </span>

//                 {notice.course && (
//                   <span>
//                     Course:{" "}
//                     <strong>
//                       {notice.course.code}
//                     </strong>
//                   </span>
//                 )}
//               </div>
//             </article>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }