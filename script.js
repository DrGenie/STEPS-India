
/* ===================================================
   STEPS FETP India Decision Aid tool
   Next generation script with working tooltips,
   WTP based benefits, sensitivity, Copilot integration and exports
   =================================================== */

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

const DEFAULT_EPI_SETTINGS = {
  general: {
    planningHorizonYears: 5,
    inrToUsdRate: 83,
    epiDiscountRate: 0.03
  },
  tiers: {
    frontline: {
      completionRate: 0.9,
      outbreaksPerGraduatePerYear: 0.5,
      valuePerGraduate: 0,
      valuePerOutbreak: 4000000
    },
    intermediate: {
      completionRate: 0.9,
      outbreaksPerGraduatePerYear: 0.5,
      valuePerGraduate: 0,
      valuePerOutbreak: 4000000
    },
    advanced: {
      completionRate: 0.9,
      outbreaksPerGraduatePerYear: 0.5,
      valuePerGraduate: 0,
      valuePerOutbreak: 4000000
    }
  }
};

/* Response time multipliers for outbreak benefits */

const RESPONSE_TIME_MULTIPLIERS = {
  "30": 1.0,
  "15": 1.2,
  "7": 1.5
};

/* Tier duration in months */

const TIER_MONTHS = {
  frontline: 3,
  intermediate: 12,
  advanced: 24
};

/* ===========================
   Copilot interpretation prompt
   =========================== */

const COPILOT_INTERPRETATION_PROMPT = `
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
   Tooltip content mapping (UI contract)
   =========================== */

const TOOLTIP_LIBRARY = {
  opt_out_alternative: {
    title: "Opt out alternative",
    body:
      "An opt out option where no new FETP training is funded under the scenario being considered. In STEPS this acts as the benchmark of no new FETP investment."
  },
  cost_components: {
    title: "Cost components",
    body:
      "Combined cost components for each tier, covering salary and benefits, travel, training, trainee support and indirect costs including opportunity cost. In STEPS this provides harmonised direct and indirect cost items used in the costing and economic outputs."
  },
  opportunity_cost: {
    title: "Opportunity cost of trainee time",
    body:
      "The value of trainee salary time spent in training instead of normal duties, per trainee per month. In STEPS this is an optional economic cost component that can be included or excluded in the cost calculations."
  },
  preference_model: {
    title: "Preference model",
    body:
      "Mixed logit preference model estimated from the preference study. In STEPS this model is used to predict endorsement and willingness to pay for different FETP configurations."
  },

  result_endorsement: {
    title: "Endorsement rate",
    body:
      "Predicted share of stakeholders who choose the FETP option rather than the opt out alternative. It is calculated from the mixed logit utility indices using a two option logit share: exp(U_program) divided by exp(U_program) plus exp(U_optout). Higher values indicate stronger predicted support for funding the configuration."
  },
  result_optout: {
    title: "Opt out rate",
    body:
      "Predicted share of stakeholders who choose the opt out alternative rather than funding the configuration. It is one hundred minus the endorsement rate in this two option setup. Higher values indicate weaker predicted support for funding the configuration."
  },
  result_wtp_per_trainee: {
    title: "Willingness to pay per trainee per month",
    body:
      "Indicative rupee value per trainee per month implied by the preference model. It is computed by dividing the non cost utility of the configuration by the absolute value of the cost coefficient and scaling to rupees. It summarises how much value stakeholders place on the package for each trainee per month under the model."
  },
  result_wtp_per_cohort: {
    title: "Total willingness to pay per cohort",
    body:
      "Aggregate willingness to pay for one cohort. It is computed as willingness to pay per trainee per month multiplied by the programme duration in months and multiplied by trainees per cohort. It is an indicative value and should be interpreted alongside cost and epidemiological assumptions."
  },
  result_cost_programme: {
    title: "Programme cost per cohort",
    body:
      "Direct financial cost of running one cohort. It is computed as cost per trainee per month multiplied by programme duration in months and multiplied by trainees per cohort. It excludes opportunity cost unless opportunity cost is included in the economic cost concept."
  },
  result_cost_total: {
    title: "Total economic cost per cohort",
    body:
      "Economic cost concept used for benefit cost calculations. It equals programme cost per cohort plus opportunity cost of trainee time when that component is switched on. Higher values increase the cost base that benefits must exceed to generate ratios above one."
  },
  result_npv: {
    title: "Net benefit per cohort",
    body:
      "Difference between discounted outbreak related epidemiological benefit per cohort and total economic cost per cohort under current settings. Positive values indicate benefits exceed costs; negative values indicate costs exceed the outbreak benefit under the current outbreak value, planning horizon and discount rate assumptions."
  },
  result_bcr: {
    title: "Benefit cost ratio per cohort",
    body:
      "Ratio of discounted outbreak related epidemiological benefit per cohort to total economic cost per cohort. Values above one indicate benefits exceed costs under current assumptions; values below one indicate costs exceed the outbreak benefit. The ratio is sensitive to the value per outbreak, response time multiplier, planning horizon and discount rate."
  },
  result_epi_graduates: {
    title: "Graduates (all cohorts)",
    body:
      "Expected number of graduates across all cohorts after applying completion rates and the endorsement share. It is computed from trainees per cohort times completion rate times endorsement share, multiplied by the number of cohorts. It reflects the scale of trained field epidemiologists produced under the configuration."
  },
  result_epi_outbreaks: {
    title: "Outbreak responses per year",
    body:
      "Expected outbreak responses per year at the configured scale, based on graduates, assumed outbreaks handled per graduate per year, and the response time multiplier. Faster response time increases the credited outbreak responses through the multiplier."
  },
  result_epi_benefit: {
    title: "Outbreak benefit per cohort",
    body:
      "Discounted outbreak related benefit per cohort. It is computed as outbreak responses per year per cohort multiplied by value per outbreak, then multiplied by the present value factor implied by the planning horizon and discount rate. It reflects monetary value under epidemiological assumptions rather than observed savings."
  },

  national_total_cost: {
    title: "Total economic cost (national)",
    body:
      "Total economic cost across all cohorts. It equals total economic cost per cohort multiplied by the number of cohorts. It is the main cost input to national scale benefit cost summaries."
  },
  national_total_benefit: {
    title: "Total outbreak benefit (national)",
    body:
      "Total discounted outbreak related benefit across all cohorts. It equals outbreak benefit per cohort multiplied by the number of cohorts. It depends on the value per outbreak, planning horizon, discount rate and the response time multiplier."
  },
  national_net_benefit: {
    title: "Net outbreak related benefit (national)",
    body:
      "Difference between total outbreak benefit across all cohorts and total economic cost across all cohorts. Positive values indicate outbreak benefits exceed economic costs under current assumptions."
  },
  national_bcr: {
    title: "National benefit cost ratio",
    body:
      "Ratio of total outbreak benefit across all cohorts to total economic cost across all cohorts. Values above one indicate outbreak benefits exceed economic costs under current assumptions at national scale."
  },
  national_graduates: {
    title: "Total graduates (national)",
    body:
      "Total expected graduates over the planning horizon at the configured scale. It aggregates across cohorts after applying completion rates and endorsement share."
  },
  national_outbreaks: {
    title: "Outbreak responses per year (national)",
    body:
      "Aggregate outbreak responses per year implied by all graduates across all cohorts, adjusted by the response time multiplier. It is a model based output dependent on outbreaks per graduate per year and the response time multiplier."
  },
  national_total_wtp: {
    title: "Total willingness to pay (national)",
    body:
      "Aggregate willingness to pay across all cohorts implied by the preference model. It equals willingness to pay per cohort multiplied by the number of cohorts. It summarises model implied value and should be interpreted alongside epidemiological and costing outputs."
  }
};

Object.assign(TOOLTIP_LIBRARY, {
  result_endorsement: {
    title: "Endorsement rate",
    body:
      "Predicted share of stakeholders who would endorse funding the configured FETP option rather than choosing the opt out alternative. Calculated from the mixed logit utility for the programme option versus opt out, converted to a probability and expressed as a percent. Higher values indicate stronger stated support for the package under current assumptions."
  },
  result_optout: {
    title: "Opt out rate",
    body:
      "Predicted share of stakeholders who would choose the opt out alternative rather than fund the configured FETP option. It is the complement of the endorsement rate and sums to 100 percent with it. Higher values indicate weaker stated support for the package."
  },
  result_wtp_per_trainee: {
    title: "WTP per trainee per month",
    body:
      "Indicative willingness to pay per trainee per month implied by the preference model. Calculated as non cost utility for the configured option divided by the absolute value of the cost coefficient, scaled to rupees. Higher values indicate higher implied value placed on the package by respondents in the preference study."
  },
  result_wtp_total_cohort: {
    title: "Total WTP per cohort",
    body:
      "Indicative total willingness to pay for one cohort. Calculated as WTP per trainee per month multiplied by programme duration in months for the selected tier and the number of trainees per cohort. This is not a budget, it is an implied value measure from stated preferences."
  },
  result_programme_cost_cohort: {
    title: "Programme cost per cohort",
    body:
      "Direct financial programme cost for one cohort. Calculated as cost per trainee per month multiplied by programme duration in months for the selected tier and the number of trainees per cohort. This excludes opportunity cost unless that component is explicitly added in the total economic cost indicator."
  },
  result_total_cost_cohort: {
    title: "Total economic cost per cohort",
    body:
      "Economic cost for one cohort used in benefit cost and net benefit calculations. Calculated as programme cost per cohort plus the opportunity cost component when the opportunity cost setting is enabled. Opportunity cost is derived from the tier specific combined template rate applied to the programme cost."
  },
  result_net_benefit_cohort: {
    title: "Net outbreak benefit per cohort",
    body:
      "Net benefit comparing outbreak related epidemiological benefits with economic costs for one cohort. Calculated as discounted outbreak benefit per cohort minus total economic cost per cohort. Positive values indicate outbreak related benefits exceed costs under current assumptions."
  },
  result_bcr: {
    title: "Benefit cost ratio per cohort",
    body:
      "Ratio of discounted outbreak related epidemiological benefits to total economic costs for one cohort. Calculated as outbreak benefit per cohort divided by total economic cost per cohort. Values above 1 indicate outbreak benefits exceed costs under current assumptions."
  },
  result_graduates: {
    title: "Graduates",
    body:
      "Expected number of graduates produced across all configured cohorts, adjusted for completion and endorsement. Calculated from trainees per cohort, the tier completion rate, the endorsement share, and the number of cohorts. Higher values indicate a larger trained workforce output under the configured scale up."
  },
  result_outbreak_responses: {
    title: "Outbreak responses per year",
    body:
      "Expected outbreak responses per year at the configured scale, based on graduates and assumptions about outbreaks handled per graduate per year. Calculated using the effective graduates, the outbreaks per graduate per year setting, and the response time multiplier for the selected response time. Higher values increase estimated outbreak related benefits."
  },
  result_epi_benefit: {
    title: "Outbreak related benefit per cohort",
    body:
      "Discounted outbreak related epidemiological benefit for one cohort over the planning horizon. Calculated from expected outbreak responses per year, value per outbreak, and the present value factor implied by the discount rate and planning horizon. This is an indicative monetary benefit driven by settings and assumptions."
  },

  national_total_cost: {
    title: "Total economic cost",
    body:
      "Total economic cost across all configured cohorts over the planning horizon. Calculated as total economic cost per cohort multiplied by the number of cohorts. Interpreted as the aggregate economic resource requirement under the current configuration and cost settings."
  },
  national_total_benefit: {
    title: "Total outbreak related benefit",
    body:
      "Total discounted outbreak related epidemiological benefit aggregated across all configured cohorts. Calculated as outbreak benefit per cohort multiplied by the number of cohorts. This depends on the outbreak value, discount rate, planning horizon, and assumptions about outbreak responses."
  },
  national_net_benefit: {
    title: "National net benefit",
    body:
      "Net outbreak related benefit at national scale. Calculated as total outbreak related benefit across all cohorts minus total economic cost across all cohorts. Positive values indicate outbreak benefits exceed costs at scale under current assumptions."
  },
  national_bcr: {
    title: "National benefit cost ratio",
    body:
      "National scale benefit cost ratio comparing total outbreak related benefits with total economic costs across all cohorts. Calculated as total outbreak related benefit divided by total economic cost. Values above 1 indicate benefits exceed costs at scale under current assumptions."
  },
  national_total_wtp: {
    title: "Total WTP",
    body:
      "Total indicative willingness to pay aggregated across all configured cohorts. Calculated as total WTP per cohort multiplied by the number of cohorts. This is an implied value measure from the preference model, not a financial budget."
  },
  national_graduates: {
    title: "Total graduates",
    body:
      "Total expected graduates across all configured cohorts, adjusted for completion and endorsement. Calculated by aggregating cohort level graduate outputs across cohorts. Higher values reflect larger workforce scale up under the configured programme."
  },
  national_outbreaks_per_year: {
    title: "Outbreak responses per year",
    body:
      "Expected outbreak responses per year at national scale, aggregating the cohort level implied outbreak responses. This depends on graduate outputs, outbreaks per graduate per year, and the response time multiplier. Higher values increase estimated outbreak related benefits."
  }
});

/* ===========================
   Global state
   =========================== */

const appState = {
  currency: "INR",
  usdRate: DEFAULT_EPI_SETTINGS.general.inrToUsdRate,
  epiSettings: JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS)),
  currentScenario: null,
  savedScenarios: [],
  charts: {
    uptake: null,
    bcr: null,
    epi: null,
    natCostBenefit: null,
    natEpi: null
  },
  tooltip: {
    tooltipEl: null,
    titleEl: null,
    bodyEl: null,
    currentTarget: null,
    hideTimeout: null
  },
  tour: {
    steps: [],
    currentIndex: 0,
    overlayEl: null,
    popoverEl: null
  },
  settings: {
    lastAppliedValues: null
  }
};

/* ===========================
   Utility functions
   =========================== */

function getElByIdCandidates(ids) {
  if (!Array.isArray(ids)) return null;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (!id) continue;
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

function formatNumber(x, decimals = 0) {
  if (x === null || x === undefined || isNaN(x)) return "-";
  return x.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
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

function safeText(x) {
  if (x === null || x === undefined) return "";
  return String(x);
}

/* ===========================
   Outbreak value presets (sensitivity dropdowns)
   =========================== */

const OUTBREAK_VALUE_PRESETS_MN = [4, 5, 10, 20, 30, 40];

function formatOutbreakPresetLabelMn(mn) {
  return `₹${formatNumber(mn, 0)}m`;
}

function parseSensitivityValueToINR(raw) {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === "number") {
    const n = raw;
    if (!isFinite(n) || n <= 0) return null;
    if (n < 1000) return n * 1e6;
    return n;
  }

  let s = String(raw).trim();
  if (!s) return null;

  const lower = s.toLowerCase().replace(/,/g, "");
  const hasBn = lower.includes("bn") || lower.includes("billion");
  const hasMn = lower.includes("mn") || lower.includes("million");
  const hasCr = lower.includes("crore") || /(^|\s)cr(\s|$)/.test(lower);

  const match = lower.match(/-?\d+(\.\d+)?/);
  if (!match) return null;

  const n = Number(match[0]);
  if (!isFinite(n) || n <= 0) return null;

  if (hasBn) return n * 1e9;
  if (hasMn) return n * 1e6;
  if (hasCr) return n * 1e7;

  if (n < 1000) return n * 1e6;
  return n;
}

function normalisedOutbreakValueKeysFromOption(optionEl) {
  const keys = [];
  if (!optionEl) return keys;

  const rawValue = optionEl.value;
  const rawText = optionEl.textContent || "";

  const inr1 = parseSensitivityValueToINR(rawValue);
  const inr2 = inr1 ? null : parseSensitivityValueToINR(rawText);
  const inr = inr1 || inr2;

  if (rawValue !== null && rawValue !== undefined) keys.push(String(rawValue));

  if (inr && isFinite(inr) && inr > 0) {
    keys.push(String(inr));
    const mn = inr / 1e6;
    if (isFinite(mn)) {
      const mnRounded = Math.round(mn);
      if (Math.abs(mn - mnRounded) < 1e-6) keys.push(String(mnRounded));
      else keys.push(String(mn));
    }
  }

  return keys;
}

function ensureSelectHasOutbreakPresets(selectEl) {
  if (!selectEl) return;

  const existingValues = new Set();
  const hasAnyOptions = selectEl.options && selectEl.options.length > 0;

  Array.from(selectEl.options).forEach((o) => {
    normalisedOutbreakValueKeysFromOption(o).forEach((k) => existingValues.add(String(k)));
  });

  OUTBREAK_VALUE_PRESETS_MN.forEach((mn) => {
    const mnValue = String(mn);
    const inrValue = String(mn * 1e6);

    if (existingValues.has(mnValue) || existingValues.has(inrValue)) return;

    const opt = document.createElement("option");
    opt.value = mnValue;
    opt.textContent = formatOutbreakPresetLabelMn(mn);
    selectEl.appendChild(opt);

    existingValues.add(mnValue);
    existingValues.add(inrValue);
  });

  if (!hasAnyOptions && selectEl.options && selectEl.options.length) {
    const currentInr = appState.epiSettings.tiers.frontline.valuePerOutbreak;
    setSelectToOutbreakValue(selectEl, currentInr);
  }
}

function closestPresetMn(valueInINR) {
  if (!isFinite(valueInINR) || valueInINR <= 0) return OUTBREAK_VALUE_PRESETS_MN[0];
  const mn = valueInINR / 1e6;
  let best = OUTBREAK_VALUE_PRESETS_MN[0];
  let bestDist = Math.abs(best - mn);
  for (let i = 1; i < OUTBREAK_VALUE_PRESETS_MN.length; i++) {
    const v = OUTBREAK_VALUE_PRESETS_MN[i];
    const d = Math.abs(v - mn);
    if (d < bestDist) {
      best = v;
      bestDist = d;
    }
  }
  return best;
}

function setSelectToOutbreakValue(selectEl, valueInINR) {
  if (!selectEl) return;
  if (!isFinite(Number(valueInINR)) || Number(valueInINR) <= 0) return;

  const target = Number(valueInINR);
  const options = Array.from(selectEl.options || []);
  const optionValues = new Set(options.map((o) => String(o.value)));

  const exactInr = String(target);
  if (optionValues.has(exactInr)) {
    selectEl.value = exactInr;
    return;
  }

  let bestOpt = null;
  let bestDist = Infinity;

  options.forEach((opt) => {
    const inr = parseSensitivityValueToINR(opt.value) || parseSensitivityValueToINR(opt.textContent);
    if (!inr || !isFinite(Number(inr))) return;
    const d = Math.abs(Number(inr) - target);
    if (d < bestDist) {
      bestDist = d;
      bestOpt = opt;
    }
  });

  if (bestOpt && isFinite(bestDist)) {
    selectEl.value = bestOpt.value;
    return;
  }

  const nearestMn = closestPresetMn(target);
  const mnCandidate = String(nearestMn);
  const inrCandidate = String(nearestMn * 1e6);

  if (optionValues.has(mnCandidate)) {
    selectEl.value = mnCandidate;
    return;
  }
  if (optionValues.has(inrCandidate)) {
    selectEl.value = inrCandidate;
    return;
  }
}

function syncOutbreakValueDropdownsFromState() {
  const currentInr = appState.epiSettings.tiers.frontline.valuePerOutbreak;

  const sensSelect = getElByIdCandidates(["sensitivityValueSelect", "sensitivity-value-select", "sensitivity-value"]);
  const presetSelect = getElByIdCandidates(["outbreak-value-preset", "outbreakValuePreset", "outbreak-value"]);

  if (sensSelect) {
    ensureSelectHasOutbreakPresets(sensSelect);
    setSelectToOutbreakValue(sensSelect, currentInr);
  }
  if (presetSelect) {
    ensureSelectHasOutbreakPresets(presetSelect);
    setSelectToOutbreakValue(presetSelect, currentInr);
  }
}

function initOutbreakSensitivityDropdowns() {
  const sensSelect = getElByIdCandidates(["sensitivityValueSelect", "sensitivity-value-select", "sensitivity-value"]);
  const presetSelect = getElByIdCandidates(["outbreak-value-preset", "outbreakValuePreset", "outbreak-value"]);

  if (sensSelect) ensureSelectHasOutbreakPresets(sensSelect);
  if (presetSelect) ensureSelectHasOutbreakPresets(presetSelect);

  syncOutbreakValueDropdownsFromState();
}

function enforceResponseTimeFixedTo7Days() {
  const responseEl = document.getElementById("response");
  if (!responseEl || responseEl.tagName.toLowerCase() !== "select") return;

  responseEl.value = "7";

  Array.from(responseEl.options).forEach((opt) => {
    const v = String(opt.value);
    if (v === "15" || v === "30") {
      opt.disabled = true;
      opt.setAttribute("aria-disabled", "true");
    }
    if (v === "7") {
      opt.disabled = false;
      opt.removeAttribute("aria-disabled");
    }
  });

  responseEl.addEventListener("change", () => {
    responseEl.value = "7";
  });
}

/* ===========================
   Toasts (UI contract: #toastContainer)
   =========================== */

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const t = type === "success" || type === "warning" || type === "error" ? type : "info";
  toast.dataset.toastType = t;

  toast.textContent = message;
  container.appendChild(toast);

  const maxToasts = 4;
  while (container.children.length > maxToasts) {
    container.removeChild(container.firstChild);
  }

  const remove = () => {
    if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
  };

  setTimeout(remove, 3200);
}

/* ===========================
   Tooltip system (UI contract: #globalTooltip, .tooltip-trigger[data-tooltip-key])
   =========================== */

function ensureContractTooltipTriggers() {
  const resultsLabels = Array.from(document.querySelectorAll(".results-indicator-label"));
  resultsLabels.forEach((el) => {
    if (!el.classList.contains("tooltip-trigger")) el.classList.add("tooltip-trigger");
  });

  const nationalLabels = Array.from(document.querySelectorAll(".national-indicator-label"));
  nationalLabels.forEach((el) => {
    if (!el.classList.contains("tooltip-trigger")) el.classList.add("tooltip-trigger");
  });

  const requiredIdKeyPairs = [
    ["optout-alt-info", "opt_out_alternative"],
    ["cost-components-info", "cost_components"],
    ["opp-cost-info", "opportunity_cost"],
    ["preference-model-info", "preference_model"],

    ["result-endorsement-info", "result_endorsement"],
    ["result-optout-info", "result_optout"],
    ["result-wtp-trainee-info", "result_wtp_per_trainee"],
    ["result-wtp-cohort-info", "result_wtp_per_cohort"],
    ["result-prog-cost-info", "result_cost_programme"],
    ["result-total-cost-info", "result_cost_total"],
    ["result-net-benefit-info", "result_npv"],
    ["result-bcr-info", "result_bcr"],
    ["result-epi-graduates-info", "result_epi_graduates"],
    ["result-epi-outbreaks-info", "result_epi_outbreaks"],
    ["result-epi-benefit-info", "result_epi_benefit"],

    ["natsim-total-cost-info", "national_total_cost"],
    ["natsim-total-benefit-info", "national_total_benefit"],
    ["natsim-net-benefit-info", "national_net_benefit"],
    ["natsim-bcr-info", "national_bcr"],
    ["natsim-graduates-info", "national_graduates"],
    ["natsim-outbreaks-info", "national_outbreaks"],
    ["natsim-total-wtp-info", "national_total_wtp"]
  ];

  requiredIdKeyPairs.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("tooltip-trigger");
    el.setAttribute("data-tooltip-key", key);
    el.removeAttribute("title");
  });

  const legacy = Array.from(document.querySelectorAll("[data-tooltip]"));
  legacy.forEach((el) => {
    if (el.hasAttribute("data-tooltip-key")) return;
    el.classList.add("tooltip-trigger");
  });
}

function initTooltips() {
  const tooltipEl = document.getElementById("globalTooltip");
  if (!tooltipEl) return;

  const titleEl = tooltipEl.querySelector(".tooltip-title");
  const bodyEl = tooltipEl.querySelector(".tooltip-body");
  if (!titleEl || !bodyEl) return;

  appState.tooltip.tooltipEl = tooltipEl;
  appState.tooltip.titleEl = titleEl;
  appState.tooltip.bodyEl = bodyEl;

  tooltipEl.setAttribute("role", "tooltip");
  tooltipEl.style.position = tooltipEl.style.position || "absolute";
  tooltipEl.style.zIndex = tooltipEl.style.zIndex || "9999";
  tooltipEl.style.visibility = "hidden";
  tooltipEl.style.opacity = "0";
  tooltipEl.style.pointerEvents = "none";

  ensureContractTooltipTriggers();

  function getTooltipPayload(target) {
    const key = target.getAttribute("data-tooltip-key");
    if (key && TOOLTIP_LIBRARY[key]) return TOOLTIP_LIBRARY[key];

    if (key && key.startsWith("result_") && !TOOLTIP_LIBRARY[key]) {
      return {
        title: "Indicator",
        body:
          "This indicator summarises the results shown. See the settings section for the assumptions used. In general, ratios greater than 1 and net benefits greater than 0 mean the benefits outweigh the costs."
      };
    }
    if (key && key.startsWith("national_") && !TOOLTIP_LIBRARY[key]) {
      return {
        title: "Indicator",
        body:
          "This indicator summarises a national scale output derived by aggregating cohort level results. It depends on the configured cohorts, trainees per cohort, endorsement share, and the epidemiological and economic assumptions in settings."
      };
    }

    const legacyText =
      target.getAttribute("data-tooltip") ||
      target.getAttribute("aria-label") ||
      "";

    if (legacyText) {
      return {
        title: "",
        body: legacyText
      };
    }

    return null;
  }

  function setTooltipContent(payload) {
    titleEl.textContent = safeText(payload.title || "");
    bodyEl.textContent = safeText(payload.body || "");
  }

  function positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    const margin = 10;
    const offset = 10;

    tooltipEl.style.left = "0px";
    tooltipEl.style.top = "0px";
    tooltipEl.style.visibility = "hidden";
    tooltipEl.style.opacity = "0";

    tooltipEl.style.pointerEvents = "none";

    tooltipEl.style.visibility = "hidden";
    tooltipEl.style.opacity = "0";
    tooltipEl.style.display = "block";

    const tipRect = tooltipEl.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = rect.top - tipRect.height - offset;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    if (top < margin) {
      top = rect.bottom + offset;
    }

    left = clamp(left, margin, viewportW - tipRect.width - margin);

    if (top + tipRect.height > viewportH - margin) {
      const altTop = rect.top - tipRect.height - offset;
      if (altTop >= margin) top = altTop;
      top = clamp(top, margin, viewportH - tipRect.height - margin);
    }

    tooltipEl.style.left = `${left + window.scrollX}px`;
    tooltipEl.style.top = `${top + window.scrollY}px`;
    tooltipEl.style.visibility = "visible";
    tooltipEl.style.opacity = "1";
  }

  function showTooltip(target) {
    const payload = getTooltipPayload(target);
    if (!payload) return;

    if (appState.tooltip.hideTimeout) {
      clearTimeout(appState.tooltip.hideTimeout);
      appState.tooltip.hideTimeout = null;
    }

    appState.tooltip.currentTarget = target;
    setTooltipContent(payload);
    positionTooltip(target);
  }

  function hideTooltip() {
    appState.tooltip.currentTarget = null;
    tooltipEl.style.opacity = "0";
    tooltipEl.style.visibility = "hidden";
  }

  function onEnter(target) {
    showTooltip(target);
  }

  function onLeave(target, related) {
    if (!appState.tooltip.currentTarget) return;
    if (related && (target === related || target.contains(related))) return;
    appState.tooltip.hideTimeout = setTimeout(hideTooltip, 90);
  }

  const triggers = Array.from(document.querySelectorAll(".tooltip-trigger"));

  triggers.forEach((el) => {
    el.addEventListener("mouseenter", () => onEnter(el));
    el.addEventListener("mouseleave", (e) => onLeave(el, e.relatedTarget));
    el.addEventListener("focusin", () => onEnter(el));
    el.addEventListener("focusout", () => onLeave(el, null));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideTooltip();
  });

  window.addEventListener("scroll", () => {
    if (appState.tooltip.currentTarget) {
      positionTooltip(appState.tooltip.currentTarget);
    }
  });

  window.addEventListener("resize", () => {
    if (appState.tooltip.currentTarget) {
      positionTooltip(appState.tooltip.currentTarget);
    }
  });
}

/* ===========================
   Definitions for WTP, mixed logit and key sections
   =========================== */

function initDefinitionTooltips() {
  const wtpInfo = document.getElementById("wtp-info");
  if (wtpInfo) {
    wtpInfo.classList.add("tooltip-trigger");
    if (!wtpInfo.getAttribute("data-tooltip-key")) {
      wtpInfo.setAttribute("data-tooltip", "WTP per trainee per month is derived from the preference model by dividing attribute coefficients by the cost coefficient. It is an approximate rupee value stakeholders attach to this configuration. Total WTP aggregates this value across trainees and cohorts. All benefit values are indicative approximations.");
    }
    wtpInfo.removeAttribute("title");
  }

  const wtpSectionInfo = document.getElementById("wtp-section-info");
  if (wtpSectionInfo) {
    wtpSectionInfo.classList.add("tooltip-trigger");
    if (!wtpSectionInfo.getAttribute("data-tooltip-key")) {
      wtpSectionInfo.setAttribute(
        "data-tooltip",
        "WTP indicators summarise how much value stakeholders attach to each configuration in rupees per trainee and over all cohorts. They are based on the mixed logit preference model and should be read as indicative support rather than precise market prices."
      );
    }
    wtpSectionInfo.removeAttribute("title");
  }

  const mxlInfo = document.getElementById("mixedlogit-info");
  if (mxlInfo) {
    mxlInfo.classList.add("tooltip-trigger");
    if (!mxlInfo.getAttribute("data-tooltip-key")) {
      mxlInfo.setAttribute(
        "data-tooltip",
        "The mixed logit preference model allows preferences to vary across decision makers instead of assuming a single average pattern, which makes endorsement and WTP estimates more flexible."
      );
    }
    mxlInfo.removeAttribute("title");
  }

  const epiInfo = document.getElementById("epi-implications-info");
  if (epiInfo) {
    epiInfo.classList.add("tooltip-trigger");
    if (!epiInfo.getAttribute("data-tooltip-key")) {
      epiInfo.setAttribute(
        "data-tooltip",
        "Graduates and outbreak responses are obtained by combining endorsement with cohort size and number of cohorts. The indicative outbreak cost saving per cohort converts expected outbreak responses into monetary terms using the outbreak value and planning horizon set in the settings."
      );
    }
    epiInfo.removeAttribute("title");
  }

  const endorseInfo = document.getElementById("endorsement-optout-info");
  if (endorseInfo) {
    endorseInfo.classList.add("tooltip-trigger");
    if (!endorseInfo.getAttribute("data-tooltip-key")) {
      endorseInfo.setAttribute(
        "data-tooltip",
        "These percentages come from the mixed logit preference model and show how attractive the configuration is relative to opting out in the preference study."
      );
    }
    endorseInfo.removeAttribute("title");
  }

  const sensInfo = document.getElementById("sensitivity-headline-info");
  if (sensInfo) {
    sensInfo.classList.add("tooltip-trigger");
    if (!sensInfo.getAttribute("data-tooltip-key")) {
      sensInfo.setAttribute(
        "data-tooltip",
        "In this summary, the cost column shows the economic cost for each scenario over the selected time horizon. Total economic cost and net benefit are aggregated across all cohorts in millions of rupees. Total WTP benefits summarise how much value stakeholders place on each configuration, while the outbreak response column isolates the part of that value linked to faster detection and response. Epidemiological outbreak benefits appear when the outbreak benefit switch is on and the epidemiological module is active. The effective WTP benefit scales total WTP by the endorsement rate used in the calculation. Benefit cost ratios compare total benefits with total costs, and net present values show the difference between benefits and costs in rupee terms. Values above one for benefit cost ratios and positive net present values indicate that estimated benefits exceed costs under the current assumptions."
      );
    }
    sensInfo.removeAttribute("title");
  }

  const copilotInfo = document.getElementById("copilot-howto-info");
  const copilotText = document.getElementById("copilot-howto-text");
  if (copilotInfo) {
    copilotInfo.classList.add("tooltip-trigger");
    if (!copilotInfo.getAttribute("data-tooltip-key")) {
      copilotInfo.setAttribute(
        "data-tooltip",
        "First, use the other STEPS tabs to define a scenario you want to interpret. Apply the configuration, review endorsement, WTP, costs and epidemiological outbreak benefits, and check the national and sensitivity views. When you are ready, move to the Copilot tab to prepare a narrative briefing. When you press the Copilot button, STEPS rebuilds the interpretation prompt using the latest scenario and model outputs. The prompt combines a short description of STEPS, instructions for Copilot and the full JSON export for the current scenario. The aim is to guide Copilot to prepare a three to five page policy brief for discussions with ministries, World Bank staff and other partners. The brief is requested as a narrative report with clear sections such as background, scenario description, endorsement patterns, costs, epidemiological benefits, benefit cost ratios, net present values, distributional considerations and implementation notes, and includes compact tables for key indicators. After copying the text from the prompt panel, open Microsoft Copilot in a new browser tab or in the window that STEPS opens, paste the full content into the prompt box and run it. You can then edit the draft policy brief in Copilot or in your preferred word processor, keeping a record of the assumptions and JSON values supplied by STEPS."
      );
    }
    copilotInfo.removeAttribute("title");
  }
  if (copilotText) {
    copilotText.textContent =
      "Define a scenario in the other tabs, then use this Copilot tab to generate a draft policy brief. Copy the prepared prompt into Microsoft Copilot and refine the brief there.";
  }
}

/* ===========================
   Tabs (UI contract: .tablink, .tabcontent, data-tab points to panel id)
   =========================== */

function initTabs() {
  const tabLinks = Array.from(document.querySelectorAll(".tablink[data-tab]"));
  const panels = Array.from(document.querySelectorAll(".tabcontent"));

  if (!tabLinks.length || !panels.length) return;

  panels.forEach((p) => {
    if (!p.dataset.defaultDisplay) {
      const computed = window.getComputedStyle(p).display;
      p.dataset.defaultDisplay = computed && computed !== "none" ? computed : "block";
    }
  });

  function openTab(panelId, btn) {
    panels.forEach((panel) => {
      panel.style.display = "none";
      panel.classList.remove("active");
    });
    tabLinks.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });

    const panel = document.getElementById(panelId);
    if (panel) {
      panel.style.display = panel.dataset.defaultDisplay || "block";
      panel.classList.add("active");
    }
    if (btn) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    }
  }

  tabLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      if (!target) return;
      openTab(target, btn);
    });
  });

  const currentActive = tabLinks.find((b) => b.classList.contains("active"));
  const initial = currentActive || tabLinks[0];
  if (initial) {
    const target = initial.getAttribute("data-tab");
    if (target) openTab(target, initial);
  }
}

/* ===========================
   Guided tour
   =========================== */

function initGuidedTour() {
  const trigger = document.getElementById("btn-start-tour");
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

  function showStep(index) {
    const stepsArr = appState.tour.steps;
    if (!stepsArr.length) return;
    const i = clamp(index, 0, stepsArr.length - 1);
    appState.tour.currentIndex = i;
    const el = stepsArr[i];
    if (!el) return;

    const title = el.getAttribute("data-tour-title") || "STEPS tour";
    const content = el.getAttribute("data-tour-content") || "";

    document.getElementById("tour-title").textContent = title;
    document.getElementById("tour-body").textContent = content;
    document.getElementById("tour-indicator").textContent = `Step ${i + 1} of ${stepsArr.length}`;

    overlay.classList.remove("hidden");
    popover.classList.remove("hidden");

    positionTourPopover(popover, el);
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

  trigger.addEventListener("click", () => showStep(0));

  overlay.addEventListener("click", endTour);
  popover.querySelector(".tour-close-btn").addEventListener("click", endTour);
  popover.querySelector("#tour-prev").addEventListener("click", () => showStep(appState.tour.currentIndex - 1));
  popover.querySelector("#tour-next").addEventListener("click", () => {
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
  const tier = document.getElementById("program-tier").value;
  const career = document.getElementById("career-track").value;
  const mentorship = document.getElementById("mentorship").value;
  const delivery = document.getElementById("delivery").value;

  let response = "7";
  const responseEl = document.getElementById("response");
  if (responseEl) {
    responseEl.value = "7";
    response = "7";
  }

  const costSlider = Number(document.getElementById("cost-slider").value);
  const trainees = Number(document.getElementById("trainees").value);
  const cohorts = Number(document.getElementById("cohorts").value);

  // Settings: planning horizon is stored in appState.epiSettings.general
  const planningInput = document.getElementById("planning-horizon");
  let planningHorizonYears = appState.epiSettings.general.planningHorizonYears;
  if (planningInput) {
    const phVal = Number(planningInput.value);
    if (!isNaN(phVal) && phVal > 0) {
      planningHorizonYears = phVal;
    }
  }
  appState.epiSettings.general.planningHorizonYears = planningHorizonYears;

  const oppIncluded = document.getElementById("opp-toggle").classList.contains("on");

  const scenarioName =
    document.getElementById("scenario-name").value.trim() || `${tier} ${mentorship} ${cohorts} cohorts`;
  const scenarioNotes = document.getElementById("scenario-notes").value.trim();

  // NEW: mentor support cost per cohort (base) and feasibility inputs (defensive reads)
  const mentorBaseEl = document.getElementById("mentor-support-cost-per-cohort");
  let mentorSupportCostPerCohortBase = 0;
  if (mentorBaseEl) {
    const v = Number(mentorBaseEl.value);
    if (!isNaN(v) && v >= 0) mentorSupportCostPerCohortBase = v;
  }

  const availableMentorsEl = document.getElementById("available-mentors-national");
  let availableMentorsNational = 200;
  if (availableMentorsEl) {
    const v = Number(availableMentorsEl.value);
    if (!isNaN(v) && v >= 0) availableMentorsNational = v;
  }

  const sitesEl = document.getElementById("available-training-sites");
  let availableTrainingSites = 0;
  if (sitesEl) {
    const v = Number(sitesEl.value);
    if (!isNaN(v) && v >= 0) availableTrainingSites = v;
  }

  const maxCohortsEl = document.getElementById("max-cohorts-per-site");
  let maxCohortsPerSitePerYear = 0;
  if (maxCohortsEl) {
    const v = Number(maxCohortsEl.value);
    if (!isNaN(v) && v >= 0) maxCohortsPerSitePerYear = v;
  }

  const crossSectorEl = document.getElementById("cross-sector-benefit-multiplier");
  let crossSectorBenefitMultiplier = 1.0;
  if (crossSectorEl) {
    const v = Number(crossSectorEl.value);
    if (!isNaN(v) && v > 0) crossSectorBenefitMultiplier = v;
  }
  // Clamp recommended range if provided
  crossSectorBenefitMultiplier = Math.max(0.8, Math.min(2.0, crossSectorBenefitMultiplier));

  // NEW: optional export notes (persisted into scenarios for briefing/exports)
  const enablersEl = document.getElementById("export-enablers");
  const risksEl = document.getElementById("export-risks");
  const exportEnablers = enablersEl ? (enablersEl.value || "").trim() : "";
  const exportRisks = risksEl ? (risksEl.value || "").trim() : "";

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
    preferenceModel: "Mixed logit model from the preference study",

    // NEW fields
    mentorSupportCostPerCohortBase,
    availableMentorsNational,
    availableTrainingSites,
    maxCohortsPerSitePerYear,
    crossSectorBenefitMultiplier,
    exportEnablers,
    exportRisks
  };
}


function tierEffect(tier) {
  return MXL_COEFS.tier[tier] || 0;
}

function careerEffect(career) {
  return MXL_COEFS.career[career] || 0;
}

function mentorshipEffect(m) {
  return MXL_COEFS.mentorship[m] || 0;
}

function deliveryEffect(d) {
  return MXL_COEFS.delivery[d] || 0;
}

function responseEffect(r) {
  return MXL_COEFS.response[r] || 0;
}

function computeEndorsementAndWTP(config) {
  const costThousands = config.costPerTraineePerMonth / 1000;
  const utilProgram =
    MXL_COEFS.ascProgram +
    tierEffect(config.tier) +
    careerEffect(config.career) +
    mentorshipEffect(config.mentorship) +
    deliveryEffect(config.delivery) +
    responseEffect(config.response) +
    MXL_COEFS.costPerThousand * costThousands;

  const utilOptOut = MXL_COEFS.ascOptOut;

  const maxU = Math.max(utilProgram, utilOptOut);
  const expProg = Math.exp(utilProgram - maxU);
  const expOpt = Math.exp(utilOptOut - maxU);
  const denom = expProg + expOpt;

  const endorseProb = denom > 0 ? expProg / denom : 0.5;
  const optOutProb = 1 - endorseProb;

  const nonCostUtility =
    MXL_COEFS.ascProgram +
    tierEffect(config.tier) +
    careerEffect(config.career) +
    mentorshipEffect(config.mentorship) +
    deliveryEffect(config.delivery) +
    responseEffect(config.response);

  const wtpPerTraineePerMonth = (nonCostUtility / Math.abs(MXL_COEFS.costPerThousand)) * 1000;

  return {
    endorseRate: clamp(endorseProb * 100, 0, 100),
    optOutRate: clamp(optOutProb * 100, 0, 100),
    wtpPerTraineePerMonth
  };
}

function mentorshipMultiplier(intensity) {
  if (String(intensity) === "medium") return 1.3;
  if (String(intensity) === "high") return 1.7;
  return 1.0;
}

function computeCosts(config) {
  const months = TIER_MONTHS[config.tier] || 12;
  const directCostPerTraineePerMonth = config.costPerTraineePerMonth;
  const trainees = config.traineesPerCohort;

  const programmeCostPerCohort = directCostPerTraineePerMonth * months * trainees;

  // NEW: mentor support costs (base × mentorship multiplier)
  const mentorBase = Number(config.mentorSupportCostPerCohortBase || 0);
  const mentorMult = mentorshipMultiplier(config.mentorship);
  const mentorCostPerCohort = mentorBase * mentorMult;

  // Direct cost excludes opportunity cost, but includes mentor support costs
  const directCostPerCohort = programmeCostPerCohort + mentorCostPerCohort;

  const templatesForTier = COST_TEMPLATES[config.tier];
  const template =
    (COST_CONFIG && COST_CONFIG[config.tier] && COST_CONFIG[config.tier].combined) ||
    (templatesForTier && templatesForTier.combined);

  let oppRate = template ? template.oppRate : 0;
  if (!config.opportunityCostIncluded) {
    oppRate = 0;
  }

  // Keep prior behaviour: opportunity cost is applied to programme delivery costs
  const opportunityCost = programmeCostPerCohort * oppRate;

  const totalEconomicCost = directCostPerCohort + opportunityCost;

  // Convenience totals across all cohorts
  const totalMentorCostAllCohorts = mentorCostPerCohort * (config.cohorts || 0);
  const totalDirectCostAllCohorts = directCostPerCohort * (config.cohorts || 0);
  const totalEconomicCostAllCohorts = totalEconomicCost * (config.cohorts || 0);

  return {
    programmeCostPerCohort,
    mentorSupportCostPerCohortBase: mentorBase,
    mentorCostMultiplier: mentorMult,
    mentorCostPerCohort,
    directCostPerCohort,
    opportunityCostPerCohort: opportunityCost,
    totalEconomicCostPerCohort: totalEconomicCost,
    totalMentorCostAllCohorts,
    totalDirectCostAllCohorts,
    totalEconomicCostAllCohorts,
    template
  };
}


function computeEpidemiological(config, endorseRate) {
  const tierSettings = appState.epiSettings.tiers[config.tier];
  const general = appState.epiSettings.general;

  const completionRate = tierSettings.completionRate;
  const outbreaksPerGrad = tierSettings.outbreaksPerGraduatePerYear;
  const valuePerOutbreak = tierSettings.valuePerOutbreak;

  // Optional non-outbreak value (per graduate per year); defaults to 0 if not used.
  const valuePerGraduate = Number(tierSettings.valuePerGraduate || 0);

  const planningYears = general.planningHorizonYears;
  const discountRate = general.epiDiscountRate;

  const pvFactor = presentValueFactor(discountRate, planningYears);
  const endorseFactor = endorseRate / 100;

  const months = TIER_MONTHS[config.tier] || 12;

  const enrolledPerCohort = config.traineesPerCohort;
  const completedPerCohort = enrolledPerCohort * completionRate;
  const graduatesEffective = completedPerCohort * endorseFactor;

  const graduatesAllCohorts = graduatesEffective * config.cohorts;

  const respMultiplier = RESPONSE_TIME_MULTIPLIERS[String(config.response)] || 1;

  const outbreaksPerYearPerCohort = graduatesEffective * outbreaksPerGrad * respMultiplier;
  const outbreaksPerYearNational = outbreaksPerYearPerCohort * config.cohorts;

  // Base PV benefits
  const graduateAnnualBenefitPerCohort = graduatesEffective * valuePerGraduate;
  const graduateBenefitPerCohort = graduateAnnualBenefitPerCohort * pvFactor;

  const outbreakAnnualBenefitPerCohort = outbreaksPerYearPerCohort * valuePerOutbreak;
  const outbreakPVPerCohort = outbreakAnnualBenefitPerCohort * pvFactor;

  // NEW: cross-sector / One Health multiplier applied to epidemiological benefits only
  let crossSectorMultiplier = Number(config.crossSectorBenefitMultiplier || 1.0);
  if (isNaN(crossSectorMultiplier) || crossSectorMultiplier <= 0) crossSectorMultiplier = 1.0;
  crossSectorMultiplier = Math.max(0.8, Math.min(2.0, crossSectorMultiplier));

  const graduateBenefitAdj = graduateBenefitPerCohort * crossSectorMultiplier;
  const outbreakPVAdj = outbreakPVPerCohort * crossSectorMultiplier;

  const totalEpiBenefitPerCohort = graduateBenefitAdj + outbreakPVAdj;

  return {
    months,
    graduatesPerCohort: graduatesEffective,
    graduatesAllCohorts,
    outbreaksPerYearPerCohort,
    outbreaksPerYearNational,
    epiBenefitPerCohort: totalEpiBenefitPerCohort,
    graduateBenefitPerCohort: graduateBenefitAdj,
    outbreakPVPerCohort: outbreakPVAdj,
    planningYears,
    discountRate,
    completionRate,
    outbreaksPerGraduatePerYear: outbreaksPerGrad,
    valuePerOutbreak,
    valuePerGraduate,
    crossSectorMultiplier
  };
}

function mentorshipMentorCapacity(intensity) {
  if (String(intensity) === "high") return 2;
  if (String(intensity) === "medium") return 3.5;
  return 5;
}

function computeCapacity(config) {
  const trainees = Number(config.traineesPerCohort || 0);
  const cohorts = Number(config.cohorts || 0);

  const fellowsPerMentor = mentorshipMentorCapacity(config.mentorship);
  const mentorsPerCohort = fellowsPerMentor > 0 ? Math.ceil(trainees / fellowsPerMentor) : 0;
  const totalMentorsRequired = mentorsPerCohort * cohorts;

  const availableMentors = Number(config.availableMentorsNational ?? 200);
  const mentorShortfall = Math.max(0, totalMentorsRequired - (isNaN(availableMentors) ? 0 : availableMentors));
  const withinMentorCapacity = totalMentorsRequired <= (isNaN(availableMentors) ? 0 : availableMentors);

  // Optional sites/hubs capacity (if provided)
  const sites = Number(config.availableTrainingSites || 0);
  const maxCohortsPerSite = Number(config.maxCohortsPerSitePerYear || 0);

  let siteCapacity = null;
  let siteGap = null;
  let withinSiteCapacity = null;
  if (!isNaN(sites) && !isNaN(maxCohortsPerSite) && sites > 0 && maxCohortsPerSite > 0) {
    siteCapacity = sites * maxCohortsPerSite;
    siteGap = Math.max(0, cohorts - siteCapacity);
    withinSiteCapacity = cohorts <= siteCapacity;
  }

  const status = withinMentorCapacity ? "Within current capacity" : "Requires capacity expansion";

  return {
    fellowsPerMentor,
    mentorsPerCohort,
    totalMentorsRequired,
    availableMentors: isNaN(availableMentors) ? 0 : availableMentors,
    mentorShortfall,
    status,
    siteCapacity,
    siteGap,
    withinSiteCapacity
  };
}

function buildAssumptionsForScenario(scenario) {
  const c = scenario.config;
  const tierSettings = appState.epiSettings.tiers[c.tier] || {};
  const general = appState.epiSettings.general || {};

  return {
    planningHorizonYears: scenario.planningYears ?? general.planningHorizonYears,
    discountRate: scenario.discountRate ?? general.epiDiscountRate,
    completionRate: scenario.epi?.completionRate ?? tierSettings.completionRate,
    outbreaksPerGraduatePerYear: scenario.epi?.outbreaksPerGraduatePerYear ?? tierSettings.outbreaksPerGraduatePerYear,
    valuePerOutbreak: scenario.epi?.valuePerOutbreak ?? tierSettings.valuePerOutbreak,
    valuePerGraduate: scenario.epi?.valuePerGraduate ?? tierSettings.valuePerGraduate ?? 0,
    opportunityCostIncluded: !!c.opportunityCostIncluded,
    mentorSupportCostPerCohortBase: Number(c.mentorSupportCostPerCohortBase || 0),
    mentorMultiplierApplied: mentorshipMultiplier(c.mentorship),
    crossSectorBenefitMultiplier: Number(c.crossSectorBenefitMultiplier || 1.0),
    availableMentorsNational: Number(c.availableMentorsNational ?? 200),
    availableTrainingSites: Number(c.availableTrainingSites || 0),
    maxCohortsPerSitePerYear: Number(c.maxCohortsPerSitePerYear || 0)
  };
}

function getSelectedScenarioIds() {
  const checks = Array.from(document.querySelectorAll('#scenario-table tbody input[type="checkbox"][data-scenario-id]'));
  return checks.filter((c) => c.checked).map((c) => c.getAttribute("data-scenario-id"));
}

function getShortlistedOrTopScenarios(limit = 3) {
  const selected = new Set(getSelectedScenarioIds());
  const saved = appState.savedScenarios.slice();

  if (selected.size > 0) {
    return saved.filter((s) => selected.has(s.id));
  }

  // Default: top scenarios by net benefit (all cohorts), descending
  saved.sort((a, b) => (b.netBenefitAllCohorts || 0) - (a.netBenefitAllCohorts || 0));
  return saved.slice(0, Math.min(limit, saved.length));
}

function getExportMode() {
  const brief = document.getElementById("export-mode-brief");
  const standard = document.getElementById("export-mode-standard");
  if (brief && brief.checked) return "brief";
  if (standard && standard.checked) return "standard";
  return "standard";
}

function getExportNotesFromUI() {
  const enablersEl = document.getElementById("export-enablers");
  const risksEl = document.getElementById("export-risks");
  return {
    enablers: enablersEl ? (enablersEl.value || "").trim() : "",
    risks: risksEl ? (risksEl.value || "").trim() : ""
  };
}



function scenarioTableMarkdownRows(items) {
  const header =
    "| Scenario | Endorsement | Perceived programme value (all cohorts) | Economic cost (all cohorts) | Epidemiological benefit (all cohorts) | Net benefit | BCR | Feasibility |\n" +
    "|---|---:|---:|---:|---:|---:|---:|---|\n";
  const body = items
    .map((s) => {
      const feas = s.capacity ? s.capacity.status : computeCapacity(s.config).status;
      return `| ${safeText(s.config.name || "Scenario")} | ${formatNumber(s.endorseRate, 1)}% | ${formatCurrencyDisplay(
        s.wtpAllCohorts,
        0
      )} | ${formatCurrencyDisplay(s.natTotalCost, 0)} | ${formatCurrencyDisplay(s.epiBenefitAllCohorts, 0)} | ${formatCurrencyDisplay(
        s.netBenefitAllCohorts,
        0
      )} | ${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"} | ${safeText(feas)} |`;
    })
    .join("\n");
  return header + body;
}

function escapeHtmlSimple(x) {
  return safeText(x)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateValidationWarnings(config) {
  const container = document.getElementById("config-warnings");
  if (!container) return;

  const warnings = [];

  const totalTrainees = (Number(config.cohorts || 0) * Number(config.traineesPerCohort || 0)) || 0;
  if (totalTrainees >= 2000) {
    warnings.push(
      `Check realism: cohorts × trainees per cohort = ${formatNumber(totalTrainees, 0)}. Confirm staffing, sites, and scheduling assumptions.`
    );
  }

  const sliderEl = document.getElementById("cost-slider");
  if (sliderEl) {
    const min = Number(sliderEl.min);
    const max = Number(sliderEl.max);
    const v = Number(sliderEl.value);
    if (!isNaN(min) && !isNaN(max) && max > min) {
      const p = (v - min) / (max - min);
      if (p <= 0.05 || p >= 0.95) {
        warnings.push("Cost input is near the slider extreme. Sense-check whether the cost per trainee-month is realistic.");
      }
    }
  }

  if (warnings.length === 0) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "";
  container.innerHTML = warnings.map((w) => `<p class="warn">⚠ ${escapeHtmlSimple(w)}</p>`).join("");
}




function computeScenario(config) {
  const pref = computeEndorsementAndWTP(config);
  const costs = computeCosts(config);
  const epi = computeEpidemiological(config, pref.endorseRate);
  const capacity = computeCapacity(config);

  const wtpPerTraineePerMonth = pref.wtpPerTraineePerMonth;

  const wtpPerCohort = wtpPerTraineePerMonth * epi.months * config.traineesPerCohort;
  const wtpAllCohorts = wtpPerCohort * config.cohorts;

  const epiBenefitPerCohort = epi.epiBenefitPerCohort;
  const epiBenefitAllCohorts = epiBenefitPerCohort * config.cohorts;

  const netBenefitPerCohort = epiBenefitPerCohort - costs.totalEconomicCostPerCohort;
  const netBenefitAllCohorts = epiBenefitAllCohorts - costs.totalEconomicCostPerCohort * config.cohorts;

  const bcrPerCohort =
    costs.totalEconomicCostPerCohort > 0 ? epiBenefitPerCohort / costs.totalEconomicCostPerCohort : null;

  const natTotalCost = costs.totalEconomicCostPerCohort * config.cohorts;
  const natBcr = natTotalCost > 0 ? epiBenefitAllCohorts / natTotalCost : null;

  // Retain existing decomposition placeholder; unchanged computation
  const wtpOutbreakComponent = wtpAllCohorts * 0.3;

  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    config,
    preferenceModel: config.preferenceModel,
    endorseRate: pref.endorseRate,
    optOutRate: pref.optOutRate,

    // "Perceived programme value" (previously WTP) - calculations unchanged
    wtpPerTraineePerMonth,
    wtpPerCohort,
    wtpAllCohorts,
    wtpOutbreakComponent,

    costs,
    epi,
    capacity,

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
    discountRate: epi.discountRate,
    planningYears: epi.planningYears
  };
}


/* ===========================
   Charts
   =========================== */

function ensureChart(ctxId, type, data, options) {
  if (!window.Chart) return null;
  const ctx = document.getElementById(ctxId)?.getContext("2d");
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
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  };
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
    datasets: [
      {
        label: "Per cohort (INR)",
        data: [scenario.epiBenefitPerCohort, scenario.costs.totalEconomicCostPerCohort]
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => formatNumber(value, 0) }
      }
    }
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
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => formatNumber(value, 0) } }
    }
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
  const slider = document.getElementById("cost-slider");
  const display = document.getElementById("cost-display");
  if (!slider || !display) return;
  const val = Number(slider.value);
  display.textContent = formatCurrencyDisplay(val, 0);
}

function updateCurrencyToggle() {
  const label = document.getElementById("currency-label");
  const buttons = Array.from(document.querySelectorAll(".pill-toggle"));
  buttons.forEach((btn) => {
    const c = btn.getAttribute("data-currency");
    if (c === appState.currency) btn.classList.add("active");
    else btn.classList.remove("active");
  });
  if (label) label.textContent = appState.currency;
  if (appState.currentScenario) refreshAllOutputs(appState.currentScenario);
}

/* ===========================
   Settings tab (UI contract)
   =========================== */

function readSettingsFormValues() {
  const form = document.getElementById("settingsForm");
  if (!form) return null;

  const inputs = Array.from(form.querySelectorAll("input, select, textarea"));
  const values = {};

  inputs.forEach((el) => {
    if (!el || el.disabled) return;
    const key = el.name || el.id;
    if (!key) return;

    let value = null;
    if (el.type === "checkbox") value = !!el.checked;
    else value = el.value;

    values[key] = value;
  });

  return values;
}

function applySettingsValuesToState(values) {
  if (!values) return;

  const general = appState.epiSettings.general;
  const tiers = appState.epiSettings.tiers;

  const applyToAllTiers = (fn) => {
    ["frontline", "intermediate", "advanced"].forEach((tier) => fn(tiers[tier], tier));
  };

  Object.keys(values).forEach((k) => {
    const raw = values[k];
    const lower = String(k).toLowerCase();
    const num = Number(raw);

    if (lower.includes("planning") && lower.includes("horizon")) {
      const v = Number(raw);
      if (isFinite(v) && v > 0) general.planningHorizonYears = Math.round(v);
      return;
    }

    if (lower.includes("discount")) {
      const v = Number(raw);
      if (isFinite(v) && v >= 0) {
        let r = v;
        if (r > 1) r = r / 100;
        general.epiDiscountRate = clamp(r, 0, 1);
      }
      return;
    }

    if ((lower.includes("usd") || lower.includes("exchange") || lower.includes("inr_to_usd") || lower.includes("inrtousd"))) {
      const v = Number(raw);
      if (isFinite(v) && v > 0) {
        general.inrToUsdRate = v;
        appState.usdRate = v;
      }
      return;
    }

    if (lower.includes("value") && lower.includes("outbreak")) {
      const vInr = parseSensitivityValueToINR(raw);
      if (vInr && isFinite(vInr) && vInr > 0) {
        applyToAllTiers((t) => {
          t.valuePerOutbreak = vInr;
        });
      } else if (isFinite(num) && num > 0) {
        let v = num;
        if (v < 1000) v = v * 1e6;
        applyToAllTiers((t) => {
          t.valuePerOutbreak = v;
        });
      }
      return;
    }

    if (lower.includes("completion") && lower.includes("rate")) {
      if (isFinite(num) && num >= 0) {
        let cr = num;
        if (cr > 1) cr = cr / 100;
        cr = clamp(cr, 0, 1);
        applyToAllTiers((t) => {
          t.completionRate = cr;
        });
      }
      return;
    }

    if (lower.includes("outbreaks") && lower.includes("graduate")) {
      if (isFinite(num) && num >= 0) {
        applyToAllTiers((t) => {
          t.outbreaksPerGraduatePerYear = num;
        });
      }
      return;
    }

    if (lower.includes("value") && lower.includes("graduate")) {
      if (isFinite(num) && num >= 0) {
        applyToAllTiers((t) => {
          t.valuePerGraduate = num;
        });
      }
      return;
    }
  });

  appState.settings.lastAppliedValues = values;

  syncOutbreakValueDropdownsFromState();
}

function buildHumanReadableSettingsSummary() {
  const g = appState.epiSettings.general;
  const t = appState.epiSettings.tiers.frontline;

  const parts = [];
  parts.push(`Planning horizon ${formatNumber(g.planningHorizonYears, 0)} years`);
  parts.push(`Discount rate ${formatNumber(g.epiDiscountRate * 100, 1)} percent`);
  parts.push(`INR per USD ${formatNumber(g.inrToUsdRate, 2)}`);
  parts.push(`Value per outbreak ₹${formatNumber(t.valuePerOutbreak, 0)}`);
  parts.push(`Completion rate ${formatNumber(t.completionRate * 100, 1)} percent`);
  parts.push(`Outbreaks per graduate per year ${formatNumber(t.outbreaksPerGraduatePerYear, 2)}`);
  return parts.join("; ");
}

function appendSettingsLogEntry(text) {
  const time = new Date().toLocaleString();

  const targets = [];
  const contractLog = document.getElementById("settingsLog");
  const sessionLog = document.getElementById("settings-log");
  const advLog = document.getElementById("adv-settings-log");

  if (contractLog) targets.push(contractLog);
  if (sessionLog && sessionLog !== contractLog) targets.push(sessionLog);
  if (advLog && advLog !== sessionLog && advLog !== contractLog) targets.push(advLog);

  if (!targets.length) return;

  targets.forEach((log) => {
    const entry = document.createElement("div");
    entry.className = "settings-log-entry";
    entry.textContent = `[${time}] ${text}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  });
}

function initApplySettingsButton() {
  const btn = document.getElementById("applySettingsBtn");
  if (!btn) return;

  btn.disabled = false;
  btn.removeAttribute("aria-disabled");

  btn.addEventListener("click", () => {
    const values = readSettingsFormValues();
    applySettingsValuesToState(values);

    if (appState.currentScenario) {
      const c = { ...appState.currentScenario.config };
      c.planningHorizonYears = appState.epiSettings.general.planningHorizonYears;
      const newScenario = computeScenario(c);
      appState.currentScenario = newScenario;
      refreshAllOutputs(newScenario);
    }

    const summary = buildHumanReadableSettingsSummary();
    appendSettingsLogEntry(`Settings applied. ${summary}.`);
    showToast("Settings applied.", "success");

    syncOutbreakValueDropdownsFromState();
  });
}

/* ===========================
   Results and national tabs updates
   =========================== */

function updateConfigSummary(scenario) {
  const container = document.getElementById("config-summary");
  if (!container) return;

  const c = scenario.config;
  container.innerHTML = "";

  const rows = [
    {
      label: "Programme tier",
      value: c.tier === "frontline" ? "Frontline" : c.tier === "intermediate" ? "Intermediate" : "Advanced"
    },
    {
      label: "Career incentive",
      value:
        c.career === "certificate"
          ? "Government and partner certificate"
          : c.career === "uniqual"
          ? "University qualification"
          : "Government career pathway"
    },
    {
      label: "Mentorship intensity",
      value: c.mentorship === "low" ? "Low" : c.mentorship === "medium" ? "Medium" : "High"
    },
    {
      label: "Delivery mode",
      value: c.delivery === "blended" ? "Blended" : c.delivery === "inperson" ? "Fully in person" : "Fully online"
    },
    { label: "Response time", value: "Detect and respond within 7 days" },
    { label: "Cost per trainee per month", value: formatCurrencyDisplay(c.costPerTraineePerMonth, 0) },
    { label: "Trainees per cohort", value: formatNumber(c.traineesPerCohort, 0) },
    { label: "Number of cohorts", value: formatNumber(c.cohorts, 0) },
    {
      label: "Planning horizon (years)",
      value: formatNumber(c.planningHorizonYears || appState.epiSettings.general.planningHorizonYears, 0)
    },
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

  const endorsementEl = document.getElementById("config-endorsement-value");
  if (endorsementEl) endorsementEl.textContent = formatNumber(scenario.endorseRate, 1) + "%";

  const statusTag = document.getElementById("headline-status-tag");
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
      statusText = "Challenging configuration (Less support and the WTP value is below the cost)";
    }

    statusTag.classList.add(statusClass);
    statusTag.textContent = statusText;
  }

  const headlineText = document.getElementById("headline-recommendation");
  if (headlineText) {
    const endorse = formatNumber(scenario.endorseRate, 1);
    const cost = formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0);
    const bcr = scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-";
    headlineText.textContent =
      `The mixed logit preference model points to an endorsement rate of about ${endorse} percent, an economic cost of ${cost} per cohort and an indicative outbreak cost saving to cost ratio near ${bcr}. These values give a concise starting point for discussions with ministries and partners.`;
  }

  const briefingEl = document.getElementById("headline-briefing-text");
  if (briefingEl) {
    const natCost = formatCurrencyDisplay(scenario.natTotalCost, 0);
    const natBenefit = formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0);
    const natBcr = scenario.natBcr !== null ? formatNumber(scenario.natBcr, 2) : "-";
    briefingEl.textContent =
      `With this configuration, about ${formatNumber(scenario.endorseRate, 1)} percent of stakeholders are expected to endorse the investment. Running ${formatNumber(
        scenario.config.cohorts,
        0
      )} cohorts of ${formatNumber(scenario.config.traineesPerCohort, 0)} trainees leads to a total economic cost of roughly ${natCost} over the planning horizon and an indicative outbreak related economic cost saving of roughly ${natBenefit}. The national benefit cost ratio is around ${natBcr}, based on the outbreak value and epidemiological assumptions set in the settings and methods.`;
  }
}

function updateResultsTab(scenario) {
  const endorseEl = document.getElementById("endorsement-rate");
  const optOutEl = document.getElementById("optout-rate");
  const wtpPerTraineeEl = document.getElementById("wtp-per-trainee");
  const wtpTotalCohortEl = document.getElementById("wtp-total-cohort");
  const progCostEl = document.getElementById("prog-cost-per-cohort");
  const totalCostEl = document.getElementById("total-cost");
  const netBenefitEl = document.getElementById("net-benefit");
  const bcrEl = document.getElementById("bcr");
  const gradsEl = document.getElementById("epi-graduates");
  const outbreaksEl = document.getElementById("epi-outbreaks");
  const epiBenefitEl = document.getElementById("epi-benefit");

  // NEW elements (defensive)
  const mentorCostEl = document.getElementById("mentor-cost-per-cohort");
  const directCostEl = document.getElementById("direct-cost-per-cohort");

  // Capacity panel elements (defensive)
  const capMentorsPerCohortEl = document.getElementById("capacity-mentors-per-cohort");
  const capTotalMentorsEl = document.getElementById("capacity-total-mentors");
  const capAvailableMentorsEl = document.getElementById("capacity-available-mentors");
  const capShortfallEl = document.getElementById("capacity-mentor-shortfall");
  const capStatusEl = document.getElementById("capacity-status");
  const capNoteEl = document.getElementById("capacity-note");
  const capSiteCapacityEl = document.getElementById("capacity-site-capacity");
  const capSiteGapEl = document.getElementById("capacity-site-gap");
  const capSitesRow = document.getElementById("capacity-sites-row");

  if (endorseEl) endorseEl.textContent = formatNumber(scenario.endorseRate, 1) + "%";
  if (optOutEl) optOutEl.textContent = formatNumber(scenario.optOutRate, 1) + "%";

  // Relabelled in UI as perceived programme value; IDs retained for backwards compatibility
  if (wtpPerTraineeEl) wtpPerTraineeEl.textContent = formatCurrencyDisplay(scenario.wtpPerTraineePerMonth, 0);
  if (wtpTotalCohortEl) wtpTotalCohortEl.textContent = formatCurrencyDisplay(scenario.wtpPerCohort, 0);

  if (progCostEl) progCostEl.textContent = formatCurrencyDisplay(scenario.costs.programmeCostPerCohort, 0);
  if (mentorCostEl) mentorCostEl.textContent = formatCurrencyDisplay(scenario.costs.mentorCostPerCohort, 0);
  if (directCostEl) directCostEl.textContent = formatCurrencyDisplay(scenario.costs.directCostPerCohort, 0);

  // Existing "total-cost" remains economic cost per cohort
  if (totalCostEl) totalCostEl.textContent = formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0);

  if (netBenefitEl) netBenefitEl.textContent = formatCurrencyDisplay(scenario.netBenefitPerCohort, 0);
  if (bcrEl) bcrEl.textContent = scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-";

  if (gradsEl) gradsEl.textContent = formatNumber(scenario.graduatesAllCohorts, 0);
  if (outbreaksEl) outbreaksEl.textContent = formatNumber(scenario.outbreaksPerYearNational, 1);
  if (epiBenefitEl) epiBenefitEl.textContent = formatCurrencyDisplay(scenario.epiBenefitPerCohort, 0);

  // Capacity/feasibility
  if (scenario.capacity) {
    if (capMentorsPerCohortEl) capMentorsPerCohortEl.textContent = formatNumber(scenario.capacity.mentorsPerCohort, 0);
    if (capTotalMentorsEl) capTotalMentorsEl.textContent = formatNumber(scenario.capacity.totalMentorsRequired, 0);
    if (capAvailableMentorsEl) capAvailableMentorsEl.textContent = formatNumber(scenario.capacity.availableMentors, 0);
    if (capShortfallEl) capShortfallEl.textContent = formatNumber(scenario.capacity.mentorShortfall, 0);
    if (capStatusEl) capStatusEl.textContent = scenario.capacity.status || "-";

    if (capNoteEl) {
      if (scenario.capacity.mentorShortfall > 0) {
        capNoteEl.textContent = `Mentor gap of ${formatNumber(scenario.capacity.mentorShortfall, 0)} to meet the selected cohort and mentorship intensity.`;
      } else {
        capNoteEl.textContent = "Mentor capacity appears sufficient for the selected cohorts and mentorship intensity.";
      }
    }

    const showSites = scenario.capacity.siteCapacity !== null && scenario.capacity.siteCapacity !== undefined;
    if (capSitesRow) capSitesRow.style.display = showSites ? "" : "none";
    if (showSites) {
      if (capSiteCapacityEl) capSiteCapacityEl.textContent = formatNumber(scenario.capacity.siteCapacity, 1);
      if (capSiteGapEl) capSiteGapEl.textContent = formatNumber(scenario.capacity.siteGap, 1);
    }
  }
}


function updateCostingTab(scenario) {
  const select = document.getElementById("cost-source");
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
    if (templates && templates.combined) select.value = templates.combined.id;
  }

  const summaryBox = document.getElementById("cost-breakdown-summary");
  const tbody = document.getElementById("cost-components-list");
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
  const trainees = scenario.config.traineesPerCohort;
  const directForComponents = directCost;

  template.components.forEach((comp) => {
    const amount = directForComponents * comp.directShare;
    const perTraineePerMonth = trainees > 0 && months > 0 ? amount / (trainees * months) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${comp.label}</td>
      <td class="numeric-cell">${formatNumber(comp.directShare * 100, 1)}%</td>
      <td class="numeric-cell">${formatCurrencyDisplay(amount, 0)}</td>
      <td class="numeric-cell">${formatCurrencyDisplay(perTraineePerMonth, 0)}</td>
      <td>Included in combined template for this tier.</td>
    `;
    tbody.appendChild(tr);
  });


  // NEW: Mentor support cost as explicit component (per cohort)
  if (tbody && scenario.costs) {
    const mentorPerCohort = Number(scenario.costs.mentorCostPerCohort || 0);
    if (mentorPerCohort > 0) {
      const trainees = Number(scenario.config.traineesPerCohort || 0);
      const months = TIER_MONTHS[scenario.config.tier] || 12;
      const perTraineePerMonth = trainees > 0 && months > 0 ? mentorPerCohort / (trainees * months) : 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Mentor support (explicit)</td>
        <td class="numeric-cell">—</td>
        <td class="numeric-cell">${formatCurrencyDisplay(mentorPerCohort, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(perTraineePerMonth, 0)}</td>
        <td>Base mentor support cost per cohort scaled by mentorship intensity multiplier.</td>
      `;
      tbody.appendChild(tr);
    }
  }
}


function updateNationalSimulationTab(scenario) {
  const totCostEl = document.getElementById("nat-total-cost");
  const totBenefitEl = document.getElementById("nat-total-benefit");
  const netBenefitEl = document.getElementById("nat-net-benefit");
  const natBcrEl = document.getElementById("nat-bcr");
  const natGraduatesEl = document.getElementById("nat-graduates");
  const natOutbreaksEl = document.getElementById("nat-outbreaks");
  const natTotalWtpEl = document.getElementById("nat-total-wtp");
  const textEl = document.getElementById("natsim-summary-text");

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
      `At national level, this configuration would produce about ${formatNumber(
        scenario.graduatesAllCohorts,
        0
      )} graduates over the selected timeframe and support around ${formatNumber(
        scenario.outbreaksPerYearNational,
        1
      )} outbreak responses per year once all cohorts are complete. The total economic cost across all cohorts is roughly ${formatCurrencyDisplay(
        natCost,
        0
      )}, while the indicative outbreak related economic cost saving is roughly ${formatCurrencyDisplay(
        natBenefit,
        0
      )}. This implies a national benefit cost ratio of about ${natBcr !== null ? formatNumber(natBcr, 2) : "-"} and a net outbreak related cost saving of ${formatCurrencyDisplay(
        natNet,
        0
      )}. Total willingness to pay across all cohorts is roughly ${formatCurrencyDisplay(natTotalWtp, 0)}, which can be viewed alongside outbreak benefits when preparing business cases.`;
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

  const headerEls = Array.from(document.querySelectorAll("#scenario-table thead th"));
  const headers = headerEls.map((h) => (h.textContent || "").trim().toLowerCase());

  function cellNumeric(val, decimals = 0) {
    return `<td class="numeric-cell">${formatNumber(val, decimals)}</td>`;
  }
  function cellCurrency(val, decimals = 0) {
    return `<td class="numeric-cell">${formatCurrencyDisplay(val, decimals)}</td>`;
  }

  appState.savedScenarios.forEach((s) => {
    const c = s.config;

    const tierLabel =
      c.tier === "advanced" ? "Advanced FETP" : c.tier === "intermediate" ? "Intermediate FETP" : "Other";
    const careerLabel =
      c.career === "high" ? "High (Guaranteed promotion track)" : c.career === "low" ? "Low (Certificate only)" : "Standard";
    const mentorshipLabel =
      c.mentorship === "high" ? "High (Intensive mentorship)" : c.mentorship === "low" ? "Low (Minimal)" : "Medium (Regular)";
    const deliveryLabel = c.delivery === "hybrid" ? "Hybrid (Online + Field)" : c.delivery === "inperson" ? "In-person" : "Online";
    const responseLabel = "Within 7 days";

    const cap = s.capacity || computeCapacity(c);

    const tagsHtml = `
      <td class="scenario-tags">
        <span class="tag-pill">${tierLabel}</span>
        <span class="tag-pill">${mentorshipLabel}</span>
        <span class="tag-pill">${deliveryLabel}</span>
      </td>
    `;

    const cellsByHeader = (h) => {
      if (h.includes("shortlist")) {
        return `<td><input type="checkbox" data-scenario-id="${s.id}" aria-label="Shortlist scenario"></td>`;
      }
      if (h === "name" || h.includes("scenario name")) {
        return `<td>${safeText(c.name)}</td>`;
      }
      if (h.includes("tag")) return tagsHtml;
      if (h.includes("tier")) return `<td>${tierLabel}</td>`;
      if (h.includes("career")) return `<td>${careerLabel}</td>`;
      if (h.includes("mentor") && h.includes("intensity")) return `<td>${mentorshipLabel}</td>`;
      if (h.includes("mentorship") && !h.includes("cost")) return `<td>${mentorshipLabel}</td>`;
      if (h.includes("delivery")) return `<td>${deliveryLabel}</td>`;
      if (h.includes("response")) return `<td>${responseLabel}</td>`;
      if (h === "cohorts" || h.includes("number of cohorts")) return cellNumeric(c.cohorts, 0);
      if (h.includes("trainees") && h.includes("cohort")) return cellNumeric(c.traineesPerCohort, 0);
      if (h.includes("cost per trainee") && h.includes("month")) return cellCurrency(c.costPerTraineePerMonth, 0);

      if (h.includes("mentor cost") && h.includes("per cohort")) return cellCurrency(s.costs?.mentorCostPerCohort ?? 0, 0);
      if (h.includes("total mentor")) return cellCurrency((s.costs?.mentorCostPerCohort ?? 0) * (c.cohorts || 0), 0);

      if (h.includes("direct cost") && (h.includes("total") || h.includes("all cohorts") || h.includes("national"))) {
        return cellCurrency(s.costs?.totalDirectCostAllCohorts ?? (s.costs?.directCostPerCohort ?? 0) * (c.cohorts || 0), 0);
      }
      if (h.includes("direct cost") && h.includes("per cohort")) {
        return cellCurrency(s.costs?.directCostPerCohort ?? 0, 0);
      }

      if (h.includes("economic cost") && (h.includes("total") || h.includes("all cohorts") || h.includes("national"))) {
        return cellCurrency(s.costs?.totalEconomicCostAllCohorts ?? s.natTotalCost ?? 0, 0);
      }
      if (h.includes("economic cost") && h.includes("per cohort")) {
        return cellCurrency(s.costs?.totalEconomicCostPerCohort ?? 0, 0);
      }

      if (h.includes("preference model")) return `<td>${safeText(s.preferenceModel)}</td>`;
      if (h.includes("endorse")) return cellNumeric(s.endorseRate, 1);

      if ((h.includes("wtp") || h.includes("perceived")) && h.includes("per trainee")) return cellCurrency(s.wtpPerTraineePerMonth, 0);
      if ((h.includes("wtp") || h.includes("perceived")) && h.includes("total") && h.includes("cohort")) return cellCurrency(s.wtpPerCohort, 0);
      if ((h.includes("wtp") || h.includes("perceived")) && (h.includes("all cohorts") || h.includes("national"))) return cellCurrency(s.wtpAllCohorts, 0);

      if (h.includes("bcr") && (h.includes("cohort") || h.includes("per cohort"))) {
        return `<td class="numeric-cell">${s.bcrPerCohort !== null ? formatNumber(s.bcrPerCohort, 2) : "-"}</td>`;
      }
      if (h.includes("bcr") && (h.includes("national") || h.includes("all cohorts"))) {
        return `<td class="numeric-cell">${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"}</td>`;
      }

      if (h.includes("total economic cost")) return cellCurrency(s.natTotalCost, 0);
      if (h.includes("epi benefit") && (h.includes("all cohorts") || h.includes("national"))) return cellCurrency(s.epiBenefitAllCohorts, 0);
      if (h.includes("epi benefit")) return cellCurrency(s.epiBenefitPerCohort, 0);
      if (h.includes("net benefit") && (h.includes("all cohorts") || h.includes("national"))) return cellCurrency(s.netBenefitAllCohorts, 0);
      if (h.includes("net benefit")) return cellCurrency(s.netBenefitPerCohort, 0);

      if (h.includes("feasibility") || (h.includes("capacity") && h.includes("status"))) return `<td>${safeText(cap.status)}</td>`;
      if (h.includes("mentor shortfall")) return cellNumeric(cap.mentorShortfall, 0);

      if (h.includes("actions") || h.includes("view")) {
        return `<td><button class="mini" data-snapshot="${s.id}">View</button></td>`;
      }

      // Fallback: keep blank cell to preserve alignment
      return `<td></td>`;
    };

    const tr = document.createElement("tr");

    if (headers.length > 0) {
      tr.innerHTML = headers.map((h) => cellsByHeader(h)).join("");
    } else {
      // Backwards compatible fallback (should not happen)
      tr.innerHTML = `
        <td><input type="checkbox" data-scenario-id="${s.id}" aria-label="Shortlist scenario"></td>
        <td>${safeText(c.name)}</td>
        ${tagsHtml}
        <td>${tierLabel}</td>
        <td>${careerLabel}</td>
        <td>${mentorshipLabel}</td>
        <td>${deliveryLabel}</td>
        <td>${responseLabel}</td>
        <td class="numeric-cell">${formatNumber(c.cohorts, 0)}</td>
        <td class="numeric-cell">${formatNumber(c.traineesPerCohort, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(c.costPerTraineePerMonth, 0)}</td>
        <td>${safeText(s.preferenceModel)}</td>
        <td class="numeric-cell">${formatNumber(s.endorseRate, 1)}%</td>
        <td class="numeric-cell">${formatCurrencyDisplay(s.wtpPerTraineePerMonth, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(s.wtpAllCohorts, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(s.natTotalCost, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(s.epiBenefitAllCohorts, 0)}</td>
        <td class="numeric-cell">${formatCurrencyDisplay(s.netBenefitAllCohorts, 0)}</td>
        <td class="numeric-cell">${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"}</td>
        <td><button class="mini" data-snapshot="${s.id}">View</button></td>
      `;
    }

    tbody.appendChild(tr);
  });

  // Attach snapshot click handler (delegated)
  tbody.querySelectorAll('button[data-snapshot]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-snapshot");
      const sc = appState.savedScenarios.find((x) => x.id === id);
      if (sc) openSnapshotModal(sc);
    });
  });
}


function exportScenariosToExcel() {
  if (!window.XLSX) {
    showToast("Excel export is not available in this browser.", "error");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: Scenario summary table
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
    "Opportunity cost included",
    "Mentor support cost base per cohort (INR)",
    "Mentor multiplier",
    "Mentor support cost per cohort (INR)",
    "Total mentor support cost all cohorts (INR)",
    "Programme cost per cohort (INR)",
    "Direct cost per cohort (INR)",
    "Opportunity cost per cohort (INR)",
    "Economic cost per cohort (INR)",
    "Total direct cost all cohorts (INR)",
    "Total economic cost all cohorts (INR)",
    "Preference model",
    "Endorsement (%)",
    "Perceived programme value per trainee per month (INR)",
    "Perceived programme value per cohort (INR)",
    "Total perceived programme value all cohorts (INR)",
    "Total epidemiological benefit per cohort (INR)",
    "Total epidemiological benefit all cohorts (INR)",
    "Net epidemiological benefit per cohort (INR)",
    "Net epidemiological benefit all cohorts (INR)",
    "BCR per cohort",
    "BCR national",
    "Outbreak responses per year (national)",
    "Cross-sector benefit multiplier",
    "Mentors required per cohort",
    "Total mentors required nationally",
    "Available mentors nationally",
    "Mentor shortfall",
    "Feasibility status",
    "Available training sites / hubs",
    "Max cohorts per site per year",
    "Implied annual site capacity (cohorts)",
    "Site capacity gap (cohorts)",
    "Notes",
    "Enablers (export)",
    "Risks (export)"
  ]);

  appState.savedScenarios.forEach((s) => {
    const c = s.config;
    const cap = s.capacity || computeCapacity(c);
    const a = buildAssumptionsForScenario(s);

    rows.push([
      c.name || "Scenario",
      c.tier,
      c.career,
      c.mentorship,
      c.delivery,
      c.response,
      c.cohorts,
      c.traineesPerCohort,
      c.costPerTraineePerMonth,
      c.opportunityCostIncluded ? "Yes" : "No",
      a.mentorSupportCostPerCohortBase,
      a.mentorMultiplierApplied,
      s.costs?.mentorCostPerCohort ?? 0,
      s.costs?.totalMentorCostAllCohorts ?? (s.costs?.mentorCostPerCohort ?? 0) * (c.cohorts || 0),
      s.costs?.programmeCostPerCohort ?? 0,
      s.costs?.directCostPerCohort ?? 0,
      s.costs?.opportunityCostPerCohort ?? 0,
      s.costs?.totalEconomicCostPerCohort ?? 0,
      s.costs?.totalDirectCostAllCohorts ?? (s.costs?.directCostPerCohort ?? 0) * (c.cohorts || 0),
      s.costs?.totalEconomicCostAllCohorts ?? s.natTotalCost ?? 0,
      s.preferenceModel,
      s.endorseRate,
      s.wtpPerTraineePerMonth,
      s.wtpPerCohort,
      s.wtpAllCohorts,
      s.epiBenefitPerCohort,
      s.epiBenefitAllCohorts,
      s.netBenefitPerCohort,
      s.netBenefitAllCohorts,
      s.bcrPerCohort !== null ? s.bcrPerCohort : "",
      s.natBcr !== null ? s.natBcr : "",
      s.outbreaksPerYearNational,
      a.crossSectorBenefitMultiplier,
      cap.mentorsPerCohort,
      cap.totalMentorsRequired,
      cap.availableMentors,
      cap.mentorShortfall,
      cap.status,
      a.availableTrainingSites,
      a.maxCohortsPerSitePerYear,
      cap.siteCapacity !== null ? cap.siteCapacity : "",
      cap.siteGap !== null ? cap.siteGap : "",
      c.notes || "",
      c.exportEnablers || "",
      c.exportRisks || ""
    ]);
  });

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, sheet, "STEPS scenarios");

  // Sheet 2: Assumptions used (scenario-specific)
  const aRows = [];
  aRows.push([
    "Scenario",
    "Planning horizon (years)",
    "Discount rate (%)",
    "Completion rate (%)",
    "Outbreak responses per graduate per year",
    "Value per outbreak (INR)",
    "Non-outbreak value per graduate per year (INR)",
    "Opportunity cost included",
    "Mentor cost base per cohort (INR)",
    "Mentorship multiplier applied",
    "Cross-sector benefit multiplier",
    "Available mentors nationally",
    "Available training sites / hubs",
    "Max cohorts per site per year"
  ]);

  appState.savedScenarios.forEach((s) => {
    const a = buildAssumptionsForScenario(s);
    aRows.push([
      s.config.name || "Scenario",
      a.planningHorizonYears,
      a.discountRate * 100,
      a.completionRate * 100,
      a.outbreaksPerGraduatePerYear,
      a.valuePerOutbreak,
      a.valuePerGraduate,
      a.opportunityCostIncluded ? "Yes" : "No",
      a.mentorSupportCostPerCohortBase,
      a.mentorMultiplierApplied,
      a.crossSectorBenefitMultiplier,
      a.availableMentorsNational,
      a.availableTrainingSites,
      a.maxCohortsPerSitePerYear
    ]);
  });

  const aSheet = XLSX.utils.aoa_to_sheet(aRows);
  XLSX.utils.book_append_sheet(wb, aSheet, "Assumptions");

  XLSX.writeFile(wb, "steps_saved_scenarios.xlsx");
  showToast("Excel file downloaded.", "success");
}


function exportScenariosToPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export is not available in this browser.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const mode = getExportMode();

  const notes = getExportNotesFromUI();
  const scenarios =
    mode === "brief" ? getShortlistedOrTopScenarios(3) : appState.savedScenarios.slice();

  if (scenarios.length === 0) {
    showToast("Save at least one scenario before exporting.", "warning");
    return;
  }

  function sortByNetBenefitDesc(a, b) {
    return (b.netBenefitAllCohorts || 0) - (a.netBenefitAllCohorts || 0);
  }

  const recommended = scenarios.slice().sort(sortByNetBenefitDesc)[0] || scenarios[0];
  const recommendedAssumptions = buildAssumptionsForScenario(recommended);
  const recommendedCapacity = recommended.capacity || computeCapacity(recommended.config);

  const doc =
    mode === "brief" ? new jsPDF({ orientation: "portrait" }) : new jsPDF({ orientation: "landscape" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  function addWrappedText(text, x, y, maxWidth, lineHeight) {
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach((ln) => {
      if (y > pageH - 12) {
        doc.addPage();
        y = 12;
      }
      doc.text(ln, x, y);
      y += lineHeight;
    });
    return y;
  }

  function drawBox(x, y, w, h, title) {
    doc.rect(x, y, w, h);
    if (title) {
      doc.setFontSize(10);
      doc.text(title, x + 2, y + 6);
    }
  }

  function scenarioTableMarkdownRows(items) {
    const header =
      "| Scenario | Endorsement | Perceived programme value (all cohorts) | Economic cost (all cohorts) | Epidemiological benefit (all cohorts) | Net benefit | BCR | Feasibility |\n" +
      "|---|---:|---:|---:|---:|---:|---:|---|\n";
    const body = items
      .map((s) => {
        const feas = s.capacity ? s.capacity.status : computeCapacity(s.config).status;
        return `| ${safeText(s.config.name || "Scenario")} | ${formatNumber(s.endorseRate, 1)}% | ${formatCurrencyDisplay(
          s.wtpAllCohorts,
          0
        )} | ${formatCurrencyDisplay(s.natTotalCost, 0)} | ${formatCurrencyDisplay(s.epiBenefitAllCohorts, 0)} | ${formatCurrencyDisplay(
          s.netBenefitAllCohorts,
          0
        )} | ${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"} | ${safeText(feas)} |`;
      })
      .join("\n");
    return header + body;
  }

  function writeAssumptionsBox(a, x, y, w) {
    const lines = [
      `Planning horizon: ${formatNumber(a.planningHorizonYears, 0)} years`,
      `Discount rate: ${formatNumber(a.discountRate * 100, 1)}%`,
      `Completion rate: ${formatNumber(a.completionRate * 100, 1)}%`,
      `Outbreak responses per graduate per year: ${formatNumber(a.outbreaksPerGraduatePerYear, 2)}`,
      `Value per outbreak (INR): ${formatCurrencyDisplay(a.valuePerOutbreak, 0)}`,
      `Non-outbreak value per graduate per year (INR): ${formatCurrencyDisplay(a.valuePerGraduate, 0)}`,
      `Opportunity cost included: ${a.opportunityCostIncluded ? "Yes" : "No"}`,
      `Mentor cost base per cohort (INR): ${formatCurrencyDisplay(a.mentorSupportCostPerCohortBase, 0)}`,
      `Mentorship multiplier applied: ${formatNumber(a.mentorMultiplierApplied, 1)}`,
      `Cross-sector benefit multiplier: ${formatNumber(a.crossSectorBenefitMultiplier, 2)}`,
      `Available mentors nationally: ${formatNumber(a.availableMentorsNational, 0)}`
    ];

    if (a.availableTrainingSites && a.maxCohortsPerSitePerYear) {
      lines.push(`Training sites/hubs: ${formatNumber(a.availableTrainingSites, 0)}; Max cohorts per site/year: ${formatNumber(a.maxCohortsPerSitePerYear, 0)}`);
    }

    doc.setFontSize(9);
    let yy = y;
    lines.forEach((ln) => {
      yy = addWrappedText(ln, x, yy, w, 4.5);
    });
    return yy;
  }

  if (mode === "brief") {
    // Page 1: headline + comparison table
    doc.setFontSize(16);
    doc.text("STEPS FETP India Decision Aid — Brief export", 14, 16);

    doc.setFontSize(11);
    const recLine =
      `Recommendation: ${safeText(recommended.config.name || "Selected scenario")} ranks highest by net epidemiological benefit ` +
      `among the included scenarios under the current assumptions and costing.`;
    addWrappedText(recLine, 14, 24, pageW - 28, 5);

    const tableY = 38;
    doc.setFontSize(10);
    doc.text("Scenario comparison (top/shortlisted):", 14, tableY);

    // Render a simple table
    const cols = [
      { label: "Scenario", w: 55 },
      { label: "Endorse", w: 20 },
      { label: "Value", w: 30 },
      { label: "Cost", w: 30 },
      { label: "Epi", w: 30 },
      { label: "Net", w: 30 },
      { label: "BCR", w: 15 },
      { label: "Feasibility", w: 25 }
    ];
    const x0 = 14;
    let y0 = tableY + 6;
    let x = x0;

    doc.setFontSize(9);
    cols.forEach((c) => {
      doc.text(c.label, x + 1, y0);
      x += c.w;
    });
    y0 += 3;
    doc.line(x0, y0, x0 + cols.reduce((s, c) => s + c.w, 0), y0);
    y0 += 5;

    scenarios.forEach((s) => {
      if (y0 > pageH - 30) {
        doc.addPage();
        y0 = 16;
      }
      const feas = s.capacity ? s.capacity.status : computeCapacity(s.config).status;

      const row = [
        safeText(s.config.name || "Scenario"),
        `${formatNumber(s.endorseRate, 0)}%`,
        formatCurrencyDisplay(s.wtpAllCohorts, 0),
        formatCurrencyDisplay(s.natTotalCost, 0),
        formatCurrencyDisplay(s.epiBenefitAllCohorts, 0),
        formatCurrencyDisplay(s.netBenefitAllCohorts, 0),
        s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-",
        safeText(feas)
      ];

      x = x0;
      row.forEach((val, idx) => {
        const w = cols[idx].w - 2;
        const textLines = doc.splitTextToSize(String(val), w);
        doc.text(textLines.slice(0, 2), x + 1, y0);
        x += cols[idx].w;
      });
      y0 += 10;
    });

    // Page 2: assumptions + feasibility + enablers/risks
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Assumptions and feasibility summary", 14, 16);

    // Assumptions box
    doc.setFontSize(10);
    doc.text("Assumptions used (for recommended scenario):", 14, 26);
    drawBox(14, 30, pageW - 28, 62, null);
    writeAssumptionsBox(recommendedAssumptions, 16, 36, pageW - 32);

    // Feasibility
    let y = 98;
    doc.setFontSize(10);
    doc.text("Capacity and feasibility:", 14, y);
    y += 6;
    doc.setFontSize(9);

    const feasLines = [
      `Status: ${safeText(recommendedCapacity.status)}`,
      `Required mentors per cohort: ${formatNumber(recommendedCapacity.mentorsPerCohort, 0)} (capacity: ${formatNumber(recommendedCapacity.fellowsPerMentor, 1)} fellows/mentor)`,
      `Total mentors required nationally: ${formatNumber(recommendedCapacity.totalMentorsRequired, 0)}`,
      `Available mentors nationally: ${formatNumber(recommendedCapacity.availableMentors, 0)}`,
      `Mentor shortfall: ${formatNumber(recommendedCapacity.mentorShortfall, 0)}`
    ];
    feasLines.forEach((ln) => {
      y = addWrappedText(ln, 14, y, pageW - 28, 4.5);
    });

    if (recommendedCapacity.siteCapacity !== null) {
      y = addWrappedText(
        `Training sites/hubs capacity: ${formatNumber(recommendedCapacity.siteCapacity, 1)} cohorts/year (gap: ${formatNumber(recommendedCapacity.siteGap, 1)}).`,
        14,
        y + 1,
        pageW - 28,
        4.5
      );
    }

    // Enablers / Risks
    y += 4;
    doc.setFontSize(10);
    doc.text("Implementation enablers and risks:", 14, y);
    y += 6;
    doc.setFontSize(9);

    const enablers = (notes.enablers || recommended.config.exportEnablers || "").trim();
    const risks = (notes.risks || recommended.config.exportRisks || "").trim();

    y = addWrappedText(`Enablers: ${enablers || "—"}`, 14, y, pageW - 28, 4.5);
    y = addWrappedText(`Risks: ${risks || "—"}`, 14, y + 1, pageW - 28, 4.5);

    doc.save("steps_saved_scenarios_brief.pdf");
    showToast("Brief PDF downloaded.", "success");
    return;
  }

  // Standard export (landscape): list scenarios with key metrics + assumptions box
  doc.setFontSize(14);
  doc.text("STEPS FETP India Decision Aid — Saved scenarios", 10, 12);

  let y = 20;
  doc.setFontSize(10);

  scenarios.forEach((s, idx) => {
    const c = s.config;
    const cap = s.capacity || computeCapacity(c);
    const a = buildAssumptionsForScenario(s);

    if (y > pageH - 40) {
      doc.addPage();
      y = 14;
    }

    doc.setFontSize(12);
    doc.text(`${idx + 1}. ${safeText(c.name || "Scenario")}`, 10, y);
    y += 6;

    doc.setFontSize(10);
    const line1 =
      `Endorsement: ${formatNumber(s.endorseRate, 1)}% | Perceived programme value (all cohorts): ${formatCurrencyDisplay(
        s.wtpAllCohorts,
        0
      )} | Economic cost (all cohorts): ${formatCurrencyDisplay(s.natTotalCost, 0)} | BCR: ${s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-"}`;
    y = addWrappedText(line1, 10, y, pageW - 20, 4.5);

    const line2 =
      `Mentor support cost per cohort: ${formatCurrencyDisplay(s.costs?.mentorCostPerCohort ?? 0, 0)} ` +
      `(${formatCurrencyDisplay(a.mentorSupportCostPerCohortBase, 0)} base × ${formatNumber(a.mentorMultiplierApplied, 1)} multiplier). ` +
      `Direct cost per cohort: ${formatCurrencyDisplay(s.costs?.directCostPerCohort ?? 0, 0)}. Economic cost per cohort: ${formatCurrencyDisplay(
        s.costs?.totalEconomicCostPerCohort ?? 0,
        0
      )} (${a.opportunityCostIncluded ? "includes" : "excludes"} opportunity cost).`;
    y = addWrappedText(line2, 10, y, pageW - 20, 4.5);

    const line3 =
      `Epidemiological benefit (all cohorts): ${formatCurrencyDisplay(s.epiBenefitAllCohorts, 0)} | Net epidemiological benefit (all cohorts): ${formatCurrencyDisplay(
        s.netBenefitAllCohorts,
        0
      )} | Outbreak responses/year (national): ${formatNumber(s.outbreaksPerYearNational, 1)} | Cross-sector multiplier: ${formatNumber(
        a.crossSectorBenefitMultiplier,
        2
      )}`;
    y = addWrappedText(line3, 10, y, pageW - 20, 4.5);

    const line4 =
      `Feasibility: ${safeText(cap.status)} (required mentors: ${formatNumber(cap.totalMentorsRequired, 0)}, available: ${formatNumber(
        cap.availableMentors,
        0
      )}, shortfall: ${formatNumber(cap.mentorShortfall, 0)}).`;
    y = addWrappedText(line4, 10, y, pageW - 20, 4.5);

    // Assumptions box
    const boxX = 10;
    const boxY = y + 2;
    const boxW = pageW - 20;
    const boxH = 32;
    drawBox(boxX, boxY, boxW, boxH, "Assumptions used");
    y = writeAssumptionsBox(a, boxX + 2, boxY + 10, boxW - 4);
    y = boxY + boxH + 8;
  });

  doc.save("steps_saved_scenarios.pdf");
  showToast("PDF downloaded.", "success");
}


/* ===========================
   WTP based benefits and sensitivity
   =========================== */

function getSensitivityControls() {
  const benefitModeSelect = getElByIdCandidates(["benefit-definition-select", "benefitDefinitionSelect"]);
  const epiToggle = getElByIdCandidates(["sensitivity-epi-toggle", "sensitivityEpiToggle"]);
  const endorsementOverrideInput = getElByIdCandidates(["endorsement-override", "endorsementOverride"]);

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
  const dceBody = document.getElementById("dce-benefits-table-body");
  const sensBody = document.getElementById("sensitivity-table-body");
  if (!dceBody || !sensBody) return;

  dceBody.innerHTML = "";
  sensBody.innerHTML = "";

  if (!appState.currentScenario) return;

  const controls = getSensitivityControls();

  const scenarios = [
    { label: "Current configuration", scenario: appState.currentScenario },
    ...appState.savedScenarios.map((s, idx) => ({
      label: s.config.name || `Saved scenario ${idx + 1}`,
      scenario: s
    }))
  ];

  scenarios.forEach(({ label, scenario }) => {
    const c = scenario.config;
    const s = computeSensitivityRow(scenario);

    let endorsementUsed = controls.endorsementOverride !== null ? controls.endorsementOverride : scenario.endorseRate;
    endorsementUsed = clamp(endorsementUsed, 0, 100);

    let effectiveWtp = s.wtpAll;
    if (controls.benefitMode === "endorsement_adjusted") {
      effectiveWtp = s.wtpAll * (endorsementUsed / 100);
    }

    let combinedBenefit = s.combinedBenefit;
    if (!controls.epiIncluded) {
      combinedBenefit = s.wtpAll;
    }

    const bcrDceOnly = s.costAll > 0 ? s.wtpAll / s.costAll : null;
    const bcrCombined = s.costAll > 0 ? combinedBenefit / s.costAll : null;

    const npvDceOnly = s.npvDceOnly;
    const npvCombined = combinedBenefit - s.costAll;

    const trHeadline = document.createElement("tr");
    trHeadline.innerHTML = `
      <td>${label}</td>
      <td class="numeric-cell">${formatCurrencyINR(s.costAll, 0)}</td>
      <td class="numeric-cell">${formatNumber(s.costAll / 1e6, 2)}</td>
      <td class="numeric-cell">${formatNumber(s.netAll / 1e6, 2)}</td>
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
      <td class="numeric-cell">${formatCurrencyINR(npvDceOnly / c.cohorts, 0)}</td>
      <td class="numeric-cell">${bcrCombined !== null ? formatNumber(bcrCombined, 2) : "-"}</td>
      <td class="numeric-cell">${formatCurrencyINR(npvCombined / c.cohorts, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR((s.wtpAll * (endorsementUsed / 100)) / c.cohorts, 0)}</td>
      <td class="numeric-cell">${formatCurrencyINR((combinedBenefit * (endorsementUsed / 100)) / c.cohorts, 0)}</td>
    `;
    sensBody.appendChild(trDetail);
  });
}

function exportSensitivityToExcel() {
  if (!window.XLSX) {
    showToast("Excel export is not available in this browser.", "error");
    return;
  }
  const table = document.getElementById("dce-benefits-table");
  if (!table) return;

  const wb = XLSX.utils.book_new();
  const sheet = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, sheet, "Sensitivity");
  XLSX.writeFile(wb, "steps_sensitivity_summary.xlsx");
  showToast("Sensitivity table Excel file downloaded.", "success");
}

/* ===========================
   Sensitivity contract controls and PDF export
   =========================== */

function exportSensitivityContainerToPdf() {
  const container = document.getElementById("sensitivityTableContainer");
  if (!container) {
    showToast("Sensitivity table is not available on this page.", "error");
    return;
  }
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export is not available in this browser.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 28;

  let y = margin;
  doc.setFontSize(13);
  doc.text("STEPS FETP India Decision Aid - Sensitivity analysis", margin, y);
  y += 18;

  const tables = Array.from(container.querySelectorAll("table"));

  if (doc.autoTable && tables.length) {
    tables.forEach((table) => {
      const headRow = table.querySelector("thead tr");
      const head = [];
      if (headRow) {
        head.push(Array.from(headRow.children).map((th) => th.textContent.trim()));
      }

      const body = [];
      const bodyRows = table.querySelectorAll("tbody tr");
      bodyRows.forEach((tr) => {
        const row = Array.from(tr.children).map((td) => td.textContent.trim());
        body.push(row);
      });

      if (!head.length || !body.length) return;

      if (y > pageH - margin - 80) {
        doc.addPage();
        y = margin;
      }

      const sectionTitle = table.getAttribute("aria-label") || table.getAttribute("data-title") || "";
      if (sectionTitle) {
        doc.setFontSize(11);
        doc.text(sectionTitle, margin, y);
        y += 12;
      }

      doc.setFontSize(8);
      doc.autoTable({
        head,
        body,
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: pageW - margin * 2,
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle"
        },
        headStyles: { fontSize: 7.5 },
        theme: "grid",
        pageBreak: "auto"
      });

      y = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : y + 20) + 16;
    });
  } else {
    const text = container.innerText || "";
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    doc.setFontSize(9);
    lines.forEach((line) => {
      if (y > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    });
  }

  doc.save("steps_sensitivity_table.pdf");
  showToast("Sensitivity PDF downloaded.", "success");
}

function initSensitivityContractControls() {
  const select = getElByIdCandidates(["sensitivityValueSelect", "sensitivity-value-select", "sensitivity-value"]);
  const applyBtn = getElByIdCandidates(["applySensitivityValueBtn", "apply-sensitivity-value", "applySensitivityBtn"]);
  const pdfBtn = getElByIdCandidates(["downloadSensitivityPDF", "download-sensitivity-pdf", "downloadSensitivityPdf"]);

  if (select) {
    ensureSelectHasOutbreakPresets(select);
    select.addEventListener("change", () => {
      const valueInINR = parseSensitivityValueToINR(select.value);
      if (valueInINR) {
        applyOutbreakPreset(valueInINR, { silentToast: true, silentLog: true });
      }
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (!select) {
        showToast("Sensitivity value selector is not available.", "error");
        return;
      }
      const valueInINR = parseSensitivityValueToINR(select.value);
      if (!valueInINR) {
        showToast("Select a valid sensitivity value before applying.", "warning");
        return;
      }
      applyOutbreakPreset(valueInINR, { silentToast: true, silentLog: false });
      showToast("Sensitivity value applied.", "success");
    });
  }

  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      exportSensitivityContainerToPdf();
    });
  }
}

/* ===========================
   Advanced settings
   =========================== */

function logSettingsMessage(message) {
  const targets = [];
  const sessionLog = document.getElementById("settings-log");
  const advLog = document.getElementById("adv-settings-log");
  const contractLog = document.getElementById("settingsLog");

  if (contractLog) targets.push(contractLog);
  if (sessionLog && sessionLog !== contractLog) targets.push(sessionLog);
  if (advLog && advLog !== sessionLog && advLog !== contractLog) targets.push(advLog);

  if (!targets.length) return;

  const time = new Date().toLocaleString();
  targets.forEach((box) => {
    const p = document.createElement("p");
    p.textContent = `[${time}] ${message}`;
    box.appendChild(p);
  });
}

function initAdvancedSettings() {
  const valueGradInput = document.getElementById("adv-value-per-graduate");
  const valueOutbreakInput = document.getElementById("adv-value-per-outbreak");
  const completionInput = document.getElementById("adv-completion-rate");
  const outbreaksPerGradInput = document.getElementById("adv-outbreaks-per-graduate");
  const horizonInput = document.getElementById("adv-planning-horizon");
  const discInput = document.getElementById("adv-epi-discount-rate");
  const usdRateInput = document.getElementById("adv-usd-rate");
  const applyBtn = document.getElementById("adv-apply-settings");
  const resetBtn = document.getElementById("adv-reset-settings");

  function writeLog(message) {
    logSettingsMessage(message);
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (valueGradInput && valueOutbreakInput && completionInput && outbreaksPerGradInput && horizonInput && discInput && usdRateInput) {
        const vGrad = Number(valueGradInput.value);
        const vOutParsed = parseSensitivityValueToINR(valueOutbreakInput.value);
        const vOut = vOutParsed !== null ? vOutParsed : Number(valueOutbreakInput.value);
        const compRateRaw = Number(completionInput.value);
        const compRate = isFinite(compRateRaw) ? clamp(compRateRaw / 100, 0, 1) : appState.epiSettings.tiers.frontline.completionRate;
        const outPerGrad = Number(outbreaksPerGradInput.value);
        const horizon = Number(horizonInput.value);
        const discRateRaw = Number(discInput.value);
        const discRate = isFinite(discRateRaw) ? clamp(discRateRaw / 100, 0, 1) : appState.epiSettings.general.epiDiscountRate;
        const usdRate = Number(usdRateInput.value);

        ["frontline", "intermediate", "advanced"].forEach((tier) => {
          appState.epiSettings.tiers[tier].valuePerGraduate = isFinite(vGrad) ? vGrad : 0;
          if (isFinite(vOut) && vOut > 0) appState.epiSettings.tiers[tier].valuePerOutbreak = vOut;
          appState.epiSettings.tiers[tier].completionRate = compRate;
          if (isFinite(outPerGrad) && outPerGrad >= 0) appState.epiSettings.tiers[tier].outbreaksPerGraduatePerYear = outPerGrad;
        });

        if (isFinite(horizon) && horizon > 0) appState.epiSettings.general.planningHorizonYears = horizon;
        appState.epiSettings.general.epiDiscountRate = discRate;

        if (isFinite(usdRate) && usdRate > 0) {
          appState.epiSettings.general.inrToUsdRate = usdRate;
          appState.usdRate = usdRate;
        }

        writeLog(
          "Advanced settings updated for graduate value, value per outbreak, completion rate, outbreaks per graduate, planning horizon, discount rate and INR per USD. Current outbreak cost saving calculations use the outbreak value and planning horizon."
        );

        syncOutbreakValueDropdownsFromState();

        if (appState.currentScenario) {
          const newScenario = computeScenario(appState.currentScenario.config);
          appState.currentScenario = newScenario;
          refreshAllOutputs(newScenario);
        }

        showToast("Advanced settings applied for this session.", "success");
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      appState.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
      appState.usdRate = DEFAULT_EPI_SETTINGS.general.inrToUsdRate;

      if (valueGradInput) valueGradInput.value = "0";
      if (valueOutbreakInput) valueOutbreakInput.value = "4000000";
      if (completionInput) completionInput.value = "90";
      if (outbreaksPerGradInput) outbreaksPerGradInput.value = "0.5";
      if (horizonInput) horizonInput.value = String(DEFAULT_EPI_SETTINGS.general.planningHorizonYears);
      if (discInput) discInput.value = String(DEFAULT_EPI_SETTINGS.general.epiDiscountRate * 100);
      if (usdRateInput) usdRateInput.value = String(DEFAULT_EPI_SETTINGS.general.inrToUsdRate);

      writeLog("Advanced settings reset to default values.");

      syncOutbreakValueDropdownsFromState();

      if (appState.currentScenario) {
        const newScenario = computeScenario(appState.currentScenario.config);
        appState.currentScenario = newScenario;
        refreshAllOutputs(newScenario);
      }

      showToast("Advanced settings reset to defaults.", "success");
    });
  }
}

function applyOutbreakPreset(valueInINR, options = {}) {
  const silentToast = !!options.silentToast;
  const silentLog = !!options.silentLog;

  if (isNaN(valueInINR) || valueInINR <= 0) return;

  ["frontline", "intermediate", "advanced"].forEach((tier) => {
    appState.epiSettings.tiers[tier].valuePerOutbreak = valueInINR;
  });

  const valueOutbreakInput = document.getElementById("adv-value-per-outbreak");
  if (valueOutbreakInput) valueOutbreakInput.value = String(valueInINR);

  syncOutbreakValueDropdownsFromState();

  if (appState.currentScenario) {
    const newScenario = computeScenario(appState.currentScenario.config);
    appState.currentScenario = newScenario;
    refreshAllOutputs(newScenario);
  }

  if (!silentLog) {
    logSettingsMessage(`Value per outbreak updated to ₹${formatNumber(valueInINR, 0)} per outbreak for all tiers from sensitivity controls.`);
  }

  if (!silentToast) {
    showToast(`Value per outbreak set to ₹${formatNumber(valueInINR, 0)} for all tiers.`, "success");
  }
}

/* ===========================
   Copilot integration
   =========================== */

function buildScenarioJsonForCopilot(scenario) {
  const c = scenario.config;
  const cap = scenario.capacity || computeCapacity(c);
  const assumptions = buildAssumptionsForScenario(scenario);

  return {
    name: c.name || "Scenario",
    tier: c.tier,
    career: c.career,
    mentorship: c.mentorship,
    delivery: c.delivery,
    responseTimeDays: c.response,
    cohorts: c.cohorts,
    traineesPerCohort: c.traineesPerCohort,
    costPerTraineePerMonthINR: c.costPerTraineePerMonth,
    opportunityCostIncluded: !!c.opportunityCostIncluded,
    mentorSupportCostPerCohortBaseINR: Number(c.mentorSupportCostPerCohortBase || 0),
    mentorMultiplierApplied: assumptions.mentorMultiplierApplied,
    crossSectorBenefitMultiplier: assumptions.crossSectorBenefitMultiplier,
    availableMentorsNational: assumptions.availableMentorsNational,
    availableTrainingSites: assumptions.availableTrainingSites,
    maxCohortsPerSitePerYear: assumptions.maxCohortsPerSitePerYear,

    results: {
      endorsementRatePct: scenario.endorseRate,
      optOutRatePct: scenario.optOutRate,
      perceivedProgrammeValuePerTraineePerMonthINR: scenario.wtpPerTraineePerMonth,
      perceivedProgrammeValueAllCohortsINR: scenario.wtpAllCohorts,

      programmeCostPerCohortINR: scenario.costs?.programmeCostPerCohort ?? 0,
      mentorSupportCostPerCohortINR: scenario.costs?.mentorCostPerCohort ?? 0,
      directCostPerCohortINR: scenario.costs?.directCostPerCohort ?? 0,
      economicCostPerCohortINR: scenario.costs?.totalEconomicCostPerCohort ?? 0,
      totalEconomicCostAllCohortsINR: scenario.natTotalCost,

      epidemiologicalBenefitAllCohortsINR: scenario.epiBenefitAllCohorts,
      netEpidemiologicalBenefitAllCohortsINR: scenario.netBenefitAllCohorts,
      bcrNational: scenario.natBcr,

      feasibility: {
        status: cap.status,
        mentorsPerCohort: cap.mentorsPerCohort,
        totalMentorsRequired: cap.totalMentorsRequired,
        availableMentors: cap.availableMentors,
        mentorShortfall: cap.mentorShortfall,
        siteCapacityCohortsPerYear: cap.siteCapacity,
        siteGapCohorts: cap.siteGap
      }
    },

    assumptionsUsed: {
      planningHorizonYears: assumptions.planningHorizonYears,
      discountRate: assumptions.discountRate,
      completionRate: assumptions.completionRate,
      outbreaksPerGraduatePerYear: assumptions.outbreaksPerGraduatePerYear,
      valuePerOutbreakINR: assumptions.valuePerOutbreak,
      nonOutbreakValuePerGraduatePerYearINR: assumptions.valuePerGraduate
    },

    exportNotes: {
      enablers: c.exportEnablers || "",
      risks: c.exportRisks || ""
    }
  };
}


function initCopilot() {
  const legacyBtn = document.getElementById("copilot-open-and-copy-btn");

  const copilotBtn = document.getElementById("copilot-copy-btn");
  const chatgptBtn = document.getElementById("chatgpt-copy-btn");
  const downloadBtn = document.getElementById("briefing-download-btn");

  const output = document.getElementById("copilot-prompt-output");
  const statusPill = document.getElementById("copilot-status-pill");
  const statusText = document.getElementById("copilot-status-text");

  function setStatus(ok, msg) {
    if (statusPill) statusPill.className = ok ? "pill ok" : "pill warn";
    if (statusText) statusText.textContent = msg;
  }

  function buildPrompt(target) {
    const selected = getShortlistedOrTopScenarios(3);
    const scenarios = selected.length > 0 ? selected : (appState.savedScenarios.slice().sort((a,b)=> (b.netBenefitAllCohorts||0)-(a.netBenefitAllCohorts||0)).slice(0,3));

    const recommended = scenarios.slice().sort((a, b) => (b.netBenefitAllCohorts || 0) - (a.netBenefitAllCohorts || 0))[0] || appState.currentScenario;
    const notes = getExportNotesFromUI();

    const scenarioObjects = scenarios.map(buildScenarioJsonForCopilot);
    const recObj = recommended ? buildScenarioJsonForCopilot(recommended) : null;

    const comparisonTable = scenarioTableMarkdownRows(scenarios);

    const assumptions = recObj ? recObj.assumptionsUsed : null;
    const feas = recObj ? recObj.results.feasibility : null;

    const systemHint =
      target === "copilot"
        ? "You are drafting a concise policy-style briefing based on the STEPS Decision Aid outputs."
        : "You are drafting a concise policy-style briefing based on the STEPS Decision Aid outputs. Use clear language and avoid jargon.";

    const enablers = (notes.enablers || (recObj && recObj.exportNotes.enablers) || "").trim();
    const risks = (notes.risks || (recObj && recObj.exportNotes.risks) || "").trim();

    const prompt = [
      systemHint,
      "",
      "Task:",
      "Write a two-page equivalent briefing (or slide-ready notes) summarising the shortlisted scenarios and recommending an option. Use the scenario comparison table and the assumptions box. Clearly separate: (i) context and options, (ii) results and interpretation, (iii) feasibility, (iv) risks and enablers, (v) recommendation.",
      "",
      "Key requirement:",
      "Use the term 'perceived programme value' for the preference-derived value metric (previously labelled WTP).",
      "",
      "Scenario comparison table (Markdown):",
      comparisonTable,
      "",
      "Assumptions used (recommended scenario):",
      assumptions
        ? [
            `Planning horizon: ${assumptions.planningHorizonYears} years`,
            `Discount rate: ${(assumptions.discountRate * 100).toFixed(1)}%`,
            `Completion rate: ${(assumptions.completionRate * 100).toFixed(1)}%`,
            `Outbreak responses per graduate per year: ${assumptions.outbreaksPerGraduatePerYear}`,
            `Value per outbreak (INR): ${assumptions.valuePerOutbreakINR}`,
            `Non-outbreak value per graduate per year (INR): ${assumptions.nonOutbreakValuePerGraduatePerYearINR}`,
            `Opportunity cost included: ${recObj.opportunityCostIncluded ? "Yes" : "No"}`,
            `Mentor cost base per cohort (INR): ${recObj.mentorSupportCostPerCohortBaseINR}`,
            `Mentorship multiplier applied: ${recObj.mentorMultiplierApplied}`,
            `Cross-sector benefit multiplier: ${recObj.crossSectorBenefitMultiplier}`,
            `Available mentors nationally: ${recObj.availableMentorsNational}`,
            recObj.availableTrainingSites && recObj.maxCohortsPerSitePerYear
              ? `Training sites/hubs: ${recObj.availableTrainingSites}; Max cohorts per site/year: ${recObj.maxCohortsPerSitePerYear}`
              : "Training sites/hubs inputs: not provided"
          ].join("\n")
        : "—",
      "",
      "Capacity and feasibility (recommended scenario):",
      feas
        ? [
            `Status: ${feas.status}`,
            `Mentors per cohort: ${feas.mentorsPerCohort}`,
            `Total mentors required: ${feas.totalMentorsRequired}`,
            `Available mentors: ${feas.availableMentors}`,
            `Mentor shortfall: ${feas.mentorShortfall}`,
            feas.siteCapacityCohortsPerYear !== null && feas.siteCapacityCohortsPerYear !== undefined
              ? `Site capacity (cohorts/year): ${feas.siteCapacityCohortsPerYear} (gap: ${feas.siteGapCohorts})`
              : "Site capacity: not assessed"
          ].join("\n")
        : "—",
      "",
      "Implementation enablers (optional):",
      enablers || "—",
      "",
      "Implementation risks (optional):",
      risks || "—",
      "",
      "Data payload (JSON):",
      JSON.stringify({ shortlistedScenarios: scenarioObjects, recommendedScenario: recObj }, null, 2)
    ].join("\n");

    return prompt;
  }

  function copyPromptToClipboard(prompt) {
    if (!navigator.clipboard) {
      setStatus(false, "Clipboard API not available. Copy manually from the text box.");
      return;
    }
    navigator.clipboard
      .writeText(prompt)
      .then(() => setStatus(true, "Prompt copied to clipboard."))
      .catch(() => setStatus(false, "Copy failed. Please copy manually."));
  }

  function handle(target) {
    if (!output) return;
    if (!appState.savedScenarios || appState.savedScenarios.length === 0) {
      setStatus(false, "Save at least one scenario first.");
      output.value = "";
      return;
    }
    const prompt = buildPrompt(target);
    output.value = prompt;
    copyPromptToClipboard(prompt);
  }

  // Backwards compatible behaviour: one button that generates and copies the prompt
  if (legacyBtn) {
    legacyBtn.addEventListener("click", () => handle("copilot"));
  }

  if (copilotBtn) copilotBtn.addEventListener("click", () => handle("copilot"));
  if (chatgptBtn) chatgptBtn.addEventListener("click", () => handle("chatgpt"));

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!output || !output.value) {
        setStatus(false, "Generate a prompt first.");
        return;
      }
      const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "steps_briefing_prompt.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(true, "Text file downloaded.");
    });
  }

  setStatus(true, "Ready.");
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

  const closeBtn = snapshotModal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    snapshotModal.classList.add("hidden");
  });
  snapshotModal.addEventListener("click", (e) => {
    if (e.target === snapshotModal) snapshotModal.classList.add("hidden");
  });
}

function openSnapshotModal(scenario) {
  ensureSnapshotModal();
  const body = snapshotModal.querySelector("#snapshot-body");
  if (body) {
    const c = scenario.config;
    const a = buildAssumptionsForScenario(scenario);

    const mentorBase = scenario.costs?.mentorSupportCostPerCohortBase ?? c.mentorSupportCostPerCohortBase ?? 0;
    const mentorMult = scenario.costs?.mentorCostMultiplier ?? mentorshipMultiplier(c.mentorship);
    const mentorPerCohort = scenario.costs?.mentorCostPerCohort ?? 0;
    const mentorAll = (mentorPerCohort || 0) * (c.cohorts || 0);

    const directPerCohort = scenario.costs?.directCostPerCohort ?? (scenario.costs?.programmeCostPerCohort || 0) + mentorPerCohort;
    const economicPerCohort = scenario.costs?.totalEconomicCostPerCohort ?? 0;

    const cap = scenario.capacity || computeCapacity(c);

    body.innerHTML = `
      <p><strong>Scenario name:</strong> ${safeText(c.name || "")}</p>
      <p><strong>Tier:</strong> ${safeText(c.tier)}</p>
      <p><strong>Career incentive:</strong> ${safeText(c.career)}</p>
      <p><strong>Mentorship:</strong> ${safeText(c.mentorship)}</p>
      <p><strong>Delivery mode:</strong> ${safeText(c.delivery)}</p>
      <p><strong>Response time:</strong> ${safeText(c.response)} days</p>
      <p><strong>Cohorts and trainees:</strong> ${formatNumber(c.cohorts, 0)} cohorts of ${formatNumber(c.traineesPerCohort, 0)} trainees</p>
      <p><strong>Cost per trainee per month:</strong> ${formatCurrencyDisplay(c.costPerTraineePerMonth, 0)}</p>

      <hr />

      <p><strong>Endorsement:</strong> ${formatNumber(scenario.endorseRate, 1)}%</p>
      <p><strong>Perceived programme value per trainee per month:</strong> ${formatCurrencyDisplay(scenario.wtpPerTraineePerMonth, 0)}</p>
      <p><strong>Total perceived programme value (all cohorts):</strong> ${formatCurrencyDisplay(scenario.wtpAllCohorts, 0)}</p>

      <hr />

      <p><strong>Mentor support cost per cohort (base):</strong> ${formatCurrencyDisplay(mentorBase, 0)} (multiplier ${formatNumber(mentorMult, 1)} applied)</p>
      <p><strong>Mentor support cost per cohort:</strong> ${formatCurrencyDisplay(mentorPerCohort, 0)}</p>
      <p><strong>Total mentor support cost (all cohorts):</strong> ${formatCurrencyDisplay(mentorAll, 0)}</p>

      <p><strong>Direct cost per cohort:</strong> ${formatCurrencyDisplay(directPerCohort, 0)}</p>
      <p><strong>Economic cost per cohort:</strong> ${formatCurrencyDisplay(economicPerCohort, 0)} ${c.opportunityCostIncluded ? "(includes opportunity cost)" : "(excludes opportunity cost)"}</p>

      <p><strong>Total economic cost all cohorts:</strong> ${formatCurrencyDisplay(scenario.natTotalCost, 0)}</p>

      <hr />

      <p><strong>Total indicative epidemiological benefit (per cohort):</strong> ${formatCurrencyDisplay(scenario.epiBenefitPerCohort, 0)}</p>
      <p><strong>Net epidemiological benefit (per cohort):</strong> ${formatCurrencyDisplay(scenario.netBenefitPerCohort, 0)}</p>
      <p><strong>Benefit cost ratio (per cohort):</strong> ${scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-"}</p>

      <p><strong>Total indicative epidemiological benefit (all cohorts):</strong> ${formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0)}</p>
      <p><strong>Net epidemiological benefit (all cohorts):</strong> ${formatCurrencyDisplay(scenario.netBenefitAllCohorts, 0)}</p>
      <p><strong>National benefit cost ratio:</strong> ${scenario.natBcr !== null ? formatNumber(scenario.natBcr, 2) : "-"}</p>

      <hr />

      <p><strong>Capacity and feasibility:</strong> ${safeText(cap.status)}</p>
      <p><strong>Required mentors per cohort:</strong> ${formatNumber(cap.mentorsPerCohort, 0)} (capacity: ${formatNumber(cap.fellowsPerMentor, 1)} fellows/mentor)</p>
      <p><strong>Total mentors required nationally:</strong> ${formatNumber(cap.totalMentorsRequired, 0)}</p>
      <p><strong>Available mentors nationally:</strong> ${formatNumber(cap.availableMentors, 0)}</p>
      <p><strong>Mentor shortfall:</strong> ${formatNumber(cap.mentorShortfall, 0)}</p>

      <hr />

      <p><strong>Assumptions used:</strong></p>
      <p>Planning horizon: ${formatNumber(a.planningHorizonYears, 0)} years; Discount rate: ${formatNumber(a.discountRate * 100, 1)}%</p>
      <p>Completion rate: ${formatNumber(a.completionRate * 100, 1)}%; Outbreak responses per graduate per year: ${formatNumber(a.outbreaksPerGraduatePerYear, 2)}</p>
      <p>Value per outbreak: ${formatCurrencyDisplay(a.valuePerOutbreak, 0)}; Non-outbreak value per graduate per year: ${formatCurrencyDisplay(a.valuePerGraduate, 0)}</p>
      <p>Cross-sector benefit multiplier: ${formatNumber(a.crossSectorBenefitMultiplier, 2)}</p>
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
  syncOutbreakValueDropdownsFromState();
  if (scenario && scenario.config) {
    updateValidationWarnings(scenario.config);
  }
}


function initEventHandlers() {
  const costSlider = document.getElementById("cost-slider");
  if (costSlider) {
    costSlider.addEventListener("input", () => updateCostSliderLabel());
  }

  const currencyButtons = Array.from(document.querySelectorAll(".pill-toggle"));
  currencyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const currency = btn.getAttribute("data-currency");
      if (currency && currency !== appState.currency) {
        appState.currency = currency;
        updateCurrencyToggle();
      }
    });
  });

  const oppToggle = document.getElementById("opp-toggle");
  if (oppToggle) {
    oppToggle.addEventListener("click", () => {
      const on = oppToggle.classList.toggle("on");
      const label = oppToggle.querySelector(".switch-label");
      if (label) {
        label.textContent = on ? "Opportunity cost included" : "Opportunity cost excluded";
      }
      if (appState.currentScenario) {
        const newScenario = computeScenario(appState.currentScenario.config);
        appState.currentScenario = newScenario;
        refreshAllOutputs(newScenario);
      }
    });
  }

  const updateBtn = document.getElementById("update-results");
  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      const config = getConfigFromForm();
      const scenario = computeScenario(config);
      appState.currentScenario = scenario;
      refreshAllOutputs(scenario);
      showToast("Configuration applied and results updated.", "success");
    });
  }

  const snapshotBtn = document.getElementById("open-snapshot");
  if (snapshotBtn) {
    snapshotBtn.addEventListener("click", () => {
      if (!appState.currentScenario) {
        showToast("Apply a configuration before opening the summary.", "warning");
        return;
      }
      openSnapshotModal(appState.currentScenario);
    });
  }

  const saveScenarioBtn = document.getElementById("save-scenario");
  if (saveScenarioBtn) {
    saveScenarioBtn.addEventListener("click", () => {
      if (!appState.currentScenario) {
        showToast("Apply a configuration before saving a scenario.", "warning");
        return;
      }
      appState.savedScenarios.push(appState.currentScenario);
      refreshSavedScenariosTable();
      refreshSensitivityTables();
      showToast("Scenario saved for comparison and export.", "success");
    });
  }

  const exportExcelBtn = document.getElementById("export-excel");
  if (exportExcelBtn) exportExcelBtn.addEventListener("click", () => exportScenariosToExcel());

  const exportPdfBtn = document.getElementById("export-pdf");
  if (exportPdfBtn) exportPdfBtn.addEventListener("click", () => exportScenariosToPdf());

  const sensUpdateBtn = document.getElementById("refresh-sensitivity-benefits");
  if (sensUpdateBtn) {
    sensUpdateBtn.addEventListener("click", () => {
      if (!appState.currentScenario) {
        showToast("Apply a configuration before updating the sensitivity summary.", "warning");
        return;
      }
      refreshSensitivityTables();
      showToast("Sensitivity summary updated.", "success");
    });
  }

  const sensExcelBtn = document.getElementById("export-sensitivity-benefits-excel");
  if (sensExcelBtn) sensExcelBtn.addEventListener("click", () => exportSensitivityToExcel());

  const epiToggle = getElByIdCandidates(["sensitivity-epi-toggle", "sensitivityEpiToggle"]);
  if (epiToggle) {
    epiToggle.addEventListener("click", () => {
      const on = epiToggle.classList.toggle("on");
      const label = epiToggle.querySelector(".switch-label");
      if (label) label.textContent = on ? "Outbreak benefits included" : "Outbreak benefits excluded";
      if (appState.currentScenario) refreshSensitivityTables();
    });
  }

  const outbreakPresetSelect = getElByIdCandidates(["outbreak-value-preset", "outbreakValuePreset", "outbreak-value"]);
  if (outbreakPresetSelect) {
    ensureSelectHasOutbreakPresets(outbreakPresetSelect);
    outbreakPresetSelect.addEventListener("change", () => {
      const valueInINR = parseSensitivityValueToINR(outbreakPresetSelect.value);
      if (valueInINR) {
        applyOutbreakPreset(valueInINR);
      }
    });
  }

  const outbreakApplyBtn = getElByIdCandidates(["apply-outbreak-value", "applyOutbreakValue", "applyOutbreakPreset"]);
  if (outbreakApplyBtn && outbreakPresetSelect) {
    outbreakApplyBtn.addEventListener("click", () => {
      const valueInINR = parseSensitivityValueToINR(outbreakPresetSelect.value);
      if (valueInINR) {
        applyOutbreakPreset(valueInINR);
      } else {
        showToast("Select a value per outbreak before applying.", "warning");
      }
    });
  }

  const benefitDefSelect = getElByIdCandidates(["benefit-definition-select", "benefitDefinitionSelect"]);
  if (benefitDefSelect) {
    benefitDefSelect.addEventListener("change", () => {
      if (!appState.currentScenario) return;
      refreshSensitivityTables();
    });
  }

  const endorsementOverrideInput = getElByIdCandidates(["endorsement-override", "endorsementOverride"]);
  if (endorsementOverrideInput) {
    endorsementOverrideInput.addEventListener("change", () => {
      if (!appState.currentScenario) return;
      refreshSensitivityTables();
    });
  }

  initApplySettingsButton();
  initSensitivityContractControls();
}

/* ===========================
   Initialise
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  COST_CONFIG = COST_TEMPLATES;

  initTabs();
  initDefinitionTooltips();
  initTooltips();
  initGuidedTour();
  initAdvancedSettings();
  initCopilot();

  enforceResponseTimeFixedTo7Days();
  initOutbreakSensitivityDropdowns();

  initEventHandlers();
  updateCostSliderLabel();
  updateCurrencyToggle();
});
