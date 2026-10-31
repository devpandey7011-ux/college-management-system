
"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getCourses } from "@/services/course.service";

import {
  AdminNotice,
  createNotice,
  updateNotice,
  NoticeAudience,
} from "@/services/admin-notice.service";

import styles from "./NoticeForm.module.css";

interface NoticeFormProps {
  notice?: AdminNotice | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NoticeForm({
  notice,
  onSuccess,
  onCancel,
}: NoticeFormProps) {
  const queryClient = useQueryClient();

  const isEditing = Boolean(notice);

  const [title, setTitle] = useState(() => notice?.title ?? "");
  const [content, setContent] = useState(() => notice?.content ?? "");
  const [audience, setAudience] = useState<NoticeAudience>(
    () => notice?.audience ?? "all"
  );
  const [course, setCourse] = useState(
    () => notice?.course?._id ?? ""
  );
  const [isPublic, setIsPublic] = useState(
    () => notice?.isPublic ?? false
  );
  const [error, setError] = useState("");

  const {
    data: courses = [],
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const data = {
        title: title.trim(),
        content: content.trim(),
        audience,
        isPublic,
        ...(course.trim()
          ? { course: course.trim() }
          : {}),
      };

      if (isEditing && notice) {
        return updateNotice(notice._id, data);
      }

      return createNotice(data);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "notices"],
      });

      setTitle("");
      setContent("");
      setAudience("all");
      setCourse("");
      setIsPublic(false);
      setError("");

      onSuccess?.();
    },

    onError: () => {
      setError(
        `Unable to ${
          isEditing ? "update" : "create"
        } the notice. Please check the details and try again.`
      );
    },
  });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a notice title.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the notice content.");
      return;
    }

    if (isPublic && (audience !== "all" || course.trim())) {
      setError(
        'Public notices must target "Everyone" and "All courses".'
      );
      return;
    }

    mutation.mutate();
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.header}>
        <div>
          <h2>
            {isEditing ? "Edit Notice" : "Create Notice"}
          </h2>

          <p>
            Publish an announcement for students or teachers.
          </p>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="notice-title">Title</label>

        <input
          id="notice-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter notice title"
          maxLength={150}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="notice-content">Content</label>

        <textarea
          id="notice-content"
          rows={7}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write the announcement..."
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="notice-audience">Audience</label>

        <select
          id="notice-audience"
          value={audience}
          onChange={(event) => {
            const nextAudience =
              event.target.value as NoticeAudience;

            setAudience(nextAudience);

            if (nextAudience !== "all") {
              setIsPublic(false);
            }
          }}
        >
          <option value="all">Everyone</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="notice-course">
          Course <span>(optional)</span>
        </label>

        <select
          id="notice-course"
          value={course}
          onChange={(event) => {
            const nextCourse = event.target.value;

            setCourse(nextCourse);

            if (nextCourse.trim()) {
              setIsPublic(false);
            }
          }}
          disabled={coursesLoading}
        >
          <option value="">
            {coursesLoading ? "Loading courses..." : "All courses"}
          </option>

          {courses.map((item) => (
            <option key={item._id} value={item._id}>
              {item.code} — {item.name}
            </option>
          ))}
        </select>

        <small>
          Leave as &quot;All courses&quot; for a general notice.
        </small>
      </div>

      <div className={styles.field}>
        <label htmlFor="notice-public">
          <input
            id="notice-public"
            type="checkbox"
            checked={isPublic}
            onChange={(event) =>
              setIsPublic(event.target.checked)
            }
            disabled={
              audience !== "all" || Boolean(course.trim())
            }
          />{" "}
          Show on public website
        </label>

        <small>
          Public notices are visible without logging in. They must
          target everyone and apply to all courses.
        </small>
      </div>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Saving..."
            : isEditing
              ? "Update Notice"
              : "Publish Notice"}
        </button>
      </div>
    </form>
  );
}
