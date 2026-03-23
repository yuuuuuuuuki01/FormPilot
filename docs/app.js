const STORAGE_KEY = "formpilot-pages-state";

const defaultState = {
  metrics: [
    { label: "取得数", value: "3", detail: "2 ルールから企業を取得" },
    { label: "解析成功率", value: "33%", detail: "1 / 3 企業でURL解析完了" },
    { label: "送信数", value: "1", detail: "1 件がレビュー待ち" },
    { label: "返信率", value: "100%", detail: "1 件の返信を分類済み" },
    { label: "日程確定率", value: "100%", detail: "1 件が予約リンク経由で確定" }
  ],
  rules: [
    {
      id: "rule_1",
      name: "東京の士業向けDX",
      industries: ["士業", "コンサル"],
      regions: ["東京", "神奈川"],
      keywords: ["DX", "予約", "顧客管理"],
      excludeTerms: ["採用", "代理店募集"],
      sources: ["search", "directory"],
      runCadence: "毎朝 09:15",
      lastRunAt: "2026-03-22T09:15:00+09:00"
    }
  ],
  reviews: [
    {
      id: "review_1",
      subject: "Takumi Precision の問い合わせフォーム",
      reason: "ambiguous_phrase",
      detail: "フォーム周辺文言に営業拒否文言が含まれているため、送信を停止しました。",
      assignee: "Mio Sato",
      retryAllowed: false
    },
    {
      id: "review_2",
      subject: "Northfield Consulting のフォーム探索",
      reason: "special_form",
      detail: "問い合わせ導線が SPA 内に隠れており、自動抽出の再設計が必要です。",
      assignee: "",
      retryAllowed: true
    }
  ],
  policy: {
    timezone: "Asia/Tokyo",
    allowedWeekdays: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 18,
    blockJapaneseHolidays: true,
    minHoursBetweenSends: 72
  }
};

function loadState() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function reviewLabel(reason) {
  return {
    ambiguous_phrase: "禁止文言",
    ambiguous_dedupe: "名寄せ曖昧",
    special_form: "特殊フォーム",
    copy_quality: "文面品質",
    delivery_risk: "送信事故懸念"
  }[reason] ?? reason;
}

function renderMetrics(state) {
  document.getElementById("metrics").innerHTML = state.metrics
    .map(
      (metric) => `
      <article class="metric">
        <p class="eyebrow">${metric.label}</p>
        <strong>${metric.value}</strong>
        <span>${metric.detail}</span>
      </article>`
    )
    .join("");
}

function renderRules(state) {
  document.getElementById("rules-list").innerHTML = state.rules
    .map(
      (rule) => `
      <article class="card">
        <p class="eyebrow">${rule.runCadence}</p>
        <h3>${rule.name}</h3>
        <p class="muted">業種: ${rule.industries.join(" / ") || "-"}</p>
        <p class="muted">地域: ${rule.regions.join(" / ") || "-"}</p>
        <p class="muted">キーワード: ${rule.keywords.join(" / ") || "-"}</p>
        <p class="muted">除外語: ${rule.excludeTerms.join(" / ") || "-"}</p>
        <p class="muted">取得元: ${rule.sources.join(" + ")}</p>
      </article>`
    )
    .join("");
}

function renderReviews(state) {
  document.getElementById("reviews-list").innerHTML = state.reviews
    .map(
      (review, index) => `
      <article class="card">
        <div class="inline-stats">
          <h3>${review.subject}</h3>
          <span class="pill ${review.retryAllowed ? "warn" : "risk"}">${reviewLabel(review.reason)}</span>
        </div>
        <div class="stack">
          <label class="field">
            <span>担当者</span>
            <input data-review-assignee="${index}" value="${review.assignee ?? ""}" />
          </label>
          <label class="field">
            <span>詳細</span>
            <textarea data-review-detail="${index}" rows="4">${review.detail}</textarea>
          </label>
          <label class="checkbox">
            <input data-review-retry="${index}" type="checkbox" ${review.retryAllowed ? "checked" : ""} />
            <span>再実行を許可する</span>
          </label>
          <div class="actions">
            <button class="button" data-review-save="${index}" type="button">更新</button>
            <span id="review-feedback-${index}" class="feedback"></span>
          </div>
        </div>
      </article>`
    )
    .join("");

  state.reviews.forEach((_, index) => {
    document.querySelector(`[data-review-save="${index}"]`).addEventListener("click", () => {
      state.reviews[index].assignee = document.querySelector(`[data-review-assignee="${index}"]`).value;
      state.reviews[index].detail = document.querySelector(`[data-review-detail="${index}"]`).value;
      state.reviews[index].retryAllowed = document.querySelector(`[data-review-retry="${index}"]`).checked;
      saveState(state);
      const feedback = document.getElementById(`review-feedback-${index}`);
      feedback.textContent = "保存しました";
      feedback.className = "feedback ok";
      renderReviews(state);
    });
  });
}

function renderSettings(state) {
  const form = document.getElementById("settings-form");
  form.timezone.value = state.policy.timezone;
  form.startHour.value = state.policy.startHour;
  form.endHour.value = state.policy.endHour;
  form.minHoursBetweenSends.value = state.policy.minHoursBetweenSends;
  form.blockJapaneseHolidays.checked = state.policy.blockJapaneseHolidays;

  document.getElementById("weekday-list").innerHTML = [1, 2, 3, 4, 5, 6, 0]
    .map((day) => {
      const label = ["日", "月", "火", "水", "木", "金", "土"][day];
      return `<label class="checkbox"><input type="checkbox" data-weekday="${day}" ${state.policy.allowedWeekdays.includes(day) ? "checked" : ""} />${label}</label>`;
    })
    .join("");
}

function bindRuleForm(state) {
  document.getElementById("rule-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = document.getElementById("rule-feedback");
    const sources = [...form.querySelectorAll('input[name="source"]:checked')].map((node) => node.value);

    state.rules.unshift({
      id: `rule_${Date.now()}`,
      name: form.name.value,
      industries: splitList(form.industries.value),
      regions: splitList(form.regions.value),
      keywords: splitList(form.keywords.value),
      excludeTerms: splitList(form.excludeTerms.value),
      sources,
      runCadence: form.runCadence.value,
      lastRunAt: new Date().toISOString()
    });

    saveState(state);
    form.reset();
    form.runCadence.value = "平日 09:30";
    form.querySelectorAll('input[name="source"]').forEach((node) => {
      node.checked = true;
    });
    feedback.textContent = "収集ルールを追加しました";
    feedback.className = "feedback ok";
    renderRules(state);
  });
}

function bindSettingsForm(state) {
  document.getElementById("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    state.policy = {
      timezone: form.timezone.value,
      startHour: Number(form.startHour.value),
      endHour: Number(form.endHour.value),
      minHoursBetweenSends: Number(form.minHoursBetweenSends.value),
      blockJapaneseHolidays: form.blockJapaneseHolidays.checked,
      allowedWeekdays: [...document.querySelectorAll("[data-weekday]:checked")].map((node) =>
        Number(node.getAttribute("data-weekday"))
      )
    };
    saveState(state);
    const feedback = document.getElementById("settings-feedback");
    feedback.textContent = "送信ポリシーを保存しました";
    feedback.className = "feedback ok";
  });
}

const state = loadState();
renderMetrics(state);
renderRules(state);
renderReviews(state);
renderSettings(state);
bindRuleForm(state);
bindSettingsForm(state);
