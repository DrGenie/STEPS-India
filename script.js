/* ===================================================
   STEPS FETP India Decision Aid
   Upgraded script.js with robust ID fallbacks, fixed response time,
   fully wired tabs, tooltips, scenarios, sensitivity, Copilot and exports.
   =================================================== */

/* ===========================
   Optional external JSON hooks
   =========================== */
/*
  If your upgraded build provides JSON files, the script will try to load them
  (non-fatal if not found). Supported keys in JSON:
  - MXL_COEFS
  - COST_TEMPLATES
  - DEFAULT_EPI_SETTINGS
  - COPILOT_INTERPRETATION_PROMPT
  - RESPONSE_TIME_MULTIPLIERS
  - TIER_MONTHS
*/
const STEPS_JSON_CANDIDATES = [
  "./steps-config.json",
  "./config/steps-config.json",
  "./assets/steps-config.json",
  "./data/steps-config.json"
];

async function tryLoadJsonConfigs() {
  if (!window.fetch) return null;
  for (const path of STEPS_JSON_CANDIDATES) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      return json;
    } catch (_) {}
  }
  return null;
}

/* ===========================
   Global model coefficients
   =========================== */

let MXL_COEFS = {
  ascProgram: 0.168,
  ascOptOut: -0.601,
  tier: { frontline: 0.0, intermediate: 0.220, advanced: 0.487 },
  career: { certificate: 0.0, uniqual: 0.017, career_path: -0.122 },
  mentorship: { low: 0.0, medium: 0.453, high: 0.640 },
  delivery: { blended: 0.0, inperson: -0.232, online: -1.073 },
  response: { 30: 0.0, 15: 0.546, 7: 0.610 },
  costPerThousand: -0.005
};

/* ===========================
   Cost templates (combined)
   =========================== */

let COST_TEMPLATES = {
  frontline: {
    combined: {
      id: "frontline_combined",
      label: "Frontline combined template (all institutions)",
      description:
        "Combined frontline cost structure across all institutions using harmonised components and indirect costs including opportunity cost.",
      oppRate: 1.09,
      components: [
        { id: "staff_core", label: "In country programme staff salaries and benefits", directShare: 0.214 },
        { id: "office_equipment", label: "Office equipment for staff and faculty", directShare: 0.004 },
        { id: "office_software", label: "Office software for staff and faculty", directShare: 0.0004 },
        { id: "rent_utilities", label: "Rent and utilities for staff and faculty", directShare: 0.024 },
        { id: "training_materials", label: "Training materials and printing", directShare: 0.0006 },
        { id: "workshops", label: "Workshops and seminars", directShare: 0.107 },
        { id: "travel_in_country", label: "In country travel for faculty, mentors and trainees", directShare: 0.65 }
      ]
    }
  },
  intermediate: {
    combined: {
      id: "intermediate_combined",
      label: "Intermediate combined template (all institutions)",
      description:
        "Combined intermediate cost structure across all institutions using harmonised components and indirect costs including opportunity cost.",
      oppRate: 0.35,
      components: [
        { id: "staff_core", label: "In country programme staff salaries and benefits", directShare: 0.0924 },
        { id: "staff_other", label: "Other salaries and benefits for consultants and advisors", directShare: 0.0004 },
        { id: "office_equipment", label: "Office equipment for staff and faculty", directShare: 0.0064 },
        { id: "office_software", label: "Office software for staff and faculty", directShare: 0.027 },
        { id: "rent_utilities", label: "Rent and utilities for staff and faculty", directShare: 0.0171 },
        { id: "training_materials", label: "Training materials and printing", directShare: 0.0005 },
        { id: "workshops", label: "Workshops and seminars", directShare: 0.0258 },
        { id: "travel_in_country", label: "In country travel for faculty, mentors and trainees", directShare: 0.57 },
        { id: "travel_international", label: "International travel for faculty, mentors and trainees", directShare: 0.1299 },
        { id: "other_direct", label: "Other direct programme expenses", directShare: 0.1302 }
      ]
    }
  },
  advanced: {
    combined: {
      id: "advanced_combined",
      label: "Advanced combined template (all institutions)",
      description:
        "Combined advanced cost structure across all institutions using harmonised components and indirect costs including opportunity cost.",
      oppRate: 0.30,
      components: [
        { id: "staff_core", label: "In country programme staff salaries and benefits", directShare: 0.165 },
        { id: "office_equipment", label: "Office equipment for staff and faculty", directShare: 0.0139 },
        { id: "office_software", label: "Office software for staff and faculty", directShare: 0.0184 },
        { id: "rent_utilities", label: "Rent and utilities for staff and faculty", directShare: 0.0255 },
        { id: "trainee_allowances", label: "Trainee allowances and scholarships", directShare: 0.0865 },
        { id: "trainee_equipment", label: "Trainee equipment such as laptops and internet", directShare: 0.0035 },
        { id: "trainee_software", label: "Trainee software licences", directShare: 0.0017 },
        { id: "training_materials", label: "Training materials and printing", directShare: 0.0024 },
        { id: "workshops", label: "Workshops and seminars", directShare: 0.0188 },
        { id: "travel_in_country", label: "In country travel for faculty, mentors and trainees", directShare: 0.372 },
        { id: "travel_international", label: "International travel for faculty, mentors and trainees", directShare: 0.288 },
        { id: "other_direct", label: "Other direct programme expenses", directShare: 0.0043 }
      ]
    }
  }
};

let COST_CONFIG = null;

/* ===========================
   Epidemiological settings
   =========================== */

let DEFAULT_EPI_SETTINGS = {
  general: {
    planningHorizonYears: 5,
    inrToUsdRate: 83,
    epiDiscountRate: 0.03
  },
  tiers: {
    frontline: { completionRate: 0.9, outbreaksPerGraduatePerYear: 0.5, valuePerGraduate: 0, valuePerOutbreak: 20000000000 },
    intermediate: { completionRate: 0.9, outbreaksPerGraduatePerYear: 0.5, valuePerGraduate: 0, valuePerOutbreak: 20000000000 },
    advanced: { completionRate: 0.9, outbreaksPerGraduatePerYear: 0.5, valuePerGraduate: 0, valuePerOutbreak: 20000000000 }
  }
};

let RESPONSE_TIME_MULTIPLIERS = { "30": 1.0, "15": 1.2, "7": 1.5 };
let TIER_MONTHS = { frontline: 3, intermediate: 12, advanced: 24 };

/* ===========================
   Copilot interpretation prompt
   =========================== */

let COPILOT_INTERPRETATION_PROMPT = `
You are a senior health economist advising the Ministry of Health and Family Welfare in India, working with World Bank counterparts, on plans to scale up Field Epidemiology Training Programmes. You receive structured outputs from the STEPS FETP India Decision Aid for one configuration that summarises programme design, costs, epidemiological benefits and results from a mixed logit preference study (endorsement and willingness to pay).

Use only the STEPS scenario JSON that follows as your quantitative evidence. Treat all numbers in the JSON as internally consistent. Work in Indian rupees as the main currency and, where helpful, also report values in millions of rupees.

Write a narrative policy brief of roughly three to five A4 pages. Use headings and paragraphs only and do not use bullet points or numbered lists. Suggested section headings are: Background; Scenario description; Preference study evidence and endorsement; Economic costs; Epidemiological effects; Benefit cost results; Distributional and implementation considerations; and Recommendations.

In Background, explain briefly the role of FETP in India, the purpose of the STEPS decision aid and why combining costs, epidemiological benefits and preference study results is useful for ministries of health and finance.

In Scenario description, summarise the configuration reported in the JSON: tier, career incentive, mentorship intensity, delivery mode, outbreak response time, cohort size and number of cohorts, cost per trainee per month and whether opportunity cost of trainee time is included. Use clear language that senior officials can read quickly.

In Preference study evidence and endorsement, interpret the endorsement and opt out rates and the willingness to pay values from the mixed logit preference study. Explain how strong support for this configuration appears to be and what this implies for negotiations between government and partners.

In Economic costs, describe programme cost per cohort, total economic cost per cohort and total economic cost across all cohorts in the planning horizon. Distinguish clearly between financial costs and economic costs that include opportunity cost where this is relevant.

In Epidemiological effects, explain the number of graduates, implied outbreak responses per year and the epidemiological benefit values. Describe how completion rates, response time and values per graduate and per outbreak response combine to give the total indicative epidemiological benefits.

In Benefit cost results, interpret the benefit cost ratios and net present values. State whether the scenario appears favourable on epidemiological benefits alone and on the combination of willingness to pay and epidemiological benefits and what this implies for the strength of the business case.

In Distributional and implementation considerations, discuss any equity, implementation or capacity issues that logically follow from the scenario structure, such as changes in mentorship intensity, delivery mode or tier, without speculating beyond the JSON.

In Recommendations, give a concise narrative judgement on whether this configuration is a strong, moderate or weak candidate for funding. Suggest any simple variations that might improve value for money and note what further analysis or sensitivity checks ministries could request.

Insert one or two compact tables only if they clarify key results, for example a table comparing costs and benefits per cohort and across all cohorts. Refer to each table in the surrounding text so that the brief remains readable without the table.
`;

/* ===========================
   Global state
   =========================== */

const appState = {
  currency: "INR",
  usdRate: DEFAULT_EPI_SETTINGS.general.inrToUsdRate,
  epiSettings: JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS)),
  currentScenario: null,
  savedScenarios: [],
  charts: { uptake: null, bcr: null, epi: null, natCostBenefit: null, natEpi: null },
  tooltip: { bubbleEl: null, arrowEl: null, currentTarget: null, hideTimeout: null },
  tour: { steps: [], currentIndex: 0, overlayEl: null, popoverEl: null }
};

/* ===========================
   Small DOM helpers (robust)
   =========================== */

function $(id) {
  return document.getElementById(id);
}

function firstEl(idsOrSelectors) {
  for (const key of idsOrSelectors) {
    const el = key.startsWith("#") || key.startsWith(".") || key.includes("[") ? document.querySelector(key) : $(key);
    if (el) return el;
  }
  return null;
}

function numFromEl(el, fallback = 0) {
  if (!el) return fallback;
  const v = Number(el.value);
  return isNaN(v) ? fallback : v;
}

function textFromEl(el, fallback = "") {
  if (!el) return fallback;
  return (el.value ?? el.textContent ?? fallback).toString();
}

function setText(el, txt) {
  if (!el) return;
  el.textContent = txt;
}

function setValue(el, val) {
  if (!el) return;
  el.value = String(val);
}

function hasClass(el, c) {
  return !!(el && el.classList && el.classList.contains(c));
}

/* ===========================
   Utility functions
   =========================== */

function formatNumber(x, decimals = 0) {
  if (x === null || x === undefined || isNaN(x)) return "-";
  return Number(x).toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function formatCurrencyINR(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return "-";
  return "INR " + formatNumber(amount, decimals);
}

function formatCurrencyDisplay(amountInINR, decimals = 0) {
  if (amountInINR === null || amountInINR === undefined || isNaN(amountInINR)) return "-";
  if (appState.currency === "USD") {
    const usd = amountInINR / (appState.usdRate || 1);
    return "USD " + formatNumber(usd, decimals);
  }
  return formatCurrencyINR(amountInINR, decimals);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function presentValueFactor(rate, years) {
  if (years <= 0) return 0;
  if (rate <= 0) return years;
  const r = rate;
  return (1 - Math.pow(1 + r, -years)) / r;
}

function safeExp(x) {
  if (x > 700) return Math.exp(700);
  if (x < -700) return Math.exp(-700);
  return Math.exp(x);
}

/* ===========================
   Toasts
   =========================== */

let toastEl = null;

function ensureToast() {
  if (toastEl) return;
  toastEl = document.createElement("div");
  toastEl.id = "toast";
  toastEl.className = "toast";
  document.body.appendChild(toastEl);
}

function showToast(message, type = "info") {
  ensureToast();
  toastEl.textContent = message;
  toastEl.classList.remove("toast-success", "toast-warning", "toast-error");
  if (type === "success") toastEl.classList.add("toast-success");
  if (type === "warning") toastEl.classList.add("toast-warning");
  if (type === "error") toastEl.classList.add("toast-error");
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3000);
}

/* ===========================
   Response time (fixed at 7)
   =========================== */

function enforceFixedResponseTimeUI() {
  const responseEl = firstEl(["response", "#response", "#program-response", "#outbreak-response"]);
  if (!responseEl) return;

  // Keep the dropdown visible but lock to 7 days
  try {
    setValue(responseEl, "7");
    const opts = Array.from(responseEl.querySelectorAll("option"));
    opts.forEach((o) => {
      if (o.value === "15" || o.value === "30") {
        o.disabled = true;
        o.setAttribute("aria-disabled", "true");
      }
      if (o.value === "7") {
        o.disabled = false;
        o.removeAttribute("aria-disabled");
      }
    });

    responseEl.addEventListener("change", () => {
      setValue(responseEl, "7");
      showToast("Outbreak response time is fixed at 7 days in this tool.", "warning");
    });
  } catch (_) {}
}

/* ===========================
   Tooltip system
   =========================== */

function initTooltips() {
  const icons = Array.from(document.querySelectorAll(".info-icon,[data-tooltip],[data-tooltip-key]"));
  if (!icons.length) return;

  // Apply tooltip library by key where used
  icons.forEach((icon) => {
    const key = icon.getAttribute("data-tooltip-key");
    if (key && TOOLTIP_LIBRARY[key] && !icon.getAttribute("data-tooltip")) {
      icon.setAttribute("data-tooltip", TOOLTIP_LIBRARY[key]);
    }
    const dataTip = icon.getAttribute("data-tooltip");
    const title = icon.getAttribute("title");
    if (!dataTip && title) icon.setAttribute("data-tooltip", title);
    icon.removeAttribute("title");
  });

  const bubble = document.createElement("div");
  bubble.className = "tooltip-bubble tooltip-hidden";
  const textP = document.createElement("p");
  const arrow = document.createElement("div");
  arrow.className = "tooltip-arrow";
  bubble.appendChild(textP);
  bubble.appendChild(arrow);
  document.body.appendChild(bubble);

  appState.tooltip.bubbleEl = bubble;
  appState.tooltip.arrowEl = arrow;

  function positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    bubble.style.left = "0px";
    bubble.style.top = "0px";
    bubble.classList.remove("top", "bottom");

    bubble.style.visibility = "hidden";
    bubble.classList.remove("tooltip-hidden");
    bubble.classList.add("tooltip-visible");

    const bubbleRect = bubble.getBoundingClientRect();
    let top = rect.bottom + 8 + window.scrollY;
    let left = rect.left + window.scrollX + rect.width / 2 - bubbleRect.width / 2;

    if (left < 8) left = 8;
    if (left + bubbleRect.width > window.scrollX + window.innerWidth - 8) {
      left = window.scrollX + window.innerWidth - bubbleRect.width - 8;
    }

    if (top + bubbleRect.height > window.scrollY + window.innerHeight - 8) {
      top = rect.top + window.scrollY - bubbleRect.height - 10;
      bubble.classList.add("top");
    } else {
      bubble.classList.add("bottom");
    }

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
    bubble.style.visibility = "visible";
  }

  function showTooltip(target) {
    const text = target.getAttribute("data-tooltip") || target.getAttribute("aria-label") || "";
    if (!text) return;
    appState.tooltip.currentTarget = target;
    textP.textContent = text;
    bubble.classList.remove("tooltip-hidden");
    bubble.classList.add("tooltip-visible");
    positionTooltip(target);
  }

  function hideTooltip() {
    bubble.classList.remove("tooltip-visible");
    bubble.classList.add("tooltip-hidden");
    appState.tooltip.currentTarget = null;
  }

  icons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      if (appState.tooltip.hideTimeout) clearTimeout(appState.tooltip.hideTimeout);
      showTooltip(icon);
    });
    icon.addEventListener("mouseleave", () => {
      appState.tooltip.hideTimeout = setTimeout(hideTooltip, 120);
    });
    icon.addEventListener("focus", () => showTooltip(icon));
    icon.addEventListener("blur", hideTooltip);
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      if (appState.tooltip.currentTarget === icon) hideTooltip();
      else showTooltip(icon);
    });
  });

  window.addEventListener("scroll", () => {
    if (appState.tooltip.currentTarget) positionTooltip(appState.tooltip.currentTarget);
  });
  window.addEventListener("resize", () => {
    if (appState.tooltip.currentTarget) positionTooltip(appState.tooltip.currentTarget);
  });
  document.addEventListener("click", (e) => {
    if (!bubble.contains(e.target)) hideTooltip();
  });
}

/* ===========================
   Tooltip library (key-based)
   =========================== */

const TOOLTIP_LIBRARY = {
  wtp_info:
    "WTP per trainee per month is derived from the preference model by dividing attribute coefficients by the cost coefficient. It is an approximate rupee value stakeholders attach to this configuration. Total WTP aggregates this value across trainees and cohorts. All benefit values are indicative approximations.",
  wtp_section_info:
    "WTP indicators summarise how much value stakeholders attach to each configuration in rupees per trainee and over all cohorts. They are based on the mixed logit preference model and should be read as indicative support rather than precise market prices.",
  mixedlogit_info:
    "The mixed logit preference model allows preferences to vary across decision makers instead of assuming a single average pattern, which makes endorsement and WTP estimates more flexible.",
  epi_implications_info:
    "Graduates and outbreak responses are obtained by combining endorsement with cohort size and number of cohorts. The indicative outbreak cost saving per cohort converts expected outbreak responses into monetary terms using the outbreak value and planning horizon set in the settings.",
  endorsement_optout_info:
    "These percentages come from the mixed logit preference model and show how attractive the configuration is relative to opting out in the preference study.",
  sensitivity_headline_info:
    "In this summary, costs are aggregated across all cohorts in the selected time horizon. Total WTP benefits summarise the indicative value stakeholders place on each configuration. Outbreak benefits are included when the outbreak benefit switch is on. Benefit cost ratios compare total benefits with total costs, and net present values show the difference between benefits and costs in rupee terms.",
  copilot_howto_info:
    "Define a scenario in the other tabs. Then press the Copilot button to prepare a prompt that includes instructions and the full scenario JSON. Copy and paste it into Microsoft Copilot to generate a narrative policy brief.",
  optout_alt_info:
    "The opt out alternative represents a situation where no new FETP training is funded under the scenario being considered. STEPS treats this as the benchmark when calculating endorsement and opt out rates.",
  cost_components_info:
    "Cost components group programme expenses for each tier, including salaries and benefits, travel, training inputs, trainee support and indirect items such as opportunity cost.",
  opp_cost_info:
    "The opportunity cost of trainee time reflects the value of salary time that trainees spend in training instead of normal duties. If the opportunity cost switch is on, STEPS adds this value to the economic cost."
};

function initDefinitionTooltips() {
  const map = [
    ["wtp-info", "wtp_info"],
    ["wtp-section-info", "wtp_section_info"],
    ["mixedlogit-info", "mixedlogit_info"],
    ["epi-implications-info", "epi_implications_info"],
    ["endorsement-optout-info", "endorsement_optout_info"],
    ["sensitivity-headline-info", "sensitivity_headline_info"],
    ["copilot-howto-info", "copilot_howto_info"],
    ["optout-alt-info", "optout_alt_info"],
    ["cost-components-info", "cost_components_info"],
    ["opp-cost-info", "opp_cost_info"]
  ];

  map.forEach(([id, key]) => {
    const el = $(id);
    if (el && !el.getAttribute("data-tooltip")) el.setAttribute("data-tooltip", TOOLTIP_LIBRARY[key] || "");
  });

  const copilotText = $("copilot-howto-text");
  if (copilotText) {
    copilotText.textContent =
      "Define a scenario in the other tabs, then use this Copilot tab to generate a draft policy brief. Copy the prepared prompt into Microsoft Copilot and refine the brief there.";
  }

  // Also apply key-based tooltips when HTML uses data-tooltip-key
  document.querySelectorAll("[data-tooltip-key]").forEach((el) => {
    const key = el.getAttribute("data-tooltip-key");
    if (key && TOOLTIP_LIBRARY[key] && !el.getAttribute("data-tooltip")) {
      el.setAttribute("data-tooltip", TOOLTIP_LIBRARY[key]);
    }
  });
}

/* ===========================
   Tabs (supports multiple patterns)
   =========================== */

function initTabs() {
  // Pattern A: .tab-link[data-tab] toggles #tab-<name>
  const tabLinks = Array.from(document.querySelectorAll(".tab-link"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  if (tabLinks.length && panels.length) {
    tabLinks.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        tabLinks.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = $(`tab-${target}`);
        if (panel) panel.classList.add("active");
      });
    });
    return;
  }

  // Pattern B: .tablink[data-tab] toggles .tabcontent with id
  const tabButtons = Array.from(document.querySelectorAll(".tablink,[data-tablink='true']"));
  const tabContents = Array.from(document.querySelectorAll(".tabcontent,[data-tabcontent='true']"));

  if (tabButtons.length && tabContents.length) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab") || this.getAttribute("data-target") || this.getAttribute("aria-controls");
        tabContents.forEach((tab) => (tab.style.display = "none"));
        tabButtons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        const panel = tabId ? $(tabId) : null;
        if (panel) panel.style.display = "block";
      });
    });
  }
}

/* ===========================
   Guided tour
   =========================== */

function initGuidedTour() {
  const trigger = $("btn-start-tour");
  if (!trigger) return;

  const steps = Array.from(document.querySelectorAll("[data-tour-step]"));
  if (!steps.length) return;

  appState.tour.steps = steps;

  const overlay = document.createElement("div");
  overlay.id = "tour-overlay";
  overlay.className = "tour-overlay hidden";

  const popover = document.createElement("div");
  popover.id = "tour-popover";
  popover.className = "tour-popover hidden";
  popover.innerHTML = `
    <div class="tour-popover-header">
      <h3 id="tour-title"></h3>
      <button class="tour-close-btn" type="button" aria-label="Close tour">×</button>
    </div>
    <div class="tour-popover-body" id="tour-body"></div>
    <div class="tour-popover-footer">
      <span class="tour-step-indicator" id="tour-indicator"></span>
      <div class="tour-buttons">
        <button type="button" class="btn-ghost-small" id="tour-prev">Previous</button>
        <button type="button" class="btn-primary-small" id="tour-next">Next</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(popover);

  appState.tour.overlayEl = overlay;
  appState.tour.popoverEl = popover;

  function endTour() {
    overlay.classList.add("hidden");
    popover.classList.add("hidden");
  }

  function positionTourPopover(popoverEl, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const popRect = popoverEl.getBoundingClientRect();
    let top = rect.bottom + 8 + window.scrollY;
    let left = rect.left + window.scrollX + rect.width / 2 - popRect.width / 2;

    if (left < 8) left = 8;
    if (left + popRect.width > window.scrollX + window.innerWidth - 8) {
      left = window.scrollX + window.innerWidth - popRect.width - 8;
    }
    if (top + popRect.height > window.scrollY + window.innerHeight - 8) {
      top = rect.top + window.scrollY - popRect.height - 10;
    }

    popoverEl.style.left = `${left}px`;
    popoverEl.style.top = `${top}px`;
  }

  function showStep(index) {
    const stepsArr = appState.tour.steps;
    if (!stepsArr.length) return;
    const i = clamp(index, 0, stepsArr.length - 1);
    appState.tour.currentIndex = i;
    const el = stepsArr[i];
    if (!el) return;

    const title = el.getAttribute("data-tour-title") || "STEPS tour";
    const content = el.getAttribute("data-tour-content") || "";

    setText($("tour-title"), title);
    setText($("tour-body"), content);
    setText($("tour-indicator"), `Step ${i + 1} of ${stepsArr.length}`);

    overlay.classList.remove("hidden");
    popover.classList.remove("hidden");
    positionTourPopover(popover, el);
  }

  trigger.addEventListener("click", () => showStep(0));
  overlay.addEventListener("click", endTour);
  popover.querySelector(".tour-close-btn")?.addEventListener("click", endTour);
  popover.querySelector("#tour-prev")?.addEventListener("click", () => showStep(appState.tour.currentIndex - 1));
  popover.querySelector("#tour-next")?.addEventListener("click", () => {
    if (appState.tour.currentIndex >= appState.tour.steps.length - 1) endTour();
    else showStep(appState.tour.currentIndex + 1);
  });

  window.addEventListener("resize", () => {
    if (!overlay.classList.contains("hidden") && appState.tour.steps.length) {
      const el = appState.tour.steps[appState.tour.currentIndex];
      if (el) positionTourPopover(popover, el);
    }
  });
  window.addEventListener("scroll", () => {
    if (!overlay.classList.contains("hidden") && appState.tour.steps.length) {
      const el = appState.tour.steps[appState.tour.currentIndex];
      if (el) positionTourPopover(popover, el);
    }
  });
}

/* ===========================
   Configuration and results
   =========================== */

function getConfigFromForm() {
  const tierEl = firstEl(["program-tier", "#program-tier", "#tier", "#programme-tier"]);
  const careerEl = firstEl(["career-track", "#career-track", "#career", "#career-incentive"]);
  const mentorshipEl = firstEl(["mentorship", "#mentorship"]);
  const deliveryEl = firstEl(["delivery", "#delivery"]);

  const tier = tierEl ? tierEl.value : "intermediate";
  const career = careerEl ? careerEl.value : "certificate";
  const mentorship = mentorshipEl ? mentorshipEl.value : "medium";
  const delivery = deliveryEl ? deliveryEl.value : "blended";

  // Fixed response time
  const response = "7";
  const responseEl = firstEl(["response", "#response", "#program-response", "#outbreak-response"]);
  if (responseEl) setValue(responseEl, "7");

  const costSliderEl = firstEl(["cost-slider", "#cost-slider", "#costPerMonth", "#cost_per_month"]);
  const traineesEl = firstEl(["trainees", "#trainees", "#trainees-per-cohort"]);
  const cohortsEl = firstEl(["cohorts", "#cohorts", "#num-cohorts"]);

  const costSlider = numFromEl(costSliderEl, 0);
  const trainees = clamp(numFromEl(traineesEl, 0), 0, 1e9);
  const cohorts = clamp(numFromEl(cohortsEl, 0), 0, 1e6);

  const planningInput = firstEl(["planning-horizon", "#planning-horizon", "#planning-horizon-years", "#planningHorizonYears"]);
  let planningHorizonYears = appState.epiSettings.general.planningHorizonYears;
  if (planningInput) {
    const phVal = Number(planningInput.value);
    if (!isNaN(phVal) && phVal > 0) planningHorizonYears = phVal;
  }
  appState.epiSettings.general.planningHorizonYears = planningHorizonYears;

  const oppToggleEl = firstEl(["opp-toggle", "#opp-toggle", "#opportunity-toggle"]);
  const oppIncluded = oppToggleEl ? hasClass(oppToggleEl, "on") : true;

  const scenarioNameEl = firstEl(["scenario-name", "#scenario-name", "#config-name", "#scenarioTitle"]);
  const scenarioNotesEl = firstEl(["scenario-notes", "#scenario-notes", "#notes", "#scenarioNotes"]);

  const scenarioName = scenarioNameEl?.value?.trim() || `${tier} ${mentorship} ${cohorts} cohorts`;
  const scenarioNotes = scenarioNotesEl?.value?.trim() || "";

  return {
    tier,
    career,
    mentorship,
    delivery,
    response,
    costPerTraineePerMonth: costSlider,
    traineesPerCohort: trainees,
    cohorts,
    planningHorizonYears,
    opportunityCostIncluded: oppIncluded,
    name: scenarioName,
    notes: scenarioNotes,
    preferenceModel: "Mixed logit model from the preference study"
  };
}

function tierEffect(tier) {
  return MXL_COEFS.tier?.[tier] ?? 0;
}
function careerEffect(career) {
  return MXL_COEFS.career?.[career] ?? 0;
}
function mentorshipEffect(m) {
  return MXL_COEFS.mentorship?.[m] ?? 0;
}
function deliveryEffect(d) {
  return MXL_COEFS.delivery?.[d] ?? 0;
}
function responseEffect(r) {
  return MXL_COEFS.response?.[r] ?? 0;
}

function computeEndorsementAndWTP(config) {
  const costThousands = (config.costPerTraineePerMonth || 0) / 1000;
  const utilProgram =
    (MXL_COEFS.ascProgram || 0) +
    tierEffect(config.tier) +
    careerEffect(config.career) +
    mentorshipEffect(config.mentorship) +
    deliveryEffect(config.delivery) +
    responseEffect(config.response) +
    (MXL_COEFS.costPerThousand || 0) * costThousands;

  const utilOptOut = MXL_COEFS.ascOptOut || 0;

  const maxU = Math.max(utilProgram, utilOptOut);
  const expProg = safeExp(utilProgram - maxU);
  const expOpt = safeExp(utilOptOut - maxU);
  const denom = expProg + expOpt;

  const endorseProb = denom > 0 ? expProg / denom : 0.5;
  const optOutProb = 1 - endorseProb;

  const nonCostUtility =
    (MXL_COEFS.ascProgram || 0) +
    tierEffect(config.tier) +
    careerEffect(config.career) +
    mentorshipEffect(config.mentorship) +
    deliveryEffect(config.delivery) +
    responseEffect(config.response);

  const costCoefAbs = Math.abs(MXL_COEFS.costPerThousand || 1e-9);
  const wtpPerTraineePerMonth = (nonCostUtility / costCoefAbs) * 1000;

  return {
    endorseRate: clamp(endorseProb * 100, 0, 100),
    optOutRate: clamp(optOutProb * 100, 0, 100),
    wtpPerTraineePerMonth
  };
}

function computeCosts(config) {
  const months = TIER_MONTHS[config.tier] || 12;
  const directCostPerTraineePerMonth = config.costPerTraineePerMonth || 0;
  const trainees = config.traineesPerCohort || 0;

  const programmeCostPerCohort = directCostPerTraineePerMonth * months * trainees;

  const templatesForTier = COST_TEMPLATES[config.tier];
  const template =
    (COST_CONFIG && COST_CONFIG[config.tier] && COST_CONFIG[config.tier].combined) || (templatesForTier && templatesForTier.combined);

  let oppRate = template ? template.oppRate : 0;
  if (!config.opportunityCostIncluded) oppRate = 0;

  const opportunityCost = programmeCostPerCohort * oppRate;
  const totalEconomicCost = programmeCostPerCohort + opportunityCost;

  return {
    programmeCostPerCohort,
    totalEconomicCostPerCohort: totalEconomicCost,
    opportunityCostPerCohort: opportunityCost,
    template
  };
}

function computeEpidemiological(config, endorseRate) {
  const tierSettings = appState.epiSettings.tiers[config.tier] || appState.epiSettings.tiers.intermediate;
  const general = appState.epiSettings.general;

  const completionRate = clamp(tierSettings.completionRate ?? 0.9, 0, 1);
  const outbreaksPerGrad = tierSettings.outbreaksPerGraduatePerYear ?? 0.5;
  const valuePerOutbreak = tierSettings.valuePerOutbreak ?? 0;

  const planningYears = general.planningHorizonYears ?? 5;
  const discountRate = general.epiDiscountRate ?? 0.03;

  const pvFactor = presentValueFactor(discountRate, planningYears);
  const endorseFactor = clamp((endorseRate ?? 50) / 100, 0, 1);

  const months = TIER_MONTHS[config.tier] || 12;

  const enrolledPerCohort = config.traineesPerCohort || 0;
  const completedPerCohort = enrolledPerCohort * completionRate;
  const graduatesEffective = completedPerCohort * endorseFactor;

  const graduatesAllCohorts = graduatesEffective * (config.cohorts || 0);

  const respMultiplier = RESPONSE_TIME_MULTIPLIERS[String(config.response)] || 1;

  const outbreaksPerYearPerCohort = graduatesEffective * outbreaksPerGrad * respMultiplier;
  const outbreaksPerYearNational = outbreaksPerYearPerCohort * (config.cohorts || 0);

  const graduateBenefitPerCohort = tierSettings.valuePerGraduate ? graduatesEffective * (tierSettings.valuePerGraduate || 0) * pvFactor : 0;

  const outbreakAnnualBenefitPerCohort = outbreaksPerYearPerCohort * valuePerOutbreak;
  const outbreakPVPerCohort = outbreakAnnualBenefitPerCohort * pvFactor;

  const totalEpiBenefitPerCohort = graduateBenefitPerCohort + outbreakPVPerCohort;

  return {
    months,
    graduatesPerCohort: graduatesEffective,
    graduatesAllCohorts,
    outbreaksPerYearPerCohort,
    outbreaksPerYearNational,
    epiBenefitPerCohort: totalEpiBenefitPerCohort,
    graduateBenefitPerCohort,
    outbreakPVPerCohort,
    planningYears,
    discountRate
  };
}

function computeScenario(config) {
  const pref = computeEndorsementAndWTP(config);
  const costs = computeCosts(config);
  const epi = computeEpidemiological(config, pref.endorseRate);

  const wtpPerTraineePerMonth = pref.wtpPerTraineePerMonth || 0;
  const wtpPerCohort = wtpPerTraineePerMonth * epi.months * (config.traineesPerCohort || 0);
  const wtpAllCohorts = wtpPerCohort * (config.cohorts || 0);

  const epiBenefitPerCohort = epi.epiBenefitPerCohort || 0;
  const epiBenefitAllCohorts = epiBenefitPerCohort * (config.cohorts || 0);

  const netBenefitPerCohort = epiBenefitPerCohort - (costs.totalEconomicCostPerCohort || 0);
  const netBenefitAllCohorts = epiBenefitAllCohorts - (costs.totalEconomicCostPerCohort || 0) * (config.cohorts || 0);

  const bcrPerCohort = (costs.totalEconomicCostPerCohort || 0) > 0 ? epiBenefitPerCohort / costs.totalEconomicCostPerCohort : null;

  const natTotalCost = (costs.totalEconomicCostPerCohort || 0) * (config.cohorts || 0);
  const natBcr = natTotalCost > 0 ? epiBenefitAllCohorts / natTotalCost : null;

  // Keep this as an explicit placeholder component used in the sensitivity tab
  const wtpOutbreakComponent = wtpAllCohorts * 0.3;

  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    config,
    preferenceModel: config.preferenceModel,
    endorseRate: pref.endorseRate,
    optOutRate: pref.optOutRate,
    wtpPerTraineePerMonth,
    wtpPerCohort,
    wtpAllCohorts,
    costs,
    epi,
    epiBenefitPerCohort,
    epiBenefitAllCohorts,
    netBenefitPerCohort,
    netBenefitAllCohorts,
    bcrPerCohort,
    natTotalCost,
    natBcr,
    graduatesPerCohort: epi.graduatesPerCohort,
    graduatesAllCohorts: epi.graduatesAllCohorts,
    outbreaksPerYearPerCohort: epi.outbreaksPerYearPerCohort,
    outbreaksPerYearNational: epi.outbreaksPerYearNational,
    wtpOutbreakComponent,
    discountRate: epi.discountRate,
    planningYears: epi.planningYears
  };
}

/* ===========================
   Charts
   =========================== */

function ensureChart(ctxId, type, data, options) {
  if (!window.Chart) return null;
  const canvas = $(ctxId) || document.querySelector(`#${ctxId}`);
  const ctx = canvas?.getContext ? canvas.getContext("2d") : null;
  if (!ctx) return null;
  return new Chart(ctx, { type, data, options });
}

function updateUptakeChart(scenario) {
  const ctxId = "chart-uptake";
  const existing = appState.charts.uptake;
  const data = {
    labels: ["Endorse FETP option", "Choose opt out"],
    datasets: [{ label: "Share of stakeholders", data: [scenario.endorseRate, scenario.optOutRate] }]
  };
  const options = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } };
  if (existing) {
    existing.data = data;
    existing.options = options;
    existing.update();
  } else {
    appState.charts.uptake = ensureChart(ctxId, "bar", data, options);
  }
}

function updateBcrChart(scenario) {
  const ctxId = "chart-bcr";
  const existing = appState.charts.bcr;
  const data = {
    labels: ["Indicative outbreak cost saving", "Economic cost"],
    datasets: [{ label: "Per cohort (INR)", data: [scenario.epiBenefitPerCohort, scenario.costs.totalEconomicCostPerCohort] }]
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatNumber(value, 0) } } }
  };
  if (existing) {
    existing.data = data;
    existing.options = options;
    existing.update();
  } else {
    appState.charts.bcr = ensureChart(ctxId, "bar", data, options);
  }
}

function updateEpiChart(scenario) {
  const ctxId = "chart-epi";
  const existing = appState.charts.epi;
  const data = {
    labels: ["Graduates (all cohorts)", "Outbreak responses per year"],
    datasets: [{ label: "Epidemiological outputs", data: [scenario.graduatesAllCohorts, scenario.outbreaksPerYearNational] }]
  };
  const options = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  if (existing) {
    existing.data = data;
    existing.options = options;
    existing.update();
  } else {
    appState.charts.epi = ensureChart(ctxId, "bar", data, options);
  }
}

function updateNatCostBenefitChart(scenario) {
  const ctxId = "chart-nat-cost-benefit";
  const existing = appState.charts.natCostBenefit;
  const totalBenefit = scenario.epiBenefitAllCohorts;
  const data = {
    labels: ["Total economic cost (all cohorts)", "Total outbreak cost saving (all cohorts)"],
    datasets: [{ label: "National totals (INR)", data: [scenario.natTotalCost, totalBenefit] }]
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatNumber(value, 0) } } }
  };
  if (existing) {
    existing.data = data;
    existing.options = options;
    existing.update();
  } else {
    appState.charts.natCostBenefit = ensureChart(ctxId, "bar", data, options);
  }
}

function updateNatEpiChart(scenario) {
  const ctxId = "chart-nat-epi";
  const existing = appState.charts.natEpi;
  const data = {
    labels: ["Total graduates", "Outbreak responses per year"],
    datasets: [{ label: "National epidemiological outputs", data: [scenario.graduatesAllCohorts, scenario.outbreaksPerYearNational] }]
  };
  const options = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  if (existing) {
    existing.data = data;
    existing.options = options;
    existing.update();
  } else {
    appState.charts.natEpi = ensureChart(ctxId, "bar", data, options);
  }
}

/* ===========================
   UI updates
   =========================== */

function updateCostSliderLabel() {
  const slider = firstEl(["cost-slider", "#cost-slider"]);
  const display = firstEl(["cost-display", "#cost-display", "#costDisplay"]);
  if (!slider || !display) return;
  const val = Number(slider.value);
  display.textContent = formatCurrencyDisplay(val, 0);
}

function updateCurrencyToggle() {
  const label = firstEl(["currency-label", "#currency-label"]);
  const buttons = Array.from(document.querySelectorAll(".pill-toggle,[data-currency]"));
  buttons.forEach((btn) => {
    const c = btn.getAttribute("data-currency");
    if (c === appState.currency) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  if (label) label.textContent = appState.currency;
  if (appState.currentScenario) refreshAllOutputs(appState.currentScenario);
}

function updateConfigSummary(scenario) {
  const container = firstEl(["config-summary", "#config-summary"]);
  if (!container) return;

  const c = scenario.config;
  container.innerHTML = "";

  const rows = [
    { label: "Programme tier", value: c.tier === "frontline" ? "Frontline" : c.tier === "intermediate" ? "Intermediate" : "Advanced" },
    {
      label: "Career incentive",
      value:
        c.career === "certificate"
          ? "Government and partner certificate"
          : c.career === "uniqual"
          ? "University qualification"
          : "Government career pathway"
    },
    { label: "Mentorship intensity", value: c.mentorship === "low" ? "Low" : c.mentorship === "medium" ? "Medium" : "High" },
    { label: "Delivery mode", value: c.delivery === "blended" ? "Blended" : c.delivery === "inperson" ? "Fully in person" : "Fully online" },
    { label: "Response time", value: "Detect and respond within 7 days" },
    { label: "Cost per trainee per month", value: formatCurrencyDisplay(c.costPerTraineePerMonth, 0) },
    { label: "Trainees per cohort", value: formatNumber(c.traineesPerCohort, 0) },
    { label: "Number of cohorts", value: formatNumber(c.cohorts, 0) },
    { label: "Planning horizon (years)", value: formatNumber(c.planningHorizonYears || appState.epiSettings.general.planningHorizonYears, 0) },
    { label: "Opportunity cost", value: c.opportunityCostIncluded ? "Included in economic cost" : "Not included" }
  ];

  rows.forEach((row) => {
    const div = document.createElement("div");
    div.className = "config-summary-row";
    div.innerHTML = `
      <span class="config-summary-label">${row.label}</span>
      <span class="config-summary-value">${row.value}</span>
    `;
    container.appendChild(div);
  });

  const endorsementEl = firstEl(["config-endorsement-value", "#config-endorsement-value"]);
  if (endorsementEl) endorsementEl.textContent = formatNumber(scenario.endorseRate, 1) + "%";

  const statusTag = firstEl(["headline-status-tag", "#headline-status-tag"]);
  if (statusTag) {
    statusTag.textContent = "";
    statusTag.classList.remove("status-neutral", "status-good", "status-warning", "status-poor");

    let statusClass = "status-neutral";
    let statusText = "Scenario assessed";

    if (scenario.endorseRate >= 70 && scenario.bcrPerCohort !== null && scenario.bcrPerCohort >= 1.2) {
      statusClass = "status-good";
      statusText = "Strong configuration";
    } else if (scenario.endorseRate >= 50 && scenario.bcrPerCohort !== null && scenario.bcrPerCohort >= 1.0) {
      statusClass = "status-warning";
      statusText = "Promising configuration (needs discussion)";
    } else {
      statusClass = "status-poor";
      statusText = "Challenging configuration";
    }

    statusTag.classList.add(statusClass);
    statusTag.textContent = statusText;
  }

  const headlineText = firstEl(["headline-recommendation", "#headline-recommendation"]);
  if (headlineText) {
    const endorse = formatNumber(scenario.endorseRate, 1);
    const cost = formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0);
    const bcr = scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-";
    headlineText.textContent =
      `The mixed logit preference model points to an endorsement rate of about ${endorse} percent, an economic cost of ${cost} per cohort and an indicative outbreak cost saving to cost ratio near ${bcr}. These values give a concise starting point for discussions with ministries and partners.`;
  }

  const briefingEl = firstEl(["headline-briefing-text", "#headline-briefing-text"]);
  if (briefingEl) {
    const natCost = formatCurrencyDisplay(scenario.natTotalCost, 0);
    const natBenefit = formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0);
    const natBcr = scenario.natBcr !== null ? formatNumber(scenario.natBcr, 2) : "-";
    briefingEl.textContent =
      `With this configuration, about ${formatNumber(scenario.endorseRate, 1)} percent of stakeholders are expected to endorse the investment. Running ${formatNumber(scenario.config.cohorts, 0)} cohorts of ${formatNumber(scenario.config.traineesPerCohort, 0)} trainees leads to a total economic cost of roughly ${natCost} over the planning horizon and an indicative outbreak related economic cost saving of roughly ${natBenefit}. The national benefit cost ratio is around ${natBcr}, based on the outbreak value and epidemiological assumptions set in the settings and methods.`;
  }
}

function updateResultsTab(scenario) {
  const endorseEl = firstEl(["endorsement-rate", "#endorsement-rate"]);
  const optOutEl = firstEl(["optout-rate", "#optout-rate"]);
  const wtpPerTraineeEl = firstEl(["wtp-per-trainee", "#wtp-per-trainee"]);
  const wtpTotalCohortEl = firstEl(["wtp-total-cohort", "#wtp-total-cohort"]);
  const progCostEl = firstEl(["prog-cost-per-cohort", "#prog-cost-per-cohort"]);
  const totalCostEl = firstEl(["total-cost", "#total-cost"]);
  const netBenefitEl = firstEl(["net-benefit", "#net-benefit"]);
  const bcrEl = firstEl(["bcr", "#bcr"]);
  const gradsEl = firstEl(["epi-graduates", "#epi-graduates"]);
  const outbreaksEl = firstEl(["epi-outbreaks", "#epi-outbreaks"]);
  const epiBenefitEl = firstEl(["epi-benefit", "#epi-benefit"]);

  if (endorseEl) endorseEl.textContent = formatNumber(scenario.endorseRate, 1) + "%";
  if (optOutEl) optOutEl.textContent = formatNumber(scenario.optOutRate, 1) + "%";
  if (wtpPerTraineeEl) wtpPerTraineeEl.textContent = formatCurrencyDisplay(scenario.wtpPerTraineePerMonth, 0);
  if (wtpTotalCohortEl) wtpTotalCohortEl.textContent = formatCurrencyDisplay(scenario.wtpPerCohort, 0);
  if (progCostEl) progCostEl.textContent = formatCurrencyDisplay(scenario.costs.programmeCostPerCohort, 0);
  if (totalCostEl) totalCostEl.textContent = formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0);
  if (netBenefitEl) netBenefitEl.textContent = formatCurrencyDisplay(scenario.netBenefitPerCohort, 0);
  if (bcrEl) bcrEl.textContent = scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-";

  if (gradsEl) gradsEl.textContent = formatNumber(scenario.graduatesAllCohorts, 0);
  if (outbreaksEl) outbreaksEl.textContent = formatNumber(scenario.outbreaksPerYearNational, 1);
  if (epiBenefitEl) epiBenefitEl.textContent = formatCurrencyDisplay(scenario.epiBenefitPerCohort, 0);
}

function updateCostingTab(scenario) {
  const select = firstEl(["cost-source", "#cost-source"]);
  if (select && select.options.length === 0) {
    ["frontline", "intermediate", "advanced"].forEach((tier) => {
      const templates = COST_TEMPLATES[tier];
      if (templates && templates.combined) {
        const opt = document.createElement("option");
        opt.value = templates.combined.id;
        opt.textContent = templates.combined.label;
        select.appendChild(opt);
      }
    });
  }

  if (select) {
    const templates = COST_TEMPLATES[scenario.config.tier];
    if (templates?.combined) select.value = templates.combined.id;
  }

  const summaryBox = firstEl(["cost-breakdown-summary", "#cost-breakdown-summary"]);
  const tbody = firstEl(["cost-components-list", "#cost-components-list"]);
  if (!summaryBox || !tbody) return;

  tbody.innerHTML = "";
  summaryBox.innerHTML = "";

  const costInfo = scenario.costs;
  const template = costInfo.template;
  const directCost = costInfo.programmeCostPerCohort;
  const oppCost = costInfo.opportunityCostPerCohort;
  const econCost = costInfo.totalEconomicCostPerCohort;

  const cardsData = [
    { label: "Programme cost per cohort", value: formatCurrencyDisplay(directCost, 0) },
    { label: "Opportunity cost per cohort", value: formatCurrencyDisplay(oppCost, 0) },
    { label: "Total economic cost per cohort", value: formatCurrencyDisplay(econCost, 0) },
    {
      label: "Share of opportunity cost",
      value: econCost > 0 ? formatNumber((oppCost / econCost) * 100, 1) + "%" : "-"
    }
  ];

  cardsData.forEach((c) => {
    const div = document.createElement("div");
    div.className = "cost-summary-card";
    div.innerHTML = `
      <div class="cost-summary-label">${c.label}</div>
      <div class="cost-summary-value">${c.value}</div>
    `;
    summaryBox.appendChild(div);
  });

  if (!template) return;

  const months = TIER_MONTHS[scenario.config.tier] || 12;
  const trainees = scenario.config.traineesPerCohort || 0;
  const directForComponents = directCost;

  template.components.forEach((comp) => {
    const amount = directForComponents * (comp.directShare || 0);
    const perTraineePerMonth = trainees > 0 && months > 0 ? amount / (trainees * months) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${comp.label}</td>
      <td class="numeric-cell">${formatNumber((comp.directShare || 0) * 100, 1)}%</td>
      <td class="numeric-cell">${formatCurrencyDisplay(amount, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(perTraineePerMonth, 0)}</td>
      <td>Included in combined template for this tier.</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateNationalSimulationTab(scenario) {
  const totCostEl = firstEl(["nat-total-cost", "#nat-total-cost"]);
  const totBenefitEl = firstEl(["nat-total-benefit", "#nat-total-benefit"]);
  const netBenefitEl = firstEl(["nat-net-benefit", "#nat-net-benefit"]);
  const natBcrEl = firstEl(["nat-bcr", "#nat-bcr"]);
  const natGraduatesEl = firstEl(["nat-graduates", "#nat-graduates"]);
  const natOutbreaksEl = firstEl(["nat-outbreaks", "#nat-outbreaks"]);
  const natTotalWtpEl = firstEl(["nat-total-wtp", "#nat-total-wtp"]);
  const textEl = firstEl(["natsim-summary-text", "#natsim-summary-text"]);

  const natCost = scenario.natTotalCost;
  const natBenefit = scenario.epiBenefitAllCohorts;
  const natNet = scenario.netBenefitAllCohorts;
  const natBcr = scenario.natBcr !== null ? scenario.natBcr : null;
  const natTotalWtp = scenario.wtpAllCohorts;

  if (totCostEl) totCostEl.textContent = formatCurrencyDisplay(natCost, 0);
  if (totBenefitEl) totBenefitEl.textContent = formatCurrencyDisplay(natBenefit, 0);
  if (netBenefitEl) netBenefitEl.textContent = formatCurrencyDisplay(natNet, 0);
  if (natBcrEl) natBcrEl.textContent = natBcr !== null ? formatNumber(natBcr, 2) : "-";
  if (natGraduatesEl) natGraduatesEl.textContent = formatNumber(scenario.graduatesAllCohorts, 0);
  if (natOutbreaksEl) natOutbreaksEl.textContent = formatNumber(scenario.outbreaksPerYearNational, 1);
  if (natTotalWtpEl) natTotalWtpEl.textContent = formatCurrencyDisplay(natTotalWtp, 0);

  if (textEl) {
    textEl.textContent =
      `At national level, this configuration would produce about ${formatNumber(scenario.graduatesAllCohorts, 0)} graduates over the planning horizon and support around ${formatNumber(scenario.outbreaksPerYearNational, 1)} outbreak responses per year once all cohorts are complete. The total economic cost across all cohorts is roughly ${formatCurrencyDisplay(natCost, 0)}, while the indicative outbreak related economic cost saving is roughly ${formatCurrencyDisplay(natBenefit, 0)}. This implies a national benefit cost ratio of about ${natBcr !== null ? formatNumber(natBcr, 2) : "-"} and a net outbreak related cost saving of ${formatCurrencyDisplay(natNet, 0)}. Total willingness to pay across all cohorts is roughly ${formatCurrencyDisplay(natTotalWtp, 0)}.`;
  }

  updateNatCostBenefitChart(scenario);
  updateNatEpiChart(scenario);
}

/* ===========================
   Scenarios table and exports
   =========================== */

function refreshSavedScenariosTable() {
  const tbody = document.querySelector("#scenario-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  appState.savedScenarios.forEach((scenario) => {
    const c = scenario.config;
    const tr = document.createElement("tr");
    const tierLabel = c.tier === "frontline" ? "Frontline" : c.tier === "intermediate" ? "Intermediate" : "Advanced";
    const mentorshipLabel = c.mentorship === "low" ? "Low" : c.mentorship === "medium" ? "Medium" : "High";
    const careerLabel = c.career === "certificate" ? "Certificate" : c.career === "uniqual" ? "University qualification" : "Government career pathway";

    tr.innerHTML = `
      <td><input type="checkbox" data-scenario-id="${scenario.id}" /></td>
      <td>${c.name || "Scenario"}</td>
      <td>
        <span class="chip chip-tier">${tierLabel}</span>
        <span class="chip chip-mentorship">${mentorshipLabel} mentorship</span>
        <span class="chip chip-incentive">${careerLabel}</span>
      </td>
      <td>${tierLabel}</td>
      <td>${careerLabel}</td>
      <td>${mentorshipLabel}</td>
      <td>${c.delivery === "blended" ? "Blended" : c.delivery === "inperson" ? "Fully in person" : "Fully online"}</td>
      <td>Within 7 days</td>
      <td class="numeric-cell">${formatNumber(c.cohorts, 0)}</td>
      <td class="numeric-cell">${formatNumber(c.traineesPerCohort, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(c.costPerTraineePerMonth, 0)}</td>
      <td>${scenario.preferenceModel}</td>
      <td class="numeric-cell">${formatNumber(scenario.endorseRate, 1)}%</td>
      <td class="numeric-cell">${formatCurrencyDisplay(scenario.wtpPerTraineePerMonth, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(scenario.wtpAllCohorts, 0)}</td>
      <td class="numeric-cell">${scenario.natBcr !== null ? formatNumber(scenario.natBcr, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(scenario.natTotalCost, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(scenario.netBenefitAllCohorts, 0)}</td>
      <td class="numeric-cell">${formatNumber(scenario.outbreaksPerYearNational, 1)}</td>
      <td>${c.notes || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportScenariosToExcel() {
  if (!window.XLSX) {
    showToast("Excel export is not available in this browser.", "error");
    return;
  }
  const wb = XLSX.utils.book_new();
  const rows = [];
  rows.push([
    "Name",
    "Tier",
    "Career",
    "Mentorship",
    "Delivery",
    "Response time (days)",
    "Cohorts",
    "Trainees per cohort",
    "Cost per trainee per month (INR)",
    "Endorsement (%)",
    "WTP per trainee per month (INR)",
    "Total WTP all cohorts (INR)",
    "Total economic cost all cohorts (INR)",
    "Indicative outbreak cost saving all cohorts (INR)",
    "Net outbreak cost saving all cohorts (INR)",
    "Benefit cost ratio (outbreak benefits)"
  ]);

  appState.savedScenarios.forEach((s) => {
    const c = s.config;
    rows.push([
      c.name || "",
      c.tier,
      c.career,
      c.mentorship,
      c.delivery,
      "7",
      c.cohorts,
      c.traineesPerCohort,
      c.costPerTraineePerMonth,
      s.endorseRate,
      s.wtpPerTraineePerMonth,
      s.wtpAllCohorts,
      s.natTotalCost,
      s.epiBenefitAllCohorts,
      s.netBenefitAllCohorts,
      s.natBcr
    ]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, sheet, "STEPS scenarios");
  XLSX.writeFile(wb, "steps_saved_scenarios.xlsx");
  showToast("Excel file downloaded.", "success");
}

function exportScenariosToPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export is not available in this browser.", "error");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  let y = 10;
  doc.setFontSize(14);
  doc.text("STEPS FETP India Decision Aid - Saved scenarios", 10, y);
  y += 8;
  doc.setFontSize(10);

  appState.savedScenarios.forEach((s, idx) => {
    if (y > 190) {
      doc.addPage();
      y = 10;
    }
    const c = s.config;
    doc.text(`${idx + 1}. ${c.name || "Scenario"}`, 10, y);
    y += 5;
    doc.text(`Tier: ${c.tier} | Career: ${c.career} | Mentorship: ${c.mentorship} | Delivery: ${c.delivery} | Response: 7 days`, 10, y);
    y += 5;
    doc.text(
      `Cohorts: ${c.cohorts}, Trainees per cohort: ${c.traineesPerCohort}, Cost per trainee per month (INR): ${formatNumber(c.costPerTraineePerMonth, 0)}`,
      10,
      y
    );
    y += 5;
    doc.text(`Endorsement: ${formatNumber(s.endorseRate, 1)}% | WTP per trainee per month (INR): ${formatNumber(s.wtpPerTraineePerMonth, 0)}`, 10, y);
    y += 5;
    doc.text(`Total WTP all cohorts (INR): ${formatNumber(s.wtpAllCohorts, 0)}`, 10, y);
    y += 5;
    doc.text(
      `Total economic cost all cohorts (INR): ${formatNumber(s.natTotalCost, 0)} | Indicative outbreak cost saving (INR): ${formatNumber(s.epiBenefitAllCohorts, 0)}`,
      10,
      y
    );
    y += 5;
    doc.text(
      `Net outbreak cost saving (INR): ${formatNumber(s.netBenefitAllCohorts, 0)} | Benefit cost ratio: ${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"}`,
      10,
      y
    );
    y += 7;
  });

  doc.save("steps_saved_scenarios.pdf");
  showToast("Policy summary PDF downloaded.", "success");
}

function exportCurrentScenarioJson() {
  if (!appState.currentScenario) {
    showToast("Apply a configuration before exporting JSON.", "warning");
    return;
  }
  const blob = new Blob([JSON.stringify(appState.currentScenario, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "steps_current_scenario.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  showToast("Scenario JSON downloaded.", "success");
}

/* ===========================
   WTP based benefits and sensitivity
   =========================== */

function getSensitivityControls() {
  const benefitModeSelect = $("benefit-definition-select");
  const epiToggle = $("sensitivity-epi-toggle");
  const endorsementOverrideInput = $("endorsement-override");

  return {
    benefitMode: benefitModeSelect ? benefitModeSelect.value : "wtp_only",
    epiIncluded: epiToggle && epiToggle.classList.contains("on"),
    endorsementOverride: endorsementOverrideInput ? Number(endorsementOverrideInput.value) || null : null
  };
}

function computeSensitivityRow(scenario) {
  const c = scenario.config;
  const costAll = scenario.costs.totalEconomicCostPerCohort * c.cohorts;
  const epiAll = scenario.epiBenefitPerCohort * c.cohorts;
  const netAll = epiAll - costAll;
  const epiBcr = costAll > 0 ? epiAll / costAll : null;

  const wtpAll = scenario.wtpAllCohorts;
  const wtpOutbreak = scenario.wtpOutbreakComponent;
  const combinedBenefit = wtpAll + epiAll;

  const npvDceOnly = wtpAll - costAll;
  const npvCombined = combinedBenefit - costAll;

  return { costAll, epiAll, netAll, epiBcr, wtpAll, wtpOutbreak, combinedBenefit, npvDceOnly, npvCombined };
}

function refreshSensitivityTables() {
  const dceBody = $("dce-benefits-table-body");
  const sensBody = $("sensitivity-table-body");
  if (!dceBody || !sensBody) return;

  dceBody.innerHTML = "";
  sensBody.innerHTML = "";

  if (!appState.currentScenario) return;

  const controls = getSensitivityControls();
  const scenarios = [{ label: "Current configuration", scenario: appState.currentScenario }].concat(
    appState.savedScenarios.map((s, idx) => ({ label: s.config.name || `Saved scenario ${idx + 1}`, scenario: s }))
  );

  scenarios.forEach(({ label, scenario }) => {
    const c = scenario.config;
    const s = computeSensitivityRow(scenario);

    let endorsementUsed = controls.endorsementOverride !== null ? controls.endorsementOverride : scenario.endorseRate;
    endorsementUsed = clamp(endorsementUsed, 0, 100);

    let effectiveWtp = s.wtpAll;
    if (controls.benefitMode === "endorsement_adjusted") effectiveWtp = s.wtpAll * (endorsementUsed / 100);

    let combinedBenefit = s.combinedBenefit;
    if (!controls.epiIncluded) combinedBenefit = s.wtpAll;

    const bcrDceOnly = s.costAll > 0 ? s.wtpAll / s.costAll : null;
    const bcrCombined = s.costAll > 0 ? combinedBenefit / s.costAll : null;

    const npvDceOnly = s.npvDceOnly;
    const npvCombined = controls.epiIncluded ? s.npvCombined : s.npvDceOnly;

    const trHeadline = document.createElement("tr");
    trHeadline.innerHTML = `
      <td>${label}</td>
      <td class="numeric-cell">${formatCurrencyINR(s.costAll, 0)}</td>
      <td class="numeric-cell">${formatNumber(s.costAll / 1e6, 2)}</td>
      <td class="numeric-cell">${formatNumber((controls.epiIncluded ? (s.netAll / 1e6) : (npvDceOnly / 1e6)), 2)}</td>
      <td class="numeric-cell">${formatCurrencyINR(s.wtpAll, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR(s.wtpOutbreak, 0)}</td>
      <td class="numeric-cell">${controls.epiIncluded ? formatCurrencyINR(s.epiAll, 0) : "Not included"}</td>
      <td class="numeric-cell">${formatNumber(endorsementUsed, 1)}</td>
      <td class="numeric-cell">${formatCurrencyINR(effectiveWtp, 0)}</td>
      <td class="numeric-cell">${bcrDceOnly !== null ? formatNumber(bcrDceOnly, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyINR(npvDceOnly, 0)}</td>
      <td class="numeric-cell">${bcrCombined !== null ? formatNumber(bcrCombined, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyINR(npvCombined, 0)}</td>
    `;
    dceBody.appendChild(trHeadline);

    const trDetail = document.createElement("tr");
    trDetail.innerHTML = `
      <td>${label}</td>
      <td>${scenario.preferenceModel}</td>
      <td class="numeric-cell">${formatNumber(scenario.endorseRate, 1)}%</td>
      <td class="numeric-cell">${formatCurrencyINR(scenario.costs.totalEconomicCostPerCohort, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR(scenario.wtpPerCohort, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR(scenario.wtpOutbreakComponent, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR(scenario.epiBenefitPerCohort, 0)}</td>
      <td class="numeric-cell">${bcrDceOnly !== null ? formatNumber(bcrDceOnly, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyINR(npvDceOnly / (c.cohorts || 1), 0)}</td>
      <td class="numeric-cell">${bcrCombined !== null ? formatNumber(bcrCombined, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyINR(npvCombined / (c.cohorts || 1), 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR((s.wtpAll * (endorsementUsed / 100)) / (c.cohorts || 1), 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR(((combinedBenefit * (endorsementUsed / 100)) / (c.cohorts || 1)), 0)}</td>
    `;
    sensBody.appendChild(trDetail);
  });
}

function exportSensitivityToExcel() {
  if (!window.XLSX) {
    showToast("Excel export is not available in this browser.", "error");
    return;
  }
  const table = $("dce-benefits-table");
  if (!table) return;

  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, sheet, "Sensitivity");
  XLSX.writeFile(wb, "steps_sensitivity_summary.xlsx");
  showToast("Sensitivity table Excel file downloaded.", "success");
}

function exportSensitivityToPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export is not available in this browser.", "error");
    return;
  }

  const table = $("dce-benefits-table");
  if (!table) {
    showToast("Sensitivity table is not available on this page.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("STEPS FETP India Decision Aid - WTP based benefits and sensitivity", 10, 10);

  const headRow = table.querySelector("thead tr");
  const head = [];
  if (headRow) head.push(Array.from(headRow.children).map((th) => th.textContent.trim()));

  const body = [];
  table.querySelectorAll("tbody tr").forEach((tr) => {
    body.push(Array.from(tr.children).map((td) => td.textContent.trim()));
  });

  if (doc.autoTable && head.length && body.length) {
    doc.setFontSize(9);
    doc.autoTable({
      head,
      body,
      startY: 16,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [240, 240, 240] },
      margin: { left: 10, right: 10 },
      tableWidth: "wrap"
    });
  } else {
    let y = 18;
    doc.setFontSize(9);
    if (head.length) {
      doc.text(head[0].join(" | "), 10, y);
      y += 6;
    }
    body.forEach((row, idx) => {
      if (y > 190) {
        doc.addPage();
        y = 10;
        if (head.length) {
          doc.text(head[0].join(" | "), 10, y);
          y += 6;
        }
      }
      doc.text(`${idx + 1}. ${row.join(" | ")}`, 10, y);
      y += 5;
    });
  }

  doc.save("steps_sensitivity_summary.pdf");
  showToast("Sensitivity table PDF downloaded.", "success");
}

/* ===========================
   Advanced settings
   =========================== */

function logSettingsMessage(message) {
  const targets = [];
  const sessionLog = $("settings-log");
  const advLog = $("adv-settings-log");
  if (sessionLog) targets.push(sessionLog);
  if (advLog && advLog !== sessionLog) targets.push(advLog);
  if (!targets.length) return;
  const time = new Date().toLocaleString();
  targets.forEach((box) => {
    const p = document.createElement("p");
    p.textContent = `[${time}] ${message}`;
    box.appendChild(p);
  });
}

function initAdvancedSettings() {
  const valueGradInput = $("adv-value-per-graduate");
  const valueOutbreakInput = $("adv-value-per-outbreak");
  const completionInput = $("adv-completion-rate");
  const outbreaksPerGradInput = $("adv-outbreaks-per-graduate");
  const horizonInput = $("adv-planning-horizon");
  const discInput = $("adv-epi-discount-rate");
  const usdRateInput = $("adv-usd-rate");
  const applyBtn = $("adv-apply-settings");
  const resetBtn = $("adv-reset-settings");

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (!valueGradInput || !valueOutbreakInput || !completionInput || !outbreaksPerGradInput || !horizonInput || !discInput || !usdRateInput) return;

      const vGrad = Number(valueGradInput.value);
      const vOut = Number(valueOutbreakInput.value);
      const compRate = Number(completionInput.value) / 100;
      const outPerGrad = Number(outbreaksPerGradInput.value);
      const horizon = Number(horizonInput.value);
      const discRate = Number(discInput.value) / 100;
      const usdRate = Number(usdRateInput.value);

      ["frontline", "intermediate", "advanced"].forEach((tier) => {
        appState.epiSettings.tiers[tier].valuePerGraduate = isNaN(vGrad) ? 0 : vGrad;
        appState.epiSettings.tiers[tier].valuePerOutbreak = isNaN(vOut) ? 0 : vOut;
        appState.epiSettings.tiers[tier].completionRate = clamp(isNaN(compRate) ? 0.9 : compRate, 0, 1);
        appState.epiSettings.tiers[tier].outbreaksPerGraduatePerYear = isNaN(outPerGrad) ? 0.5 : outPerGrad;
      });

      if (!isNaN(horizon) && horizon > 0) appState.epiSettings.general.planningHorizonYears = horizon;
      if (!isNaN(discRate) && discRate >= 0) appState.epiSettings.general.epiDiscountRate = discRate;
      if (!isNaN(usdRate) && usdRate > 0) {
        appState.epiSettings.general.inrToUsdRate = usdRate;
        appState.usdRate = usdRate;
      }

      logSettingsMessage(
        "Advanced settings updated for graduate value, value per outbreak, completion rate, outbreaks per graduate, planning horizon, discount rate and INR per USD."
      );

      if (appState.currentScenario) {
        const newScenario = computeScenario(appState.currentScenario.config);
        appState.currentScenario = newScenario;
        refreshAllOutputs(newScenario);
      }

      showToast("Advanced settings applied for this session.", "success");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      appState.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
      appState.usdRate = DEFAULT_EPI_SETTINGS.general.inrToUsdRate;

      if (valueGradInput) valueGradInput.value = "0";
      if (valueOutbreakInput) valueOutbreakInput.value = "20000000000";
      if (completionInput) completionInput.value = "90";
      if (outbreaksPerGradInput) outbreaksPerGradInput.value = "0.5";
      if (horizonInput) horizonInput.value = String(DEFAULT_EPI_SETTINGS.general.planningHorizonYears);
      if (discInput) discInput.value = String(DEFAULT_EPI_SETTINGS.general.epiDiscountRate * 100);
      if (usdRateInput) usdRateInput.value = String(DEFAULT_EPI_SETTINGS.general.inrToUsdRate);

      logSettingsMessage("Advanced settings reset to default values.");

      if (appState.currentScenario) {
        const newScenario = computeScenario(appState.currentScenario.config);
        appState.currentScenario = newScenario;
        refreshAllOutputs(newScenario);
      }

      showToast("Advanced settings reset to defaults.", "success");
    });
  }
}

function applyOutbreakPreset(valueInINR) {
  if (isNaN(valueInINR) || valueInINR <= 0) return;

  ["frontline", "intermediate", "advanced"].forEach((tier) => {
    appState.epiSettings.tiers[tier].valuePerOutbreak = valueInINR;
  });

  const valueOutbreakInput = $("adv-value-per-outbreak");
  if (valueOutbreakInput) valueOutbreakInput.value = String(valueInINR);

  if (appState.currentScenario) {
    const newScenario = computeScenario(appState.currentScenario.config);
    appState.currentScenario = newScenario;
    refreshAllOutputs(newScenario);
  }

  logSettingsMessage(`Value per outbreak updated to ₹${formatNumber(valueInINR, 0)} per outbreak for all tiers from sensitivity controls.`);
  showToast(`Value per outbreak set to ₹${formatNumber(valueInINR, 0)} for all tiers.`, "success");
}

/* ===========================
   Copilot integration
   =========================== */

function buildScenarioJsonForCopilot(scenario) {
  const c = scenario.config;
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      tool: "STEPS FETP India Decision Aid",
      country: "India",
      planningHorizonYears: scenario.planningYears,
      discountRateForBenefits: scenario.discountRate
    },
    configuration: {
      name: c.name,
      notes: c.notes,
      tier: c.tier,
      careerIncentive: c.career,
      mentorshipIntensity: c.mentorship,
      deliveryMode: c.delivery,
      responseTimeDays: 7,
      costPerTraineePerMonthINR: c.costPerTraineePerMonth,
      traineesPerCohort: c.traineesPerCohort,
      cohorts: c.cohorts,
      opportunityCostIncluded: c.opportunityCostIncluded
    },
    preferenceModel: {
      type: scenario.preferenceModel,
      endorsementRatePercent: scenario.endorseRate,
      optOutRatePercent: scenario.optOutRate,
      wtpPerTraineePerMonthINR: scenario.wtpPerTraineePerMonth,
      wtpPerCohortINR: scenario.wtpPerCohort,
      wtpAllCohortsINR: scenario.wtpAllCohorts
    },
    costResults: {
      programmeCostPerCohortINR: scenario.costs.programmeCostPerCohort,
      opportunityCostPerCohortINR: scenario.costs.opportunityCostPerCohort,
      economicCostPerCohortINR: scenario.costs.totalEconomicCostPerCohort,
      totalEconomicCostAllCohortsINR: scenario.natTotalCost
    },
    epidemiologicalResults: {
      graduatesPerCohort: scenario.graduatesPerCohort,
      graduatesAllCohorts: scenario.graduatesAllCohorts,
      outbreakResponsesPerYearPerCohort: scenario.outbreaksPerYearPerCohort,
      outbreakResponsesPerYearNational: scenario.outbreaksPerYearNational,
      epiBenefitPerCohortINR: scenario.epiBenefitPerCohort,
      epiBenefitAllCohortsINR: scenario.epiBenefitAllCohorts
    },
    benefitCostResults: {
      bcrPerCohortEpidemiological: scenario.bcrPerCohort,
      bcrNationalEpidemiological: scenario.natBcr,
      netBenefitPerCohortINR: scenario.netBenefitPerCohort,
      netBenefitAllCohortsINR: scenario.netBenefitAllCohorts,
      wtpOutbreakComponentAllCohortsINR: scenario.wtpOutbreakComponent,
      totalWtpAllCohortsINR: scenario.wtpAllCohorts
    }
  };
}

function initCopilot() {
  const btn = $("copilot-open-and-copy-btn");
  const textarea = $("copilot-prompt-output");
  const statusPill = $("copilot-status-pill");
  const statusText = $("copilot-status-text");

  function setStatus(text) {
    if (statusPill) statusPill.textContent = text;
  }

  if (!btn || !textarea) return;

  btn.addEventListener("click", async () => {
    if (!appState.currentScenario) {
      showToast("Apply a configuration before preparing the Copilot prompt.", "warning");
      setStatus("Waiting for configuration");
      textarea.value =
        'Apply a configuration in STEPS and click "Open in Copilot and copy prompt" to generate the full interpretation prompt and scenario JSON. When the Copilot window opens, paste the copied text into the chat box.';
      return;
    }

    const scenarioJson = buildScenarioJsonForCopilot(appState.currentScenario);
    const jsonText = JSON.stringify(scenarioJson, null, 2);

    const fullText =
      COPILOT_INTERPRETATION_PROMPT.trim() +
      "\n\nThe STEPS scenario JSON is provided below between the markers <SCENARIO_JSON> and </SCENARIO_JSON>. Use it as the quantitative evidence base for your policy brief.\n\n<SCENARIO_JSON>\n" +
      jsonText +
      "\n</SCENARIO_JSON>\n";

    textarea.value = fullText;
    setStatus("Prompt ready");
    if (statusText) {
      statusText.textContent = "The Copilot prompt is ready. Paste this text into Copilot and run it.";
    }

    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(fullText);
        copied = true;
        showToast("Prompt copied. Paste it into the Copilot window.", "success");
      } catch (_) {}
    }
    if (!copied) showToast("Prompt prepared. Copy it from the panel and paste into Copilot.", "warning");

    const urlOverride = btn.getAttribute("data-copilot-url") || window.STEPS_COPILOT_URL;
    const copilotUrl = urlOverride || "https://copilot.microsoft.com/";
    window.open(copilotUrl, "_blank");
  });
}

/* ===========================
   Snapshot modal
   =========================== */

let snapshotModal = null;

function ensureSnapshotModal() {
  if (snapshotModal) return;
  snapshotModal = document.createElement("div");
  snapshotModal.className = "modal hidden";
  snapshotModal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" type="button" aria-label="Close">×</button>
      <h2>Scenario summary</h2>
      <div id="snapshot-body"></div>
    </div>
  `;
  document.body.appendChild(snapshotModal);

  snapshotModal.querySelector(".modal-close")?.addEventListener("click", () => snapshotModal.classList.add("hidden"));
  snapshotModal.addEventListener("click", (e) => {
    if (e.target === snapshotModal) snapshotModal.classList.add("hidden");
  });
}

function openSnapshotModal(scenario) {
  ensureSnapshotModal();
  const body = snapshotModal.querySelector("#snapshot-body");
  if (body) {
    const c = scenario.config;
    body.innerHTML = `
      <p><strong>Scenario name:</strong> ${c.name || ""}</p>
      <p><strong>Tier:</strong> ${c.tier}</p>
      <p><strong>Career incentive:</strong> ${c.career}</p>
      <p><strong>Mentorship:</strong> ${c.mentorship}</p>
      <p><strong>Delivery mode:</strong> ${c.delivery}</p>
      <p><strong>Response time:</strong> 7 days</p>
      <p><strong>Cohorts and trainees:</strong> ${formatNumber(c.cohorts, 0)} cohorts of ${formatNumber(c.traineesPerCohort, 0)} trainees</p>
      <p><strong>Cost per trainee per month:</strong> ${formatCurrencyDisplay(c.costPerTraineePerMonth, 0)}</p>
      <p><strong>Endorsement:</strong> ${formatNumber(scenario.endorseRate, 1)}%</p>
      <p><strong>Economic cost per cohort:</strong> ${formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0)}</p>
      <p><strong>Indicative outbreak cost saving per cohort:</strong> ${formatCurrencyDisplay(scenario.epiBenefitPerCohort, 0)}</p>
      <p><strong>Benefit cost ratio per cohort:</strong> ${scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-"}</p>
      <p><strong>Total economic cost all cohorts:</strong> ${formatCurrencyDisplay(scenario.natTotalCost, 0)}</p>
      <p><strong>Indicative outbreak cost saving all cohorts:</strong> ${formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0)}</p>
      <p><strong>Net outbreak cost saving all cohorts:</strong> ${formatCurrencyDisplay(scenario.netBenefitAllCohorts, 0)}</p>
    `;
  }
  snapshotModal.classList.remove("hidden");
}

/* ===========================
   Event wiring and refresh
   =========================== */

function refreshAllOutputs(scenario) {
  updateCostSliderLabel();
  updateConfigSummary(scenario);
  updateResultsTab(scenario);
  updateCostingTab(scenario);
  updateNationalSimulationTab(scenario);
  updateUptakeChart(scenario);
  updateBcrChart(scenario);
  updateEpiChart(scenario);
  refreshSensitivityTables();
  refreshSavedScenariosTable();
  enforceFixedResponseTimeUI();
}

function initEventHandlers() {
  const costSlider = firstEl(["cost-slider", "#cost-slider"]);
  costSlider?.addEventListener("input", updateCostSliderLabel);

  Array.from(document.querySelectorAll(".pill-toggle,[data-currency]")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const currency = btn.getAttribute("data-currency");
      if (currency && currency !== appState.currency) {
        appState.currency = currency;
        updateCurrencyToggle();
      }
    });
  });

  const oppToggle = firstEl(["opp-toggle", "#opp-toggle"]);
  if (oppToggle) {
    oppToggle.addEventListener("click", () => {
      const on = oppToggle.classList.toggle("on");
      const label = oppToggle.querySelector(".switch-label");
      if (label) label.textContent = on ? "Opportunity cost included" : "Opportunity cost excluded";
      if (appState.currentScenario) {
        const newScenario = computeScenario(appState.currentScenario.config);
        appState.currentScenario = newScenario;
        refreshAllOutputs(newScenario);
      }
    });
  }

  const updateBtn = firstEl(["update-results", "#update-results", "#apply-configuration", "[data-role='apply-config']"]);
  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      enforceFixedResponseTimeUI();
      const config = getConfigFromForm();
      const scenario = computeScenario(config);
      appState.currentScenario = scenario;
      refreshAllOutputs(scenario);
      showToast("Configuration applied and results updated.", "success");
    });
  }

  const snapshotBtn = firstEl(["open-snapshot", "#open-snapshot", "[data-role='open-snapshot']"]);
  snapshotBtn?.addEventListener("click", () => {
    if (!appState.currentScenario) {
      showToast("Apply a configuration before opening the summary.", "warning");
      return;
    }
    openSnapshotModal(appState.currentScenario);
  });

  const saveScenarioBtn = firstEl(["save-scenario", "#save-scenario", "[data-role='save-scenario']"]);
  saveScenarioBtn?.addEventListener("click", () => {
    if (!appState.currentScenario) {
      showToast("Apply a configuration before saving a scenario.", "warning");
      return;
    }
    appState.savedScenarios.push(appState.currentScenario);
    refreshSavedScenariosTable();
    refreshSensitivityTables();
    showToast("Scenario saved for comparison and export.", "success");
  });

  firstEl(["export-excel", "#export-excel"])?.addEventListener("click", exportScenariosToExcel);
  firstEl(["export-pdf", "#export-pdf"])?.addEventListener("click", exportScenariosToPdf);

  firstEl(["export-current-json", "#export-current-json"])?.addEventListener("click", exportCurrentScenarioJson);

  const sensUpdateBtn = firstEl(["refresh-sensitivity-benefits", "#refresh-sensitivity-benefits"]);
  sensUpdateBtn?.addEventListener("click", () => {
    if (!appState.currentScenario) {
      showToast("Apply a configuration before updating the sensitivity summary.", "warning");
      return;
    }
    refreshSensitivityTables();
    showToast("Sensitivity summary updated.", "success");
  });

  firstEl(["export-sensitivity-benefits-excel", "#export-sensitivity-benefits-excel"])?.addEventListener("click", exportSensitivityToExcel);
  firstEl(["export-sensitivity-benefits-pdf", "#export-sensitivity-benefits-pdf"])?.addEventListener("click", exportSensitivityToPdf);

  const epiToggle = $("sensitivity-epi-toggle");
  if (epiToggle) {
    epiToggle.addEventListener("click", () => {
      const on = epiToggle.classList.toggle("on");
      const label = epiToggle.querySelector(".switch-label");
      if (label) label.textContent = on ? "Outbreak benefits included" : "Outbreak benefits excluded";
      if (appState.currentScenario) refreshSensitivityTables();
    });
  }

  const outbreakPresetSelect = $("outbreak-value-preset");
  outbreakPresetSelect?.addEventListener("change", () => {
    const raw = Number(outbreakPresetSelect.value);
    if (!isNaN(raw) && raw > 0) applyOutbreakPreset(raw * 1e9);
  });

  const outbreakApplyBtn = $("apply-outbreak-value");
  outbreakApplyBtn?.addEventListener("click", () => {
    const raw = Number(outbreakPresetSelect?.value);
    if (!isNaN(raw) && raw > 0) applyOutbreakPreset(raw * 1e9);
    else showToast("Select a value per outbreak before applying.", "warning");
  });

  $("benefit-definition-select")?.addEventListener("change", () => appState.currentScenario && refreshSensitivityTables());
  $("endorsement-override")?.addEventListener("change", () => appState.currentScenario && refreshSensitivityTables());

  // Always enforce fixed response time
  enforceFixedResponseTimeUI();
}

/* ===========================
   Initialise
   =========================== */

document.addEventListener("DOMContentLoaded", async () => {
  // Merge external JSON config if present
  const external = await tryLoadJsonConfigs();
  if (external && typeof external === "object") {
    if (external.MXL_COEFS) MXL_COEFS = external.MXL_COEFS;
    if (external.COST_TEMPLATES) COST_TEMPLATES = external.COST_TEMPLATES;
    if (external.DEFAULT_EPI_SETTINGS) DEFAULT_EPI_SETTINGS = external.DEFAULT_EPI_SETTINGS;
    if (external.COPILOT_INTERPRETATION_PROMPT) COPILOT_INTERPRETATION_PROMPT = external.COPILOT_INTERPRETATION_PROMPT;
    if (external.RESPONSE_TIME_MULTIPLIERS) RESPONSE_TIME_MULTIPLIERS = external.RESPONSE_TIME_MULTIPLIERS;
    if (external.TIER_MONTHS) TIER_MONTHS = external.TIER_MONTHS;

    // Re-sync state if defaults were overridden
    appState.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
    appState.usdRate = DEFAULT_EPI_SETTINGS.general.inrToUsdRate;
  }

  COST_CONFIG = COST_TEMPLATES;

  initTabs();
  initDefinitionTooltips();
  initTooltips();
  initGuidedTour();
  initAdvancedSettings();
  initCopilot();
  initEventHandlers();
  updateCostSliderLabel();
  updateCurrencyToggle();
  enforceFixedResponseTimeUI();

  // If an initial "apply" is desired when the page loads, uncomment:
  // const scenario = computeScenario(getConfigFromForm());
  // appState.currentScenario = scenario;
  // refreshAllOutputs(scenario);
});
