/* ============================================================
   FETP India Decision Aid Tool (Fully Functional, Enhanced)
   Robust tab activation with explicit initialization and event handling.
   Uses a different method: direct forEach on tab buttons for activation.
   Added console logs for debugging tab switches.
   Ensures all tabs work by resetting states on each click.
============================================================ */
(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const INRfmt = n => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
  function showError(msg) {
    const b = $("#globalError");
    b.textContent = msg;
    b.style.display = "block";
    setTimeout(() => b.style.display = "none", 5000); // Auto-hide after 5s
  }
  function hideError() {
    $("#globalError").style.display = "none";
  }

  /* ---------- Globals for Charts ---------- */
  let wtpChart, endorseChart, combinedChart, qalyChart, psaBCRChart, psaICERChart;

  /* ---------- Parameters ---------- */
  /* Logit coefficients (placeholder) */
  const COEFS = {
    ASC: 0.30,
    type_intermediate: 0.28, type_advanced: 0.48,
    dur_12: 0.10, dur_24: 0.18,
    focus_animal: 0.14, focus_onehealth: 0.36,
    mode_hybrid: 0.12, mode_online: -0.32,
    resp_7: 0.16, resp_3: 0.30, resp_1: 0.52,
    cost_perT_perM: -0.0000085
  };

  /* Marginal WTP (₹) */
  const WTP = {
    type_intermediate: 10000, type_advanced: 20000,
    dur_12: 5000, dur_24: 8000,
    focus_animal: 6000, focus_onehealth: 13000,
    mode_hybrid: 3000, mode_online: -6500,
    resp_7: 4000, resp_3: 9500, resp_1: 16000
  };

  /* Cost components */
  const BASE_COSTS = {
    staff_consult: 1200000, rent_utils: 150000, workshops: 220000,
    office_maint: 60000, staff_dev: 80000
  };
  const PER_TRAINEE = {
    allowance: 18000, equip: 6000, materials: 1200, opp_cost: 25000
  };

  /* Multipliers */
  const MULTIPLIERS = {
    ptype: { frontline: 1.0, intermediate: 1.08, advanced: 1.18 },
    duration: { "6": 1.0, "12": 1.25, "24": 1.7 },
    mode_cost: { inperson: 1.0, hybrid: 1.03, online: 0.85 },
    focus_cost: { human: 1.0, animal: 1.04, onehealth: 1.08 },
    resp_cost: { "14": 1.0, "7": 1.06, "3": 1.12, "1": 1.20 }
  };

  const COLORS = ["#2b6cb0", "#38b2ac", "#ed8936", "#c53030", "#718096"];

  /* ---------- State ---------- */
  let savedScenarios = [];
  let currentScenario = null; // Store last calculated scenario

  /* ---------- On DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    try {
      initializeTabs();
      bindInputs();
      $("#calcBtn").addEventListener("click", safe(calcAndDisplay));
      $("#closeModalBtn").addEventListener("click", closeModal);
      $("#showWTP").addEventListener("click", safe(renderWTPChart));
      $("#showEndorse").addEventListener("click", safe(() => renderEndorseChart()));
      $("#toggleBreakdown").addEventListener("click", toggleCostBreakdown);
      $("#runQALY").addEventListener("click", safe(runQALY));
      $("#runPSA").addEventListener("click", safe(runPSA));
      $("#saveScenarioBtn").addEventListener("click", safe(saveScenario));
      $("#exportPDFBtn").addEventListener("click", safe(exportPDF));
    } catch (e) {
      console.error(e);
      showError("Initialization error. Please check the console.");
    }
  });

  /* ---------- Safe Wrapper ---------- */
  function safe(fn) {
    return (...args) => {
      try {
        hideError();
        fn(...args);
      } catch (e) {
        console.error(e);
        showError(e.message);
      }
    };
  }

  /* ---------- Tab Management (Different Method: Direct forEach on Buttons) ---------- */
  function initializeTabs() {
    const tabs = $$(".tablink");
    const tabContents = $$(".tabcontent");

    // Reset all tabs and contents
    tabs.forEach(tab => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
      tab.addEventListener("click", () => activateTab(tab.dataset.tab));
    });
    tabContents.forEach(content => content.style.display = "none");

    // Activate initial tab
    const initialTab = tabs[0];
    if (initialTab) {
      initialTab.classList.add("active");
      initialTab.setAttribute("aria-selected", "true");
      const initialContent = $(`#${initialTab.dataset.tab}`);
      if (initialContent) initialContent.style.display = "block";
      console.log("Initial tab activated:", initialTab.dataset.tab);
    }

    // Keyboard navigation
    tabs.forEach(tab => {
      tab.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateTab(tab.dataset.tab);
        }
      });
    });
  }

  function activateTab(tabId) {
    const tabs = $$(".tablink");
    const tabContents = $$(".tabcontent");

    tabs.forEach(b => {
      const isActive = b.dataset.tab === tabId;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    tabContents.forEach(sec => {
      sec.style.display = sec.id === tabId ? "block" : "none";
    });

    console.log("Tab activated:", tabId);

    // Auto-render if scenario calculated
    if (currentScenario) {
      switch (tabId) {
        case "wtpTab":
          renderWTPChart();
          break;
        case "endorseTab":
          renderEndorseChart();
          break;
        case "costsTab":
          renderCostsBenefits();
          break;
        case "qalyTab":
          runQALY();
          break;
        case "psaTab":
          runPSA();
          break;
      }
    } else if (["wtpTab", "endorseTab", "costsTab", "qalyTab", "psaTab"].includes(tabId)) {
      showError("Please calculate a scenario in the Inputs tab first.");
    }
  }

  /* ---------- Inputs ---------- */
  function bindInputs() {
    const capSlider = $("#capSlider"), costSlider = $("#costSlider"), stakeSlider = $("#stakeSlider");
    capSlider.addEventListener("input", () => { $("#capLabel").textContent = capSlider.value; });
    costSlider.addEventListener("input", () => { $("#costLabel").textContent = Number(costSlider.value).toLocaleString(); });
    stakeSlider.addEventListener("input", () => { $("#stakeLabel").textContent = stakeSlider.value; });
  }

  /* Build Scenario Object */
  function buildScenario() {
    const sc = {
      ptype: document.querySelector('input[name="ptype"]:checked')?.value,
      duration: document.querySelector('input[name="duration"]:checked')?.value,
      focus: document.querySelector('input[name="focus"]:checked')?.value,
      mode: document.querySelector('input[name="mode"]:checked')?.value,
      resp: document.querySelector('input[name="resp"]:checked')?.value,
      capacity: +$("#capSlider").value,
      costPerTM: +$("#costSlider").value,
      stakeholders: +$("#stakeSlider").value,
      cohortsYear: +$("#cohortsYear").value,
      yearsHorizon: +$("#yearsHorizon").value,
      discRate: (+$("#discRate").value) / 100
    };
    if (!sc.ptype || !sc.duration || !sc.focus || !sc.mode || !sc.resp) {
      throw new Error("Please select all attribute levels.");
    }
    const warn = [];
    if (sc.mode === "online" && (sc.ptype === "advanced" || sc.focus === "onehealth")) {
      warn.push("Fully online delivery for Advanced or One Health programs may be impractical; consider Hybrid.");
    }
    if (sc.capacity > 1200 && sc.mode === "inperson" && sc.resp === "1") {
      warn.push("24-hour response with in-person delivery and capacity >1200 may strain logistics.");
    }
    setWarnings(warn);
    return sc;
  }

  function setWarnings(arr) {
    const box = $("#warnings");
    if (arr.length) {
      box.innerHTML = "<ul>" + arr.map(x => `<li>${x}</li>`).join("") + "</ul>";
      box.style.display = "block";
    } else {
      box.style.display = "none";
      box.innerHTML = "";
    }
  }

  /* ---------- Core Calculations ---------- */
  function endorsementProb(sc) {
    let U = COEFS.ASC;
    if (sc.ptype === "intermediate") U += COEFS.type_intermediate;
    if (sc.ptype === "advanced") U += COEFS.type_advanced;
    if (sc.duration === "12") U += COEFS.dur_12;
    if (sc.duration === "24") U += COEFS.dur_24;
    if (sc.focus === "animal") U += COEFS.focus_animal;
    if (sc.focus === "onehealth") U += COEFS.focus_onehealth;
    if (sc.mode === "hybrid") U += COEFS.mode_hybrid;
    if (sc.mode === "online") U += COEFS.mode_online;
    if (sc.resp === "7") U += COEFS.resp_7;
    if (sc.resp === "3") U += COEFS.resp_3;
    if (sc.resp === "1") U += COEFS.resp_1;
    U += COEFS.cost_perT_perM * sc.costPerTM;
    const p = Math.exp(U) / (1 + Math.exp(U));
    return Math.max(0.01, Math.min(0.99, p));
  }

  function totalWTP(sc, eShare) {
    let m = 0;
    if (sc.ptype === "intermediate") m += WTP.type_intermediate;
    if (sc.ptype === "advanced") m += WTP.type_advanced;
    if (sc.duration === "12") m += WTP.dur_12;
    if (sc.duration === "24") m += WTP.dur_24;
    if (sc.focus === "animal") m += WTP.focus_animal;
    if (sc.focus === "onehealth") m += WTP.focus_onehealth;
    if (sc.mode === "hybrid") m += WTP.mode_hybrid;
    if (sc.mode === "online") m += WTP.mode_online;
    if (sc.resp === "7") m += WTP.resp_7;
    if (sc.resp === "3") m += WTP.resp_3;
    if (sc.resp === "1") m += WTP.resp_1;
    return m * sc.stakeholders * eShare;
  }

  function pvCost(sc, eShare) {
    const yrs = sc.yearsHorizon, r = sc.discRate, coh = sc.cohortsYear;
    const mT = MULTIPLIERS.ptype[sc.ptype], mD = MULTIPLIERS.duration[sc.duration],
          mMo = MULTIPLIERS.mode_cost[sc.mode], mF = MULTIPLIERS.focus_cost[sc.focus],
          mR = MULTIPLIERS.resp_cost[sc.resp], mult = mT * mD * mMo * mF * mR;

    let pv = 0;
    for (let t = 0; t < yrs; t++) {
      let fixed = 0;
      Object.values(BASE_COSTS).forEach(v => fixed += v);
      fixed *= mult;
      const endorsed = sc.capacity * eShare * coh;
      let perT = 0;
      Object.values(PER_TRAINEE).forEach(v => perT += v);
      perT *= endorsed * mT * mD * mF;
      const moh = sc.costPerTM * (sc.duration / 12) * sc.capacity * coh;
      const yearCost = fixed + perT + moh;
      pv += yearCost / Math.pow(1 + r, t);
    }
    return pv;
  }

  function pvQALY(sc, eShare, qalyPerT) {
    const yrs = sc.yearsHorizon, r = sc.discRate, coh = sc.cohortsYear;
    let pv = 0;
    for (let t = 0; t < yrs; t++) {
      pv += (sc.capacity * coh * eShare * qalyPerT) / Math.pow(1 + r, t);
    }
    return pv;
  }

  /* ---------- Recommendations ---------- */
  function buildRecommendation(sc, ePct, bcr, net) {
    const msgs = [];
    if (ePct >= 70 && bcr >= 1 && net > 0) {
      msgs.push("High endorsement and positive net benefit—proceed to implementation planning.");
    }
    if (ePct < 45) {
      msgs.push("Low endorsement (<45%). Consider shorter durations, hybrid delivery, or faster response times.");
    }
    if (bcr < 1 || net < 0) {
      msgs.push("Benefits below costs. Reduce stipends, overheads, or expand stakeholder base.");
    }
    if (sc.mode === "online" && (sc.ptype === "advanced" || sc.focus === "onehealth")) {
      msgs.push("Hybrid delivery may be more suitable for Advanced/One Health programs.");
    }
    if (sc.duration === "24") {
      msgs.push("24-month programs are costly; consider 12-month programs with refreshers.");
    }
    if (sc.resp === "14") {
      msgs.push("Faster response times (≤7 days) significantly boost WTP and endorsement.");
    }
    if (sc.costPerTM > 70000) {
      msgs.push("High MoH costs; explore co-funding or economies of scale.");
    }
    if (msgs.length === 0) {
      msgs.push("Balanced configuration with strong endorsement and cost-effectiveness.");
    }
    return "Recommendations: " + msgs.join(" ");
  }

  /* ---------- Main Pipeline ---------- */
  function calcAndDisplay() {
    const sc = buildScenario();
    currentScenario = sc;
    const eShare = endorsementProb(sc);
    const ePct = eShare * 100;
    const w = totalWTP(sc, eShare);
    const c = pvCost(sc, eShare);
    const bcr = w / c;
    const net = w - c;
    const rec = buildRecommendation(sc, ePct, bcr, net);

    $("#modalResults").innerHTML = `
      <h4>Scenario Summary</h4>
      <p><strong>Endorsement Rate:</strong> ${ePct.toFixed(1)}%</p>
      <p><strong>Total WTP:</strong> ₹${INRfmt(w)}</p>
      <p><strong>Total Cost (PV):</strong> ₹${INRfmt(c)}</p>
      <p><strong>BCR:</strong> ${bcr.toFixed(2)}</p>
      <p><strong>Net Benefit:</strong> ₹${INRfmt(net)}</p>
      <p>${rec}</p>`;
    openModal();

    renderWTPChart();
    renderEndorseChart(sc);
    renderCostsBenefits(sc, ePct, w, c, bcr, net, eShare);
  }

  /* ---------- Charts ---------- */
  function renderWTPChart() {
    if (!currentScenario) {
      showError("Please calculate a scenario first.");
      return;
    }
    const canvas = $("#wtpChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (wtpChart) wtpChart.destroy();
    const labels = Object.keys(WTP).map(k => k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    const values = Object.values(WTP);
    wtpChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Marginal WTP (₹)",
          data: values,
          backgroundColor: COLORS,
          borderColor: "#2d3748",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "₹" } } },
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Marginal WTP by Attribute (₹)", font: { size: 18 } }
        }
      }
    });
  }

  function renderEndorseChart(sc = null) {
    if (!currentScenario && !sc) {
      showError("Please calculate a scenario first.");
      return;
    }
    const canvas = $("#endorseChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (endorseChart) endorseChart.destroy();
    const s = sc || currentScenario;
    const p = endorsementProb(s) * 100;
    endorseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Endorse", "Not Endorse"],
        datasets: [{
          data: [p, 100 - p],
          backgroundColor: [COLORS[0], "#e2e8f0"],
          borderColor: "#ffffff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: `Endorsement Rate: ${p.toFixed(1)}%`, font: { size: 18 } },
          legend: { display: false }
        }
      }
    });
  }

  function renderCostsBenefits(sc = null, ePct = null, w = null, c = null, bcr = null, net = null, eShare = null) {
    if (!currentScenario && !sc) {
      showError("Please calculate a scenario first.");
      return;
    }
    const cont = $("#costsBenefitsResults");
    if (!cont) return;
    const s = sc || currentScenario;
    const es = eShare ?? endorsementProb(s);
    const ep = ePct ?? (es * 100);
    const W = w ?? totalWTP(s, es);
    const C = c ?? pvCost(s, es);
    const B = bcr ?? (W / C);
    const N = net ?? (W - C);

    cont.innerHTML = `
      <p><strong>Endorsement Rate:</strong> ${ep.toFixed(1)}%</p>
      <p><strong>Total WTP:</strong> ₹${INRfmt(W)}</p>
      <p><strong>Total Cost (PV):</strong> ₹${INRfmt(C)}</p>
      <p><strong>BCR:</strong> ${B.toFixed(2)} ${B < 1 ? '<span style="color:#c53030">(BCR<1)</span>' : ''}</p>
      <p><strong>Net Benefit:</strong> ₹${INRfmt(N)}</p>
      <div class="chart-box fixed-height"><canvas id="combinedChart"></canvas></div>
    `;

    const list = $("#detailedCostBreakdown");
    list.innerHTML = "";
    const mT = MULTIPLIERS.ptype[s.ptype], mD = MULTIPLIERS.duration[s.duration],
          mMo = MULTIPLIERS.mode_cost[s.mode], mF = MULTIPLIERS.focus_cost[s.focus],
          mR = MULTIPLIERS.resp_cost[s.resp], mult = mT * mD * mMo * mF * mR;
    const endorsed = s.capacity * es * s.cohortsYear;

    Object.entries(BASE_COSTS).forEach(([k, v]) => addCostCard(list, k, v * mult, "Fixed"));
    Object.entries(PER_TRAINEE).forEach(([k, v]) => addCostCard(list, k, v * endorsed * mT * mD * mF, "Per Trainee"));
    const moh = s.costPerTM * (s.duration / 12) * s.capacity * s.cohortsYear;
    addCostCard(list, "MoH Training Cost", moh, "Per Trainee");

    const ctx = $("#combinedChart").getContext("2d");
    if (combinedChart) combinedChart.destroy();
    combinedChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Total Cost", "Total WTP", "Net Benefit"],
        datasets: [{
          label: "₹",
          data: [C, W, N],
          backgroundColor: [COLORS[3], COLORS[1], COLORS[2]],
          borderColor: "#2d3748",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Cost–Benefit Summary (₹)", font: { size: 18 } }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: "₹" } } }
      }
    });
  }

  function addCostCard(container, title, val, type) {
    const div = document.createElement("div");
    div.className = "cost-card";
    div.innerHTML = `
      <h4>${title.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</h4>
      <p>${type} Component</p>
      <p><strong>₹${INRfmt(val)}</strong></p>`;
    container.appendChild(div);
  }

  /* ---------- QALY ---------- */
  function runQALY() {
    if (!currentScenario) {
      showError("Please calculate a scenario first.");
      return;
    }
    const sc = currentScenario;
    const eShare = endorsementProb(sc);
    const qalyPerT = parseFloat($("#qalyPerTrainee").value) || 0.03;
    const thr = +$("#threshold").value;

    const cost = pvCost(sc, eShare);
    const qaly = pvQALY(sc, eShare, qalyPerT);
    const icer = cost / qaly;

    $("#qalyResults").innerHTML = `
      <p><strong>Total QALYs (PV):</strong> ${qaly.toFixed(2)}</p>
      <p><strong>Total Cost (PV):</strong> ₹${INRfmt(cost)}</p>
      <p><strong>ICER:</strong> ₹${INRfmt(icer)} / QALY</p>
      <p><strong>Threshold:</strong> ₹${INRfmt(thr)} → ${icer <= thr ? '<span style="color:#38b2ac">Cost-effective</span>' : '<span style="color:#c53030">Not cost-effective</span>'}</p>`;

    const ctx = $("#qalyChart").getContext("2d");
    if (qalyChart) qalyChart.destroy();
    qalyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["ICER", "Threshold"],
        datasets: [{
          data: [icer, thr],
          backgroundColor: [COLORS[0], COLORS[4]],
          borderColor: "#2d3748",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "ICER vs Threshold (₹/QALY)", font: { size: 18 } }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: "₹/QALY" } } }
      }
    });
  }

  /* ---------- PSA ---------- */
  function runPSA() {
    if (!currentScenario) {
      showError("Please calculate a scenario first.");
      return;
    }
    const sc = currentScenario;
    const seCost = +$("#seCost").value / 100;
    const seWTP = +$("#seWTP").value / 100;
    const seEnd = +$("#seEndorse").value / 100;
    const iters = +$("#iterations").value;
    const qalyPerT = parseFloat($("#qalyPerTrainee").value) || 0.03;
    const thr = +$("#threshold").value;

    const eMean = endorsementProb(sc),
          wMean = totalWTP(sc, eMean),
          cMean = pvCost(sc, eMean),
          qMean = pvQALY(sc, eMean, qalyPerT);

    const BCR = [], ICER = [];
    for (let i = 0; i < iters; i++) {
      const e = truncNormal(eMean, eMean * seEnd, 0.01, 0.99);
      const w = truncNormal(wMean, wMean * seWTP, 1, Infinity);
      const c = truncNormal(cMean, cMean * seCost, 1, Infinity);
      const q = truncNormal(qMean, qMean * seCost, 0.0001, Infinity);
      BCR.push(w / c);
      ICER.push(c / q);
    }
    const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
    const ci = a => {
      const s = [...a].sort((x, y) => x - y), n = s.length;
      return [s[Math.floor(0.025 * n)], s[Math.ceil(0.975 * n) - 1]];
    };
    const [bL, bU] = ci(BCR), [iL, iU] = ci(ICER);

    $("#psaResults").innerHTML = `
      <p><strong>BCR mean:</strong> ${mean(BCR).toFixed(2)} (95% CI ${bL.toFixed(2)}–${bU.toFixed(2)})</p>
      <p><strong>ICER mean:</strong> ₹${INRfmt(mean(ICER))} (95% CI ₹${INRfmt(iL)}–₹${INRfmt(iU)})</p>
      <p><strong>P(BCR>1):</strong> ${(BCR.filter(x => x > 1).length / iters * 100).toFixed(1)}%</p>
      <p><strong>P(ICER<Threshold):</strong> ${(ICER.filter(x => x < thr).length / iters * 100).toFixed(1)}%</p>`;

    renderHistogram("psaBCR", BCR, "BCR", COLORS[1], psaBCRChart, (h) => psaBCRChart = h);
    renderHistogram("psaICER", ICER, "ICER (₹/QALY)", COLORS[3], psaICERChart, (h) => psaICERChart = h);
  }

  function truncNormal(mean, sd, min, max) {
    let x;
    do {
      x = mean + sd * randn_bm();
    } while (x < min || x > max);
    return x;
  }

  function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function renderHistogram(id, data, label, color, chartRef, setRef) {
    const ctx = $("#" + id).getContext("2d");
    if (chartRef) chartRef.destroy();
    const bins = 20, min = Math.min(...data), max = Math.max(...data), w = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    data.forEach(v => {
      let k = Math.floor((v - min) / w);
      if (k >= bins) k = bins - 1;
      counts[k]++;
    });
    const labels = counts.map((_, i) => (min + i * w).toFixed(2));
    const cfg = {
      type: "bar",
      data: { labels, datasets: [{ data: counts, backgroundColor: color, borderColor: "#2d3748", borderWidth: 1 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: `${label} Distribution`, font: { size: 16 } } },
        scales: { y: { beginAtZero: true } }
      }
    };
    setRef(new Chart(ctx, cfg));
  }

  /* ---------- Save / Export ---------- */
  function saveScenario() {
    if (!currentScenario) {
      alert("Please calculate a scenario first.");
      return;
    }
    const sc = currentScenario;
    const eShare = endorsementProb(sc), e = eShare * 100;
    const w = totalWTP(sc, eShare), c = pvCost(sc, eShare);
    const b = w / c, n = w - c;
    const qpt = parseFloat($("#qalyPerTrainee").value || "0.03");
    const q = pvQALY(sc, eShare, qpt); const icer = c / q;
    const obj = { ...sc, endorse: e, totalWTP: w, totalCost: c, bcr: b, net: n, icer, name: `Scenario ${savedScenarios.length + 1}` };
    savedScenarios.push(obj);
    appendScenarioRow(obj);
    alert(`Saved ${obj.name}.`);
  }

  function appendScenarioRow(s) {
    const tbody = $("#scenarioTable tbody");
    const tr = document.createElement("tr");
    const cols = ["name", "ptype", "duration", "focus", "mode", "resp", "capacity", "costPerTM", "stakeholders", "cohortsYear", "yearsHorizon", "discRate", "endorse", "totalWTP", "totalCost", "bcr", "net", "icer"];
    cols.forEach(c => {
      const td = document.createElement("td");
      let v = s[c];
      if (["totalWTP", "totalCost", "net", "costPerTM", "icer"].includes(c)) v = "₹" + INRfmt(v);
      if (c === "bcr") v = s[c].toFixed(2);
      if (c === "endorse") v = s[c].toFixed(1) + "%";
      if (c === "discRate") v = (s[c] * 100).toFixed(1) + "%";
      td.textContent = v;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  function exportPDF() {
    if (savedScenarios.length === 0) {
      alert("No scenarios saved.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" }), pw = doc.internal.pageSize.getWidth();
    let y = 15;
    doc.setFontSize(16);
    doc.text("FETP India – Scenario Comparison", pw / 2, y, { align: "center" });
    y += 8;
    savedScenarios.forEach(s => {
      if (y > 275) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.text(s.name, 15, y);
      y += 5;
      [
        `Type:${s.ptype} Dur:${s.duration}m Focus:${s.focus} Mode:${s.mode} Resp:${s.resp}d`,
        `Cap:${s.capacity} Coh/yr:${s.cohortsYear} Years:${s.yearsHorizon} Disc:${(s.discRate * 100).toFixed(1)}%`,
        `₹/T/M:${INRfmt(s.costPerTM)} Stakeh:${s.stakeholders}`,
        `Endorse:${s.endorse.toFixed(1)}%  WTP:₹${INRfmt(s.totalWTP)}  Cost:₹${INRfmt(s.totalCost)}`,
        `BCR:${s.bcr.toFixed(2)}  Net:₹${INRfmt(s.net)}  ICER:₹${INRfmt(s.icer)}/QALY`
      ].forEach(line => {
        doc.text(line, 15, y);
        y += 5;
      });
      y += 3;
    });
    doc.save("FETP_Scenarios.pdf");
  }

  /* ---------- Modal / Breakdown ---------- */
  function openModal() {
    $("#resultModal").style.display = "block";
  }

  function closeModal() {
    $("#resultModal").style.display = "none";
  }

  function toggleCostBreakdown() {
    const el = $("#detailedCostBreakdown");
    el.style.display = (el.style.display === "none" || el.style.display === "") ? "flex" : "none";
  }

})(); // IIFE end
