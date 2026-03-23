"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ReviewQueueItem } from "@/lib/types";

function getReviewLabel(reason: ReviewQueueItem["reason"]) {
  switch (reason) {
    case "ambiguous_phrase":
      return "禁止文言";
    case "ambiguous_dedupe":
      return "名寄せ曖昧";
    case "special_form":
      return "特殊フォーム";
    case "copy_quality":
      return "文面品質";
    case "delivery_risk":
      return "送信事故懸念";
    default:
      return reason;
  }
}

function ReviewEditor({ review }: { review: ReviewQueueItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [assignee, setAssignee] = useState(review.assignee ?? "");
  const [detail, setDetail] = useState(review.detail);
  const [retryAllowed, setRetryAllowed] = useState(review.retryAllowed);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignee: assignee || undefined,
          detail,
          retryAllowed
        })
      });

      if (!response.ok) {
        setError("レビュー更新に失敗しました。");
        return;
      }

      setMessage("レビュー内容を更新しました。");
      router.refresh();
    });
  }

  return (
    <article className="card">
      <div className="inline-stats">
        <h3>{review.subject}</h3>
        <span className={`pill ${retryAllowed ? "warn" : "risk"}`}>{getReviewLabel(review.reason)}</span>
      </div>
      <div className="stack">
        <label className="field">
          <span className="field-label">担当者</span>
          <input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="未割当" />
        </label>
        <label className="field">
          <span className="field-label">詳細</span>
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} rows={4} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={retryAllowed} onChange={(event) => setRetryAllowed(event.target.checked)} />
          <span>再実行を許可する</span>
        </label>
        <div className="inline-stats">
          <span className="muted">理由コード: {review.reason}</span>
          <button className="button" type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "保存中..." : "更新"}
          </button>
        </div>
        {message ? <p className="feedback ok-text">{message}</p> : null}
        {error ? <p className="feedback risk-text">{error}</p> : null}
      </div>
    </article>
  );
}

export function ReviewQueueClient({ reviews }: { reviews: ReviewQueueItem[] }) {
  return (
    <section className="cards">
      {reviews.map((review) => (
        <ReviewEditor key={review.id} review={review} />
      ))}
    </section>
  );
}
