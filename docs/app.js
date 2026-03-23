const STORAGE_KEY = "formpilot-pages-state";

const defaultState = {
  metrics: [
    { label: "取得数", value: "3", detail: "2 ルールから企業を取得" },
    { label: "解析成功率", value: "33%", detail: "1 / 3 企業でURL解析完了" },
    { label: "送信数", value: "1", detail: "1 件がレビュー待ち" },
    { label: "返信率", value: "100%", detail: "1 件の返信を分類済み" },
    { label: "日程確定率", value: "100%", detail: "1 件が予約リンク経由で確定" }
  ],
  companies: [
    {
      id: "company_1",
      name: "Sakura Legal Partners",
      websiteUrl: "https://sakura-legal.example.jp",
      source: "search",
      scanStatus: "scanned",
      formDetected: true,
      sendReady: true,
      blockReason: ""
    },
    {
      id: "company_2",
      name: "Takumi Precision",
      websiteUrl: "https://takumi-precision.example.jp",
      source: "directory",
      scanStatus: "needs_review",
      formDetected: true,
      sendReady: false,
      blockReason: "営業禁止文言をフォーム周辺で検知"
    },
    {
      id: "company_3",
      name: "Northfield Consulting",
      websiteUrl: "https://northfield-consulting.example.jp",
      source: "search",
      scanStatus: "queued",
      formDetected: false,
      sendReady: false,
      blockReason: "フォーム候補を再探索中"
    }
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
      companyId: "company_2",
      subject: "Takumi Precision の問い合わせフォーム",
      reason: "ambiguous_phrase",
      detail: "フォーム周辺文言に営業拒否文言が含まれているため、送信を停止しました。",
      assignee: "Mio Sato",
      retryAllowed: false
    },
    {
      id: "review_2",
      companyId: "company_3",
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

function sourceLabel(source) {
  return source === "search" ? "検索" : "ディレクトリ";
}

function getReadiness(company) {
  if (!company.formDetected) {
    return { label: "フォーム未発見", tone: "warn" };
  }
  if (company.sendReady) {
    return { label: "送信可能", tone: "ok" };
  }
  return { label: company.blockReason || "要レビュー", tone: "risk" };
}

function getScanTone(scanStatus) {
  if (scanStatus === "scanned") {
    return "ok";
  }
  if (scanStatus === "queued") {
    return "warn";
  }
  return "risk";
}

function recalculateMetrics(state) {
  const scannedCount = state.companies.filter((company) => company.scanStatus === "scanned").length;
  const sendReadyCount = state.companies.filter((company) => company.sendReady).length;
  const successRate = state.companies.length
    ? `${Math.round((scannedCount / state.companies.length) * 100)}%`
    : "0%";

  state.metrics = [
    { label: "取得数", value: String(state.companies.length), detail: `${state.rules.length} ルールから企業を取得` },
    { label: "解析成功率", value: successRate, detail: `${scannedCount} / ${state.companies.length} 企業でURL解析完了` },
    { label: "送信数", value: String(sendReadyCount), detail: `${state.reviews.length} 件がレビュー待ち` },
    { label: "返信率", value: "100%", detail: "1 件の返信を分類済み" },
    { label: "日程確定率", value: "100%", detail: "1 件が予約リンク経由で確定" }
  ];
}

function renderMetrics(state) {
  recalculateMetrics(state);
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

function renderCompanies(state) {
  document.getElementById("companies-body").innerHTML = state.companies
    .map((company, index) => {
      const readiness = getReadiness(company);
      return `
        <tr>
          <td>
            <strong>${company.name}</strong>
            <div class="muted">${company.websiteUrl}</div>
            <div id="company-feedback-${index}" class="feedback-slot"></div>
          </td>
          <td>${sourceLabel(company.source)}</td>
          <td><span class="pill ${getScanTone(company.scanStatus)}">${company.scanStatus}</span></td>
          <td><span class="pill ${readiness.tone}">${readiness.label}</span></td>
          <td>
            <button class="button small-button" data-company-scan="${index}" type="button">フォーム探索</button>
          </td>
        </tr>`;
    })
    .join("");

  state.companies.forEach((_, index) => {
    document.querySelector(`[data-company-scan="${index}"]`).addEventListener("click", () => {
      runCompanyScan(state, index);
    });
  });
}

function upsertReview(state, review) {
  const index = state.reviews.findIndex((item) => item.companyId === review.companyId);
  if (index >= 0) {
    state.reviews[index] = review;
    return;
  }
  state.reviews.unshift(review);
}

function removeReview(state, companyId) {
  state.reviews = state.reviews.filter((review) => review.companyId !== companyId);
}

function runCompanyScan(state, index) {
  const company = state.companies[index];
  const feedback = document.getElementById(`company-feedback-${index}`);
  feedback.textContent = "フォーム探索を実行しています...";
  feedback.className = "feedback-slot feedback warn";

  window.setTimeout(() => {
    if (company.name.includes("Takumi")) {
      state.companies[index] = {
        ...company,
        scanStatus: "needs_review",
        formDetected: true,
        sendReady: false,
        blockReason: "営業禁止文言を検知"
      };
      upsertReview(state, {
        id: `review_${Date.now()}`,
        companyId: company.id,
        subject: `${company.name} の問い合わせフォーム`,
        reason: "ambiguous_phrase",
        detail: "フォーム周辺文言に営業目的の送信禁止表現を検知したため、レビューに回しました。",
        assignee: "",
        retryAllowed: false
      });
      feedback.textContent = "フォーム探索完了: 禁止文言を検知したためレビューへ移動しました";
      feedback.className = "feedback-slot feedback risk";
    } else if (company.name.includes("Northfield")) {
      state.companies[index] = {
        ...company,
        scanStatus: "needs_review",
        formDetected: false,
        sendReady: false,
        blockReason: "問い合わせ導線が SPA 内にあり追加解析が必要"
      };
      upsertReview(state, {
        id: `review_${Date.now()}`,
        companyId: company.id,
        subject: `${company.name} のフォーム探索`,
        reason: "special_form",
        detail: "問い合わせ導線が動的描画で隠れているため、追加解析が必要です。",
        assignee: "",
        retryAllowed: true
      });
      feedback.textContent = "フォーム探索完了: 特殊フォーム候補としてレビューへ移動しました";
      feedback.className = "feedback-slot feedback warn";
    } else {
      state.companies[index] = {
        ...company,
        scanStatus: "scanned",
        formDetected: true,
        sendReady: true,
        blockReason: ""
      };
      removeReview(state, company.id);
      feedback.textContent = "フォーム探索完了: 送信可能です";
      feedback.className = "feedback-slot feedback ok";
    }

    saveState(state);
    renderMetrics(state);
    renderCompanies(state);
    renderReviews(state);

    const refreshedFeedback = document.getElementById(`company-feedback-${index}`);
    refreshedFeedback.textContent = feedback.textContent;
    refreshedFeedback.className = feedback.className;
  }, 350);
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
    renderMetrics(state);
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
renderCompanies(state);
renderRules(state);
renderReviews(state);
renderSettings(state);
bindRuleForm(state);
bindSettingsForm(state);
