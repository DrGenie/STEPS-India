// script.js
(function () {
  "use strict";

  const FILE_CANDIDATES = {
    cost: [
      "cost_config.json",
      "cost-config.json",
      "config/cost_config.json",
      "data/cost_config.json",
      "json/cost_config.json"
    ],
    epi: [
      "epi_config.json",
      "epi-config.json",
      "config/epi_config.json",
      "data/epi_config.json",
      "json/epi_config.json"
    ]
  };

  const state = {
    costConfig: null,
    epiConfig: null,
    loadedFrom: { cost: null, epi: null },
    displayCurrency: "INR",
    lastComputed: null
  };

  const els = {};

  function q(id) { return document.getElementById(id); }
  function qa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function fmtNumber(x, decimals = 0) {
    if (!Number.isFinite(x)) return "—";
    return x.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function fmtMoneyINR(x) {
    if (!Number.isFinite(x)) return "—";
    return "INR " + fmtNumber(x, 0);
  }

  function convertFromINR(xInr, currency) {
    if (!Number.isFinite(xInr)) return NaN;
    if (currency === "INR") return xInr;
    const rate = Number(els.inrPerUsd?.value || state.epiConfig?.general?.inrPerUsd || 83);
    if (!Number.isFinite(rate) || rate <= 0) return NaN;
    return xInr / rate;
  }

  function fmtMoney(xInr) {
    const c = state.displayCurrency || "INR";
    if (c === "INR") return fmtMoneyINR(xInr);
    const usd = convertFromINR(xInr, "USD");
    if (!Number.isFinite(usd)) return "USD —";
    return "USD " + fmtNumber(usd, 0);
  }

  function discountFactor(t, r) {
    return 1 / Math.pow(1 + r, t);
  }

  async function fetchFirstJson(candidates) {
    let lastErr = null;
    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status} at ${path}`);
          continue;
        }
        const data = await res.json();
        return { data, path };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("Failed to load JSON.");
  }

  function setBadge(text, kind = "soft") {
    if (!els.dataStatusBadge) return;
    els.dataStatusBadge.textContent = text;
    els.dataStatusBadge.classList.remove("badge-primary", "badge-soft", "badge-outline");
    if (kind === "primary") els.dataStatusBadge.classList.add("badge-primary");
    else if (kind === "outline") els.dataStatusBadge.classList.add("badge-outline");
    else els.dataStatusBadge.classList.add("badge-soft");
  }

  function toast(msg, type = "visible") {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.remove("toast-success", "toast-warning", "toast-error");
    if (type === "success") els.toast.classList.add("toast-success");
    if (type === "warning") els.toast.classList.add("toast-warning");
    if (type === "error") els.toast.classList.add("toast-error");
    els.toast.classList.add("visible");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => els.toast.classList.remove("visible"), 2800);
  }

  function logAssumptions(lines) {
    if (!els.assumptionLog) return;
    els.assumptionLog.textContent = lines.join("\n");
  }

  function openTab(tabId, btn) {
    qa(".tabcontent, .tab-panel").forEach(t => t.classList.remove("active"));
    qa(".tablink, .tab-link").forEach(b => b.classList.remove("active"));

    const target = document.getElementById(tabId);
    if (target) target.classList.add("active");
    if (btn) btn.classList.add("active");
  }

  function setupTabs() {
    const tabButtons = qa(".tablink[data-tab], .tab-link[data-tab]");
    tabButtons.forEach(button => {
      button.addEventListener("click", function () {
        openTab(this.getAttribute("data-tab"), this);
      });
    });
    const defaultBtn = tabButtons[0];
    if (defaultBtn) openTab(defaultBtn.getAttribute("data-tab"), defaultBtn);
  }

  function setupTooltips() {
    let bubble = null;

    function hide() {
      if (bubble) bubble.classList.add("tooltip-hidden");
    }

    function destroy() {
      if (bubble && bubble.parentNode) bubble.parentNode.removeChild(bubble);
      bubble = null;
    }

    function show(target, text) {
      destroy();
      bubble = document.createElement("div");
      bubble.className = "tooltip-bubble bottom";
      bubble.innerHTML = `<div class="tooltip-arrow"></div><p></p>`;
      bubble.querySelector("p").textContent = text;
      document.body.appendChild(bubble);

      const r = target.getBoundingClientRect();
      const br = bubble.getBoundingClientRect();

      const spaceBelow = window.innerHeight - r.bottom;
      const placeTop = spaceBelow < 120 && r.top > 120;

      let top = placeTop ? (r.top - br.height - 10) : (r.bottom + 10);
      let left = Math.min(Math.max(12, r.left), window.innerWidth - br.width - 12);

      bubble.style.top = `${Math.max(12, top)}px`;
      bubble.style.left = `${left}px`;
      bubble.classList.remove("tooltip-hidden");
      bubble.classList.toggle("top", placeTop);
      bubble.classList.toggle("bottom", !placeTop);
    }

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const tooltip = t.getAttribute("data-tooltip");
      if (tooltip) {
        e.preventDefault();
        e.stopPropagation();
        show(t, tooltip);
      } else {
        hide();
      }
    });

    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") destroy(); });
  }

  function fillSelect(el, options, selected) {
    if (!el) return;
    el.innerHTML = "";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = String(opt.value);
      o.textContent = opt.label;
      if (String(opt.value) === String(selected)) o.selected = true;
      el.appendChild(o);
    }
  }

  function clamp(x, a, b) {
    const v = Number(x);
    if (!Number.isFinite(v)) return a;
    return Math.max(a, Math.min(b, v));
  }

  function getConfigDefaults() {
    const epi = state.epiConfig;
    const d = epi?.defaults || {};
    return {
      tier: d.default_tier || "frontline",
      traineesPerCohort: 25,
      numCohorts: (epi?.cost_templates?.[d.default_cost_template]?.default_number_of_cohorts) || 6,
      planningYears: epi?.general?.planningHorizonYears || epi?.time_horizon?.planning_years || 5,
      responseTimeDays: 7,
      economicCost: "false"
    };
  }

  function applyDefaultsToUI() {
    const def = getConfigDefaults();

    if (els.tierSelect) els.tierSelect.value = def.tier;
    if (els.traineesPerCohort) els.traineesPerCohort.value = String(def.traineesPerCohort);
    if (els.numCohorts) els.numCohorts.value = String(def.numCohorts);
    if (els.planningYears) els.planningYears.value = String(def.planningYears);
    if (els.responseTimeDays) els.responseTimeDays.value = "7";
    if (els.economicCostToggle) els.economicCostToggle.value = def.economicCost;

    if (els.displayCurrency) els.displayCurrency.value = state.epiConfig?.currency?.default_display_currency || "INR";
    state.displayCurrency = els.displayCurrency?.value || "INR";

    if (els.inrPerUsd) els.inrPerUsd.value = String(state.epiConfig?.general?.inrPerUsd || state.epiConfig?.currency?.inr_per_usd_display || 83);
    if (els.discountRateAnnual) els.discountRateAnnual.value = String(state.epiConfig?.general?.discountRateAnnual ?? state.epiConfig?.time_horizon?.discount_rate_annual ?? 0.03);
    if (els.applyDiscountOutbreak) els.applyDiscountOutbreak.value = String(state.epiConfig?.general?.applyDiscountingToOutbreakBenefits ?? state.epiConfig?.time_horizon?.apply_discounting_to_outbreak_benefits ?? false);

    updateSettingsLog();
  }

  function updateSettingsLog() {
    const lines = [];
    lines.push(`Display currency: ${state.displayCurrency}`);
    lines.push(`INR per USD: ${els.inrPerUsd?.value || "—"}`);
    lines.push(`Annual discount rate: ${els.discountRateAnnual?.value || "—"}`);
    lines.push(`Apply discounting to outbreak benefits: ${els.applyDiscountOutbreak?.value || "—"}`);
    lines.push(`Cost config loaded from: ${state.loadedFrom.cost || "—"}`);
    lines.push(`Epi config loaded from: ${state.loadedFrom.epi || "—"}`);
    if (els.settingsLog) els.settingsLog.textContent = lines.join("\n");
  }

  function buildAttributesTable() {
    if (!els.attrTable) return;
    const rows = [
      { a: "Programme tier", l: "Frontline; Intermediate; Advanced", d: "Tier selection determines default duration, graduation share, outbreak frequency, and cost template mapping." },
      { a: "Trainees per cohort", l: "User input", d: "Used to compute per trainee indicators. Totals scale by cohort counts; trainee count affects per trainee metrics." },
      { a: "Number of cohorts", l: "User input", d: "Scales costs and benefits linearly relative to the aggregated tier template." },
      { a: "Planning horizon", l: "1 to 10 years", d: "Used for time aggregation and optional discounting where enabled." },
      { a: "Outbreak response time", l: "Fixed at 7 days", d: "Locked at 7 days. The dropdown is visible but other options are disabled." },
      { a: "Economic cost toggle", l: "Include or exclude opportunity cost", d: "When enabled, components flagged as opportunity cost are included in the total economic cost." }
    ];

    const header = `
      <div class="attr-table-header">
        <div>Attribute</div><div>Levels</div><div>Notes</div>
      </div>
    `;
    const body = rows.map(r => `
      <div class="attr-table-row">
        <div class="attr-cell-title">${r.a}</div>
        <div>${r.l}</div>
        <div class="attr-cell-expl">${r.d}</div>
      </div>
    `).join("");

    els.attrTable.innerHTML = header + body;
  }

  function computeScenario(override = null) {
    const tier = override?.tier ?? (els.tierSelect?.value || "frontline");
    const traineesPerCohort = Number(override?.traineesPerCohort ?? els.traineesPerCohort?.value ?? 25);
    const numCohorts = Number(override?.numCohorts ?? els.numCohorts?.value ?? 1);
    const planningYears = Number(override?.planningYears ?? els.planningYears?.value ?? 5);
    const responseTimeDays = 7;
    const economicCost = String(override?.economicCost ?? els.economicCostToggle?.value ?? "false") === "true";

    const epiTier = state.epiConfig?.tiers?.[tier];
    const costTier = state.costConfig?.[tier]?.Overall;

    const r = clamp(Number(els.discountRateAnnual?.value ?? 0.03), 0, 0.2);
    const applyDiscOutbreak = String(els.applyDiscountOutbreak?.value ?? "false") === "true";

    if (!epiTier || !costTier) {
      return { ok: false, error: "Missing tier configuration in JSON files." };
    }

    const baseComponents = Array.isArray(costTier.components) ? costTier.components : [];
    const scaledComponents = baseComponents.map(c => {
      const amount = Number(c.amountTotal || 0) * numCohorts;
      return { ...c, amountScenario: amount };
    });

    const totalDirect = scaledComponents
      .filter(c => String(c.major || "").toLowerCase().includes("direct"))
      .reduce((s, c) => s + (Number.isFinite(c.amountScenario) ? c.amountScenario : 0), 0);

    const totalOpp = scaledComponents
      .filter(c => !!c.isOpportunityCost)
      .reduce((s, c) => s + (Number.isFinite(c.amountScenario) ? c.amountScenario : 0), 0);

    const totalCost = economicCost ? (totalDirect + totalOpp) : totalDirect;

    const gradRate = Number(override?.gradRate ?? epiTier.gradRate ?? epiTier.gradShare ?? 0.9);
    const gradShare = Number(epiTier.gradShare ?? gradRate ?? 0.9);
    const outbreaksPerYear = Number(override?.outbreaksPerCohortPerYear ?? epiTier.outbreaksPerCohortPerYear ?? 0.3);

    const valuePerGrad = Number(override?.valuePerGraduate ?? epiTier.valuePerGraduate ?? 0);
    const valuePerOutbreak = Number(override?.valuePerOutbreak ?? epiTier.valuePerOutbreak ?? 0);

    const responseMult = Number(state.epiConfig?.response_time_multipliers?.["7"] ?? 1.0);

    const gradsTotal = traineesPerCohort * numCohorts * gradRate;

    let outbreakBenefit = 0;
    if (!applyDiscOutbreak) {
      outbreakBenefit = numCohorts * outbreaksPerYear * planningYears * valuePerOutbreak * responseMult;
    } else {
      let sum = 0;
      for (let t = 1; t <= planningYears; t++) {
        sum += discountFactor(t, r);
      }
      outbreakBenefit = numCohorts * outbreaksPerYear * valuePerOutbreak * responseMult * sum;
    }

    const gradBenefit = gradsTotal * valuePerGrad;

    const totalBenefit = outbreakBenefit + gradBenefit;

    const netBenefit = totalBenefit - totalCost;
    const bcr = totalCost > 0 ? (totalBenefit / totalCost) : NaN;

    const traineesTotal = Math.max(1, traineesPerCohort * numCohorts);

    return {
      ok: true,
      tier,
      traineesPerCohort,
      numCohorts,
      planningYears,
      responseTimeDays,
      economicCost,
      gradRate,
      gradShare,
      outbreaksPerYear,
      valuePerGrad,
      valuePerOutbreak,
      responseMult,
      components: scaledComponents,
      totals: {
        totalDirect,
        totalOpp,
        totalCost,
        outbreakBenefit,
        gradBenefit,
        totalBenefit,
        netBenefit,
        bcr,
        costPerTrainee: totalCost / traineesTotal,
        benefitPerTrainee: totalBenefit / traineesTotal
      },
      display: {
        currency: state.displayCurrency
      }
    };
  }

  function renderScenarioSnapshot(s) {
    if (!els.scenarioSummary) return;
    const rows = [
      ["Tier", s.tier],
      ["Trainees per cohort", fmtNumber(s.traineesPerCohort, 0)],
      ["Number of cohorts", fmtNumber(s.numCohorts, 0)],
      ["Planning horizon (years)", fmtNumber(s.planningYears, 0)],
      ["Outbreak response time (days)", "7"],
      ["Economic cost toggle", s.economicCost ? "On" : "Off"],
      ["Display currency", state.displayCurrency]
    ];

    els.scenarioSummary.innerHTML = rows.map(([k, v]) => `
      <div class="config-summary-row">
        <div class="config-summary-label">${k}</div>
        <div class="config-summary-value">${v}</div>
      </div>
    `).join("");
  }

  function setHeadline(s) {
    if (!els.headlineStatusPill || !els.headlineText) return;
    const bcr = s.totals.bcr;

    let pillClass = "status-neutral";
    let pillText = "Not calculated";
    let text = "Configure the programme and select Recalculate to populate results.";

    if (Number.isFinite(bcr)) {
      if (bcr >= 1.2) {
        pillClass = "status-good";
        pillText = "Favourable";
      } else if (bcr >= 1.0) {
        pillClass = "status-warning";
        pillText = "Borderline";
      } else {
        pillClass = "status-poor";
        pillText = "Unfavourable";
      }
      text = `Under the current configuration, total benefits are ${fmtMoney(s.totals.totalBenefit)} and total costs are ${fmtMoney(s.totals.totalCost)}. The benefit cost ratio is ${fmtNumber(bcr, 2)} and net benefit is ${fmtMoney(s.totals.netBenefit)}.`;
    }

    els.headlineStatusPill.classList.remove("status-neutral", "status-good", "status-warning", "status-poor");
    els.headlineStatusPill.classList.add(pillClass);
    els.headlineStatusPill.textContent = pillText;
    els.headlineText.textContent = text;
  }

  function renderKpis(s) {
    if (!els.kpiGrid) return;
    const kpis = [
      { label: "Total cost", value: fmtMoney(s.totals.totalCost), note: s.economicCost ? "Includes opportunity cost" : "Direct costs only" },
      { label: "Total benefit", value: fmtMoney(s.totals.totalBenefit), note: "Outbreak + graduate channels" },
      { label: "Net benefit", value: fmtMoney(s.totals.netBenefit), note: "Benefit minus cost" },
      { label: "BCR", value: Number.isFinite(s.totals.bcr) ? fmtNumber(s.totals.bcr, 2) : "—", note: "Total benefit divided by total cost" },
      { label: "Cost per trainee", value: fmtMoney(s.totals.costPerTrainee), note: "Total cost divided by total trainees" },
      { label: "Benefit per trainee", value: fmtMoney(s.totals.benefitPerTrainee), note: "Total benefit divided by total trainees" }
    ];
    els.kpiGrid.innerHTML = kpis.map(k => `
      <div class="kpi-card">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-small-note">${k.note}</div>
      </div>
    `).join("");
  }

  function renderBriefing(s) {
    if (!els.briefingText) return;
    els.briefingText.textContent =
      `Scenario: ${s.tier} tier, ${fmtNumber(s.numCohorts, 0)} cohorts with ${fmtNumber(s.traineesPerCohort, 0)} trainees per cohort over ${fmtNumber(s.planningYears, 0)} years. Outbreak response time is fixed at 7 days. Total cost is ${fmtMoney(s.totals.totalCost)} and total benefit is ${fmtMoney(s.totals.totalBenefit)}.`;
  }

  function drawBarChart(canvas, aLabel, a, bLabel, b) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
    const h = canvas.height = 140 * (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    const pad = 16 * (window.devicePixelRatio || 1);
    const barW = (w - pad * 3) / 2;
    const maxV = Math.max(a, b, 1);

    const scale = (h - pad * 3) / maxV;

    const bars = [
      { x: pad, y: h - pad, v: a, label: aLabel },
      { x: pad * 2 + barW, y: h - pad, v: b, label: bLabel }
    ];

    ctx.fillStyle = "rgba(29,79,145,0.85)";
    ctx.strokeStyle = "rgba(15,23,42,0.35)";
    ctx.lineWidth = 1 * (window.devicePixelRatio || 1);

    for (const bar of bars) {
      const bh = Math.max(2, bar.v * scale);
      const x = bar.x;
      const y = bar.y - bh;

      ctx.fillRect(x, y, barW, bh);
      ctx.strokeRect(x, y, barW, bh);

      ctx.fillStyle = "rgba(17,24,39,0.9)";
      ctx.font = `${12 * (window.devicePixelRatio || 1)}px system-ui`;
      ctx.fillText(bar.label, x, h - pad / 2);
      ctx.fillStyle = "rgba(29,79,145,0.85)";
    }
  }

  function renderCosting(s) {
    if (!els.costTableBody || !els.costSummary) return;

    const comp = s.components || [];
    const rows = comp.map(c => {
      const opp = c.isOpportunityCost ? "Yes" : "No";
      return `
        <tr>
          <td>${c.major || ""}</td>
          <td>${c.category || ""}</td>
          <td>${c.subCategory || ""}</td>
          <td class="numeric-col">${fmtMoney(Number(c.amountScenario || 0))}</td>
          <td>${opp}</td>
        </tr>
      `;
    }).join("");

    els.costTableBody.innerHTML = rows;

    els.costSummary.innerHTML = `
      <div class="cost-summary-card">
        <div class="cost-summary-label">Direct costs</div>
        <div class="cost-summary-value">${fmtMoney(s.totals.totalDirect)}</div>
      </div>
      <div class="cost-summary-card">
        <div class="cost-summary-label">Opportunity cost components</div>
        <div class="cost-summary-value">${fmtMoney(s.totals.totalOpp)}</div>
      </div>
      <div class="cost-summary-card">
        <div class="cost-summary-label">Total cost used</div>
        <div class="cost-summary-value">${fmtMoney(s.totals.totalCost)}</div>
      </div>
    `;

    if (els.exportPreview) {
      els.exportPreview.textContent = `Total cost: ${fmtMoney(s.totals.totalCost)} | Total benefit: ${fmtMoney(s.totals.totalBenefit)} | BCR: ${Number.isFinite(s.totals.bcr) ? fmtNumber(s.totals.bcr, 2) : "—"}`;
    }
  }

  function renderTechnical(s) {
    if (!els.technicalBox) return;
    const lines = [];
    lines.push("Model summary");
    lines.push("");
    lines.push(`Tier: ${s.tier}`);
    lines.push(`Cohorts: ${s.numCohorts}`);
    lines.push(`Trainees per cohort: ${s.traineesPerCohort}`);
    lines.push(`Planning horizon (years): ${s.planningYears}`);
    lines.push(`Outbreak response time (days): 7`);
    lines.push(`Economic cost toggle: ${s.economicCost ? "On" : "Off"}`);
    lines.push("");
    lines.push("Cost construction");
    lines.push("Total cost is computed by scaling the tier aggregated template linearly by the number of cohorts. When economic cost is enabled, components flagged as opportunity cost are included.");
    lines.push("");
    lines.push("Benefit construction");
    lines.push("Outbreak benefits are computed as cohorts × outbreaks per cohort per year × horizon × value per outbreak × response time multiplier. If discounting is enabled for outbreak benefits, an annual discount factor is applied over the horizon.");
    lines.push("Graduate benefits are computed as (trainees per cohort × cohorts × graduation rate) × value per graduate.");
    lines.push("");
    lines.push(`Cost JSON: ${state.loadedFrom.cost || "—"}`);
    lines.push(`Epi JSON: ${state.loadedFrom.epi || "—"}`);
    els.technicalBox.textContent = lines.join("\n");
  }

  function renderSourcesBox() {
    if (!els.dataSourcesBox) return;
    const lines = [];
    lines.push(`Cost configuration: ${state.loadedFrom.cost || "Not loaded"}`);
    lines.push(`Epidemiological configuration: ${state.loadedFrom.epi || "Not loaded"}`);
    lines.push("");
    lines.push("Candidate filenames searched:");
    lines.push(`Cost: ${FILE_CANDIDATES.cost.join(", ")}`);
    lines.push(`Epi: ${FILE_CANDIDATES.epi.join(", ")}`);
    els.dataSourcesBox.textContent = lines.join("\n");
  }

  function buildResponseTimeDropdown() {
    if (!els.responseTimeDays) return;
    const options = [
      { value: 30, label: "30" },
      { value: 15, label: "15" },
      { value: 7, label: "7" }
    ];
    fillSelect(els.responseTimeDays, options, 7);

    Array.from(els.responseTimeDays.options).forEach(o => {
      if (o.value !== "7") o.disabled = true;
    });
    els.responseTimeDays.value = "7";
  }

  function runComputeAndRender(sourceLabel = "Recalculate") {
    const s = computeScenario();
    if (!s.ok) {
      setBadge("Data not loaded", "outline");
      toast(s.error || "Error", "error");
      if (els.costingError) {
        els.costingError.textContent = s.error || "Error";
        els.costingError.classList.remove("hidden");
      }
      logAssumptions([
        "Computation failed.",
        s.error || "Unknown error.",
        "",
        `Cost JSON: ${state.loadedFrom.cost || "—"}`,
        `Epi JSON: ${state.loadedFrom.epi || "—"}`
      ]);
      return;
    }

    if (els.costingError) els.costingError.classList.add("hidden");

    state.lastComputed = s;

    renderScenarioSnapshot(s);
    setHeadline(s);
    renderKpis(s);
    renderBriefing(s);
    renderCosting(s);
    renderTechnical(s);

    drawBarChart(els.costBenefitChart, "Cost", s.totals.totalCost, "Benefit", s.totals.totalBenefit);

    updateSettingsLog();

    const assumptions = [];
    assumptions.push(`Run: ${new Date().toISOString()}`);
    assumptions.push(`Trigger: ${sourceLabel}`);
    assumptions.push(`Tier: ${s.tier}`);
    assumptions.push(`Trainees per cohort: ${s.traineesPerCohort}`);
    assumptions.push(`Cohorts: ${s.numCohorts}`);
    assumptions.push(`Planning years: ${s.planningYears}`);
    assumptions.push(`Response time (days): 7 (locked)`);
    assumptions.push(`Economic cost toggle: ${s.economicCost ? "On" : "Off"}`);
    assumptions.push(`Discount rate: ${els.discountRateAnnual?.value || "—"}`);
    assumptions.push(`Discount outbreak benefits: ${els.applyDiscountOutbreak?.value || "—"}`);
    assumptions.push(`Outbreaks per cohort per year: ${fmtNumber(s.outbreaksPerYear, 2)}`);
    assumptions.push(`Value per outbreak (INR): ${fmtNumber(s.valuePerOutbreak, 0)}`);
    assumptions.push(`Value per graduate (INR): ${fmtNumber(s.valuePerGrad, 0)}`);
    assumptions.push("");
    assumptions.push(`Cost JSON: ${state.loadedFrom.cost || "—"}`);
    assumptions.push(`Epi JSON: ${state.loadedFrom.epi || "—"}`);
    logAssumptions(assumptions);

    setBadge("Data loaded", "primary");
  }

  function saveScenario() {
    const s = computeScenario();
    if (!s.ok) return;
    const payload = {
      tier: s.tier,
      traineesPerCohort: s.traineesPerCohort,
      numCohorts: s.numCohorts,
      planningYears: s.planningYears,
      economicCost: s.economicCost,
      displayCurrency: state.displayCurrency,
      inrPerUsd: Number(els.inrPerUsd?.value || 83),
      discountRateAnnual: Number(els.discountRateAnnual?.value || 0.03),
      applyDiscountOutbreak: String(els.applyDiscountOutbreak?.value || "false") === "true"
    };
    localStorage.setItem("steps_saved_scenario_v1", JSON.stringify(payload));
    toast("Scenario saved.", "success");
  }

  function loadScenario() {
    const raw = localStorage.getItem("steps_saved_scenario_v1");
    if (!raw) {
      toast("No saved scenario found.", "warning");
      return;
    }
    try {
      const p = JSON.parse(raw);
      if (els.tierSelect) els.tierSelect.value = p.tier || "frontline";
      if (els.traineesPerCohort) els.traineesPerCohort.value = String(p.traineesPerCohort ?? 25);
      if (els.numCohorts) els.numCohorts.value = String(p.numCohorts ?? 1);
      if (els.planningYears) els.planningYears.value = String(p.planningYears ?? 5);
      if (els.economicCostToggle) els.economicCostToggle.value = p.economicCost ? "true" : "false";

      if (els.displayCurrency) els.displayCurrency.value = p.displayCurrency || "INR";
      state.displayCurrency = els.displayCurrency.value;

      if (els.inrPerUsd) els.inrPerUsd.value = String(p.inrPerUsd ?? 83);
      if (els.discountRateAnnual) els.discountRateAnnual.value = String(p.discountRateAnnual ?? 0.03);
      if (els.applyDiscountOutbreak) els.applyDiscountOutbreak.value = String(!!p.applyDiscountOutbreak);

      buildResponseTimeDropdown();
      toast("Scenario loaded.", "success");
      runComputeAndRender("Load scenario");
    } catch (e) {
      toast("Failed to load scenario.", "error");
    }
  }

  function buildCopilotPackage() {
    const s = state.lastComputed || computeScenario();
    if (!s.ok) return "";
    const packageObj = {
      meta: {
        tool: "STEPS FETP India Decision Aid",
        generatedAt: new Date().toISOString(),
        responseTimeDaysFixed: 7,
        files: { cost: state.loadedFrom.cost, epi: state.loadedFrom.epi }
      },
      configuration: {
        tier: s.tier,
        traineesPerCohort: s.traineesPerCohort,
        numCohorts: s.numCohorts,
        planningYears: s.planningYears,
        economicCost: s.economicCost,
        discountRateAnnual: Number(els.discountRateAnnual?.value || 0.03),
        applyDiscountingToOutbreakBenefits: String(els.applyDiscountOutbreak?.value || "false") === "true",
        displayCurrency: state.displayCurrency,
        inrPerUsd: Number(els.inrPerUsd?.value || 83)
      },
      results: {
        totalCostInr: s.totals.totalCost,
        totalBenefitInr: s.totals.totalBenefit,
        netBenefitInr: s.totals.netBenefit,
        bcr: s.totals.bcr,
        costPerTraineeInr: s.totals.costPerTrainee,
        benefitPerTraineeInr: s.totals.benefitPerTrainee,
        channelBreakdown: {
          directCostInr: s.totals.totalDirect,
          opportunityCostInr: s.totals.totalOpp,
          outbreakBenefitInr: s.totals.outbreakBenefit,
          graduateBenefitInr: s.totals.gradBenefit
        }
      }
    };

    const prompt =
`You are assisting with a policy briefing based on a configured STEPS FETP scenario. Read the JSON block below and produce a structured briefing with the following sections: Executive summary, Scenario configuration, Results table, Interpretation, Key assumptions, Sensitivity considerations, and Practical implications. Use the JSON values exactly. Provide amounts in both INR and USD using the provided INR per USD rate. Avoid adding new numbers that are not in the JSON.`;

    return prompt + "\n\nJSON:\n" + JSON.stringify(packageObj, null, 2);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  function renderSensitivity() {
    if (!els.sensTableBody) return;
    const base = state.lastComputed || computeScenario();
    if (!base.ok) return;

    const vOut = Number(els.sensOutbreakValue?.value);
    const gRate = Number(els.sensGradRate?.value);
    const oPer = Number(els.sensOutbreaksPerYear?.value);

    const baseOverrides = {
      valuePerOutbreak: Number.isFinite(vOut) ? vOut : base.valuePerOutbreak,
      gradRate: Number.isFinite(gRate) ? gRate : base.gradRate,
      outbreaksPerCohortPerYear: Number.isFinite(oPer) ? oPer : base.outbreaksPerYear
    };

    const cases = [
      { name: "Base", o: {} },
      { name: "Lower outbreak value", o: { valuePerOutbreak: baseOverrides.valuePerOutbreak * 0.75 } },
      { name: "Higher outbreak value", o: { valuePerOutbreak: baseOverrides.valuePerOutbreak * 1.25 } },
      { name: "Lower graduation rate", o: { gradRate: clamp(baseOverrides.gradRate - 0.10, 0, 1) } },
      { name: "Higher outbreak frequency", o: { outbreaksPerCohortPerYear: baseOverrides.outbreaksPerCohortPerYear * 1.25 } }
    ];

    const rows = cases.map(c => {
      const s = computeScenario({ ...baseOverrides, ...c.o });
      if (!s.ok) return "";
      const bcr = s.totals.bcr;
      return `
        <tr>
          <td>${c.name}</td>
          <td class="numeric-col">${fmtMoney(s.totals.totalCost)}</td>
          <td class="numeric-col">${fmtMoney(s.totals.totalBenefit)}</td>
          <td class="numeric-col">${fmtMoney(s.totals.netBenefit)}</td>
          <td class="numeric-col">${Number.isFinite(bcr) ? fmtNumber(bcr, 2) : "—"}</td>
        </tr>
      `;
    }).join("");

    els.sensTableBody.innerHTML = rows;

    if (els.sensCaption) {
      els.sensCaption.textContent =
        `Sensitivity varies outbreak value, graduation rate, and outbreak frequency around the current configuration. Response time is fixed at 7 days.`;
    }

    if (els.sensNote) {
      els.sensNote.textContent =
        `Overrides applied: value per outbreak ${fmtNumber(baseOverrides.valuePerOutbreak, 0)} INR, graduation rate ${fmtNumber(baseOverrides.gradRate, 2)}, outbreaks per cohort per year ${fmtNumber(baseOverrides.outbreaksPerCohortPerYear, 2)}.`;
    }
  }

  function setupTour() {
    if (!els.tourOverlay || !els.tourPopover) return;
    const steps = [
      { tab: "aboutTab", title: "Purpose", body: "This tab summarises the scenario snapshot and headline indicator." },
      { tab: "configTab", title: "Configuration", body: "Set tier, cohort structure, planning horizon, and economic cost toggle. Response time is fixed at 7 days." },
      { tab: "resultsTab", title: "Results", body: "Review headline costs, benefits, net benefit, and BCR alongside a simple chart." },
      { tab: "costingTab", title: "Costing", body: "Inspect the cost component breakdown scaled by number of cohorts." },
      { tab: "copilotTab", title: "Copilot", body: "Generate and copy a scenario package for policy briefing inside your Copilot environment." }
    ];
    let idx = 0;

    function show() {
      const s = steps[idx];
      const btn = document.querySelector(`.tablink[data-tab="${s.tab}"], .tab-link[data-tab="${s.tab}"]`);
      if (btn) btn.click();
      els.tourTitle.textContent = s.title;
      els.tourBody.textContent = s.body;
      els.tourStepIndicator.textContent = `Step ${idx + 1} of ${steps.length}`;
      els.tourOverlay.classList.remove("hidden");
      els.tourPopover.classList.remove("hidden");

      const rect = btn ? btn.getBoundingClientRect() : { left: 40, top: 80, bottom: 80 };
      const pop = els.tourPopover.getBoundingClientRect();
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - pop.width - 12);
      const top = Math.min(Math.max(12, rect.bottom + 10), window.innerHeight - pop.height - 12);
      els.tourPopover.style.left = `${left}px`;
      els.tourPopover.style.top = `${top}px`;
    }

    function close() {
      els.tourOverlay.classList.add("hidden");
      els.tourPopover.classList.add("hidden");
    }

    els.runTourBtn?.addEventListener("click", () => { idx = 0; show(); });
    els.tourCloseBtn?.addEventListener("click", close);
    els.tourOverlay?.addEventListener("click", close);

    els.tourPrevBtn?.addEventListener("click", () => { idx = Math.max(0, idx - 1); show(); });
    els.tourNextBtn?.addEventListener("click", () => { idx = Math.min(steps.length - 1, idx + 1); show(); });
  }

  function wireUI() {
    els.dataStatusBadge = q("dataStatusBadge");
    els.toast = q("toast");

    els.tierSelect = q("tierSelect");
    els.traineesPerCohort = q("traineesPerCohort");
    els.numCohorts = q("numCohorts");
    els.planningYears = q("planningYears");
    els.responseTimeDays = q("responseTimeDays");
    els.economicCostToggle = q("economicCostToggle");

    els.displayCurrency = q("displayCurrency");
    els.inrPerUsd = q("inrPerUsd");
    els.discountRateAnnual = q("discountRateAnnual");
    els.applyDiscountOutbreak = q("applyDiscountOutbreak");
    els.settingsLog = q("settingsLog");

    els.assumptionLog = q("assumptionLog");
    els.scenarioSummary = q("scenarioSummary");
    els.headlineStatusPill = q("headlineStatusPill");
    els.headlineText = q("headlineText");
    els.kpiGrid = q("kpiGrid");
    els.briefingText = q("briefingText");
    els.costBenefitChart = q("costBenefitChart");

    els.costSummary = q("costSummary");
    els.costTable = q("costTable");
    els.costTableBody = els.costTable ? els.costTable.querySelector("tbody") : null;
    els.costingError = q("costingError");
    els.exportPreview = q("exportPreview");

    els.attrTable = q("attrTable");
    els.dataSourcesBox = q("dataSourcesBox");
    els.technicalBox = q("technicalBox");

    els.recalcBtn = q("recalcBtn");
    els.resetBtn = q("resetBtn");
    els.applyBtn = q("applyBtn");
    els.saveScenarioBtn = q("saveScenarioBtn");
    els.loadScenarioBtn = q("loadScenarioBtn");

    els.printBtn = q("printBtn");
    els.copySummaryBtn = q("copySummaryBtn");

    els.sensOutbreakValue = q("sensOutbreakValue");
    els.sensGradRate = q("sensGradRate");
    els.sensOutbreaksPerYear = q("sensOutbreaksPerYear");
    els.sensRunBtn = q("sensRunBtn");
    els.sensTable = q("sensTable");
    els.sensTableBody = els.sensTable ? els.sensTable.querySelector("tbody") : null;
    els.sensCaption = q("sensCaption");
    els.sensNote = q("sensNote");

    els.generateCopilotBtn = q("generateCopilotBtn");
    els.copyCopilotBtn = q("copyCopilotBtn");
    els.copyCopilotBtnDark = q("copyCopilotBtnDark");
    els.copyCopilotBtnTop = q("copyCopilotBtnTop");
    els.copilotPackage = q("copilotPackage");
    els.copilotStatusText = q("copilotStatusText");
    els.copilotStatusPill = q("copilotStatusPill");
    els.copilotActionsText = q("copilotActionsText");

    els.themeToggleBtn = q("themeToggleBtn");

    els.runTourBtn = q("runTourBtn");
    els.tourOverlay = q("tour-overlay");
    els.tourPopover = q("tour-popover");
    els.tourTitle = q("tourTitle");
    els.tourBody = q("tourBody");
    els.tourStepIndicator = q("tourStepIndicator");
    els.tourCloseBtn = q("tourCloseBtn");
    els.tourPrevBtn = q("tourPrevBtn");
    els.tourNextBtn = q("tourNextBtn");

    els.recalcBtn?.addEventListener("click", () => runComputeAndRender("Recalculate"));
    els.applyBtn?.addEventListener("click", () => runComputeAndRender("Apply configuration"));
    els.resetBtn?.addEventListener("click", () => {
      applyDefaultsToUI();
      runComputeAndRender("Reset to defaults");
      toast("Defaults applied.", "success");
    });

    els.displayCurrency?.addEventListener("change", () => {
      state.displayCurrency = els.displayCurrency.value;
      updateSettingsLog();
      runComputeAndRender("Display currency changed");
    });

    els.inrPerUsd?.addEventListener("change", updateSettingsLog);
    els.discountRateAnnual?.addEventListener("change", () => { updateSettingsLog(); runComputeAndRender("Discount rate changed"); });
    els.applyDiscountOutbreak?.addEventListener("change", () => { updateSettingsLog(); runComputeAndRender("Discount toggle changed"); });

    els.saveScenarioBtn?.addEventListener("click", saveScenario);
    els.loadScenarioBtn?.addEventListener("click", loadScenario);

    els.printBtn?.addEventListener("click", () => window.print());
    els.copySummaryBtn?.addEventListener("click", async () => {
      const s = state.lastComputed || computeScenario();
      if (!s.ok) return;
      const txt = `Tier: ${s.tier}\nCohorts: ${s.numCohorts}\nTrainees per cohort: ${s.traineesPerCohort}\nPlanning years: ${s.planningYears}\nTotal cost: ${fmtMoney(s.totals.totalCost)}\nTotal benefit: ${fmtMoney(s.totals.totalBenefit)}\nBCR: ${Number.isFinite(s.totals.bcr) ? fmtNumber(s.totals.bcr, 2) : "—"}`;
      const ok = await copyText(txt);
      toast(ok ? "Summary copied." : "Copy failed.", ok ? "success" : "error");
    });

    els.sensRunBtn?.addEventListener("click", () => {
      renderSensitivity();
      toast("Sensitivity table updated.", "success");
    });

    function generateAndShowCopilot() {
      const pkg = buildCopilotPackage();
      if (els.copilotPackage) els.copilotPackage.value = pkg;
      if (els.copilotStatusText) els.copilotStatusText.textContent = pkg ? "Package generated." : "Not generated.";
      if (els.copilotStatusPill) els.copilotStatusPill.textContent = pkg ? "Ready" : "Idle";
      if (els.copilotActionsText) els.copilotActionsText.textContent = pkg ? "Paste into Copilot." : "";
    }

    els.generateCopilotBtn?.addEventListener("click", () => {
      generateAndShowCopilot();
      toast("Copilot package generated.", "success");
    });

    async function copyCopilot() {
      if (!els.copilotPackage) return;
      if (!els.copilotPackage.value) generateAndShowCopilot();
      const ok = await copyText(els.copilotPackage.value || "");
      toast(ok ? "Package copied." : "Copy failed.", ok ? "success" : "error");
    }

    els.copyCopilotBtn?.addEventListener("click", copyCopilot);
    els.copyCopilotBtnDark?.addEventListener("click", copyCopilot);
    els.copyCopilotBtnTop?.addEventListener("click", copyCopilot);

    els.themeToggleBtn?.addEventListener("click", () => {
      const on = document.body.getAttribute("data-theme") === "worldbank-dark";
      if (on) document.body.removeAttribute("data-theme");
      else document.body.setAttribute("data-theme", "worldbank-dark");
    });

    window.addEventListener("resize", () => {
      if (state.lastComputed?.ok) {
        drawBarChart(els.costBenefitChart, "Cost", state.lastComputed.totals.totalCost, "Benefit", state.lastComputed.totals.totalBenefit);
      }
    });
  }

  async function init() {
    setupTabs();
    setupTooltips();
    wireUI();
    setupTour();

    setBadge("Loading data", "soft");

    try {
      const cost = await fetchFirstJson(FILE_CANDIDATES.cost);
      state.costConfig = cost.data;
      state.loadedFrom.cost = cost.path;

      const epi = await fetchFirstJson(FILE_CANDIDATES.epi);
      state.epiConfig = epi.data;
      state.loadedFrom.epi = epi.path;

      renderSourcesBox();

      const currencyOptions = (state.epiConfig?.currency?.display_currency_options || ["INR", "USD"]).map(x => ({ value: x, label: x }));
      fillSelect(els.displayCurrency, currencyOptions, state.epiConfig?.currency?.default_display_currency || "INR");
      state.displayCurrency = els.displayCurrency?.value || "INR";

      const tiers = Object.keys(state.epiConfig?.tiers || { frontline: {}, intermediate: {}, advanced: {} });
      fillSelect(els.tierSelect, tiers.map(t => ({ value: t, label: (state.epiConfig.tiers?.[t]?.label || t) })), getConfigDefaults().tier);

      const displayResOptions = [
        { value: 30, label: "30" },
        { value: 15, label: "15" },
        { value: 7, label: "7" }
      ];
      fillSelect(els.responseTimeDays, displayResOptions, 7);
      buildResponseTimeDropdown();

      applyDefaultsToUI();
      buildAttributesTable();
      updateSettingsLog();

      setBadge("Data loaded", "primary");
      toast("Data loaded.", "success");

      runComputeAndRender("Initial load");
      renderSensitivity();
    } catch (e) {
      setBadge("Data not loaded", "outline");
      renderSourcesBox();
      logAssumptions([
        "Data load failed.",
        String(e && e.message ? e.message : e),
        "",
        "If you are viewing this as a local file, switch to GitHub Pages or a local server to allow fetch().",
        "Ensure cost_config.json and epi_config.json are deployed in the same folder as index.html."
      ]);
      toast("Failed to load JSON data.", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
