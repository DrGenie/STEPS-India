/* ===================================================
   STEPS FETP India Decision Aid
   Script with interactive DCE sensitivity / benefits
   and Copilot interpretation helper
   =================================================== */

(function () {
  "use strict";

  /* ===========================
     Global model coefficients
     =========================== */

  const MXL_COEFS = {
    ascProgram: 0.168,
    ascOptOut: -0.601,
    tier: {
      frontline: 0.0,
      intermediate: 0.220,
      advanced: 0.487
    },
    career: {
      certificate: 0.0,
      uniqual: 0.017,
      career_path: -0.122
    },
    mentorship: {
      low: 0.0,
      medium: 0.453,
      high: 0.640
    },
    delivery: {
      blended: 0.0,
      inperson: -0.232,
      online: -1.073
    },
    response: {
      30: 0.0,
      15: 0.546,
      7: 0.610
    },
    costPerThousand: -0.005
  };

  /* ===========================
     Embedded training video
     =========================== */

  const STEPS_VIDEO_EMBED_URL =
    "https://uonstaff-my.sharepoint.com/personal/mg844_newcastle_edu_au/_layouts/15/embed.aspx?UniqueId=df59fa1b-0cd5-47fa-b743-cdd486b3b82c&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create";

  /* ===========================
     Cost templates (combined)
     =========================== */

  const COST_TEMPLATES = {
    frontline: {
      combined: {
        id: "frontline_combined",
        label: "Frontline combined template (all institutions)",
        description:
          "Combined frontline cost structure across all institutions using harmonised components and indirect costs including opportunity cost.",
        oppRate: 1.09,
        components: [
          {
            id: "staff_core",
            label: "In country programme staff salaries and benefits",
            directShare: 0.214
          },
          {
            id: "office_equipment",
            label: "Office equipment for staff and faculty",
            directShare: 0.004
          },
          {
            id: "office_software",
            label: "Office software for staff and faculty",
            directShare: 0.0004
          },
          {
            id: "rent_utilities",
            label: "Rent and utilities for staff and faculty",
            directShare: 0.024
          },
          {
            id: "training_materials",
            label: "Training materials and printing",
            directShare: 0.0006
          },
          {
            id: "workshops",
            label: "Workshops and seminars",
            directShare: 0.107
          },
          {
            id: "travel_in_country",
            label: "In country travel for faculty, mentors and trainees",
            directShare: 0.65
          }
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
          {
            id: "staff_core",
            label: "In country programme staff salaries and benefits",
            directShare: 0.0924
          },
          {
            id: "staff_other",
            label: "Other salaries and benefits for consultants and advisors",
            directShare: 0.0004
          },
          {
            id: "office_equipment",
            label: "Office equipment for staff and faculty",
            directShare: 0.0064
          },
          {
            id: "office_software",
            label: "Office software for staff and faculty",
            directShare: 0.027
          },
          {
            id: "rent_utilities",
            label: "Rent and utilities for staff and faculty",
            directShare: 0.0171
          },
          {
            id: "training_materials",
            label: "Training materials and printing",
            directShare: 0.0005
          },
          {
            id: "workshops",
            label: "Workshops and seminars",
            directShare: 0.0258
          },
          {
            id: "travel_in_country",
            label: "In country travel for faculty, mentors and trainees",
            directShare: 0.57
          },
          {
            id: "travel_international",
            label: "International travel for faculty, mentors and trainees",
            directShare: 0.1299
          },
          {
            id: "other_direct",
            label: "Other direct programme expenses",
            directShare: 0.1302
          }
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
          {
            id: "staff_core",
            label: "In country programme staff salaries and benefits",
            directShare: 0.165
          },
          {
            id: "office_equipment",
            label: "Office equipment for staff and faculty",
            directShare: 0.0139
          },
          {
            id: "office_software",
            label: "Office software for staff and faculty",
            directShare: 0.0184
          },
          {
            id: "rent_utilities",
            label: "Rent and utilities for staff and faculty",
            directShare: 0.0255
          },
          {
            id: "trainee_allowances",
            label: "Trainee allowances and scholarships",
            directShare: 0.0865
          },
          {
            id: "trainee_equipment",
            label: "Trainee equipment such as laptops and internet",
            directShare: 0.0035
          },
          {
            id: "trainee_software",
            label: "Trainee software licences",
            directShare: 0.0017
          },
          {
            id: "training_materials",
            label: "Training materials and printing",
            directShare: 0.0024
          },
          {
            id: "workshops",
            label: "Workshops and seminars",
            directShare: 0.0188
          },
          {
            id: "travel_in_country",
            label: "In country travel for faculty, mentors and trainees",
            directShare: 0.372
          },
          {
            id: "travel_international",
            label: "International travel for faculty, mentors and trainees",
            directShare: 0.288
          },
          {
            id: "other_direct",
            label: "Other direct programme expenses",
            directShare: 0.0043
          }
        ]
      }
    }
  };

  let COST_CONFIG = null; // optional external config if added later

  /* ===========================
     Epidemiological settings
     =========================== */

  const DEFAULT_ADV_SETTINGS = {
    valuePerGraduate: 500000,
    valuePerOutbreak: 30000000,
    completionRate: 0.9,
    outbreaksPerGraduatePerYear: 0.5,
    planningHorizonYears: 5,
    epiDiscountRate: 0.03,
    inrPerUsd: 83
  };

  const RESPONSE_TIME_MULTIPLIERS = {
    "30": 1.0,
    "15": 1.2,
    "7": 1.5
  };

  const TIER_MONTHS = {
    frontline: 3,
    intermediate: 12,
    advanced: 24
  };

  /* ===========================
     Copilot interpretation prompt
     =========================== */

  const COPILOT_INTERPRETATION_PROMPT = [
    "Background and role.",
    "You are a senior health economist advising the Ministry of Health and Family Welfare in India on the national scale up of Field Epidemiology Training Programmes. You have received an exported scenario from the STEPS FETP India Decision Aid. The JSON that follows summarises the configuration chosen by the user. It records programme tier, career incentive, mentorship intensity, mode of delivery, expected response time, cost per trainee per month, number of cohorts, cohort size and the main outputs from the preference model, costing module and epidemiological calculations. Latent class estimates are not included in this export and should not be discussed. All other model components should be treated as valid and used in your interpretation.",
    "",
    "Scenario description.",
    "Using the JSON that follows, reconstruct the scenario in clear plain language. Explain which FETP tier is being scaled, how many cohorts are planned, the number of trainees per cohort, and the key design features related to careers, mentorship, delivery and outbreak response time. Report the indicative cost per trainee per month and the total economic cost across all cohorts, making clear whether opportunity cost of trainee time has been included. Describe these elements in a way that senior decision makers can quickly understand what the configuration implies for resources and implementation effort.",
    "",
    "Endorsement and stakeholder preferences.",
    "Interpret the endorsement results from the discrete choice experiment. State the predicted proportion of stakeholders who would support the configuration compared with choosing an opt out option. Characterise support as low, moderate or strong in the context of national scale up decisions for India. Where the JSON indicates links between endorsement and attributes such as faster response time or stronger mentorship, explain these patterns in qualitative terms so that policy makers can see how design choices affect stakeholder willingness to invest.",
    "",
    "Willingness to pay as a benefit measure.",
    "Explain how the willingness to pay estimates in the JSON summarise stakeholder valuations of the configuration. Clarify that willingness to pay is treated as a benefit measure because it reflects the maximum monetary amount that informed stakeholders would hypothetically give up to secure improvements in epidemiological training, mentoring, response time and system capacity relative to the status quo. Make clear that willingness to pay is expressed in rupees per trainee per month and can be aggregated across trainees and cohorts. Use the JSON to compare total willingness to pay with total economic cost. State whether the implied perceived value of the programme exceeds its cost and what this suggests for the economic case for investment.",
    "",
    "Costs, epidemiological benefits and cost benefit ratios.",
    "Summarise the main cost figures in the JSON, including total economic cost across all cohorts and any breakdown between programme cost and opportunity cost. Then interpret the epidemiological outputs, such as the estimated number of graduates, the number of outbreak responses supported per year and the monetary value attached to these outcomes over the planning horizon. Explain how the benefit cost ratios and net present values are calculated by comparing epidemiological and willingness to pay benefits with economic costs. Comment on whether these indicators suggest that the configuration offers good value for money and under what assumptions.",
    "",
    "National scale and implementation picture.",
    "Using the national simulation outputs in the JSON, describe the national picture in narrative terms. Report total numbers of graduates, total economic cost, total indicative epidemiological benefit, net benefits and total willingness to pay across all cohorts. Explain what these figures mean for national level planning, including likely demand on budgets, the scale of response capacity generated and the implied value of avoided outbreaks or strengthened surveillance.",
    "",
    "Equity, feasibility and implementation considerations.",
    "Where the JSON allows, discuss any distributional or feasibility issues that may affect the interpretation of the configuration. Reflect on how mentorship intensity, delivery mode and response time assumptions might affect equity across states or cadres. Highlight any aspects that may support or hinder implementation, such as reliance on online delivery, intensive mentoring requirements or high frontline staffing needs. Suggest practical considerations for phasing, piloting or targeting that could help decision makers turn the scenario into a realistic implementation plan.",
    "",
    "Output format.",
    "Based on the JSON, prepare a structured narrative policy brief of around three to five pages that is written in paragraphs rather than bullet points. Use clear section headings such as Background, Scenario description, Endorsement and preferences, Economic results, National picture, Equity and implementation and Conclusion. Within each section, write in continuous prose without bullet lists. Include a small number of simple tables only where they add clarity, for example a table that summarises key cost and benefit indicators. Write in a style that is suitable for a joint briefing to the Ministry of Health and Family Welfare, the Ministry of Finance and international partners such as the World Bank."
  ].join("\n");

  /* ===========================
     Global state
     =========================== */

  const state = {
    currency: "INR",
    opportunityCostIncluded: true,
    selectedCostConfigId: null,
    advanced: { ...DEFAULT_ADV_SETTINGS },
    currentScenario: null,
    savedScenarios: [],
    charts: {},
    tooltip: {
      el: null,
      arrow: null,
      activeIcon: null
    },
    tour: {
      steps: [],
      currentIndex: 0,
      overlayEl: null,
      popoverEl: null
    }
  };

  /* ===========================
     Formatting helpers
     =========================== */

  function formatINR(value) {
    if (!isFinite(value)) return "-";
    return "INR " + Math.round(value).toLocaleString("en-IN");
  }

  function formatINRMillions(value) {
    if (!isFinite(value)) return "-";
    const millions = value / 1e6;
    return millions.toFixed(2) + " million";
  }

  function formatPercent(value, decimals = 0) {
    if (!isFinite(value)) return "-";
    return value.toFixed(decimals) + "%";
  }

  function formatCurrency(value, currency) {
    if (!isFinite(value)) return "-";
    if (currency === "USD") {
      const usd = value / state.advanced.inrPerUsd;
      return "USD " + Math.round(usd).toLocaleString("en-US");
    }
    return formatINR(value);
  }

  function formatRatio(value) {
    if (!isFinite(value)) return "-";
    return value.toFixed(2);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ===========================
     Tooltip system
     =========================== */

  function initTooltips() {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-bubble tooltip-hidden";
    tooltip.innerHTML = '<p></p><div class="tooltip-arrow"></div>';
    document.body.appendChild(tooltip);

    state.tooltip.el = tooltip;
    state.tooltip.arrow = tooltip.querySelector(".tooltip-arrow");

    const icons = document.querySelectorAll(".info-icon");
    icons.forEach((icon) => {
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTooltip(icon);
      });
      icon.addEventListener("mouseenter", () => {
        showTooltip(icon);
      });
      icon.addEventListener("mouseleave", () => {
        hideTooltip();
      });
    });

    document.addEventListener("click", () => {
      hideTooltip();
    });

    window.addEventListener("resize", () => {
      if (state.tooltip.activeIcon) {
        positionTooltip(state.tooltip.activeIcon);
      }
    });
  }

  function toggleTooltip(icon) {
    if (state.tooltip.activeIcon === icon && !state.tooltip.el.classList.contains("tooltip-hidden")) {
      hideTooltip();
    } else {
      showTooltip(icon);
    }
  }

  function showTooltip(icon) {
    const text = icon.getAttribute("data-tooltip") || icon.getAttribute("title");
    if (!text) return;

    const bubble = state.tooltip.el;
    bubble.querySelector("p").textContent = text;
    bubble.classList.remove("tooltip-hidden");
    bubble.classList.add("tooltip-visible");
    state.tooltip.activeIcon = icon;
    positionTooltip(icon);
  }

  function hideTooltip() {
    const bubble = state.tooltip.el;
    bubble.classList.add("tooltip-hidden");
    bubble.classList.remove("tooltip-visible");
    state.tooltip.activeIcon = null;
  }

  function positionTooltip(icon) {
    const bubble = state.tooltip.el;
    const arrow = state.tooltip.arrow;
    if (!bubble || !arrow) return;

    const rect = icon.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + rect.width / 2 - bubbleRect.width / 2;

    const maxLeft = window.scrollX + document.documentElement.clientWidth - bubbleRect.width - 8;
    const minLeft = window.scrollX + 8;
    left = clamp(left, minLeft, maxLeft);

    bubble.style.top = top + "px";
    bubble.style.left = left + "px";

    arrow.style.left = (rect.left + rect.width / 2 - left - 4) + "px";
    arrow.style.top = "-4px";
  }

  /* ===========================
     Tabs
     =========================== */

  function initTabs() {
    const tabLinks = document.querySelectorAll(".tab-link");
    const panels = document.querySelectorAll(".tab-panel");

    tabLinks.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        if (!target) return;

        tabLinks.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        const panel = document.getElementById("tab-" + target);
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ===========================
     Toast notifications
     =========================== */

  let toastEl = null;
  let toastTimeout = null;

  function ensureToast() {
    if (toastEl) return toastEl;
    const el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
    toastEl = el;
    return el;
  }

  function showToast(message, type = "success") {
    const el = ensureToast();
    el.textContent = message;
    el.className = "toast visible";
    if (type === "success") el.classList.add("toast-success");
    if (type === "warning") el.classList.add("toast-warning");
    if (type === "error") el.classList.add("toast-error");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.classList.remove("visible");
      el.classList.remove("toast-success", "toast-warning", "toast-error");
    }, 3500);
  }

  /* ===========================
     Guided tour
     =========================== */

  function initTour() {
    const trigger = document.getElementById("btn-start-tour");
    if (!trigger) return;

    const steps = Array.from(
      document.querySelectorAll("[data-tour-step]")
    ).map((el, index) => ({
      el,
      step: el.getAttribute("data-tour-step") || "step-" + index,
      title: el.getAttribute("data-tour-title") || "STEPS tour",
      content:
        el.getAttribute("data-tour-content") ||
        "This is part of the STEPS decision aid interface."
    }));

    state.tour.steps = steps;

    const overlay = document.createElement("div");
    overlay.id = "tour-overlay";
    overlay.className = "tour-overlay hidden";

    const popover = document.createElement("div");
    popover.id = "tour-popover";
    popover.className = "tour-popover hidden";
    popover.innerHTML = `
      <div class="tour-popover-header">
        <h3></h3>
        <button type="button" class="tour-close-btn" aria-label="Close tour">×</button>
      </div>
      <div class="tour-popover-body"></div>
      <div class="tour-popover-footer">
        <span class="tour-step-indicator"></span>
        <div class="tour-buttons">
          <button type="button" class="btn-ghost-small" data-tour-prev>Back</button>
          <button type="button" class="btn-primary-small" data-tour-next>Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popover);

    state.tour.overlayEl = overlay;
    state.tour.popoverEl = popover;

    trigger.addEventListener("click", () => {
      if (!state.tour.steps.length) return;
      state.tour.currentIndex = 0;
      openTourStep(0);
    });

    overlay.addEventListener("click", endTour);
    popover.querySelector(".tour-close-btn").addEventListener("click", endTour);
    popover.querySelector("[data-tour-prev]").addEventListener("click", () => {
      if (state.tour.currentIndex > 0) {
        state.tour.currentIndex -= 1;
        openTourStep(state.tour.currentIndex);
      }
    });
    popover.querySelector("[data-tour-next"]).addEventListener("click", () => {
      if (state.tour.currentIndex < state.tour.steps.length - 1) {
        state.tour.currentIndex += 1;
        openTourStep(state.tour.currentIndex);
      } else {
        endTour();
      }
    });

    window.addEventListener("resize", () => {
      if (!overlay.classList.contains("hidden")) {
        openTourStep(state.tour.currentIndex);
      }
    });
  }

  function openTourStep(index) {
    const overlay = state.tour.overlayEl;
    const popover = state.tour.popoverEl;
    if (!overlay || !popover) return;

    const step = state.tour.steps[index];
    if (!step) return;

    overlay.classList.remove("hidden");
    popover.classList.remove("hidden");

    const titleEl = popover.querySelector(".tour-popover-header h3");
    const bodyEl = popover.querySelector(".tour-popover-body");
    const indicatorEl = popover.querySelector(".tour-step-indicator");

    titleEl.textContent = step.title;
    bodyEl.textContent = step.content;
    indicatorEl.textContent = "Step " + (index + 1) + " of " + state.tour.steps.length;

    const rect = step.el.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();

    let top = rect.bottom + window.scrollY + 10;
    let left = rect.left + window.scrollX + rect.width / 2 - popRect.width / 2;

    const maxLeft = window.scrollX + document.documentElement.clientWidth - popRect.width - 8;
    const minLeft = window.scrollX + 8;
    left = clamp(left, minLeft, maxLeft);

    if (top + popRect.height > window.scrollY + window.innerHeight) {
      top = rect.top + window.scrollY - popRect.height - 10;
    }

    popover.style.top = top + "px";
    popover.style.left = left + "px";

    step.el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function endTour() {
    if (state.tour.overlayEl) state.tour.overlayEl.classList.add("hidden");
    if (state.tour.popoverEl) state.tour.popoverEl.classList.add("hidden");
  }

  /* ===========================
     Charts
     =========================== */

  function getChartCtx(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function createOrUpdateChart(key, id, config) {
    const ctx = getChartCtx(id);
    if (!ctx) return;
    if (state.charts[key]) {
      state.charts[key].data = config.data;
      state.charts[key].options = config.options || {};
      state.charts[key].update();
      return;
    }
    state.charts[key] = new Chart(ctx, config);
  }

  /* ===========================
     Config reading and core model
     =========================== */

  function readConfigFromForm() {
    const tier = document.getElementById("program-tier").value;
    const career = document.getElementById("career-track").value;
    const mentorship = document.getElementById("mentorship").value;
    const delivery = document.getElementById("delivery").value;
    const response = document.getElementById("response").value;
    const costSlider = document.getElementById("cost-slider");
    const trainees = Number(document.getElementById("trainees").value) || 0;
    const cohorts = Number(document.getElementById("cohorts").value) || 0;
    const scenarioName = document.getElementById("scenario-name").value.trim();
    const scenarioNotes = document.getElementById("scenario-notes").value.trim();

    const costPerTraineePerMonth = Number(costSlider.value) || 0;
    const months = TIER_MONTHS[tier] || 0;

    const programmeCostPerCohort = costPerTraineePerMonth * trainees * months;

    const template = getCurrentCostTemplate(tier);
    const oppRate = template ? template.oppRate : 0;
    const economicCostPerCohort = state.opportunityCostIncluded
      ? programmeCostPerCohort * (1 + oppRate)
      : programmeCostPerCohort;

    return {
      tier,
      career,
      mentorship,
      delivery,
      response: response,
      responseNumeric: Number(response),
      costPerTraineePerMonth,
      traineesPerCohort: trainees,
      cohorts,
      months,
      programmeCostPerCohort,
      economicCostPerCohort,
      scenarioName: scenarioName || buildScenarioNameFromConfig({ tier, mentorship, cohorts }),
      scenarioNotes
    };
  }

  function buildScenarioNameFromConfig(cfg) {
    const tierLabel =
      cfg.tier === "frontline"
        ? "Frontline"
        : cfg.tier === "intermediate"
        ? "Intermediate"
        : "Advanced";
    const mentorshipLabel =
      cfg.mentorship === "high"
        ? "high mentorship"
        : cfg.mentorship === "medium"
        ? "medium mentorship"
        : "low mentorship";
    return tierLabel + " " + mentorshipLabel + " " + cfg.cohorts + " cohorts";
  }

  function getCurrentCostTemplate(tier) {
    if (COST_CONFIG && COST_CONFIG[tier]) {
      return COST_CONFIG[tier];
    }
    const group = COST_TEMPLATES[tier];
    if (!group) return null;
    const template = group.combined;
    return template || null;
  }

  function computeEndorsementAndWTP(cfg) {
    const tierEffect = MXL_COEFS.tier[cfg.tier] || 0;
    const careerEffect = MXL_COEFS.career[cfg.career] || 0;
    const mentorshipEffect = MXL_COEFS.mentorship[cfg.mentorship] || 0;
    const deliveryEffect = MXL_COEFS.delivery[cfg.delivery] || 0;
    const responseEffect = MXL_COEFS.response[cfg.responseNumeric] || 0;

    const nonCostUtility =
      tierEffect + careerEffect + mentorshipEffect + deliveryEffect + responseEffect;

    const costTerm = MXL_COEFS.costPerThousand * (cfg.costPerTraineePerMonth / 1000);

    const utilityProgram = MXL_COEFS.ascProgram + nonCostUtility + costTerm;
    const utilityOptOut = MXL_COEFS.ascOptOut;

    const expP = Math.exp(utilityProgram);
    const expO = Math.exp(utilityOptOut);
    const endorsementRate = expP / (expP + expO);
    const optOutRate = expO / (expP + expO);

    const wtpPerThousand = nonCostUtility / -MXL_COEFS.costPerThousand;
    const wtpPerTraineePerMonth = wtpPerThousand * 1000;

    const totalWtpPerCohort =
      wtpPerTraineePerMonth * cfg.traineesPerCohort * cfg.months;
    const totalWtpAllCohorts = totalWtpPerCohort * cfg.cohorts;

    return {
      nonCostUtility,
      endorsementRate,
      optOutRate,
      wtpPerTraineePerMonth,
      totalWtpPerCohort,
      totalWtpAllCohorts
    };
  }

  function computeEpiAndEconomic(cfg, endorsementRate) {
    const adv = state.advanced;
    const completionRate = adv.completionRate;
    const outbreaksPerGraduatePerYear = adv.outbreaksPerGraduatePerYear;
    const valuePerGraduate = adv.valuePerGraduate;
    const valuePerOutbreak = adv.valuePerOutbreak;
    const planningHorizonYears = adv.planningHorizonYears;
    const discountRate = adv.epiDiscountRate;

    const expectedGraduates =
      cfg.traineesPerCohort *
      cfg.cohorts *
      endorsementRate *
      completionRate;

    const responseMultiplier = RESPONSE_TIME_MULTIPLIERS[String(cfg.responseNumeric)] || 1;

    const presentValueYears =
      discountRate > 0
        ? (1 - Math.pow(1 + discountRate / 100, -planningHorizonYears)) /
          (discountRate / 100)
        : planningHorizonYears;

    const totalOutbreakResponsesAllYears =
      expectedGraduates *
      outbreaksPerGraduatePerYear *
      responseMultiplier *
      presentValueYears;

    const gradBenefitAllCohorts = expectedGraduates * valuePerGraduate;
    const outbreakBenefitAllCohorts =
      totalOutbreakResponsesAllYears * valuePerOutbreak;

    const epiBenefitAllCohorts = gradBenefitAllCohorts + outbreakBenefitAllCohorts;

    const epiBenefitPerCohort =
      cfg.cohorts > 0 ? epiBenefitAllCohorts / cfg.cohorts : 0;

    const economicCostPerCohort = cfg.economicCostPerCohort;
    const totalEconomicCostAllCohorts = economicCostPerCohort * cfg.cohorts;

    const netBenefitPerCohort = epiBenefitPerCohort - economicCostPerCohort;
    const netBenefitAllCohorts = epiBenefitAllCohorts - totalEconomicCostAllCohorts;

    const bcrPerCohort =
      economicCostPerCohort > 0
        ? epiBenefitPerCohort / economicCostPerCohort
        : NaN;

    const natBcr =
      totalEconomicCostAllCohorts > 0
        ? epiBenefitAllCohorts / totalEconomicCostAllCohorts
        : NaN;

    const natGraduates = expectedGraduates;
    const natOutbreaksPerYear =
      expectedGraduates * outbreaksPerGraduatePerYear * responseMultiplier;

    return {
      expectedGraduates,
      natGraduates,
      totalOutbreakResponsesAllYears,
      natOutbreaksPerYear,
      gradBenefitAllCohorts,
      outbreakBenefitAllCohorts,
      epiBenefitPerCohort,
      epiBenefitAllCohorts,
      economicCostPerCohort,
      totalEconomicCostAllCohorts,
      netBenefitPerCohort,
      netBenefitAllCohorts,
      bcrPerCohort,
      natBcr
    };
  }

  function buildScenarioObject(cfg, pref, epi) {
    return {
      id: "scenario_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      name: cfg.scenarioName,
      notes: cfg.scenarioNotes,
      tier: cfg.tier,
      career: cfg.career,
      mentorship: cfg.mentorship,
      delivery: cfg.delivery,
      responseDays: cfg.responseNumeric,
      costPerTraineePerMonth: cfg.costPerTraineePerMonth,
      traineesPerCohort: cfg.traineesPerCohort,
      cohorts: cfg.cohorts,
      months: cfg.months,
      programmeCostPerCohort: cfg.programmeCostPerCohort,
      economicCostPerCohort: epi.economicCostPerCohort,
      totalEconomicCostAllCohorts: epi.totalEconomicCostAllCohorts,
      endorsementRate: pref.endorsementRate,
      optOutRate: pref.optOutRate,
      wtpPerTraineePerMonth: pref.wtpPerTraineePerMonth,
      totalWtpPerCohort: pref.totalWtpPerCohort,
      totalWtpAllCohorts: pref.totalWtpAllCohorts,
      expectedGraduates: epi.expectedGraduates,
      natGraduates: epi.natGraduates,
      totalOutbreakResponsesAllYears: epi.totalOutbreakResponsesAllYears,
      natOutbreaksPerYear: epi.natOutbreaksPerYear,
      gradBenefitAllCohorts: epi.gradBenefitAllCohorts,
      outbreakBenefitAllCohorts: epi.outbreakBenefitAllCohorts,
      epiBenefitPerCohort: epi.epiBenefitPerCohort,
      epiBenefitAllCohorts: epi.epiBenefitAllCohorts,
      netBenefitPerCohort: epi.netBenefitPerCohort,
      netBenefitAllCohorts: epi.netBenefitAllCohorts,
      bcrPerCohort: epi.bcrPerCohort,
      natBcr: epi.natBcr,
      currency: state.currency,
      opportunityCostIncluded: state.opportunityCostIncluded,
      advancedSettingsSnapshot: { ...state.advanced }
    };
  }

  /* ===========================
     Configuration and UI wiring
     =========================== */

  function initConfigControls() {
    const costSlider = document.getElementById("cost-slider");
    const costDisplay = document.getElementById("cost-display");
    const oppToggle = document.getElementById("opp-toggle");
    const currencyLabel = document.getElementById("currency-label");
    const currencyToggles = document.querySelectorAll(".pill-toggle[data-currency]");
    const applyBtn = document.getElementById("update-results");
    const snapshotBtn = document.getElementById("open-snapshot");
    const saveBtn = document.getElementById("save-scenario");

    if (costSlider && costDisplay) {
      costSlider.addEventListener("input", () => {
        updateCostSliderDisplay();
      });
      updateCostSliderDisplay();
    }

    if (oppToggle) {
      oppToggle.addEventListener("click", () => {
        state.opportunityCostIncluded = !state.opportunityCostIncluded;
        oppToggle.classList.toggle("on", state.opportunityCostIncluded);
        const labelEl = oppToggle.querySelector(".switch-label");
        if (labelEl) {
          labelEl.textContent = state.opportunityCostIncluded
            ? "Opportunity cost included"
            : "Opportunity cost excluded";
        }
        if (state.currentScenario) {
          handleApplyConfiguration(false);
        }
      });
    }

    if (currencyToggles.length) {
      currencyToggles.forEach((btn) => {
        btn.addEventListener("click", () => {
          const currency = btn.getAttribute("data-currency");
          if (!currency) return;
          state.currency = currency;
          currencyToggles.forEach((b) =>
            b.classList.toggle("active", b === btn)
          );
          if (currencyLabel) {
            currencyLabel.textContent = currency;
          }
          updateCostSliderDisplay();
          if (state.currentScenario) {
            refreshAllDisplaysFromScenario();
          }
        });
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        handleApplyConfiguration(true);
      });
    }

    if (snapshotBtn) {
      snapshotBtn.addEventListener("click", () => {
        openSnapshotModal();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        saveCurrentScenario();
      });
    }

    const tierSelect = document.getElementById("program-tier");
    if (tierSelect) {
      tierSelect.addEventListener("change", () => {
        populateCostSourceSelect();
      });
    }

    const videoIframe = document.getElementById("steps-video");
    if (videoIframe && !videoIframe.src) {
      videoIframe.src = STEPS_VIDEO_EMBED_URL;
    }

    populateCostSourceSelect();
  }

  function updateCostSliderDisplay() {
    const slider = document.getElementById("cost-slider");
    const display = document.getElementById("cost-display");
    if (!slider || !display) return;
    const value = Number(slider.value) || 0;
    display.textContent = formatCurrency(value, state.currency);
  }

  function populateCostSourceSelect() {
    const tier = document.getElementById("program-tier")
      ? document.getElementById("program-tier").value
      : "frontline";
    const select = document.getElementById("cost-source");
    if (!select) return;

    select.innerHTML = "";
    let templatesForTier = null;

    if (COST_CONFIG && COST_CONFIG[tier]) {
      templatesForTier = [COST_CONFIG[tier]];
    } else if (COST_TEMPLATES[tier]) {
      templatesForTier = Object.values(COST_TEMPLATES[tier]);
    }

    if (templatesForTier && templatesForTier.length) {
      templatesForTier.forEach((tpl) => {
        const opt = document.createElement("option");
        opt.value = tpl.id;
        opt.textContent = tpl.label;
        select.appendChild(opt);
      });
      state.selectedCostConfigId = templatesForTier[0].id;
      select.value = state.selectedCostConfigId;
    }

    select.addEventListener("change", () => {
      state.selectedCostConfigId = select.value;
      if (state.currentScenario) {
        handleApplyConfiguration(false);
      }
    });
  }

  /* ===========================
     Advanced settings
     =========================== */

  function initAdvancedSettings() {
    const vGrad = document.getElementById("adv-value-per-graduate");
    const vOut = document.getElementById("adv-value-per-outbreak");
    const compRate = document.getElementById("adv-completion-rate");
    const outPerGrad = document.getElementById("adv-outbreaks-per-graduate");
    const horizon = document.getElementById("adv-planning-horizon");
    const disc = document.getElementById("adv-epi-discount-rate");
    const usdRate = document.getElementById("adv-usd-rate");

    if (vGrad) vGrad.value = DEFAULT_ADV_SETTINGS.valuePerGraduate;
    if (vOut) vOut.value = DEFAULT_ADV_SETTINGS.valuePerOutbreak;
    if (compRate) compRate.value = DEFAULT_ADV_SETTINGS.completionRate * 100;
    if (outPerGrad) outPerGrad.value = DEFAULT_ADV_SETTINGS.outbreaksPerGraduatePerYear;
    if (horizon) horizon.value = DEFAULT_ADV_SETTINGS.planningHorizonYears;
    if (disc) disc.value = DEFAULT_ADV_SETTINGS.epiDiscountRate * 100;
    if (usdRate) usdRate.value = DEFAULT_ADV_SETTINGS.inrPerUsd;

    const applyBtn = document.getElementById("adv-apply-settings");
    const resetBtn = document.getElementById("adv-reset-settings");

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        applyAdvancedSettings();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetAdvancedSettings();
      });
    }

    logAdvancedSettings("Initial default settings applied.");
  }

  function applyAdvancedSettings() {
    const vGrad = Number(
      document.getElementById("adv-value-per-graduate").value
    );
    const vOut = Number(
      document.getElementById("adv-value-per-outbreak").value
    );
    const compRate = Number(
      document.getElementById("adv-completion-rate").value
    );
    const outPerGrad = Number(
      document.getElementById("adv-outbreaks-per-graduate").value
    );
    const horizon = Number(
      document.getElementById("adv-planning-horizon").value
    );
    const disc = Number(
      document.getElementById("adv-epi-discount-rate").value
    );
    const usdRate = Number(
      document.getElementById("adv-usd-rate").value
    );

    state.advanced.valuePerGraduate = vGrad > 0 ? vGrad : DEFAULT_ADV_SETTINGS.valuePerGraduate;
    state.advanced.valuePerOutbreak = vOut > 0 ? vOut : DEFAULT_ADV_SETTINGS.valuePerOutbreak;
    state.advanced.completionRate =
      compRate > 0 ? Math.min(compRate, 100) / 100 : DEFAULT_ADV_SETTINGS.completionRate;
    state.advanced.outbreaksPerGraduatePerYear =
      outPerGrad >= 0 ? outPerGrad : DEFAULT_ADV_SETTINGS.outbreaksPerGraduatePerYear;
    state.advanced.planningHorizonYears =
      horizon > 0 ? horizon : DEFAULT_ADV_SETTINGS.planningHorizonYears;
    state.advanced.epiDiscountRate =
      disc >= 0 ? disc / 100 : DEFAULT_ADV_SETTINGS.epiDiscountRate;
    state.advanced.inrPerUsd =
      usdRate > 0 ? usdRate : DEFAULT_ADV_SETTINGS.inrPerUsd;

    logAdvancedSettings("Advanced settings updated.");
    showToast("Advanced settings applied.", "success");

    if (state.currentScenario) {
      handleApplyConfiguration(false);
    }
  }

  function resetAdvancedSettings() {
    state.advanced = { ...DEFAULT_ADV_SETTINGS };

    document.getElementById("adv-value-per-graduate").value =
      DEFAULT_ADV_SETTINGS.valuePerGraduate;
    document.getElementById("adv-value-per-outbreak").value =
      DEFAULT_ADV_SETTINGS.valuePerOutbreak;
    document.getElementById("adv-completion-rate").value =
      DEFAULT_ADV_SETTINGS.completionRate * 100;
    document.getElementById("adv-outbreaks-per-graduate").value =
      DEFAULT_ADV_SETTINGS.outbreaksPerGraduatePerYear;
    document.getElementById("adv-planning-horizon").value =
      DEFAULT_ADV_SETTINGS.planningHorizonYears;
    document.getElementById("adv-epi-discount-rate").value =
      DEFAULT_ADV_SETTINGS.epiDiscountRate * 100;
    document.getElementById("adv-usd-rate").value =
      DEFAULT_ADV_SETTINGS.inrPerUsd;

    logAdvancedSettings("Advanced settings reset to defaults.");
    showToast("Advanced settings reset to defaults.", "success");

    if (state.currentScenario) {
      handleApplyConfiguration(false);
    }
  }

  function logAdvancedSettings(msg) {
    const logBox = document.getElementById("adv-settings-log");
    if (!logBox) return;
    const time = new Date().toLocaleString();
    const entry = document.createElement("div");
    entry.textContent = "[" + time + "] " + msg;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }

  /* ===========================
     Apply configuration
     =========================== */

  function handleApplyConfiguration(showMessage) {
    const cfg = readConfigFromForm();

    if (!cfg.traineesPerCohort || !cfg.cohorts) {
      if (showMessage) {
        showToast("Please enter trainees per cohort and number of cohorts.", "warning");
      }
      return;
    }

    const pref = computeEndorsementAndWTP(cfg);
    const epi = computeEpiAndEconomic(cfg, pref.endorsementRate);
    const scenario = buildScenarioObject(cfg, pref, epi);

    state.currentScenario = scenario;

    updateConfigSummary(scenario);
    updateResultsTab(scenario);
    updateCostingTab(scenario);
    updateNationalSimulationTab(scenario);
    updateSensitivityTables();
    refreshCharts(scenario);
    refreshCopilotStatus();

    if (showMessage) {
      showToast("Configuration applied and results updated.", "success");
    }
  }

  function refreshAllDisplaysFromScenario() {
    if (!state.currentScenario) return;
    updateConfigSummary(state.currentScenario);
    updateResultsTab(state.currentScenario);
    updateCostingTab(state.currentScenario);
    updateNationalSimulationTab(state.currentScenario);
    updateSensitivityTables();
    refreshCharts(state.currentScenario);
    refreshCopilotStatus();
  }

  /* ===========================
     Configuration summary card
     =========================== */

  function updateConfigSummary(scenario) {
    const container = document.getElementById("config-summary");
    const endorsementEl = document.getElementById("config-endorsement-value");
    const statusTag = document.getElementById("headline-status-tag");
    const headlineText = document.getElementById("headline-recommendation");
    const briefingText = document.getElementById("headline-briefing-text");

    if (!container || !endorsementEl || !statusTag || !headlineText || !briefingText) {
      return;
    }

    container.innerHTML = "";

    const rows = [
      {
        label: "Programme tier",
        value:
          scenario.tier === "frontline"
            ? "Frontline (3 months)"
            : scenario.tier === "intermediate"
            ? "Intermediate (12 months)"
            : "Advanced (24 months)"
      },
      {
        label: "Career incentive",
        value:
          scenario.career === "certificate"
            ? "Government and partner certificate"
            : scenario.career === "uniqual"
            ? "University qualification"
            : "Government career pathway"
      },
      {
        label: "Mentorship intensity",
        value:
          scenario.mentorship === "high"
            ? "High (maximum 2 fellows per mentor)"
            : scenario.mentorship === "medium"
            ? "Medium (3 to 4 fellows per mentor)"
            : "Low (5 or more fellows per mentor)"
      },
      {
        label: "Mode of delivery",
        value:
          scenario.delivery === "blended"
            ? "Blended"
            : scenario.delivery === "inperson"
            ? "Fully in person"
            : "Fully online"
      },
      {
        label: "Expected response time",
        value:
          scenario.responseDays === 7
            ? "Detect and respond within 7 days"
            : scenario.responseDays === 15
            ? "Detect and respond within 15 days"
            : "Detect and respond within 30 days"
      },
      {
        label: "Cohorts and trainees",
        value:
          scenario.cohorts +
          " cohort(s) with " +
          scenario.traineesPerCohort +
          " trainees each"
      },
      {
        label: "Cost per trainee per month",
        value: formatCurrency(
          scenario.costPerTraineePerMonth,
          state.currency
        )
      },
      {
        label: "Programme cost per cohort",
        value: formatCurrency(
          scenario.programmeCostPerCohort,
          state.currency
        )
      },
      {
        label: "Economic cost per cohort",
        value: formatCurrency(
          scenario.economicCostPerCohort,
          state.currency
        )
      }
    ];

    rows.forEach((row) => {
      const div = document.createElement("div");
      div.className = "config-summary-row";
      div.innerHTML =
        '<span class="config-summary-label">' +
        row.label +
        '</span><span class="config-summary-value">' +
        row.value +
        "</span>";
      container.appendChild(div);
    });

    const endorsementPercent = scenario.endorsementRate * 100;
    endorsementEl.textContent = formatPercent(endorsementPercent, 1);

    statusTag.classList.remove(
      "status-neutral",
      "status-good",
      "status-warning",
      "status-poor"
    );

    let statusClass = "status-neutral";
    let statusText = "Configuration under review";
    let headline = "";

    if (endorsementPercent >= 70 && scenario.bcrPerCohort >= 1.2) {
      statusClass = "status-good";
      statusText = "Promising configuration";
      headline =
        "This configuration combines strong stakeholder endorsement with a favourable epidemiological benefit cost ratio. It is a good candidate for national scale up discussions.";
    } else if (endorsementPercent >= 50 && scenario.bcrPerCohort >= 1.0) {
      statusClass = "status-warning";
      statusText = "Moderate support and viable ratios";
      headline =
        "Stakeholder support and epidemiological benefits are broadly aligned with costs. The configuration may be suitable for targeted or phased implementation, subject to budget envelope and distributional considerations.";
    } else {
      statusClass = "status-poor";
      statusText = "Caution for scale up";
      headline =
        "On current assumptions, either endorsement or the epidemiological benefit cost ratio is modest. This configuration may require revision of mentorship, response time or cost levels before forming the basis of a national investment case.";
    }

    statusTag.classList.add(statusClass);
    statusTag.textContent = statusText;
    headlineText.textContent = headline;

    const brief =
      "For this scenario, the mixed logit preference model predicts that about " +
      formatPercent(endorsementPercent, 1) +
      " of stakeholders would endorse the FETP option, with the remainder preferring to opt out. " +
      "Programme cost per cohort is approximately " +
      formatCurrency(scenario.programmeCostPerCohort, state.currency) +
      ", rising to " +
      formatCurrency(scenario.economicCostPerCohort, state.currency) +
      " once opportunity cost is included. " +
      "Across all cohorts, total economic cost is " +
      formatINRMillions(scenario.totalEconomicCostAllCohorts) +
      " and the indicative epidemiological benefit is " +
      formatINRMillions(scenario.epiBenefitAllCohorts) +
      ", giving a benefit cost ratio of " +
      formatRatio(scenario.natBcr) +
      " under the assumptions set in the Advanced and methods tab.";

    briefingText.textContent = brief;
  }

  /* ===========================
     Results tab
     =========================== */

  function updateResultsTab(scenario) {
    const endorsementRateEl = document.getElementById("endorsement-rate");
    const optOutRateEl = document.getElementById("optout-rate");
    const wtpPerTraineeEl = document.getElementById("wtp-per-trainee");
    const wtpTotalCohortEl = document.getElementById("wtp-total-cohort");
    const progCostPerCohortEl = document.getElementById("prog-cost-per-cohort");
    const totalCostEl = document.getElementById("total-cost");
    const netBenefitEl = document.getElementById("net-benefit");
    const bcrEl = document.getElementById("bcr");
    const epiGradEl = document.getElementById("epi-graduates");
    const epiOutbreaksEl = document.getElementById("epi-outbreaks");
    const epiBenefitEl = document.getElementById("epi-benefit");

    if (!endorsementRateEl) return;

    endorsementRateEl.textContent = formatPercent(
      scenario.endorsementRate * 100,
      1
    );
    optOutRateEl.textContent = formatPercent(
      scenario.optOutRate * 100,
      1
    );

    wtpPerTraineeEl.textContent = formatCurrency(
      scenario.wtpPerTraineePerMonth,
      state.currency
    );
    wtpTotalCohortEl.textContent = formatCurrency(
      scenario.totalWtpPerCohort,
      state.currency
    );

    progCostPerCohortEl.textContent = formatCurrency(
      scenario.programmeCostPerCohort,
      state.currency
    );
    totalCostEl.textContent = formatCurrency(
      scenario.economicCostPerCohort,
      state.currency
    );

    netBenefitEl.textContent = formatCurrency(
      scenario.netBenefitPerCohort,
      state.currency
    );
    bcrEl.textContent = formatRatio(scenario.bcrPerCohort);

    epiGradEl.textContent = Math.round(
      scenario.expectedGraduates
    ).toLocaleString("en-IN");
    epiOutbreaksEl.textContent = scenario.natOutbreaksPerYear.toFixed(1);
    epiBenefitEl.textContent = formatCurrency(
      scenario.epiBenefitPerCohort,
      state.currency
    );
  }

  /* ===========================
     Costing tab
     =========================== */

  function updateCostingTab(scenario) {
    const summaryBox = document.getElementById("cost-breakdown-summary");
    const tbody = document.getElementById("cost-components-list");
    const select = document.getElementById("cost-source");
    if (!summaryBox || !tbody) return;

    const template = getCurrentCostTemplate(scenario.tier);
    tbody.innerHTML = "";
    summaryBox.innerHTML = "";

    const summaryCards = [];

    summaryCards.push({
      label: "Programme cost per cohort",
      value: formatCurrency(scenario.programmeCostPerCohort, state.currency)
    });

    summaryCards.push({
      label: "Economic cost per cohort",
      value: formatCurrency(scenario.economicCostPerCohort, state.currency)
    });

    const oppIncludedText = state.opportunityCostIncluded
      ? "Opportunity cost is included in economic cost for this view."
      : "Opportunity cost is excluded. Results focus on financial cost only.";

    summaryCards.push({
      label: "Opportunity cost treatment",
      value: oppIncludedText
    });

    if (template) {
      summaryCards.push({
        label: "Cost template",
        value: template.label
      });
    }

    summaryCards.forEach((card) => {
      const div = document.createElement("div");
      div.className = "cost-summary-card";
      div.innerHTML =
        '<div class="cost-summary-label">' +
        card.label +
        '</div><div class="cost-summary-value">' +
        card.value +
        "</div>";
      summaryBox.appendChild(div);
    });

    if (!template) return;

    const directCost = scenario.programmeCostPerCohort;
    const oppAmount = directCost * template.oppRate;
    const totalEconomic = state.opportunityCostIncluded
      ? directCost + oppAmount
      : directCost;

    template.components.forEach((comp) => {
      const row = document.createElement("tr");

      const share = comp.directShare || 0;
      const amountPerCohort = directCost * share;
      const amountPerTraineePerMonth =
        scenario.traineesPerCohort > 0 && scenario.months > 0
          ? amountPerCohort / (scenario.traineesPerCohort * scenario.months)
          : 0;

      row.innerHTML = `
        <td>${comp.label}</td>
        <td class="numeric-cell">${(share * 100).toFixed(1)}%</td>
        <td class="numeric-cell">${formatCurrency(
          amountPerCohort,
          state.currency
        )}</td>
        <td class="numeric-cell">${formatCurrency(
          amountPerTraineePerMonth,
          state.currency
        )}</td>
        <td>Included in programme cost template for this tier.</td>
      `;
      tbody.appendChild(row);
    });

    const oppRow = document.createElement("tr");
    oppRow.innerHTML = `
      <td>Implied opportunity cost of trainee time</td>
      <td class="numeric-cell">${(template.oppRate * 100).toFixed(1)}%</td>
      <td class="numeric-cell">${formatCurrency(
        oppAmount,
        state.currency
      )}</td>
      <td class="numeric-cell">${
        scenario.traineesPerCohort > 0 && scenario.months > 0
          ? formatCurrency(
              oppAmount / (scenario.traineesPerCohort * scenario.months),
              state.currency
            )
          : "-"
      }</td>
      <td>${
        state.opportunityCostIncluded
          ? "Added to programme cost when the opportunity cost switch is on."
          : "Shown for information. Not included in economic cost in this view."
      }</td>
    `;
    tbody.appendChild(oppRow);

    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td><strong>Total economic cost per cohort</strong></td>
      <td class="numeric-cell"></td>
      <td class="numeric-cell"><strong>${formatCurrency(
        totalEconomic,
        state.currency
      )}</strong></td>
      <td class="numeric-cell"></td>
      <td>Programme cost plus opportunity cost where included.</td>
    `;
    tbody.appendChild(totalRow);
  }

  /* ===========================
     National simulation tab
     =========================== */

  function updateNationalSimulationTab(scenario) {
    const totalCostEl = document.getElementById("nat-total-cost");
    const totalBenefitEl = document.getElementById("nat-total-benefit");
    const netBenefitEl = document.getElementById("nat-net-benefit");
    const bcrEl = document.getElementById("nat-bcr");
    const totalWtpEl = document.getElementById("nat-total-wtp");
    const natGradEl = document.getElementById("nat-graduates");
    const natOutbreaksEl = document.getElementById("nat-outbreaks");
    const summaryTextEl = document.getElementById("natsim-summary-text");

    if (!totalCostEl) return;

    totalCostEl.textContent = formatCurrency(
      scenario.totalEconomicCostAllCohorts,
      state.currency
    );
    totalBenefitEl.textContent = formatCurrency(
      scenario.epiBenefitAllCohorts,
      state.currency
    );
    netBenefitEl.textContent = formatCurrency(
      scenario.netBenefitAllCohorts,
      state.currency
    );
    bcrEl.textContent = formatRatio(scenario.natBcr);
    totalWtpEl.textContent = formatCurrency(
      scenario.totalWtpAllCohorts,
      state.currency
    );
    natGradEl.textContent = Math.round(
      scenario.natGraduates
    ).toLocaleString("en-IN");
    natOutbreaksEl.textContent = scenario.natOutbreaksPerYear.toFixed(1);

    if (summaryTextEl) {
      summaryTextEl.textContent =
        "At national scale, this configuration would produce around " +
        Math.round(scenario.natGraduates).toLocaleString("en-IN") +
        " graduates, supporting approximately " +
        scenario.natOutbreaksPerYear.toFixed(1) +
        " outbreak responses per year once all cohorts are complete. " +
        "Total economic cost across all cohorts is " +
        formatINRMillions(scenario.totalEconomicCostAllCohorts) +
        " and the indicative epidemiological benefit is " +
        formatINRMillions(scenario.epiBenefitAllCohorts) +
        ". This implies a benefit cost ratio of " +
        formatRatio(scenario.natBcr) +
        " and a net epidemiological benefit of " +
        formatINRMillions(scenario.netBenefitAllCohorts) +
        " under the planning horizon and discount rate specified in the Advanced and methods tab. " +
        "Total willingness to pay across all cohorts is " +
        formatINRMillions(scenario.totalWtpAllCohorts) +
        ", which summarises how strongly stakeholders value the configuration in monetary terms.";
    }
  }

  /* ===========================
     Charts update
     =========================== */

  function refreshCharts(scenario) {
    createOrUpdateChart("uptake", "chart-uptake", {
      type: "doughnut",
      data: {
        labels: ["Endorse FETP option", "Choose opt out"],
        datasets: [
          {
            data: [
              scenario.endorsementRate * 100,
              scenario.optOutRate * 100
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const label = ctx.label || "";
                const value = ctx.parsed;
                return label + ": " + value.toFixed(1) + "%";
              }
            }
          }
        }
      }
    });

    createOrUpdateChart("bcr", "chart-bcr", {
      type: "bar",
      data: {
        labels: ["Per cohort"],
        datasets: [
          {
            label: "Economic cost",
            data: [scenario.economicCostPerCohort]
          },
          {
            label: "Epidemiological benefit",
            data: [scenario.epiBenefitPerCohort]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return (
                  ctx.dataset.label +
                  ": " +
                  formatCurrency(ctx.parsed.y, state.currency)
                );
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return (value / 1e6).toFixed(1) + "m";
              }
            }
          }
        }
      }
    });

    createOrUpdateChart("epi", "chart-epi", {
      type: "bar",
      data: {
        labels: ["Graduates", "Outbreak responses per year"],
        datasets: [
          {
            label: "Count",
            data: [scenario.expectedGraduates, scenario.natOutbreaksPerYear]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    createOrUpdateChart("natCostBenefit", "chart-nat-cost-benefit", {
      type: "bar",
      data: {
        labels: ["National total"],
        datasets: [
          {
            label: "Economic cost",
            data: [scenario.totalEconomicCostAllCohorts]
          },
          {
            label: "Epidemiological benefit",
            data: [scenario.epiBenefitAllCohorts]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return (
                  ctx.dataset.label +
                  ": " +
                  formatCurrency(ctx.parsed.y, state.currency)
                );
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return (value / 1e6).toFixed(1) + "m";
              }
            }
          }
        }
      }
    });

    createOrUpdateChart("natEpi", "chart-nat-epi", {
      type: "bar",
      data: {
        labels: ["Graduates", "Outbreak responses per year"],
        datasets: [
          {
            label: "National count",
            data: [scenario.natGraduates, scenario.natOutbreaksPerYear]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /* ===========================
     Saved scenarios
     =========================== */

  function saveCurrentScenario() {
    if (!state.currentScenario) {
      showToast("Apply a configuration before saving a scenario.", "warning");
      return;
    }
    const scenarioCopy = {
      ...state.currentScenario,
      id:
        "scenario_saved_" +
        Date.now() +
        "_" +
        Math.floor(Math.random() * 100000),
      shortlisted: false
    };
    state.savedScenarios.push(scenarioCopy);
    updateScenarioTable();
    updateSensitivityTables();
    showToast("Scenario saved for comparison and export.", "success");
  }

  function initScenarios() {
    const exportExcelBtn = document.getElementById("export-excel");
    const exportPdfBtn = document.getElementById("export-pdf");
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener("click", exportScenariosToExcel);
    }
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", exportScenariosToPdf);
    }
  }

  function updateScenarioTable() {
    const table = document.getElementById("scenario-table");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const scenarios = [];
    if (state.currentScenario) {
      scenarios.push({ ...state.currentScenario, isCurrent: true });
    }
    scenarios.push(...state.savedScenarios);

    scenarios.forEach((sc) => {
      const row = document.createElement("tr");

      const tierChip =
        sc.tier === "frontline"
          ? "Frontline"
          : sc.tier === "intermediate"
          ? "Intermediate"
          : "Advanced";

      const mentorshipChip =
        sc.mentorship === "high"
          ? "High mentorship"
          : sc.mentorship === "medium"
          ? "Medium mentorship"
          : "Low mentorship";

      const incentiveChip =
        sc.career === "certificate"
          ? "Certificate"
          : sc.career === "uniqual"
          ? "University"
          : "Career pathway";

      const tagsCell =
        '<span class="chip chip-tier">' +
        tierChip +
        '</span><span class="chip chip-mentorship">' +
        mentorshipChip +
        '</span><span class="chip chip-incentive">' +
        incentiveChip +
        "</span>";

      const shortlistChecked =
        sc.shortlisted && !sc.isCurrent ? 'checked="checked"' : "";

      row.innerHTML = `
        <td>
          ${
            sc.isCurrent
              ? '<span class="tag tag-strong">Current</span>'
              : '<input type="checkbox" data-scenario-id="' +
                sc.id +
                '" ' +
                shortlistChecked +
                ">"
          }
        </td>
        <td>${sc.name || ""}</td>
        <td>${tagsCell}</td>
        <td>${tierChip}</td>
        <td>${incentiveChip}</td>
        <td>${mentorshipChip}</td>
        <td>${
          sc.delivery === "blended"
            ? "Blended"
            : sc.delivery === "inperson"
            ? "In person"
            : "Online"
        }</td>
        <td>${sc.responseDays} days</td>
        <td>${sc.cohorts}</td>
        <td>${sc.traineesPerCohort}</td>
        <td>${formatCurrency(sc.costPerTraineePerMonth, state.currency)}</td>
        <td>Mixed logit overall</td>
        <td>${formatPercent(sc.endorsementRate * 100, 1)}</td>
        <td>${formatCurrency(sc.wtpPerTraineePerMonth, state.currency)}</td>
        <td>${formatCurrency(sc.totalWtpAllCohorts, state.currency)}</td>
        <td>${formatRatio(sc.natBcr)}</td>
        <td>${formatCurrency(
          sc.totalEconomicCostAllCohorts,
          state.currency
        )}</td>
        <td>${formatCurrency(sc.epiBenefitAllCohorts, state.currency)}</td>
        <td>${formatCurrency(sc.netBenefitAllCohorts, state.currency)}</td>
        <td>${sc.natOutbreaksPerYear.toFixed(1)}</td>
        <td>${sc.notes || ""}</td>
      `;

      tbody.appendChild(row);
    });

    tbody.querySelectorAll('input[type="checkbox"][data-scenario-id]').forEach(
      (cb) => {
        cb.addEventListener("change", () => {
          const id = cb.getAttribute("data-scenario-id");
          const sc = state.savedScenarios.find((s) => s.id === id);
          if (sc) {
            sc.shortlisted = cb.checked;
          }
        });
      }
    );
  }

  function exportScenariosToExcel() {
    const table = document.getElementById("scenario-table");
    if (!table) {
      showToast("Scenario table is not available.", "error");
      return;
    }
    if (typeof XLSX === "undefined") {
      showToast("Excel export library is not loaded.", "error");
      return;
    }
    const wb = XLSX.utils.table_to_book(table, { sheet: "STEPS scenarios" });
    XLSX.writeFile(wb, "steps_scenarios.xlsx");
  }

  function exportScenariosToPdf() {
    if (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined") {
      showToast("PDF export library is not loaded.", "error");
      return;
    }
    const JsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const doc = new JsPDF({
      unit: "pt",
      format: "a4"
    });

    let y = 60;
    doc.setFontSize(14);
    doc.text("STEPS FETP India Decision Aid", 40, y);
    y += 20;
    doc.setFontSize(12);
    doc.text("Scenario policy summary for saved configurations", 40, y);
    y += 24;

    const scenarios = [];
    if (state.currentScenario) {
      scenarios.push({ ...state.currentScenario, isCurrent: true });
    }
    scenarios.push(...state.savedScenarios);

    if (!scenarios.length) {
      doc.text("No scenarios have been applied or saved.", 40, y);
      doc.save("steps_scenarios.pdf");
      return;
    }

    doc.setFontSize(11);

    scenarios.forEach((sc, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }

      const title =
        "Scenario " +
        (idx + 1) +
        (sc.isCurrent ? " (current configuration)" : "");
      doc.setFont(undefined, "bold");
      doc.text(title, 40, y);
      y += 16;

      doc.setFont(undefined, "normal");

      const lines = [
        "Name: " + (sc.name || ""),
        "Tier and design: " +
          (sc.tier === "frontline"
            ? "Frontline"
            : sc.tier === "intermediate"
            ? "Intermediate"
            : "Advanced") +
          ", " +
          (sc.mentorship === "high"
            ? "high mentorship"
            : sc.mentorship === "medium"
            ? "medium mentorship"
            : "low mentorship") +
          ", " +
          (sc.delivery === "blended"
            ? "blended delivery"
            : sc.delivery === "inperson"
            ? "in person"
            : "online") +
          ", response within " +
          sc.responseDays +
          " days.",
        "Scale: " +
          sc.cohorts +
          " cohort(s) with " +
          sc.traineesPerCohort +
          " trainees each.",
        "Costs: programme cost per cohort " +
          formatINR(sc.programmeCostPerCohort) +
          ", economic cost per cohort " +
          formatINR(sc.economicCostPerCohort) +
          ", total economic cost across all cohorts " +
          formatINR(sc.totalEconomicCostAllCohorts) +
          ".",
        "Epidemiological outputs: around " +
          Math.round(sc.natGraduates).toLocaleString("en-IN") +
          " graduates and " +
          sc.natOutbreaksPerYear.toFixed(1) +
          " outbreak responses per year once all cohorts are complete. " +
          "Indicative epidemiological benefit across all cohorts is " +
          formatINR(sc.epiBenefitAllCohorts) +
          ".",
        "Economic indicators: epidemiological benefit cost ratio " +
          formatRatio(sc.natBcr) +
          " and net epidemiological benefit " +
          formatINR(sc.netBenefitAllCohorts) +
          ". Total willingness to pay across all cohorts is " +
          formatINR(sc.totalWtpAllCohorts) +
          ".",
        sc.notes ? "Notes: " + sc.notes : ""
      ];

      lines.forEach((text) => {
        const wrapped = doc.splitTextToSize(text, 515);
        wrapped.forEach((line) => {
          if (y > 760) {
            doc.addPage();
            y = 60;
          }
          doc.text(line, 40, y);
          y += 14;
        });
      });

      y += 12;
    });

    doc.save("steps_scenario_policy_summary.pdf");
  }

  /* ===========================
     Sensitivity / DCE benefits
     =========================== */

  function initSensitivity() {
    const refreshBtn = document.getElementById("refresh-sensitivity-benefits");
    const excelBtn = document.getElementById(
      "export-sensitivity-benefits-excel"
    );
    const pdfBtn = document.getElementById("export-sensitivity-benefits-pdf");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        if (!state.currentScenario && !state.savedScenarios.length) {
          showToast("Apply a configuration or save scenarios before updating the sensitivity summary.", "warning");
          return;
        }
        updateSensitivityTables();
        showToast("Sensitivity tables updated.", "success");
      });
    }

    if (excelBtn) {
      excelBtn.addEventListener("click", exportSensitivityToExcel);
    }
    if (pdfBtn) {
      pdfBtn.addEventListener("click", exportSensitivityToPdf);
    }
  }

  function buildSensitivityRows() {
    const endorsementOverrideInput = document.getElementById(
      "endorsement-override"
    );
    const epiToggle = document.getElementById("sensitivity-epi-toggle");
    const benefitDef = document.getElementById("benefit-definition-select");

    const overrideValue = endorsementOverrideInput
      ? Number(endorsementOverrideInput.value)
      : NaN;
    const useOverride = !isNaN(overrideValue) && overrideValue >= 0 && overrideValue <= 100;
    const epiIncluded =
      epiToggle && epiToggle.classList.contains("on")
        ? true
        : epiToggle && epiToggle.id === "sensitivity-epi-toggle" && epiToggle.textContent
        ? true
        : true; // default to included
    const benefitDefinition = benefitDef ? benefitDef.value : "wtp_only";

    const scenarios = [];
    if (state.currentScenario) {
      scenarios.push({ ...state.currentScenario, label: "Current configuration" });
    }
    state.savedScenarios.forEach((sc) => {
      scenarios.push({ ...sc, label: sc.name || "Saved scenario" });
    });

    return scenarios.map((sc) => {
      const endorsementUsed = useOverride
        ? overrideValue / 100
        : sc.endorsementRate;

      const totalCost = sc.totalEconomicCostAllCohorts;
      const totalWtp = sc.totalWtpAllCohorts;
      const outbreakBenefit = epiIncluded
        ? sc.outbreakBenefitAllCohorts
        : 0;

      const effectiveWtp = totalWtp * endorsementUsed;
      const combinedBenefit = totalWtp + outbreakBenefit;
      const effectiveCombinedBenefit = combinedBenefit * endorsementUsed;

      const bcrWtp = totalCost > 0 ? totalWtp / totalCost : NaN;
      const npvWtp = totalWtp - totalCost;

      const bcrCombined = totalCost > 0 ? combinedBenefit / totalCost : NaN;
      const npvCombined = combinedBenefit - totalCost;

      return {
        scenarioLabel: sc.label,
        model: "Mixed logit overall",
        endorsementRate: sc.endorsementRate,
        endorsementUsed,
        costAllCohorts: totalCost,
        costAllCohortsMillions: totalCost / 1e6,
        netBenefitAllCohorts: sc.netBenefitAllCohorts,
        totalWtp,
        outbreakWtpComponent: estimateOutbreakWtpComponent(sc),
        outbreakBenefit,
        effectiveWtp,
        effectiveCombinedBenefit,
        bcrWtp,
        npvWtp,
        bcrCombined,
        npvCombined,
        benefitDefinition
      };
    });
  }

  function estimateOutbreakWtpComponent(sc) {
    const baseUtility = MXL_COEFS.response[30] || 0;
    const thisUtility = MXL_COEFS.response[sc.responseDays] || 0;
    const delta = thisUtility - baseUtility;
    if (delta <= 0) return 0;
    const share = Math.min(delta / 0.61, 0.6);
    return sc.totalWtpAllCohorts * share;
  }

  function updateSensitivityTables() {
    const headlineBody = document.getElementById("dce-benefits-table-body");
    const detailBody = document.getElementById("sensitivity-table-body");
    if (!headlineBody || !detailBody) return;

    headlineBody.innerHTML = "";
    detailBody.innerHTML = "";

    const rows = buildSensitivityRows();
    if (!rows.length) return;

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.scenarioLabel}</td>
        <td class="numeric-cell">${formatINR(r.costAllCohorts)}</td>
        <td class="numeric-cell">${r.costAllCohortsMillions.toFixed(2)}</td>
        <td class="numeric-cell">${formatINR(r.netBenefitAllCohorts)}</td>
        <td class="numeric-cell">${formatINR(r.totalWtp)}</td>
        <td class="numeric-cell">${formatINR(r.outbreakWtpComponent)}</td>
        <td class="numeric-cell">${formatINR(r.outbreakBenefit)}</td>
        <td class="numeric-cell">${formatPercent(r.endorsementUsed * 100, 1)}</td>
        <td class="numeric-cell">${formatINR(r.effectiveWtp)}</td>
        <td class="numeric-cell">${formatRatio(r.bcrWtp)}</td>
        <td class="numeric-cell">${formatINR(r.npvWtp)}</td>
        <td class="numeric-cell">${formatRatio(r.bcrCombined)}</td>
        <td class="numeric-cell">${formatINR(r.npvCombined)}</td>
      `;
      headlineBody.appendChild(tr);

      const trDetail = document.createElement("tr");
      trDetail.innerHTML = `
        <td>${r.scenarioLabel}</td>
        <td>${r.model}</td>
        <td class="numeric-cell">${formatPercent(r.endorsementRate * 100, 1)}</td>
        <td class="numeric-cell">${formatINR(
          state.currentScenario
            ? state.currentScenario.economicCostPerCohort
            : 0
        )}</td>
        <td class="numeric-cell">${formatINR(
          state.currentScenario
            ? state.currentScenario.totalWtpPerCohort
            : 0
        )}</td>
        <td class="numeric-cell">${formatINR(
          estimateOutbreakWtpComponent(
            state.currentScenario || r
          )
        )}</td>
        <td class="numeric-cell">${formatINR(
          state.currentScenario
            ? state.currentScenario.outbreakBenefitAllCohorts /
                (state.currentScenario.cohorts || 1)
            : 0
        )}</td>
        <td class="numeric-cell">${formatRatio(r.bcrWtp)}</td>
        <td class="numeric-cell">${formatINR(r.npvWtp)}</td>
        <td class="numeric-cell">${formatRatio(r.bcrCombined)}</td>
        <td class="numeric-cell">${formatINR(r.npvCombined)}</td>
        <td class="numeric-cell">${formatINR(r.effectiveWtp)}</td>
        <td class="numeric-cell">${formatINR(r.effectiveCombinedBenefit)}</td>
      `;
      detailBody.appendChild(trDetail);
    });
  }

  function exportSensitivityToExcel() {
    const table = document.getElementById("dce-benefits-table");
    if (!table) {
      showToast("Sensitivity table is not available.", "error");
      return;
    }
    if (typeof XLSX === "undefined") {
      showToast("Excel export library is not loaded.", "error");
      return;
    }
    const wb = XLSX.utils.table_to_book(table, {
      sheet: "STEPS sensitivity"
    });
    XLSX.writeFile(wb, "steps_sensitivity_dce_benefits.xlsx");
  }

  function exportSensitivityToPdf() {
    if (typeof window.jspdf === "undefined" && typeof window.jsPDF === "undefined") {
      showToast("PDF export library is not loaded.", "error");
      return;
    }
    const JsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const doc = new JsPDF({
      unit: "pt",
      format: "a4"
    });

    let y = 60;
    doc.setFontSize(14);
    doc.text("STEPS DCE benefit and sensitivity summary", 40, y);
    y += 24;

    const rows = buildSensitivityRows();
    if (!rows.length) {
      doc.setFontSize(11);
      doc.text("No scenarios available for sensitivity analysis.", 40, y);
      doc.save("steps_sensitivity_summary.pdf");
      return;
    }

    doc.setFontSize(11);

    rows.forEach((r, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }

      doc.setFont(undefined, "bold");
      doc.text("Scenario " + (idx + 1) + ": " + r.scenarioLabel, 40, y);
      y += 14;
      doc.setFont(undefined, "normal");

      const lines = [
        "Total economic cost across all cohorts: " + formatINR(r.costAllCohorts) + ".",
        "Total willingness to pay benefit: " + formatINR(r.totalWtp) + ".",
        "Epidemiological outbreak benefit included in combined indicators: " + formatINR(r.outbreakBenefit) + ".",
        "Benefit cost ratio based on willingness to pay only: " + formatRatio(r.bcrWtp) + ", net present value " + formatINR(r.npvWtp) + ".",
        "Benefit cost ratio based on willingness to pay plus epidemiological outbreak benefit: " + formatRatio(r.bcrCombined) + ", net present value " + formatINR(r.npvCombined) + ".",
        "Endorsement rate used in sensitivity view: " + formatPercent(r.endorsementUsed * 100, 1) + "."
      ];

      lines.forEach((text) => {
        const wrapped = doc.splitTextToSize(text, 515);
        wrapped.forEach((line) => {
          if (y > 760) {
            doc.addPage();
            y = 60;
          }
          doc.text(line, 40, y);
          y += 14;
        });
      });

      y += 10;
    });

    doc.save("steps_sensitivity_summary.pdf");
  }

  /* ===========================
     Copilot tab
     =========================== */

  function initCopilot() {
    const btn = document.getElementById("copilot-open-and-copy-btn");
    const epiToggle = document.getElementById("sensitivity-epi-toggle");

    if (btn) {
      btn.addEventListener("click", () => {
        if (!state.currentScenario) {
          showToast("Apply a configuration before preparing the Copilot prompt.", "warning");
          return;
        }
        const text = buildCopilotPromptText();
        writeCopilotPrompt(text);
        copyPromptToClipboard(text);
        window.open("https://copilot.microsoft.com/", "_blank", "noopener");
      });
    }

    if (epiToggle) {
      epiToggle.addEventListener("click", () => {
        epiToggle.classList.toggle("on");
        if (state.currentScenario) {
          updateSensitivityTables();
        }
      });
    }
  }

  function buildCopilotPromptText() {
    const scenario = state.currentScenario;
    const scenarioJson = JSON.stringify(
      {
        name: scenario.name,
        notes: scenario.notes,
        tier: scenario.tier,
        career: scenario.career,
        mentorship: scenario.mentorship,
        delivery: scenario.delivery,
        responseDays: scenario.responseDays,
        costPerTraineePerMonthINR: scenario.costPerTraineePerMonth,
        traineesPerCohort: scenario.traineesPerCohort,
        cohorts: scenario.cohorts,
        programmeCostPerCohortINR: scenario.programmeCostPerCohort,
        economicCostPerCohortINR: scenario.economicCostPerCohort,
        totalEconomicCostAllCohortsINR: scenario.totalEconomicCostAllCohorts,
        endorsementRate: scenario.endorsementRate,
        optOutRate: scenario.optOutRate,
        willingnessToPayPerTraineePerMonthINR: scenario.wtpPerTraineePerMonth,
        totalWillingnessToPayPerCohortINR: scenario.totalWtpPerCohort,
        totalWillingnessToPayAllCohortsINR: scenario.totalWtpAllCohorts,
        expectedGraduatesAllCohorts: scenario.natGraduates,
        outbreakResponsesPerYearNational: scenario.natOutbreaksPerYear,
        epidemiologicalBenefitPerCohortINR: scenario.epiBenefitPerCohort,
        epidemiologicalBenefitAllCohortsINR: scenario.epiBenefitAllCohorts,
        netEpidemiologicalBenefitAllCohortsINR: scenario.netBenefitAllCohorts,
        epidemiologicalBenefitCostRatioNational: scenario.natBcr,
        outbreaksBenefitComponentAllCohortsINR: scenario.outbreakBenefitAllCohorts,
        advancedSettings: state.advanced,
        currencyDisplay: state.currency,
        opportunityCostIncluded: state.opportunityCostIncluded
      },
      null,
      2
    );

    const introText =
      COPILOT_INTERPRETATION_PROMPT +
      "\n\nScenario JSON from STEPS\n\n" +
      scenarioJson +
      "\n";

    return introText;
  }

  function writeCopilotPrompt(text) {
    const textarea = document.getElementById("copilot-prompt-output");
    const statusPill = document.getElementById("copilot-status-pill");
    const statusText = document.getElementById("copilot-status-text");
    if (!textarea || !statusPill || !statusText) return;

    textarea.value = text;
    statusPill.textContent = "Prompt refreshed";
    statusText.textContent =
      "The interpretation text now reflects the most recent configuration and results. Copy it in full before pasting into Microsoft Copilot.";
  }

  function copyPromptToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Copilot prompt copied to clipboard and Copilot opened in a new tab.", "success");
        })
        .catch(() => {
          showToast("Prompt refreshed. Copy it manually from the panel.", "warning");
        });
    } else {
      showToast("Prompt refreshed. Copy it manually from the panel.", "warning");
    }
  }

  function refreshCopilotStatus() {
    const statusPill = document.getElementById("copilot-status-pill");
    const statusText = document.getElementById("copilot-status-text");
    if (!statusPill || !statusText) return;

    if (!state.currentScenario) {
      statusPill.textContent = "Waiting for configuration";
      statusText.textContent =
        "Apply a configuration and click the Copilot button to generate the interpretation text.";
    } else {
      statusPill.textContent = "Ready for Copilot";
      statusText.textContent =
        "The Copilot interpretation text is based on the most recent configuration. Refresh it after any changes.";
    }
  }

  /* ===========================
     Snapshot modal
     =========================== */

  function initSnapshotModal() {
    const modal = document.createElement("div");
    modal.id = "snapshot-modal";
    modal.className = "modal hidden";
    modal.innerHTML = `
      <div class="modal-content">
        <button type="button" class="modal-close" aria-label="Close snapshot">×</button>
        <h2>Scenario snapshot</h2>
        <div id="snapshot-content"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close");
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeSnapshotModal();
      }
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", closeSnapshotModal);
    }
  }

  function openSnapshotModal() {
    const modal = document.getElementById("snapshot-modal");
    const content = document.getElementById("snapshot-content");
    if (!modal || !content) return;

    if (!state.currentScenario) {
      content.innerHTML =
        "<p>Please apply a configuration before viewing the snapshot.</p>";
    } else {
      const sc = state.currentScenario;
      content.innerHTML = `
        <p><strong>Name:</strong> ${sc.name || ""}</p>
        <p><strong>Programme tier:</strong> ${
          sc.tier === "frontline"
            ? "Frontline"
            : sc.tier === "intermediate"
            ? "Intermediate"
            : "Advanced"
        }</p>
        <p><strong>Cohorts and trainees:</strong> ${
          sc.cohorts
        } cohort(s) with ${sc.traineesPerCohort} trainees each.</p>
        <p><strong>Endorsement:</strong> ${formatPercent(
          sc.endorsementRate * 100,
          1
        )} of stakeholders would support the configuration.</p>
        <p><strong>Programme cost per cohort:</strong> ${formatINR(
          sc.programmeCostPerCohort
        )}; <strong>economic cost per cohort:</strong> ${formatINR(
        sc.economicCostPerCohort
      )}.</p>
        <p><strong>Total economic cost (all cohorts):</strong> ${formatINR(
          sc.totalEconomicCostAllCohorts
        )}.</p>
        <p><strong>Epidemiological outputs:</strong> approximately ${Math.round(
          sc.natGraduates
        ).toLocaleString(
          "en-IN"
        )} graduates and ${sc.natOutbreaksPerYear.toFixed(
        1
      )} outbreak responses per year once all cohorts are complete.</p>
        <p><strong>Epidemiological benefit cost ratio:</strong> ${formatRatio(
          sc.natBcr
        )}; <strong>net epidemiological benefit:</strong> ${formatINR(
        sc.netBenefitAllCohorts
      )}.</p>
        <p><strong>Total willingness to pay (all cohorts):</strong> ${formatINR(
          sc.totalWtpAllCohorts
        )}.</p>
        ${
          sc.notes
            ? "<p><strong>Notes:</strong> " + sc.notes + "</p>"
            : ""
        }
      `;
    }

    modal.classList.remove("hidden");
  }

  function closeSnapshotModal() {
    const modal = document.getElementById("snapshot-modal");
    if (modal) modal.classList.add("hidden");
  }

  /* ===========================
     DOMContentLoaded
     =========================== */

  document.addEventListener("DOMContentLoaded", () => {
    initTooltips();
    initTabs();
    initConfigControls();
    initAdvancedSettings();
    initScenarios();
    initSensitivity();
    initCopilot();
    initSnapshotModal();
    initTour();
    refreshCopilotStatus();
  });
})();
