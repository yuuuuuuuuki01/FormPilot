"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { TenantSendPolicy } from "@/lib/types";

function weekdayLabel(day: number) {
  return ["日", "月", "火", "水", "木", "金", "土"][day] ?? String(day);
}

export function SettingsPolicyForm({ policy }: { policy: TenantSendPolicy }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [timezone, setTimezone] = useState(policy.timezone);
  const [startHour, setStartHour] = useState(policy.startHour);
  const [endHour, setEndHour] = useState(policy.endHour);
  const [minHoursBetweenSends, setMinHoursBetweenSends] = useState(policy.minHoursBetweenSends);
  const [allowedWeekdays, setAllowedWeekdays] = useState<number[]>(policy.allowedWeekdays);
  const [blockJapaneseHolidays, setBlockJapaneseHolidays] = useState(policy.blockJapaneseHolidays);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleWeekday(day: number) {
    setAllowedWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          startHour,
          endHour,
          minHoursBetweenSends,
          allowedWeekdays,
          blockJapaneseHolidays
        })
      });

      if (!response.ok) {
        setError("送信ポリシーの保存に失敗しました。");
        return;
      }

      setMessage("送信ポリシーを更新しました。");
      router.refresh();
    });
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="inline-stats">
        <div>
          <p className="eyebrow">Send Policy</p>
          <h3>送信ポリシーを更新</h3>
        </div>
        <button className="button" type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </button>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">タイムゾーン</span>
          <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">最小送信間隔</span>
          <input
            type="number"
            min={1}
            value={minHoursBetweenSends}
            onChange={(event) => setMinHoursBetweenSends(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span className="field-label">営業開始時刻</span>
          <input type="number" min={0} max={23} value={startHour} onChange={(event) => setStartHour(Number(event.target.value))} />
        </label>
        <label className="field">
          <span className="field-label">営業終了時刻</span>
          <input type="number" min={0} max={23} value={endHour} onChange={(event) => setEndHour(Number(event.target.value))} />
        </label>
      </div>

      <div className="field">
        <span className="field-label">稼働曜日</span>
        <div className="checkbox-row">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => (
            <label key={day} className="checkbox">
              <input type="checkbox" checked={allowedWeekdays.includes(day)} onChange={() => toggleWeekday(day)} />
              <span>{weekdayLabel(day)}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={blockJapaneseHolidays}
          onChange={(event) => setBlockJapaneseHolidays(event.target.checked)}
        />
        <span>日本の祝日は送信停止にする</span>
      </label>

      {message ? <p className="feedback ok-text">{message}</p> : null}
      {error ? <p className="feedback risk-text">{error}</p> : null}
    </form>
  );
}
