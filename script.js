/* ===================================================
   STEPS FETP India Decision Aid
   Script with interactive DCE sensitivity / benefits tab
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
   Cost templates (fallback)
   =========================== */

const COST_TEMPLATES = {
  frontline: {
    who: {
      id: "who",
      label: "Frontline - WHO template (6 cohorts)",
      description:
        "WHO costing template for Frontline FETP with six cohorts. Includes staff, travel, supervision and management costs.",
      oppRate: 0.15,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.40 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.20
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.15
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.15
        },
        { id: "overheads", label: "Management and overheads", directShare: 0.10 }
      ]
    }
  },
  intermediate: {
    who: {
      id: "who",
      label: "Intermediate - WHO template",
      description:
        "WHO costing template for Intermediate FETP. Reflects a mix of direct training and supervision costs.",
      oppRate: 0.20,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.38 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.18
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.14
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.18
        },
        {
          id: "overheads",
          label: "Management and overheads",
          directShare: 0.12
        }
      ]
    },
    nie: {
      id: "nie",
      label: "Intermediate - NIE template",
      description:
        "NIE budget template for Intermediate FETP. Slightly higher supervision share.",
      oppRate: 0.22,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.36 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.18
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.12
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.22
        },
        {
          id: "overheads",
          label: "Management and overheads",
          directShare: 0.12
        }
      ]
    },
    ncdc: {
      id: "ncdc",
      label: "Intermediate - NCDC template",
      description:
        "NCDC costing assumptions for Intermediate FETP. Higher management share.",
      oppRate: 0.18,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.35 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.17
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.13
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.20
        },
        {
          id: "overheads",
          label: "Management and overheads",
          directShare: 0.15
        }
      ]
    }
  },
  advanced: {
    nie: {
      id: "nie",
      label: "Advanced - NIE template",
      description:
        "NIE budget template for Advanced FETP. Reflects intensive staff time and supervision.",
      oppRate: 0.25,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.45 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.18
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.10
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.17
        },
        {
          id: "overheads",
          label: "Management and overheads",
          directShare: 0.10
        }
      ]
    },
    ncdc: {
      id: "ncdc",
      label: "Advanced - NCDC template",
      description:
        "NCDC costing assumptions for Advanced FETP. Slightly higher overhead share.",
      oppRate: 0.23,
      components: [
        { id: "staff", label: "Staff and tutors", directShare: 0.42 },
        {
          id: "travel",
          label: "Trainee travel and field work",
          directShare: 0.19
        },
        {
          id: "materials",
          label: "Training materials and supplies",
          directShare: 0.11
        },
        {
          id: "supervision",
          label: "Supervision and mentoring costs",
          directShare: 0.16
        },
        {
          id: "overheads",
          label: "Management and overheads",
          directShare: 0.12
        }
      ]
    }
  }
};

/* External JSON-driven cost configuration (if present) */
let COST_CONFIG = null;

/* ===========================
   Epidemiological settings
   =========================== */

const DEFAULT_EPI_SETTINGS = {
  general: {
    planningHorizonYears: 5,
    inrPerUsd: 83
  },
  tiers: {
    frontline: {
      gradShare: 0.9,
      outbreaksPerCohortPerYear: 0.3,
      valuePerGraduate: 800000,
      valuePerOutbreak: 30000000
    },
    intermediate: {
      gradShare: 0.92,
      outbreaksPerCohortPerYear: 0.45,
      valuePerGraduate: 1000000,
      valuePerOutbreak: 35000000
    },
    advanced: {
      gradShare: 0.95,
      outbreaksPerCohortPerYear: 0.8,
      valuePerGraduate: 1200000,
      valuePerOutbreak: 40000000
    }
  }
};

/* Response-time multipliers for outbreak benefits */
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
STEPS Tool Copilot Interpretation Prompt
Act as a senior health economist advising the Ministry of Health and Family Welfare in India on the national scale up of Field Epidemiology Training Programs. You are working with outputs from the STEPS FETP India Decision Aid. The scenario JSON you will receive summarises the configuration selected by the user, including programme tier, career pathway, mentorship intensity, delivery mode, outbreak response time, cost per trainee per month, number of cohorts and all model based outputs. Latent class results have been removed and should not be discussed. All other model components remain valid and must be interpreted.
Use the JSON provided to reconstruct the scenario in clear plain language. Describe the configuration by stating which FETP tier is being scaled, the intake size, the main design elements related to careers, mentorship, delivery and response time, and the implied cost per trainee and the total economic cost across all cohorts. Present this description with precision so that senior decision makers can immediately understand what the configuration represents and the resources it requires.
Explain the discrete choice experiment endorsement results in intuitive terms and state what proportion of key stakeholders are predicted to support the configuration. Clarify whether support appears low, moderate or strong in the context of national scale up decisions in India. If there are any differences in endorsement associated with faster response time or stronger mentorship, articulate these clearly for policy makers.
Interpret the willingness to pay estimates as monetary summaries of how strongly stakeholders value the configuration. Make clear that willingness to pay is considered a benefit measure because it reflects the maximum monetary amount that informed stakeholders would hypothetically exchange to secure improvements in epidemiological training, mentoring, outbreak response and system capacity relative to the status quo. State that willingness to pay captures perceived programme value in financial units, allowing direct comparison with the economic costs of scale up and enabling the economic case to be assessed in terms of whether the perceived value generated by the programme exceeds its cost. Explain how total willingness to pay across all cohorts compares with total economic cost. Indicate whether stakeholders appear willing to pay more, about the same or less than the programme would cost to implement. Discuss the implications of this relationship for political feasibility, acceptability to partners and the strength of the economic case from a preference based perspective. If there are separate elements of willingness to pay related to response time, explain how much additional value stakeholders attach to faster detection and earlier control of outbreaks.
Summarise the epidemiological outputs by describing the expected number of graduates, the number of outbreak responses supported per year and the approximate monetary value of these epidemiological benefits. Clarify what these figures imply for India’s surveillance and response capacity and how the selected tier contributes to detecting events at the front line, analysing and interpreting surveillance data at the intermediate level or providing advanced leadership for complex responses. State whether the combined costs and epidemiological benefits yield a benefit cost ratio that is clearly above one, close to one or below one and interpret what that means for value for money in the Indian context.
Bring the results together in a concise policy interpretation suitable for a cabinet note or a national steering committee briefing. Make an explicit judgement about whether the scenario appears highly attractive, promising but in need of refinement or weak from a value for money perspective. Refer directly to endorsement, willingness to pay, epidemiological benefits, total economic cost, benefit cost ratio and net benefits when forming this judgement. Where useful, highlight trade offs between the selected tier and other tiers. Comment on affordability and fiscal space by situating the total economic cost against the likely scale up budget envelope for FETP within the health system.
Provide a short set of policy recommendations. Indicate whether the scenario is suitable for national scale up, targeted scale up in selected states, further piloting or redesign. Suggest practical adjustments that could improve feasibility or value. Present the final output as a polished policy brief with clear section headings and well structured paragraphs. Include a results table that summarises the configuration, endorsement, willingness to pay results, epidemiological benefits, total economic costs, benefit cost ratio and net benefit.
`;

/* ===========================
   Global state
   =========================== */

const state = {
  model: "mxl",             // always mixed logit in this version
  currency: "INR",          // "INR" or "USD" display
  includeOpportunityCost: true,
  epiSettings: JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS)),
  currentTier: "frontline",
  currentCostSourceId: null,
  lastResults: null,
  scenarios: [],
  charts: {
    uptake: null,
    bcr: null,
    epi: null,
    natCostBenefit: null,
    natEpi: null
  },
  tour: {
    seen: false,
    active: false,
    stepIndex: 0,
    steps: []
  }
};

/* ===========================
   Utility helpers
   =========================== */

function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
}

function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `${value.toFixed(decimals)} %`;
}

function formatCurrencyInr(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return `INR ${value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  })}`;
}

function formatCurrency(valueInInr, currency = "INR", decimalsInr = 0) {
  if (valueInInr === null || valueInInr === undefined || isNaN(valueInInr)) {
    return "-";
  }
  if (currency === "USD") {
    const rate = state.epiSettings.general.inrPerUsd || 83;
    const valueUsd = valueInInr / rate;
    return `USD ${valueUsd.toLocaleString("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    })}`;
  }
  return formatCurrencyInr(valueInInr, decimalsInr);
}

function logistic(x) {
  if (x > 50) return 1;
  if (x < -50) return 0;
  return 1 / (1 + Math.exp(-x));
}

/* In this version all preference calculations use the mixed logit only */
function getModelCoefs(modelId) {
  return MXL_COEFS;
}

function getTierLabel(tier) {
  if (tier === "intermediate") return "Intermediate";
  if (tier === "advanced") return "Advanced";
  return "Frontline";
}

function getCareerLabel(id) {
  const map = {
    certificate: "Government and partner certificate",
    uniqual: "University qualification",
    career_path: "Government career pathway"
  };
  return map[id] || id;
}

function getMentorshipLabel(id) {
  const map = {
    low: "Low mentorship",
    medium: "Medium mentorship",
    high: "High mentorship"
  };
  return map[id] || id;
}

function getDeliveryLabel(id) {
  const map = {
    blended: "Blended",
    inperson: "Fully in-person",
    online: "Fully online"
  };
  return map[id] || id;
}

function getResponseLabel(val) {
  if (val === "7") return "Detect and respond within 7 days";
  if (val === "15") return "Detect and respond within 15 days";
  return "Detect and respond within 30 days";
}

function getTierMonths(tier) {
  return TIER_MONTHS[tier] || 12;
}

/* ===========================
   Configuration reading
   =========================== */

function readConfigurationFromInputs() {
  const tier = document.getElementById("program-tier").value;
  const career = document.getElementById("career-track").value;
  const mentorship = document.getElementById("mentorship").value;
  const delivery = document.getElementById("delivery").value;
  const response = document.getElementById("response").value;

  const costSlider = document.getElementById("cost-slider");
  const traineesInput = document.getElementById("trainees");
  const cohortsInput = document.getElementById("cohorts");

  const costPerTraineePerMonth = parseFloat(costSlider.value) || 0;
  const traineesPerCohort = parseInt(traineesInput.value, 10) || 0;
  const numberOfCohorts = parseInt(cohortsInput.value, 10) || 0;

  const scenarioNameInput = document.getElementById("scenario-name");
  const scenarioNotesInput = document.getElementById("scenario-notes");

  return {
    tier,
    career,
    mentorship,
    delivery,
    response,
    costPerTraineePerMonth,
    traineesPerCohort,
    numberOfCohorts,
    scenarioName: scenarioNameInput ? scenarioNameInput.value.trim() : "",
    scenarioNotes: scenarioNotesInput ? scenarioNotesInput.value.trim() : ""
  };
}

/* ===========================
   Utility and endorsement
   =========================== */

function computeNonCostUtility(cfg, coefs) {
  const uTier = coefs.tier[cfg.tier] || 0;
  const uCareer = coefs.career[cfg.career] || 0;
  const uMentor = coefs.mentorship[cfg.mentorship] || 0;
  const uDelivery = coefs.delivery[cfg.delivery] || 0;
  const uResponse = coefs.response[cfg.response] || 0;
  return uTier + uCareer + uMentor + uDelivery + uResponse;
}

/*
  Compute WTP components (INR per trainee per month) using:
  WTP_k (thousand INR per trainee per month) = -beta_k / beta_cost
  Multiply by 1000 to express in INR per trainee per month.
*/
function computeWtpComponents(cfg, coefs) {
  const betaCost = coefs.costPerThousand || 0;
  if (!betaCost) {
    return {
      totalPerTraineePerMonth: null,
      components: null
    };
  }

  const betaTier = coefs.tier[cfg.tier] || 0;
  const betaCareer = coefs.career[cfg.career] || 0;
  const betaMentor = coefs.mentorship[cfg.mentorship] || 0;
  const betaDelivery = coefs.delivery[cfg.delivery] || 0;
  const betaResponse = coefs.response[cfg.response] || 0;

  const tierWtp = (-1000 * betaTier) / betaCost;
  const careerWtp = (-1000 * betaCareer) / betaCost;
  const mentorshipWtp = (-1000 * betaMentor) / betaCost;
  const deliveryWtp = (-1000 * betaDelivery) / betaCost;
  const responseWtp = (-1000 * betaResponse) / betaCost;

  const total =
    tierWtp + careerWtp + mentorshipWtp + deliveryWtp + responseWtp;

  return {
    totalPerTraineePerMonth: total,
    components: {
      tier: tierWtp,
      career: careerWtp,
      mentorship: mentorshipWtp,
      delivery: deliveryWtp,
      response: responseWtp
    }
  };
}

/*
  Compute endorsement probability and WTP summary for a given model.
  Returns:
  {
    modelId,
    endorsement,          // 0 to 1
    optOutShare,          // 0 to 1
    wtpPerTraineePerMonth,
    wtpComponents
  }
*/
function computeEndorsementAndWtp(cfg, modelId) {
  const coefs = getModelCoefs(modelId);
  const nonCostUtility = computeNonCostUtility(cfg, coefs);
  const costPerThousand = cfg.costPerTraineePerMonth / 1000;
  const costUtility = (coefs.costPerThousand || 0) * costPerThousand;

  const uProgram = (coefs.ascProgram || 0) + nonCostUtility + costUtility;
  const uOptOut = coefs.ascOptOut || 0;

  const diff = uProgram - uOptOut;
  const endorseProb = logistic(diff);
  const optOutProb = 1 - endorseProb;

  const wtp = computeWtpComponents(cfg, coefs);

  return {
    modelId,
    endorsement: endorseProb,
    optOutShare: optOutProb,
    wtpPerTraineePerMonth: wtp.totalPerTraineePerMonth,
    wtpComponents: wtp.components
  };
}

/* ===========================
   Cost and epidemiology helpers
   =========================== */

function getCostConfigForTier(tier) {
  if (COST_CONFIG && COST_CONFIG[tier]) {
    return COST_CONFIG[tier];
  }
  return COST_TEMPLATES[tier] || {};
}

function getCostTemplate(tier, sourceId) {
  const cfg = getCostConfigForTier(tier);
  const keys = Object.keys(cfg);
  if (keys.length === 0) return null;

  // If sourceId matches a key directly
  if (sourceId && cfg[sourceId]) {
    return cfg[sourceId];
  }

  // Otherwise try to match by template.id
  if (sourceId) {
    const matchById = keys
      .map((k) => cfg[k])
      .find((tpl) => tpl && tpl.id === sourceId);
    if (matchById) {
      return matchById;
    }
  }

  // Fallback: first available template
  return cfg[keys[0]];
}

function updateCostSourceOptions(tier) {
  const select = document.getElementById("cost-source");
  if (!select) return;

  const cfg = getCostConfigForTier(tier);
  const keys = Object.keys(cfg);

  select.innerHTML = "";

  if (keys.length === 0) {
    state.currentCostSourceId = null;
    return;
  }

  keys.forEach((key) => {
    const tpl = cfg[key];
    if (!tpl) return;
    const id = tpl.id || key;
    tpl.id = id; // normalise configuration so templates always carry an id
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = tpl.label || key;
    select.appendChild(opt);
  });

  const firstTpl = cfg[keys[0]];
  state.currentCostSourceId = (firstTpl && firstTpl.id) || keys[0];
}

function getEpiTierSettings(tier) {
  return state.epiSettings.tiers[tier] || state.epiSettings.tiers.frontline;
}

/* ===========================
   Scenario calculations
   =========================== */

/*
  Compute all key indicators for a configuration.
  Returns an object used by views, exports and Copilot JSON.
*/
function computeScenarioResults(cfg, options = {}) {
  const modelId = options.modelId || state.model || "mxl";

  const months = getTierMonths(cfg.tier);
  const epiTier = getEpiTierSettings(cfg.tier);
  const horizonYears = state.epiSettings.general.planningHorizonYears || 5;
  const responseMultiplier = RESPONSE_TIME_MULTIPLIERS[cfg.response] || 1.0;

  const overall = computeEndorsementAndWtp(cfg, "mxl");
  const selected = overall;

  const endorse = selected.endorsement;
  const optOut = selected.optOutShare;

  const trainees = cfg.traineesPerCohort;
  const cohorts = cfg.numberOfCohorts;

  const programCostPerCohortBudget =
    cfg.costPerTraineePerMonth * trainees * months;

  const template = getCostTemplate(cfg.tier, state.currentCostSourceId);
  const oppRate = template ? template.oppRate || 0 : 0;
  const oppCostPerCohort = state.includeOpportunityCost
    ? programCostPerCohortBudget * oppRate
    : 0;

  const totalEconomicCostPerCohort =
    programCostPerCohortBudget + oppCostPerCohort;

  const totalEconomicCostAllCohorts =
    totalEconomicCostPerCohort * cohorts;

  const wtpPerTraineePerMonth = selected.wtpPerTraineePerMonth || 0;
  const wtpComponents = selected.wtpComponents || null;
  const responseWtpPerTraineePerMonth =
    wtpComponents && wtpComponents.response
      ? wtpComponents.response
      : 0;

  const wtpTotalPerCohort =
    wtpPerTraineePerMonth * trainees * months;

  const wtpTotalAllCohorts =
    wtpTotalPerCohort * cohorts;

  const wtpResponseTotalAllCohorts =
    responseWtpPerTraineePerMonth * trainees * months * cohorts;

  const gradsPerCohort =
    trainees * epiTier.gradShare * endorse;

  const outbreaksPerCohortPerYear =
    epiTier.outbreaksPerCohortPerYear * endorse;

  const valueFromGraduatesPerCohort =
    gradsPerCohort * epiTier.valuePerGraduate;

  const valueFromOutbreaksPerCohort =
    outbreaksPerCohortPerYear *
    horizonYears *
    epiTier.valuePerOutbreak *
    responseMultiplier;

  const epiBenefitPerCohort =
    valueFromGraduatesPerCohort + valueFromOutbreaksPerCohort;

  const epiBenefitAllCohorts =
    epiBenefitPerCohort * cohorts;

  const netBenefitPerCohort =
    epiBenefitPerCohort - totalEconomicCostPerCohort;

  const bcrPerCohort =
    totalEconomicCostPerCohort > 0
      ? epiBenefitPerCohort / totalEconomicCostPerCohort
      : null;

  const natNetBenefit =
    epiBenefitAllCohorts - totalEconomicCostAllCohorts;

  const natBcr =
    totalEconomicCostAllCohorts > 0
      ? epiBenefitAllCohorts / totalEconomicCostAllCohorts
      : null;

  const natGraduatesAllCohorts = gradsPerCohort * cohorts;
  const natOutbreaksPerYearAllCohorts =
    outbreaksPerCohortPerYear * cohorts;

  return {
    cfg,
    modelId,
    months,
    horizonYears,
    endorse,
    optOut,
    overall,
    wtpPerTraineePerMonth,
    wtpComponents,
    responseWtpPerTraineePerMonth,
    wtpTotalPerCohort,
    wtpTotalAllCohorts,
    wtpResponseTotalAllCohorts,
    programCostPerCohortBudget,
    oppCostPerCohort,
    totalEconomicCostPerCohort,
    totalEconomicCostAllCohorts,
    gradsPerCohort,
    outbreaksPerCohortPerYear,
    valueFromGraduatesPerCohort,
    valueFromOutbreaksPerCohort,
    epiBenefitPerCohort,
    epiBenefitAllCohorts,
    netBenefitPerCohort,
    bcrPerCohort,
    natGraduatesAllCohorts,
    natOutbreaksPerYearAllCohorts,
    natNetBenefit,
    natBcr
  };
}

/* ===========================
   DOM updates: configuration summary
   =========================== */

function updateConfigSummary(results) {
  const container = document.getElementById("config-summary");
  const endorseSpan = document.getElementById("config-endorsement-value");
  const headlineTag = document.getElementById("headline-status-tag");
  const headlineText = document.getElementById("headline-recommendation");
  const briefingText = document.getElementById("headline-briefing-text");

  if (!container || !results) {
    if (endorseSpan) endorseSpan.textContent = "Apply configuration";
    if (headlineTag) {
      headlineTag.textContent = "No assessment yet";
      headlineTag.className = "status-pill status-neutral";
    }
    if (headlineText) {
      headlineText.textContent =
        "Apply a configuration to see a concise recommendation that combines endorsement, willingness to pay, costs and indicative benefits.";
    }
    if (briefingText) {
      briefingText.textContent =
        "Once a configuration is applied, this box will provide a short narrative summary that you can copy into briefing notes, World Bank documents or meeting minutes.";
    }
    return;
  }

  const { cfg } = results;

  const rows = [];

  rows.push({
    label: "Programme tier",
    value: `${getTierLabel(cfg.tier)} (${getTierMonths(cfg.tier)} months)`
  });
  rows.push({
    label: "Career incentive",
    value: getCareerLabel(cfg.career)
  });
  rows.push({
    label: "Mentorship intensity",
    value: getMentorshipLabel(cfg.mentorship)
  });
  rows.push({
    label: "Delivery mode",
    value: getDeliveryLabel(cfg.delivery)
  });
  rows.push({
    label: "Expected response time",
    value: getResponseLabel(cfg.response)
  });
  rows.push({
    label: "Cost per trainee per month",
    value: formatCurrency(cfg.costPerTraineePerMonth, "INR")
  });
  rows.push({
    label: "Trainees per cohort",
    value: formatNumber(cfg.traineesPerCohort)
  });
  rows.push({
    label: "Number of cohorts",
    value: formatNumber(cfg.numberOfCohorts)
  });

  container.innerHTML = "";
  rows.forEach((row) => {
    const div = document.createElement("div");
    div.className = "config-summary-row";
    const labelSpan = document.createElement("span");
    labelSpan.className = "config-summary-label";
    labelSpan.textContent = row.label;
    const valueSpan = document.createElement("span");
    valueSpan.className = "config-summary-value";
    valueSpan.textContent = row.value;
    div.appendChild(labelSpan);
    div.appendChild(valueSpan);
    container.appendChild(div);
  });

  if (endorseSpan) {
    endorseSpan.textContent = formatPercent(results.endorse * 100, 1);
  }

  if (headlineTag && headlineText && briefingText) {
    const endorsePct = results.endorse * 100;
    const bcr = results.bcrPerCohort;
    let statusClass = "status-neutral";
    let statusLabel = "Needs discussion";
    let recommendationText = "";
    const bcrText = bcr !== null ? bcr.toFixed(2) : "-";

    if (endorsePct >= 70 && bcr !== null && bcr >= 1.2) {
      statusClass = "status-good";
      statusLabel = "Strong case";
      recommendationText =
        "This configuration appears attractive, combining strong endorsement with an epidemiological benefit cost ratio above one. It is a good candidate for national or large scale investment discussions.";
    } else if (endorsePct >= 50 && bcr !== null && bcr >= 1.0) {
      statusClass = "status-warning";
      statusLabel = "Promising but mixed";
      recommendationText =
        "This configuration looks promising, with moderate endorsement and a benefit cost ratio close to or just above one. It may be suitable for targeted or phased scale up while further evidence is collected.";
    } else {
      statusClass = "status-poor";
      statusLabel = "Weak case";
      recommendationText =
        "Endorsement or value for money appears limited under this configuration. It may require redesign or a stronger justification before being considered for scale up.";
    }

    headlineTag.className = `status-pill ${statusClass}`;
    headlineTag.textContent = statusLabel;

    headlineText.textContent = recommendationText;

    const natCost = results.totalEconomicCostAllCohorts;
    const natEpiBenefit = results.epiBenefitAllCohorts;
    const natBcr = results.natBcr;

    const natCostText = formatCurrency(natCost, state.currency);
    const natBenefitText = formatCurrency(natEpiBenefit, state.currency);
    const natBcrText = natBcr !== null ? natBcr.toFixed(2) : "-";
    const endorseText = formatPercent(results.endorse * 100, 1);

    briefingText.textContent =
      `Under the current settings, a ${getTierLabel(cfg.tier)} configuration with ` +
      `${cfg.traineesPerCohort} trainees per cohort and ${cfg.numberOfCohorts} cohorts ` +
      `is predicted to attract endorsement from around ${endorseText} of stakeholders ` +
      `under the selected preference model. Total economic cost across all cohorts is ` +
      `${natCostText}, while indicative epidemiological benefits over a planning horizon ` +
      `of ${results.horizonYears} years are valued at approximately ${natBenefitText}. ` +
      `This corresponds to a national epidemiological benefit cost ratio of about ${natBcrText}. ` +
      `These figures provide a concise summary for concept notes, steering committee briefings and ` +
      `discussions with ministries and partners.`;
  }
}

/* ===========================
   DOM updates: results tab
   =========================== */

function ensureChart(ctxId, chartKey, config) {
  const ctx = document.getElementById(ctxId);
  if (!ctx) return null;
  if (state.charts[chartKey]) {
    state.charts[chartKey].data = config.data;
    state.charts[chartKey].options = config.options || {};
    state.charts[chartKey].update();
    return state.charts[chartKey];
  }
  const chart = new Chart(ctx, config);
  state.charts[chartKey] = chart;
  return chart;
}

function updateResultsView(results) {
  if (!results) return;

  const endorseEl = document.getElementById("endorsement-rate");
  const optoutEl = document.getElementById("optout-rate");

  if (endorseEl) {
    endorseEl.textContent = formatPercent(results.endorse * 100, 1);
  }
  if (optoutEl) {
    optoutEl.textContent = formatPercent(results.optOut * 100, 1);
  }

  ensureChart(
    "chart-uptake",
    "uptake",
    {
      type: "doughnut",
      data: {
        labels: ["Endorse FETP option", "Choose opt-out"],
        datasets: [
          {
            data: [
              results.endorse * 100,
              results.optOut * 100
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    }
  );

  const wtpPerTraineeEl = document.getElementById("wtp-per-trainee");
  const wtpTotalCohortEl = document.getElementById("wtp-total-cohort");
  const progCostPerCohortEl = document.getElementById("prog-cost-per-cohort");
  const totalCostEl = document.getElementById("total-cost");
  const netBenefitEl = document.getElementById("net-benefit");
  const bcrEl = document.getElementById("bcr");

  if (wtpPerTraineeEl) {
    wtpPerTraineeEl.textContent = formatCurrency(
      results.wtpPerTraineePerMonth,
      state.currency
    );
  }
  if (wtpTotalCohortEl) {
    wtpTotalCohortEl.textContent = formatCurrency(
      results.wtpTotalPerCohort,
      state.currency
    );
  }
  if (progCostPerCohortEl) {
    progCostPerCohortEl.textContent = formatCurrency(
      results.programCostPerCohortBudget,
      state.currency
    );
  }
  if (totalCostEl) {
    totalCostEl.textContent = formatCurrency(
      results.totalEconomicCostPerCohort,
      state.currency
    );
  }
  if (netBenefitEl) {
    netBenefitEl.textContent = formatCurrency(
      results.netBenefitPerCohort,
      state.currency
    );
  }
  if (bcrEl) {
    bcrEl.textContent =
      results.bcrPerCohort !== null
        ? results.bcrPerCohort.toFixed(2)
        : "-";
  }

  ensureChart(
    "chart-bcr",
    "bcr",
    {
      type: "bar",
      data: {
        labels: ["Costs and benefits per cohort"],
        datasets: [
          {
            label: "Total economic cost",
            data: [results.totalEconomicCostPerCohort]
          },
          {
            label: "Indicative epidemiological benefit",
            data: [results.epiBenefitPerCohort]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  );

  const epiGraduatesEl = document.getElementById("epi-graduates");
  const epiOutbreaksEl = document.getElementById("epi-outbreaks");
  const epiBenefitEl = document.getElementById("epi-benefit");

  if (epiGraduatesEl) {
    epiGraduatesEl.textContent = formatNumber(
      results.natGraduatesAllCohorts
    );
  }
  if (epiOutbreaksEl) {
    epiOutbreaksEl.textContent = formatNumber(
      results.natOutbreaksPerYearAllCohorts,
      1
    );
  }
  if (epiBenefitEl) {
    epiBenefitEl.textContent = formatCurrency(
      results.epiBenefitPerCohort,
      state.currency
    );
  }

  ensureChart(
    "chart-epi",
    "epi",
    {
      type: "bar",
      data: {
        labels: ["Graduates", "Outbreak responses per year (national)"],
        datasets: [
          {
            label: "Outputs",
            data: [
              results.natGraduatesAllCohorts,
              results.natOutbreaksPerYearAllCohorts
            ]
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
    }
  );
}

/* ===========================
   DOM updates: costing tab
   =========================== */

function updateCostingView(results) {
  const summaryContainer = document.getElementById("cost-breakdown-summary");
  const tbody = document.getElementById("cost-components-list");
  const select = document.getElementById("cost-source");

  if (!summaryContainer || !tbody) return;

  const cfg = results.cfg;
  const template = getCostTemplate(cfg.tier, state.currentCostSourceId);

  if (select && template) {
    for (let i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === template.id) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  summaryContainer.innerHTML = "";
  tbody.innerHTML = "";

  if (!template) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      "No cost template is available for this tier. Templates can be provided in a separate cost_config.json file.";
    summaryContainer.appendChild(note);
    return;
  }

  const budgetCost = results.programCostPerCohortBudget;
  const oppCost = results.oppCostPerCohort;
  const econCost = results.totalEconomicCostPerCohort;

  const cards = [
    {
      label: "Programme cost per cohort (budgetary)",
      value: formatCurrency(budgetCost, state.currency)
    },
    {
      label: "Opportunity cost per cohort",
      value: formatCurrency(oppCost, state.currency)
    },
    {
      label: "Total economic cost per cohort",
      value: formatCurrency(econCost, state.currency)
    }
  ];

  cards.forEach((c) => {
    const div = document.createElement("div");
    div.className = "cost-summary-card";
    const l = document.createElement("div");
    l.className = "cost-summary-label";
    l.textContent = c.label;
    const v = document.createElement("div");
    v.className = "cost-summary-value";
    v.textContent = c.value;
    div.appendChild(l);
    div.appendChild(v);
    summaryContainer.appendChild(div);
  });

  const components = template.components || [];
  components.forEach((comp) => {
    const tr = document.createElement("tr");

    const amountPerCohort = budgetCost * comp.directShare;
    const amountPerTraineePerMonth =
      cfg.traineesPerCohort > 0 && results.months > 0
        ? amountPerCohort / (cfg.traineesPerCohort * results.months)
        : 0;

    const tdName = document.createElement("td");
    tdName.textContent = comp.label;

    const tdShare = document.createElement("td");
    tdShare.textContent = formatPercent(comp.directShare * 100, 1);

    const tdAmount = document.createElement("td");
    tdAmount.textContent = formatCurrency(
      amountPerCohort,
      state.currency
    );
    tdAmount.className = "numeric-cell";

    const tdPerTrainee = document.createElement("td");
    tdPerTrainee.textContent = formatCurrency(
      amountPerTraineePerMonth,
      state.currency
    );
    tdPerTrainee.className = "numeric-cell";

    const tdNotes = document.createElement("td");
    tdNotes.textContent = "";

    tr.appendChild(tdName);
    tr.appendChild(tdShare);
    tr.appendChild(tdAmount);
    tr.appendChild(tdPerTrainee);
    tr.appendChild(tdNotes);

    tbody.appendChild(tr);
  });
}

/* ===========================
   DOM updates: national simulation
   =========================== */

function updateNationalSimulationView(results) {
  if (!results) return;

  const natTotalCostEl = document.getElementById("nat-total-cost");
  const natTotalBenefitEl = document.getElementById("nat-total-benefit");
  const natNetBenefitEl = document.getElementById("nat-net-benefit");
  const natBcrEl = document.getElementById("nat-bcr");
  const natTotalWtpEl = document.getElementById("nat-total-wtp");

  const natGraduatesEl = document.getElementById("nat-graduates");
  const natOutbreaksEl = document.getElementById("nat-outbreaks");
  const summaryTextEl = document.getElementById("natsim-summary-text");

  if (natTotalCostEl) {
    natTotalCostEl.textContent = formatCurrency(
      results.totalEconomicCostAllCohorts,
      state.currency
    );
  }
  if (natTotalBenefitEl) {
    natTotalBenefitEl.textContent = formatCurrency(
      results.epiBenefitAllCohorts,
      state.currency
    );
  }
  if (natNetBenefitEl) {
    natNetBenefitEl.textContent = formatCurrency(
      results.natNetBenefit,
      state.currency
    );
  }
  if (natBcrEl) {
    natBcrEl.textContent =
      results.natBcr !== null ? results.natBcr.toFixed(2) : "-";
  }
  if (natTotalWtpEl) {
    natTotalWtpEl.textContent = formatCurrency(
      results.wtpTotalAllCohorts,
      state.currency
    );
  }

  if (natGraduatesEl) {
    natGraduatesEl.textContent = formatNumber(
      results.natGraduatesAllCohorts
    );
  }
  if (natOutbreaksEl) {
    natOutbreaksEl.textContent = formatNumber(
      results.natOutbreaksPerYearAllCohorts,
      1
    );
  }

  ensureChart(
    "chart-nat-cost-benefit",
    "natCostBenefit",
    {
      type: "bar",
      data: {
        labels: ["National totals"],
        datasets: [
          {
            label: "Total economic cost (all cohorts)",
            data: [results.totalEconomicCostAllCohorts]
          },
          {
            label: "Total epidemiological benefit (all cohorts)",
            data: [results.epiBenefitAllCohorts]
          },
          {
            label: "Total WTP (all cohorts)",
            data: [results.wtpTotalAllCohorts]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    }
  );

  ensureChart(
    "chart-nat-epi",
    "natEpi",
    {
      type: "bar",
      data: {
        labels: ["Graduates", "Outbreak responses per year"],
        datasets: [
          {
            label: "Outputs",
            data: [
              results.natGraduatesAllCohorts,
              results.natOutbreaksPerYearAllCohorts
            ]
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
    }
  );

  if (summaryTextEl) {
    const cfg = results.cfg;
    const natCostText = formatCurrency(
      results.totalEconomicCostAllCohorts,
      state.currency
    );
    const natBenefitText = formatCurrency(
      results.epiBenefitAllCohorts,
      state.currency
    );
    const natNetText = formatCurrency(
      results.natNetBenefit,
      state.currency
    );
    const natBcrText =
      results.natBcr !== null ? results.natBcr.toFixed(2) : "-";
    const gradsText = formatNumber(results.natGraduatesAllCohorts);
    const outbreaksText = formatNumber(
      results.natOutbreaksPerYearAllCohorts,
      1
    );

    summaryTextEl.textContent =
      `With ${cfg.numberOfCohorts} cohorts of ${cfg.traineesPerCohort} trainees ` +
      `at the ${getTierLabel(cfg.tier)} tier, this configuration generates an estimated ` +
      `${gradsText} FETP graduates in total and supports around ${outbreaksText} outbreak ` +
      `responses per year once graduates are in post. Total economic cost across all cohorts is ` +
      `${natCostText}, while indicative epidemiological benefits over a ${results.horizonYears}-year ` +
      `horizon are valued at about ${natBenefitText}. This yields a national epidemiological benefit ` +
      `cost ratio of approximately ${natBcrText} and a national net benefit of ${natNetText}.`;
  }
}

/* ===========================
   Sensitivity and DCE benefits tab
   =========================== */

function getBenefitDefinitionSettings() {
  const defSelect = document.getElementById("benefit-definition-select");
  const epiToggle = document.getElementById("sensitivity-epi-toggle");
  const classView = document.getElementById("benefit-class-scenario");
  const endorsementOverrideInput = document.getElementById("endorsement-override");

  const benefitDefinition = defSelect ? defSelect.value : "wtp_only";
  const includeEpi =
    epiToggle && epiToggle.classList.contains("on");
  const classViewValue = classView ? classView.value : "overall";

  let endorsementOverride = null;
  if (endorsementOverrideInput && endorsementOverrideInput.value !== "") {
    const v = parseFloat(endorsementOverrideInput.value);
    if (!isNaN(v) && v >= 0 && v <= 100) {
      endorsementOverride = v / 100;
    }
  }

  return {
    benefitDefinition,
    includeEpi,
    classView: classViewValue,
    endorsementOverride
  };
}

/* All class views now use the mixed logit only */
function computeScenarioForClassView(baseCfg, classView, includeEpi, benefitDefinition, endorsementOverride) {
  const cfg = baseCfg;
  const results = computeScenarioResults(cfg, {
    modelId: "mxl"
  });

  const endorseUsed =
    typeof endorsementOverride === "number"
      ? endorsementOverride
      : results.endorse;

  const epiPart = includeEpi ? results.valueFromOutbreaksPerCohort : 0;
  const epiAllCohorts = epiPart * cfg.numberOfCohorts;

  const totalWtpAllCohorts = results.wtpTotalAllCohorts;

  let wtpUsedForRatios = totalWtpAllCohorts;
  if (benefitDefinition === "endorsement_adjusted") {
    wtpUsedForRatios = totalWtpAllCohorts * endorseUsed;
  }

  const combinedBenefitAllCohorts =
    includeEpi ? wtpUsedForRatios + epiAllCohorts : wtpUsedForRatios;

  const costAllCohorts = results.totalEconomicCostAllCohorts;

  const bcrWtpOnly =
    costAllCohorts > 0 ? wtpUsedForRatios / costAllCohorts : null;
  const npvWtpOnly =
    wtpUsedForRatios - costAllCohorts;

  const bcrCombined =
    costAllCohorts > 0 ? combinedBenefitAllCohorts / costAllCohorts : null;
  const npvCombined =
    combinedBenefitAllCohorts - costAllCohorts;

  const effectiveWtp =
    totalWtpAllCohorts * endorseUsed;
  const effectiveCombined =
    (totalWtpAllCohorts + epiAllCohorts) * endorseUsed;

  return {
    results,
    endorseUsed,
    epiAllCohorts,
    totalWtpAllCohorts,
    wtpResponseTotalAllCohorts: results.wtpResponseTotalAllCohorts,
    costAllCohorts,
    bcrWtpOnly,
    npvWtpOnly,
    bcrCombined,
    npvCombined,
    effectiveWtp,
    effectiveCombined
  };
}

function buildDceBenefitsTableRow(label, scenarioCfg, settings) {
  const {
    benefitDefinition,
    includeEpi,
    classView,
    endorsementOverride
  } = settings;

  const calc = computeScenarioForClassView(
    scenarioCfg,
    classView,
    includeEpi,
    benefitDefinition,
    endorsementOverride
  );

  const { results } = calc;

  const row = document.createElement("tr");

  const epiBenefitFromOutbreaks = calc.epiAllCohorts;
  const epiShown = includeEpi ? epiBenefitFromOutbreaks : 0;

  const endorsePctUsed = calc.endorseUsed * 100;

  const tdScenario = document.createElement("td");
  tdScenario.textContent = label;

  const tdCost = document.createElement("td");
  tdCost.textContent = formatCurrency(
    calc.costAllCohorts,
    state.currency
  );
  tdCost.className = "numeric-cell";

  const tdTotalWtp = document.createElement("td");
  tdTotalWtp.textContent = formatCurrency(
    calc.totalWtpAllCohorts,
    state.currency
  );
  tdTotalWtp.className = "numeric-cell";

  const tdWtpResponse = document.createElement("td");
  tdWtpResponse.textContent = formatCurrency(
    calc.wtpResponseTotalAllCohorts,
    state.currency
  );
  tdWtpResponse.className = "numeric-cell";

  const tdEpi = document.createElement("td");
  tdEpi.textContent = formatCurrency(
    epiShown,
    state.currency
  );
  tdEpi.className = "numeric-cell";

  const tdEndorseUsed = document.createElement("td");
  tdEndorseUsed.textContent = formatPercent(endorsePctUsed, 1);

  const tdEffectiveWtp = document.createElement("td");
  tdEffectiveWtp.textContent = formatCurrency(
    calc.effectiveWtp,
    state.currency
  );
  tdEffectiveWtp.className = "numeric-cell";

  const tdBcrWtpOnly = document.createElement("td");
  tdBcrWtpOnly.textContent =
    calc.bcrWtpOnly !== null ? calc.bcrWtpOnly.toFixed(2) : "-";
  tdBcrWtpOnly.className = "numeric-cell";

  const tdNpvWtpOnly = document.createElement("td");
  tdNpvWtpOnly.textContent = formatCurrency(
    calc.npvWtpOnly,
    state.currency
  );
  tdNpvWtpOnly.className = "numeric-cell";

  const tdBcrCombined = document.createElement("td");
  tdBcrCombined.textContent =
    calc.bcrCombined !== null ? calc.bcrCombined.toFixed(2) : "-";
  tdBcrCombined.className = "numeric-cell";

  const tdNpvCombined = document.createElement("td");
  tdNpvCombined.textContent = formatCurrency(
    calc.npvCombined,
    state.currency
  );
  tdNpvCombined.className = "numeric-cell";

  row.appendChild(tdScenario);
  row.appendChild(tdCost);
  row.appendChild(tdTotalWtp);
  row.appendChild(tdWtpResponse);
  row.appendChild(tdEpi);
  row.appendChild(tdEndorseUsed);
  row.appendChild(tdEffectiveWtp);
  row.appendChild(tdBcrWtpOnly);
  row.appendChild(tdNpvWtpOnly);
  row.appendChild(tdBcrCombined);
  row.appendChild(tdNpvCombined);

  return row;
}

function buildSensitivityMatrixRow(label, scenarioCfg, includeEpi) {
  const overallCalc = computeScenarioForClassView(
    scenarioCfg,
    "overall",
    includeEpi,
    "wtp_only",
    null
  );
  const supportiveCalc = computeScenarioForClassView(
    scenarioCfg,
    "overall",
    includeEpi,
    "wtp_only",
    null
  );

  const { results } = overallCalc;

  const row = document.createElement("tr");

  const tdScenario = document.createElement("td");
  tdScenario.textContent = label;

  const tdModel = document.createElement("td");
  tdModel.textContent = "MXL overall";

  const tdEndorse = document.createElement("td");
  tdEndorse.textContent = formatPercent(results.endorse * 100, 1);

  const tdCostPerCohort = document.createElement("td");
  tdCostPerCohort.textContent = formatCurrency(
    results.totalEconomicCostPerCohort,
    state.currency
  );
  tdCostPerCohort.className = "numeric-cell";

  const tdTotalWtpOverall = document.createElement("td");
  tdTotalWtpOverall.textContent = formatCurrency(
    results.wtpTotalPerCohort,
    state.currency
  );
  tdTotalWtpOverall.className = "numeric-cell";

  const tdWtpResponseOverall = document.createElement("td");
  tdWtpResponseOverall.textContent = formatCurrency(
    results.responseWtpPerTraineePerMonth *
      results.cfg.traineesPerCohort *
      results.months,
    state.currency
  );
  tdWtpResponseOverall.className = "numeric-cell";

  const tdEpiBenefitPerCohort = document.createElement("td");
  const epiPerCohort = includeEpi
    ? results.valueFromOutbreaksPerCohort
    : 0;
  tdEpiBenefitPerCohort.textContent = formatCurrency(
    epiPerCohort,
    state.currency
  );
  tdEpiBenefitPerCohort.className = "numeric-cell";

  const tdBcrWtpOverall = document.createElement("td");
  const bcrWtpOverall =
    results.totalEconomicCostPerCohort > 0
      ? results.wtpTotalPerCohort /
        results.totalEconomicCostPerCohort
      : null;
  tdBcrWtpOverall.textContent =
    bcrWtpOverall !== null ? bcrWtpOverall.toFixed(2) : "-";
  tdBcrWtpOverall.className = "numeric-cell";

  const tdNpvWtpOverall = document.createElement("td");
  const npvWtpOverall =
    results.wtpTotalPerCohort -
    results.totalEconomicCostPerCohort;
  tdNpvWtpOverall.textContent = formatCurrency(
    npvWtpOverall,
    state.currency
  );
  tdNpvWtpOverall.className = "numeric-cell";

  const tdBcrCombinedOverall = document.createElement("td");
  const combinedBenefitPerCohort =
    results.wtpTotalPerCohort + epiPerCohort;
  const bcrCombinedOverall =
    results.totalEconomicCostPerCohort > 0
      ? combinedBenefitPerCohort /
        results.totalEconomicCostPerCohort
      : null;
  tdBcrCombinedOverall.textContent =
    bcrCombinedOverall !== null
      ? bcrCombinedOverall.toFixed(2)
      : "-";
  tdBcrCombinedOverall.className = "numeric-cell";

  const tdNpvCombinedOverall = document.createElement("td");
  const npvCombinedOverall =
    combinedBenefitPerCohort -
    results.totalEconomicCostPerCohort;
  tdNpvCombinedOverall.textContent = formatCurrency(
    npvCombinedOverall,
    state.currency
  );
  tdNpvCombinedOverall.className = "numeric-cell";

  const tdWtpSupportive = document.createElement("td");
  tdWtpSupportive.textContent = formatCurrency(
    supportiveCalc.results.wtpTotalPerCohort,
    state.currency
  );
  tdWtpSupportive.className = "numeric-cell";

  const tdBcrSupportive = document.createElement("td");
  const bcrSupportive =
    supportiveCalc.results.totalEconomicCostPerCohort > 0
      ? supportiveCalc.results.wtpTotalPerCohort /
        supportiveCalc.results.totalEconomicCostPerCohort
      : null;
  tdBcrSupportive.textContent =
    bcrSupportive !== null ? bcrSupportive.toFixed(2) : "-";
  tdBcrSupportive.className = "numeric-cell";

  const tdEffectiveWtpOverall = document.createElement("td");
  const effectiveWtpOverall =
    results.wtpTotalPerCohort *
    results.endorse;
  tdEffectiveWtpOverall.textContent = formatCurrency(
    effectiveWtpOverall,
    state.currency
  );
  tdEffectiveWtpOverall.className = "numeric-cell";

  const tdEffectiveCombinedOverall = document.createElement("td");
  const effectiveCombined =
    (results.wtpTotalPerCohort + epiPerCohort) *
    results.endorse;
  tdEffectiveCombinedOverall.textContent = formatCurrency(
    effectiveCombined,
    state.currency
  );
  tdEffectiveCombinedOverall.className = "numeric-cell";

  row.appendChild(tdScenario);
  row.appendChild(tdModel);
  row.appendChild(tdEndorse);
  row.appendChild(tdCostPerCohort);
  row.appendChild(tdTotalWtpOverall);
  row.appendChild(tdWtpResponseOverall);
  row.appendChild(tdEpiBenefitPerCohort);
  row.appendChild(tdBcrWtpOverall);
  row.appendChild(tdNpvWtpOverall);
  row.appendChild(tdBcrCombinedOverall);
  row.appendChild(tdNpvCombinedOverall);
  row.appendChild(tdWtpSupportive);
  row.appendChild(tdBcrSupportive);
  row.appendChild(tdEffectiveWtpOverall);
  row.appendChild(tdEffectiveCombinedOverall);

  return row;
}

function updateSensitivityTables() {
  const benefitsTbody = document.getElementById("dce-benefits-table-body");
  const sensTbody = document.getElementById("sensitivity-table-body");
  if (!benefitsTbody || !sensTbody) return;

  benefitsTbody.innerHTML = "";
  sensTbody.innerHTML = "";

  if (!state.lastResults) return;

  const settings = getBenefitDefinitionSettings();

  const currentLabel = "Current configuration";
  benefitsTbody.appendChild(
    buildDceBenefitsTableRow(
      currentLabel,
      state.lastResults.cfg,
      settings
    )
  );
  sensTbody.appendChild(
    buildSensitivityMatrixRow(
      currentLabel,
      state.lastResults.cfg,
      settings.includeEpi
    )
  );

  state.scenarios.forEach((sc, index) => {
    const label = sc.name || `Scenario ${index + 1}`;
    benefitsTbody.appendChild(
      buildDceBenefitsTableRow(label, sc.cfg, settings)
    );
    sensTbody.appendChild(
      buildSensitivityMatrixRow(
        label,
        sc.cfg,
        settings.includeEpi
      )
    );
  });
}

/* ===========================
   Scenarios tab and exports
   =========================== */

function addScenarioFromCurrentResults() {
  if (!state.lastResults) return;

  const { cfg } = state.lastResults;

  const name =
    cfg.scenarioName && cfg.scenarioName.length > 0
      ? cfg.scenarioName
      : `Scenario ${state.scenarios.length + 1}`;

  const scenario = {
    id: Date.now(),
    name,
    notes: cfg.scenarioNotes || "",
    cfg: { ...cfg },
    resultsSnapshot: { ...state.lastResults }
  };

  state.scenarios.push(scenario);
  updateScenarioTable();
  showToast("Scenario saved for comparison", "success");
}

function updateScenarioTable() {
  const tbody = document.querySelector("#scenario-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.scenarios.forEach((sc) => {
    const r = sc.resultsSnapshot;
    const tr = document.createElement("tr");

    const tdShortlist = document.createElement("td");
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.dataset.scenarioId = String(sc.id);
    tdShortlist.appendChild(chk);

    const tdName = document.createElement("td");
    tdName.textContent = sc.name;

    const tdTags = document.createElement("td");
    tdTags.textContent = "";

    const tdTier = document.createElement("td");
    tdTier.textContent = getTierLabel(sc.cfg.tier);

    const tdCareer = document.createElement("td");
    tdCareer.textContent = getCareerLabel(sc.cfg.career);

    const tdMentor = document.createElement("td");
    tdMentor.textContent = getMentorshipLabel(sc.cfg.mentorship);

    const tdDelivery = document.createElement("td");
    tdDelivery.textContent = getDeliveryLabel(sc.cfg.delivery);

    const tdResponse = document.createElement("td");
    tdResponse.textContent = getResponseLabel(sc.cfg.response);

    const tdCohorts = document.createElement("td");
    tdCohorts.textContent = formatNumber(sc.cfg.numberOfCohorts);

    const tdTrainees = document.createElement("td");
    tdTrainees.textContent = formatNumber(sc.cfg.traineesPerCohort);

    const tdCostPerTrainee = document.createElement("td");
    tdCostPerTrainee.textContent = formatCurrency(
      sc.cfg.costPerTraineePerMonth,
      state.currency
    );
    tdCostPerTrainee.className = "numeric-cell";

    const tdModel = document.createElement("td");
    tdModel.textContent = "Average MXL (overall sample)";

    const tdEndorse = document.createElement("td");
    tdEndorse.textContent = formatPercent(r.endorse * 100, 1);

    const tdWtpPerTrainee = document.createElement("td");
    tdWtpPerTrainee.textContent = formatCurrency(
      r.wtpPerTraineePerMonth,
      state.currency
    );
    tdWtpPerTrainee.className = "numeric-cell";

    const tdTotalWtpAll = document.createElement("td");
    tdTotalWtpAll.textContent = formatCurrency(
      r.wtpTotalAllCohorts,
      state.currency
    );
    tdTotalWtpAll.className = "numeric-cell";

    const tdBcr = document.createElement("td");
    tdBcr.textContent =
      r.natBcr !== null ? r.natBcr.toFixed(2) : "-";
    tdBcr.className = "numeric-cell";

    const tdTotalCostAll = document.createElement("td");
    tdTotalCostAll.textContent = formatCurrency(
      r.totalEconomicCostAllCohorts,
      state.currency
    );
    tdTotalCostAll.className = "numeric-cell";

    const tdTotalEpiAll = document.createElement("td");
    tdTotalEpiAll.textContent = formatCurrency(
      r.epiBenefitAllCohorts,
      state.currency
    );
    tdTotalEpiAll.className = "numeric-cell";

    const tdNetEpiAll = document.createElement("td");
    tdNetEpiAll.textContent = formatCurrency(
      r.natNetBenefit,
      state.currency
    );
    tdNetEpiAll.className = "numeric-cell";

    const tdOutbreaks = document.createElement("td");
    tdOutbreaks.textContent = formatNumber(
      r.natOutbreaksPerYearAllCohorts,
      1
    );

    const tdNotes = document.createElement("td");
    tdNotes.textContent = sc.notes;

    tr.appendChild(tdShortlist);
    tr.appendChild(tdName);
    tr.appendChild(tdTags);
    tr.appendChild(tdTier);
    tr.appendChild(tdCareer);
    tr.appendChild(tdMentor);
    tr.appendChild(tdDelivery);
    tr.appendChild(tdResponse);
    tr.appendChild(tdCohorts);
    tr.appendChild(tdTrainees);
    tr.appendChild(tdCostPerTrainee);
    tr.appendChild(tdModel);
    tr.appendChild(tdEndorse);
    tr.appendChild(tdWtpPerTrainee);
    tr.appendChild(tdTotalWtpAll);
    tr.appendChild(tdBcr);
    tr.appendChild(tdTotalCostAll);
    tr.appendChild(tdTotalEpiAll);
    tr.appendChild(tdNetEpiAll);
    tr.appendChild(tdOutbreaks);
    tr.appendChild(tdNotes);

    tbody.appendChild(tr);
  });
}

function exportScenariosToExcel() {
  if (typeof XLSX === "undefined") {
    showToast("Excel export library is not available", "error");
    return;
  }
  const rows = [];

  rows.push([
    "Name",
    "Tier",
    "Career incentive",
    "Mentorship",
    "Delivery",
    "Response time",
    "Cohorts",
    "Trainees per cohort",
    "Cost per trainee per month (INR)",
    "Preference model",
    "Endorsement (%)",
    "Total WTP (all cohorts, INR)",
    "Total economic cost (all cohorts, INR)",
    "Total epidemiological benefit (all cohorts, INR)",
    "Net epidemiological benefit (all cohorts, INR)",
    "National benefit cost ratio"
  ]);

  state.scenarios.forEach((sc) => {
    const r = sc.resultsSnapshot;
    rows.push([
      sc.name,
      getTierLabel(sc.cfg.tier),
      getCareerLabel(sc.cfg.career),
      getMentorshipLabel(sc.cfg.mentorship),
      getDeliveryLabel(sc.cfg.delivery),
      getResponseLabel(sc.cfg.response),
      sc.cfg.numberOfCohorts,
      sc.cfg.traineesPerCohort,
      sc.cfg.costPerTraineePerMonth,
      "Average MXL (overall sample)",
      (r.endorse * 100).toFixed(1),
      r.wtpTotalAllCohorts,
      r.totalEconomicCostAllCohorts,
      r.epiBenefitAllCohorts,
      r.natNetBenefit,
      r.natBcr !== null ? r.natBcr.toFixed(2) : ""
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Scenarios");
  XLSX.writeFile(wb, "steps_scenarios.xlsx");
}

function exportScenariosToPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export library is not available", "error");
    return;
  }
  const doc = new window.jspdf.jsPDF("p", "mm", "a4");
  let y = 10;

  doc.setFontSize(14);
  doc.text("STEPS FETP India Decision Aid", 10, y);
  y += 7;
  doc.setFontSize(11);
  doc.text("Policy brief: saved scenarios", 10, y);
  y += 8;
  doc.setFontSize(9);

  state.scenarios.forEach((sc, idx) => {
    const r = sc.resultsSnapshot;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
    doc.text(`${idx + 1}. ${sc.name}`, 10, y);
    y += 5;
    const lines = [
      `Tier: ${getTierLabel(sc.cfg.tier)}, cohorts: ${sc.cfg.numberOfCohorts}, trainees per cohort: ${sc.cfg.traineesPerCohort}`,
      `Endorsement: ${(r.endorse * 100).toFixed(1)} %, model: Average MXL (overall sample)`,
      `Total economic cost (all cohorts): ${formatCurrencyInr(r.totalEconomicCostAllCohorts)}`,
      `Total WTP (all cohorts): ${formatCurrencyInr(r.wtpTotalAllCohorts)}`,
      `Total epidemiological benefit (all cohorts): ${formatCurrencyInr(r.epiBenefitAllCohorts)}`,
      `Net epidemiological benefit (all cohorts): ${formatCurrencyInr(r.natNetBenefit)}, national benefit cost ratio: ${
        r.natBcr !== null ? r.natBcr.toFixed(2) : "-"
      }`
    ];
    lines.forEach((line) => {
      doc.text(line, 12, y);
      y += 4;
    });
    if (sc.notes && sc.notes.length > 0) {
      const noteLines = doc.splitTextToSize(
        `Notes: ${sc.notes}`,
        180
      );
      noteLines.forEach((ln) => {
        doc.text(ln, 12, y);
        y += 4;
      });
    }
    y += 3;
  });

  doc.save("steps_scenarios_brief.pdf");
}

/* ===========================
   Sensitivity exports
   =========================== */

function exportSensitivityToExcel(tableId, filename) {
  if (typeof XLSX === "undefined") {
    showToast("Excel export library is not available", "error");
    return;
  }
  const table = document.getElementById(tableId);
  if (!table) return;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, "Sensitivity");
  XLSX.writeFile(wb, filename);
}

function exportSensitivityToPdf(tableId, filename) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF export library is not available", "error");
    return;
  }
  const table = document.getElementById(tableId);
  if (!table) return;

  const doc = new window.jspdf.jsPDF("l", "mm", "a4");
  let y = 10;

  doc.setFontSize(13);
  doc.text("STEPS DCE benefits and sensitivity summary", 10, y);
  y += 8;
  doc.setFontSize(8);

  const rows = [];
  const headers = [];
  table.querySelectorAll("thead th").forEach((th) => {
    headers.push(th.textContent.trim());
  });
  rows.push(headers);

  table.querySelectorAll("tbody tr").forEach((tr) => {
    const row = [];
    tr.querySelectorAll("td").forEach((td) => {
      row.push(td.textContent.trim());
    });
    rows.push(row);
  });

  const colWidths = headers.map(() => 35);
  rows.forEach((row, idx) => {
    if (y > 190) {
      doc.addPage();
      y = 10;
    }
    let x = 10;
    row.forEach((cell, colIdx) => {
      const text = cell.length > 32 ? cell.slice(0, 32) + "..." : cell;
      doc.text(text, x, y);
      x += colWidths[colIdx];
    });
    y += idx === 0 ? 6 : 4;
  });

  doc.save(filename);
}

/* ===========================
   Copilot tab
   =========================== */

function buildScenarioJsonForCopilot(results) {
  if (!results) return null;

  const cfg = results.cfg;

  return {
    tool: "STEPS FETP India Decision Aid",
    version: "1.0",
    timestamp: new Date().toISOString(),
    configuration: {
      tier: cfg.tier,
      tierLabel: getTierLabel(cfg.tier),
      durationMonths: results.months,
      careerIncentive: cfg.career,
      careerIncentiveLabel: getCareerLabel(cfg.career),
      mentorship: cfg.mentorship,
      mentorshipLabel: getMentorshipLabel(cfg.mentorship),
      deliveryMode: cfg.delivery,
      deliveryModeLabel: getDeliveryLabel(cfg.delivery),
      responseTime: cfg.response,
      responseTimeLabel: getResponseLabel(cfg.response),
      costPerTraineePerMonthINR: cfg.costPerTraineePerMonth,
      traineesPerCohort: cfg.traineesPerCohort,
      numberOfCohorts: cfg.numberOfCohorts,
      scenarioName: cfg.scenarioName || "",
      scenarioNotes: cfg.scenarioNotes || ""
    },
    endorsement: {
      model: "Mixed logit (overall sample)",
      endorseShare: results.overall.endorsement,
      optOutShare: results.overall.optOutShare
    },
    willingnessToPay: {
      wtpPerTraineePerMonthINR: results.overall.wtpPerTraineePerMonth,
      totalWtpPerCohortINR:
        results.overall.wtpPerTraineePerMonth *
        cfg.traineesPerCohort *
        results.months,
      totalWtpAllCohortsINR: results.wtpTotalAllCohorts,
      responseTimeComponentPerTraineePerMonthINR:
        results.overall.wtpComponents &&
        results.overall.wtpComponents.response
          ? results.overall.wtpComponents.response
          : 0,
      responseTimeComponentAllCohortsINR:
        results.wtpResponseTotalAllCohorts
    },
    costs: {
      programmeCostPerCohortBudgetINR:
        results.programCostPerCohortBudget,
      opportunityCostPerCohortINR: results.oppCostPerCohort,
      totalEconomicCostPerCohortINR:
        results.totalEconomicCostPerCohort,
      totalEconomicCostAllCohortsINR:
        results.totalEconomicCostAllCohorts
    },
    epidemiological: {
      planningHorizonYears: results.horizonYears,
      graduatesPerCohort: results.gradsPerCohort,
      graduatesAllCohorts: results.natGraduatesAllCohorts,
      outbreakResponsesPerCohortPerYear:
        results.outbreaksPerCohortPerYear,
      outbreakResponsesPerYearAllCohorts:
        results.natOutbreaksPerYearAllCohorts,
      valueFromGraduatesPerCohortINR:
        results.valueFromGraduatesPerCohort,
      valueFromOutbreaksPerCohortINR:
        results.valueFromOutbreaksPerCohort,
      epiBenefitPerCohortINR: results.epiBenefitPerCohort,
      epiBenefitAllCohortsINR: results.epiBenefitAllCohorts
    },
    economicSummary: {
      netBenefitPerCohortINR: results.netBenefitPerCohort,
      benefitCostRatioPerCohort: results.bcrPerCohort,
      nationalNetBenefitINR: results.natNetBenefit,
      nationalBenefitCostRatio: results.natBcr
    }
  };
}

function refreshCopilotPrompt() {
  const output = document.getElementById("copilot-prompt-output");
  const statusText = document.getElementById("copilot-status-text");
  if (!output || !statusText) return;

  if (!state.lastResults) {
    output.value =
      "To generate the Copilot-ready interpretation prompt and scenario JSON, apply a configuration in STEPS and click “Refresh Copilot prompt”. The full text will appear here, ready to be copied and pasted into Microsoft Copilot.";
    statusText.textContent =
      "No configuration has been applied yet. Please apply a configuration before refreshing the Copilot prompt.";
    return;
  }

  const scenarioJson = buildScenarioJsonForCopilot(state.lastResults);
  const jsonText = JSON.stringify(scenarioJson, null, 2);

  const text =
    COPILOT_INTERPRETATION_PROMPT.trim() +
    "\n\nScenario JSON:\n" +
    jsonText;

  output.value = text;
  statusText.textContent =
    "The Copilot interpretation text has been updated. Copy this text and paste it into Microsoft Copilot for a policy-ready briefing.";
  showToast("Copilot prompt refreshed", "success");
}

function copyCopilotText() {
  const output = document.getElementById("copilot-prompt-output");
  if (!output) return;
  const text = output.value || "";
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Text copied for Copilot", "success");
      })
      .catch(() => {
        showToast("Copy failed. Please copy manually.", "error");
      });
  } else {
    output.select();
    document.execCommand("copy");
    showToast("Text copied for Copilot", "success");
  }
}

/* ===========================
   Advanced settings and assumption log
   =========================== */

function loadAdvancedSettingsIntoForm() {
  const s = state.epiSettings;

  const fields = [
    ["adv-inr-per-usd", s.general.inrPerUsd],
    ["adv-frontline-grads", s.tiers.frontline.gradShare],
    [
      "adv-frontline-outbreaks",
      s.tiers.frontline.outbreaksPerCohortPerYear
    ],
    ["adv-frontline-vgrad", s.tiers.frontline.valuePerGraduate],
    ["adv-frontline-voutbreak", s.tiers.frontline.valuePerOutbreak],
    ["adv-intermediate-grads", s.tiers.intermediate.gradShare],
    [
      "adv-intermediate-outbreaks",
      s.tiers.intermediate.outbreaksPerCohortPerYear
    ],
    [
      "adv-intermediate-vgrad",
      s.tiers.intermediate.valuePerGraduate
    ],
    [
      "adv-intermediate-voutbreak",
      s.tiers.intermediate.valuePerOutbreak
    ],
    ["adv-advanced-grads", s.tiers.advanced.gradShare],
    [
      "adv-advanced-outbreaks",
      s.tiers.advanced.outbreaksPerCohortPerYear
    ],
    ["adv-advanced-vgrad", s.tiers.advanced.valuePerGraduate],
    [
      "adv-advanced-voutbreak",
      s.tiers.advanced.valuePerOutbreak
    ]
  ];

  fields.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

function applyAdvancedSettingsFromForm() {
  const s = state.epiSettings;

  function readNumber(id, fallback) {
    const el = document.getElementById(id);
    if (!el || el.value === "") return fallback;
    const v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  }

  s.general.inrPerUsd = readNumber(
    "adv-inr-per-usd",
    s.general.inrPerUsd
  );

  s.tiers.frontline.gradShare = readNumber(
    "adv-frontline-grads",
    s.tiers.frontline.gradShare
  );
  s.tiers.frontline.outbreaksPerCohortPerYear = readNumber(
    "adv-frontline-outbreaks",
    s.tiers.frontline.outbreaksPerCohortPerYear
  );
  s.tiers.frontline.valuePerGraduate = readNumber(
    "adv-frontline-vgrad",
    s.tiers.frontline.valuePerGraduate
  );
  s.tiers.frontline.valuePerOutbreak = readNumber(
    "adv-frontline-voutbreak",
    s.tiers.frontline.valuePerOutbreak
  );

  s.tiers.intermediate.gradShare = readNumber(
    "adv-intermediate-grads",
    s.tiers.intermediate.gradShare
  );
  s.tiers.intermediate.outbreaksPerCohortPerYear = readNumber(
    "adv-intermediate-outbreaks",
    s.tiers.intermediate.outbreaksPerCohortPerYear
  );
  s.tiers.intermediate.valuePerGraduate = readNumber(
    "adv-intermediate-vgrad",
    s.tiers.intermediate.valuePerGraduate
  );
  s.tiers.intermediate.valuePerOutbreak = readNumber(
    "adv-intermediate-voutbreak",
    s.tiers.intermediate.valuePerOutbreak
  );

  s.tiers.advanced.gradShare = readNumber(
    "adv-advanced-grads",
    s.tiers.advanced.gradShare
  );
  s.tiers.advanced.outbreaksPerCohortPerYear = readNumber(
    "adv-advanced-outbreaks",
    s.tiers.advanced.outbreaksPerCohortPerYear
  );
  s.tiers.advanced.valuePerGraduate = readNumber(
    "adv-advanced-vgrad",
    s.tiers.advanced.valuePerGraduate
  );
  s.tiers.advanced.valuePerOutbreak = readNumber(
    "adv-advanced-voutbreak",
    s.tiers.advanced.valuePerOutbreak
  );

  showToast("Advanced settings applied", "success");
  if (state.lastResults) {
    applyConfiguration(false);
  }
  updateAssumptionLog();
}

function resetAdvancedSettingsToDefaults() {
  state.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
  loadAdvancedSettingsIntoForm();
  showToast("Advanced settings reset to defaults", "success");
  if (state.lastResults) {
    applyConfiguration(false);
  }
  updateAssumptionLog();
}

function updateAssumptionLog() {
  const el = document.getElementById("assumption-log-text");
  if (!el) return;

  const s = state.epiSettings;
  const lines = [];

  lines.push("STEPS assumption log");
  lines.push("");
  lines.push(
    `Planning horizon (years): ${s.general.planningHorizonYears}`
  );
  lines.push(
    `Display exchange rate (INR per USD): ${s.general.inrPerUsd}`
  );
  lines.push("");
  ["frontline", "intermediate", "advanced"].forEach((tier) => {
    const t = s.tiers[tier];
    lines.push(
      `${getTierLabel(tier)}: graduate share ${t.gradShare}, outbreak responses per cohort per year ${t.outbreaksPerCohortPerYear}`
    );
    lines.push(
      `  Value per graduate (INR): ${t.valuePerGraduate}, value per outbreak response (INR): ${t.valuePerOutbreak}`
    );
  });

  if (state.lastResults) {
    const r = state.lastResults;
    lines.push("");
    lines.push(
      `Current tier: ${getTierLabel(r.cfg.tier)}, cohorts: ${r.cfg.numberOfCohorts}, trainees per cohort: ${r.cfg.traineesPerCohort}`
    );
    lines.push(
      `Endorsement (selected model): ${(r.endorse * 100).toFixed(1)} %`
    );
    lines.push(
      `Total economic cost (all cohorts, INR): ${Math.round(
        r.totalEconomicCostAllCohorts
      )}`
    );
    lines.push(
      `Total epidemiological benefit (all cohorts, INR): ${Math.round(
        r.epiBenefitAllCohorts
      )}`
    );
    lines.push(
      `National benefit cost ratio: ${
        r.natBcr !== null ? r.natBcr.toFixed(2) : "-"
      }`
    );
  }

  el.textContent = lines.join("\n");
}

/* ===========================
   Tabs and configuration apply
   =========================== */

function setActiveTab(tabId) {
  const links = document.querySelectorAll(".tab-link");
  const panels = document.querySelectorAll(".tab-panel");

  links.forEach((btn) => {
    const t = btn.dataset.tab;
    btn.classList.toggle("active", t === tabId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle(
      "active",
      panel.id === `tab-${tabId}`
    );
  });
}

function updateCostSliderDisplay() {
  const slider = document.getElementById("cost-slider");
  const display = document.getElementById("cost-display");
  if (!slider || !display) return;
  const value = parseFloat(slider.value) || 0;
  display.textContent = formatCurrency(
    value,
    "INR"
  );
}

function toggleCurrency(button) {
  const currency = button.dataset.currency;
  if (!currency) return;
  state.currency = currency;
  document
    .querySelectorAll(".pill-toggle[data-currency]")
    .forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.currency === currency
      );
    });
  if (state.lastResults) {
    updateResultsView(state.lastResults);
    updateCostingView(state.lastResults);
    updateNationalSimulationView(state.lastResults);
    updateSensitivityTables();
    updateScenarioTable();
  }
}

function togglePreferenceModel(button) {
  const model = button.dataset.model;
  if (!model) return;
  // In this version we always use the mixed logit, regardless of toggle
  state.model = "mxl";
  document
    .querySelectorAll(".pill-toggle[data-model]")
    .forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.model === "mxl"
      );
    });
  if (state.lastResults) {
    applyConfiguration(false);
  }
}

function toggleOpportunityCost(button) {
  const on = !button.classList.contains("on");
  state.includeOpportunityCost = on;
  button.classList.toggle("on", on);
  const label = button.querySelector(".switch-label");
  if (label) {
    label.textContent = on
      ? "Opportunity cost included"
      : "Opportunity cost excluded";
  }
  if (state.lastResults) {
    applyConfiguration(false);
  }
}

/* Main apply function */

function applyConfiguration(showToastMessage = true) {
  const cfg = readConfigurationFromInputs();
  state.currentTier = cfg.tier;

  updateCostSourceOptions(cfg.tier);

  const results = computeScenarioResults(cfg, {
    modelId: state.model
  });
  state.lastResults = results;

  updateConfigSummary(results);
  updateResultsView(results);
  updateCostingView(results);
  updateNationalSimulationView(results);
  updateSensitivityTables();
  updateAssumptionLog();

  if (showToastMessage) {
    showToast("Configuration updated", "success");
  }
}

/* ===========================
   Modals and toast
   =========================== */

function openResultsModal() {
  const modal = document.getElementById("results-modal");
  const body = document.getElementById("modal-body");
  if (!modal || !body || !state.lastResults) return;

  const r = state.lastResults;
  const cfg = r.cfg;

  body.innerHTML = "";

  const p1 = document.createElement("p");
  p1.textContent =
    `Configuration: ${getTierLabel(cfg.tier)} tier, ${cfg.traineesPerCohort} trainees ` +
    `per cohort, ${cfg.numberOfCohorts} cohorts. Career incentive: ${getCareerLabel(
      cfg.career
    )}. Mentorship: ${getMentorshipLabel(cfg.mentorship)}. Delivery: ${getDeliveryLabel(
      cfg.delivery
    )}. Response time: ${getResponseLabel(cfg.response)}.`;

  const p2 = document.createElement("p");
  p2.textContent =
    `Endorsement is approximately ${(r.endorse * 100).toFixed(
      1
    )} percent, with a programme cost per cohort of ${formatCurrency(
      r.programCostPerCohortBudget,
      state.currency
    )} and a total economic cost per cohort of ${formatCurrency(
      r.totalEconomicCostPerCohort,
      state.currency
    )}.`;

  const p3 = document.createElement("p");
  p3.textContent =
    `Indicative epidemiological benefits per cohort are valued at ${formatCurrency(
      r.epiBenefitPerCohort,
      state.currency
    )}, giving a benefit cost ratio per cohort of ${
      r.bcrPerCohort !== null ? r.bcrPerCohort.toFixed(2) : "-"
    }. National totals across all cohorts include total economic cost of ${formatCurrency(
      r.totalEconomicCostAllCohorts,
      state.currency
    )}, epidemiological benefits of ${formatCurrency(
      r.epiBenefitAllCohorts,
      state.currency
    )}, a national benefit cost ratio of ${
      r.natBcr !== null ? r.natBcr.toFixed(2) : "-"
    } and net benefit of ${formatCurrency(
      r.natNetBenefit,
      state.currency
    )}.`;

  const p4 = document.createElement("p");
  p4.textContent =
    `Total willingness to pay across all cohorts is ${formatCurrency(
      r.wtpTotalAllCohorts,
      state.currency
    )}. This can be interpreted as a preference based measure of programme value and compared with the total economic cost in business case discussions.`;

  body.appendChild(p1);
  body.appendChild(p2);
  body.appendChild(p3);
  body.appendChild(p4);

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeResultsModal() {
  const modal = document.getElementById("results-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function showToast(message, type) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast visible";
  if (type === "success") toast.classList.add("toast-success");
  if (type === "warning") toast.classList.add("toast-warning");
  if (type === "error") toast.classList.add("toast-error");
  setTimeout(() => {
    toast.className = "toast hidden";
  }, 2600);
}

/* ===========================
   Tooltips
   =========================== */

let currentTooltip = null;

function showTooltip(target, text) {
  hideTooltip();
  const bubble = document.createElement("div");
  bubble.className = "tooltip-bubble";
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);

  const arrow = document.createElement("div");
  arrow.className = "tooltip-arrow";
  bubble.appendChild(arrow);

  document.body.appendChild(bubble);

  const rect = target.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();

  let top = rect.top + window.scrollY - bubbleRect.height - 8;
  let left =
    rect.left +
    window.scrollX +
    rect.width / 2 -
    bubbleRect.width / 2;

  if (top < window.scrollY) {
    top = rect.bottom + window.scrollY + 8;
  }

  bubble.style.top = `${top}px`;
  bubble.style.left = `${left}px`;

  const arrowSize = 8;
  arrow.style.left = `${bubbleRect.width / 2 - arrowSize / 2}px`;
  arrow.style.top =
    top < rect.top
      ? `${bubbleRect.height - arrowSize / 2}px`
      : `-${arrowSize / 2}px`;

  currentTooltip = bubble;
}

function hideTooltip() {
  if (currentTooltip && currentTooltip.parentNode) {
    currentTooltip.parentNode.removeChild(currentTooltip);
  }
  currentTooltip = null;
}

/* ===========================
   Guided tour
   =========================== */

function collectTourSteps() {
  const elements = document.querySelectorAll("[data-tour-step]");
  const steps = [];
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    steps.push({
      element: el,
      rect,
      title: el.getAttribute("data-tour-title") || "",
      content: el.getAttribute("data-tour-content") || ""
    });
  });
  steps.sort((a, b) => {
    if (a.rect.top === b.rect.top) {
      return a.rect.left - b.rect.left;
    }
    return a.rect.top - b.rect.top;
  });
  state.tour.steps = steps;
}

function openTour() {
  if (!state.tour.steps || state.tour.steps.length === 0) {
    collectTourSteps();
  }
  if (!state.tour.steps || state.tour.steps.length === 0) {
    return;
  }
  state.tour.active = true;
  state.tour.stepIndex = 0;
  document
    .getElementById("tour-overlay")
    .classList.remove("hidden");
  document
    .getElementById("tour-popover")
    .classList.remove("hidden");
  showTourStep(0);
}

function closeTour() {
  state.tour.active = false;
  document
    .getElementById("tour-overlay")
    .classList.add("hidden");
  document
    .getElementById("tour-popover")
    .classList.add("hidden");
}

function showTourStep(index) {
  if (!state.tour.steps || state.tour.steps.length === 0) return;
  if (index < 0 || index >= state.tour.steps.length) return;

  state.tour.stepIndex = index;
  const step = state.tour.steps[index];

  const titleEl = document.getElementById("tour-title");
  const contentEl = document.getElementById("tour-content");
  const indicatorEl = document.getElementById("tour-step-indicator");
  const popover = document.getElementById("tour-popover");

  if (titleEl) titleEl.textContent = step.title || "Tour step";
  if (contentEl) contentEl.textContent = step.content || "";
  if (indicatorEl) {
    indicatorEl.textContent = `Step ${index + 1} of ${state.tour.steps.length}`;
  }

  const rect = step.element.getBoundingClientRect();
  const popRect = popover.getBoundingClientRect();

  let top = rect.bottom + window.scrollY + 8;
  let left =
    rect.left +
    window.scrollX +
    rect.width / 2 -
    popRect.width / 2;

  if (top + popRect.height > window.scrollY + window.innerHeight) {
    top = rect.top + window.scrollY - popRect.height - 8;
  }

  if (left < 8) left = 8;
  if (left + popRect.width > window.innerWidth - 8) {
    left = window.innerWidth - popRect.width - 8;
  }

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}

/* ===========================
   Optional configuration files
   =========================== */

function tryLoadJsonConfig(url, onSuccess) {
  fetch(url)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error("Config not found");
      }
      return resp.json();
    })
    .then((data) => {
      onSuccess(data);
      showToast(`Loaded configuration from ${url}`, "success");
    })
    .catch(() => {
      /* Silent if not present */
    });
}

/* ===========================
   Initialisation
   =========================== */

function initTabs() {
  document
    .querySelectorAll(".tab-link")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab) setActiveTab(tab);
      });
    });
}

function initTooltips() {
  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    if (
      target.classList &&
      target.classList.contains("info-icon") &&
      target.dataset.tooltip
    ) {
      showTooltip(target, target.dataset.tooltip);
    }
  });
  document.addEventListener("mouseout", (e) => {
    const target = e.target;
    if (
      target.classList &&
      target.classList.contains("info-icon")
    ) {
      hideTooltip();
    }
  });
}

function initGuidedTour() {
  const startBtn = document.getElementById("btn-start-tour");
  const overlay = document.getElementById("tour-overlay");
  const closeBtn = document.getElementById("tour-close");
  const prevBtn = document.getElementById("tour-prev");
  const nextBtn = document.getElementById("tour-next");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      collectTourSteps();
      openTour();
    });
  }
  if (overlay) {
    overlay.addEventListener("click", closeTour);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeTour);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showTourStep(state.tour.stepIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.tour.stepIndex + 1 < state.tour.steps.length) {
        showTourStep(state.tour.stepIndex + 1);
      } else {
        closeTour();
      }
    });
  }
}

/* Main init */

function init() {
  initTabs();
  initTooltips();
  initGuidedTour();

  /* Remove latent-class UI: only keep overall mixed logit option in dropdowns/toggles */

  const classScenarioSelect = document.getElementById("benefit-class-scenario");
  if (classScenarioSelect) {
    for (let i = classScenarioSelect.options.length - 1; i >= 0; i--) {
      const opt = classScenarioSelect.options[i];
      if (opt.value && opt.value !== "overall") {
        classScenarioSelect.remove(i);
      }
    }
    classScenarioSelect.value = "overall";
  }

  document
    .querySelectorAll(".pill-toggle[data-model]")
    .forEach((btn) => {
      if (btn.dataset.model && btn.dataset.model !== "mxl") {
        if (btn.parentNode) {
          btn.parentNode.removeChild(btn);
        }
      }
    });

  const costSlider = document.getElementById("cost-slider");
  if (costSlider) {
    costSlider.addEventListener("input", updateCostSliderDisplay);
    updateCostSliderDisplay();
  }

  document
    .querySelectorAll(".pill-toggle[data-currency]")
    .forEach((btn) => {
      btn.addEventListener("click", () => toggleCurrency(btn));
    });

  document
    .querySelectorAll(".pill-toggle[data-model]")
    .forEach((btn) => {
      btn.addEventListener("click", () => togglePreferenceModel(btn));
    });

  const oppToggle = document.getElementById("opp-toggle");
  if (oppToggle) {
    oppToggle.addEventListener("click", () =>
      toggleOpportunityCost(oppToggle)
    );
  }

  const applyBtn = document.getElementById("update-results");
  if (applyBtn) {
    applyBtn.addEventListener("click", () =>
      applyConfiguration(true)
    );
  }

  const snapshotBtn = document.getElementById("open-snapshot");
  if (snapshotBtn) {
    snapshotBtn.addEventListener("click", openResultsModal);
  }

  const modalClose = document.getElementById("close-modal");
  if (modalClose) {
    modalClose.addEventListener("click", closeResultsModal);
  }

  const saveScenarioBtn = document.getElementById("save-scenario");
  if (saveScenarioBtn) {
    saveScenarioBtn.addEventListener("click", addScenarioFromCurrentResults);
  }

  const exportExcelBtn = document.getElementById("export-excel");
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", exportScenariosToExcel);
  }

  const exportPdfBtn = document.getElementById("export-pdf");
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", exportScenariosToPdf);
  }

  const costSourceSelect = document.getElementById("cost-source");
  if (costSourceSelect) {
    costSourceSelect.addEventListener("change", () => {
      state.currentCostSourceId = costSourceSelect.value;
      if (state.lastResults) {
        applyConfiguration(false);
      }
    });
  }

  const advApplyBtn = document.getElementById("advanced-apply");
  if (advApplyBtn) {
    advApplyBtn.addEventListener("click", applyAdvancedSettingsFromForm);
  }

  const advResetBtn = document.getElementById("advanced-reset");
  if (advResetBtn) {
    advResetBtn.addEventListener("click", resetAdvancedSettingsToDefaults);
  }

  const sensitivityRefreshBtn = document.getElementById("refresh-sensitivity-benefits");
  if (sensitivityRefreshBtn) {
    sensitivityRefreshBtn.addEventListener("click", updateSensitivityTables);
  }

  const sensitivityExcelBtn = document.getElementById("export-sensitivity-benefits-excel");
  if (sensitivityExcelBtn) {
    sensitivityExcelBtn.addEventListener("click", () =>
      exportSensitivityToExcel(
        "dce-benefits-table",
        "steps_dce_benefits.xlsx"
      )
    );
  }

  const sensitivityPdfBtn = document.getElementById("export-sensitivity-benefits-pdf");
  if (sensitivityPdfBtn) {
    sensitivityPdfBtn.addEventListener("click", () =>
      exportSensitivityToPdf(
        "dce-benefits-table",
        "steps_dce_benefits.pdf"
      )
    );
  }

  document
    .querySelectorAll("#benefit-definition-select, #benefit-class-scenario, #endorsement-override")
    .forEach((el) => {
      el.addEventListener("change", updateSensitivityTables);
    });

  const sensitivityEpiToggle = document.getElementById("sensitivity-epi-toggle");
  if (sensitivityEpiToggle) {
    sensitivityEpiToggle.addEventListener("click", () => {
      sensitivityEpiToggle.classList.toggle("on");
      const label = sensitivityEpiToggle.querySelector(".switch-label");
      if (label) {
        label.textContent = sensitivityEpiToggle.classList.contains("on")
          ? "Outbreak benefits included"
          : "Outbreak benefits excluded";
      }
      updateSensitivityTables();
    });
  }

  const copilotRefreshBtn = document.getElementById("copilot-refresh-btn");
  if (copilotRefreshBtn) {
    copilotRefreshBtn.addEventListener("click", refreshCopilotPrompt);
  }

  const copilotCopyBtn = document.getElementById("copilot-copy-btn");
  if (copilotCopyBtn) {
    copilotCopyBtn.addEventListener("click", copyCopilotText);
  }

  loadAdvancedSettingsIntoForm();
  updateAssumptionLog();

  const tierSelect = document.getElementById("program-tier");
  if (tierSelect) {
    state.currentTier = tierSelect.value;
    updateCostSourceOptions(state.currentTier);
  }

  tryLoadJsonConfig("epi_config.json", (data) => {
    state.epiSettings = data;
    loadAdvancedSettingsIntoForm();
    updateAssumptionLog();
    if (state.lastResults) applyConfiguration(false);
  });

  tryLoadJsonConfig("cost_config.json", (data) => {
    COST_CONFIG = data;
    if (state.currentTier) {
      updateCostSourceOptions(state.currentTier);
      if (state.lastResults) applyConfiguration(false);
    }
  });

  applyConfiguration(false);
}

/* ===========================
   DOM ready
   =========================== */

document.addEventListener("DOMContentLoaded", init);
