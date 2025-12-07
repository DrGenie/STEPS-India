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
   Cost configuration
   =========================== */

/* Aggregated cost table across institutions (INR) */
const AGGREGATED_COSTS = {
  frontline: {
    tier: "frontline",
    cohortSize: 35,
    totalProgramCost: 17413793.0,
    indirectCosts: 9089142.0,
    components: [
      {
        id: "salary_in_country_staff",
        major: "Direct cost",
        label: "Salary and benefits: in country programme staff",
        shareOfProgramCost: 1782451.0 / 17413793.0
      },
      {
        id: "equipment_office",
        major: "Direct cost",
        label: "Equipment and supplies: office equipment (staff and faculty)",
        shareOfProgramCost: 33333.0 / 17413793.0
      },
      {
        id: "software_office",
        major: "Direct cost",
        label: "Equipment and supplies: office software (staff and faculty)",
        shareOfProgramCost: 3333.0 / 17413793.0
      },
      {
        id: "facilities_rent",
        major: "Direct cost",
        label: "Facilities: rent and utilities (staff and faculty)",
        shareOfProgramCost: 200000.0 / 17413793.0
      },
      {
        id: "training_materials",
        major: "Direct cost",
        label: "Training: materials",
        shareOfProgramCost: 5000.0 / 17413793.0
      },
      {
        id: "training_workshops",
        major: "Direct cost",
        label: "Training: workshops and seminars",
        shareOfProgramCost: 890117.0 / 17413793.0
      },
      {
        id: "travel_in_country",
        major: "Direct cost",
        label: "Travel expenses: in country travel",
        shareOfProgramCost: 5410417.0 / 17413793.0
      },
      {
        id: "other_direct",
        major: "Direct cost",
        label: "Other direct costs",
        shareOfProgramCost: 0.0
      }
    ]
  },
  intermediate: {
    tier: "intermediate",
    cohortSize: 80,
    totalProgramCost: 361096904.0,
    indirectCosts: 93200454.0,
    components: [
      {
        id: "salary_in_country_staff",
        major: "Direct cost",
        label: "Salary and benefits: in country programme staff",
        shareOfProgramCost: 24751500.0 / 361096904.0
      },
      {
        id: "salary_other",
        major: "Direct cost",
        label: "Salary and benefits: other",
        shareOfProgramCost: 100000.0 / 361096904.0
      },
      {
        id: "equipment_office",
        major: "Direct cost",
        label: "Equipment and supplies: office equipment (staff and faculty)",
        shareOfProgramCost: 1720000.0 / 361096904.0
      },
      {
        id: "software_office",
        major: "Direct cost",
        label: "Equipment and supplies: office software (staff and faculty)",
        shareOfProgramCost: 7230000.0 / 361096904.0
      },
      {
        id: "facilities_rent",
        major: "Direct cost",
        label: "Facilities: rent and utilities (staff and faculty)",
        shareOfProgramCost: 4595000.0 / 361096904.0
      },
      {
        id: "training_materials",
        major: "Direct cost",
        label: "Training: materials",
        shareOfProgramCost: 145000.0 / 361096904.0
      },
      {
        id: "training_workshops",
        major: "Direct cost",
        label: "Training: workshops and seminars",
        shareOfProgramCost: 6899950.0 / 361096904.0
      },
      {
        id: "travel_in_country",
        major: "Direct cost",
        label: "Travel expenses: in country travel",
        shareOfProgramCost: 152756875.0 / 361096904.0
      },
      {
        id: "travel_international",
        major: "Direct cost",
        label: "Travel expenses: international travel",
        shareOfProgramCost: 34816125.0 / 361096904.0
      },
      {
        id: "other_direct",
        major: "Direct cost",
        label: "Other direct costs",
        shareOfProgramCost: 34882000.0 / 361096904.0
      }
    ]
  },
  advanced: {
    tier: "advanced",
    cohortSize: 40,
    totalProgramCost: 375747710.0,
    indirectCosts: 86711010.0,
    components: [
      {
        id: "salary_in_country_staff",
        major: "Direct cost",
        label: "Salary and benefits: in country programme staff",
        shareOfProgramCost: 47660000.0 / 375747710.0
      },
      {
        id: "salary_other",
        major: "Direct cost",
        label: "Salary and benefits: other",
        shareOfProgramCost: 100000.0 / 375747710.0
      },
      {
        id: "equipment_office",
        major: "Direct cost",
        label: "Equipment and supplies: office equipment (staff and faculty)",
        shareOfProgramCost: 4020000.0 / 375747710.0
      },
      {
        id: "software_office",
        major: "Direct cost",
        label: "Equipment and supplies: office software (staff and faculty)",
        shareOfProgramCost: 5310000.0 / 375747710.0
      },
      {
        id: "facilities_rent",
        major: "Direct cost",
        label: "Facilities: rent and utilities (staff and faculty)",
        shareOfProgramCost: 7375000.0 / 375747710.0
      },
      {
        id: "trainee_allowances",
        major: "Direct cost",
        label: "Trainee support: allowances",
        shareOfProgramCost: 25000000.0 / 375747710.0
      },
      {
        id: "trainee_equipment",
        major: "Direct cost",
        label: "Trainee support: trainee equipment",
        shareOfProgramCost: 1000000.0 / 375747710.0
      },
      {
        id: "trainee_software",
        major: "Direct cost",
        label: "Trainee support: trainee software",
        shareOfProgramCost: 500000.0 / 375747710.0
      },
      {
        id: "training_materials",
        major: "Direct cost",
        label: "Training: materials",
        shareOfProgramCost: 700000.0 / 375747710.0
      },
      {
        id: "training_workshops",
        major: "Direct cost",
        label: "Training: workshops and seminars",
        shareOfProgramCost: 5441200.0 / 375747710.0
      },
      {
        id: "travel_in_country",
        major: "Direct cost",
        label: "Travel expenses: in country travel",
        shareOfProgramCost: 107499500.0 / 375747710.0
      },
      {
        id: "travel_international",
        major: "Direct cost",
        label: "Travel expenses: international travel",
        shareOfProgramCost: 83300000.0 / 375747710.0
      },
      {
        id: "other_direct",
        major: "Direct cost",
        label: "Other direct costs",
        shareOfProgramCost: 1231000.0 / 375747710.0
      }
    ]
  }
};

/*
  COST_CONFIG will be loaded from cost_config.json if present.
  The aggregated table above is used to derive component shares and
  opportunity cost calculations consistently across the tool.
*/
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
   Copilot interpretation prompt (template)
   =========================== */

const COPILOT_INTERPRETATION_PROMPT_TEMPLATE =
  "STEPS Tool Copilot Interpretation Prompt\n" +
  "Act as a senior health economist advising the Ministry of Health and Family Welfare in India on the national scale up of Field Epidemiology Training Programs. You are working with outputs from the STEPS FETP India Decision Aid. The scenario JSON you will receive summarises the configuration selected by the user, including programme tier, career pathway, mentorship intensity, delivery mode, outbreak response time, cost per trainee per month, number of cohorts and all model based outputs. Latent class results are not included and should not be discussed. All other model components remain valid and must be interpreted.\n\n" +
  "Use the JSON provided to reconstruct the scenario in clear plain language. Describe the configuration by stating which FETP tier is being scaled, the cohort size, the main design elements related to careers, mentorship, delivery and response time, and the implied cost per trainee and the total economic cost across all cohorts. Present this description with precision so that senior decision makers can immediately understand what the configuration represents and the resources it requires.\n\n" +
  "Explain the discrete choice experiment endorsement results in intuitive terms and state what proportion of key stakeholders are predicted to support the configuration. Clarify whether support appears low, moderate or strong in the context of national scale up decisions in India. If there are any differences in endorsement associated with faster response time or stronger mentorship, describe these clearly for policy makers.\n\n" +
  "Interpret the willingness to pay estimates as monetary summaries of how strongly stakeholders value the configuration. Make clear that willingness to pay is considered a benefit measure because it reflects the maximum monetary amount that informed stakeholders would hypothetically exchange to secure improvements in epidemiological training, mentoring, outbreak response and system capacity relative to the status quo. State how total willingness to pay across all cohorts compares with total economic cost. Indicate whether stakeholders appear willing to pay more, about the same or less than the programme would cost to implement. Discuss the implications of this relationship for political feasibility, acceptability to partners and the strength of the economic case from a preference based perspective. If there are separate elements of willingness to pay related to response time, explain how much additional value stakeholders attach to faster detection and earlier control of outbreaks.\n\n" +
  "Summarise the epidemiological outputs by describing the expected number of graduates, the number of outbreak responses supported per year and the approximate monetary value of these epidemiological benefits. Clarify what these figures imply for India surveillance and response capacity and how the selected tier contributes to detecting events at the front line, analysing and interpreting surveillance data at the intermediate level or providing advanced leadership for complex responses. State whether the combined costs and epidemiological benefits yield a benefit cost ratio that is clearly above one, close to one or below one and interpret what that means for value for money.\n\n" +
  "Bring the results together in a concise policy interpretation suitable for a cabinet note or a national steering committee briefing. Make an explicit judgement about whether the scenario appears highly attractive, promising but in need of refinement or weak from a value for money perspective. Refer directly to endorsement, willingness to pay, epidemiological benefits, total economic cost, benefit cost ratio and net benefit when forming this judgement. Where useful, highlight any key trade offs between the selected tier and other tiers. Comment on affordability and fiscal space by situating the total economic cost against the likely scale up budget envelope for FETP within the health system.\n\n" +
  "Provide a short set of policy recommendations. Indicate whether the scenario is suitable for national scale up, targeted scale up in selected states, further piloting or redesign. Suggest practical adjustments that could improve feasibility or value. Present the final output as a polished policy brief with clear section headings and well structured paragraphs. Include a results table that summarises the configuration, endorsement, willingness to pay results, epidemiological benefits, total economic costs, benefit cost ratio and net benefit.\n\n" +
  "The scenario JSON is as follows:\n\n";

/* ===========================
   Global state
   =========================== */

const state = {
  model: "mxl",
  currency: "INR",
  includeOpportunityCost: true,
  epiSettings: JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS)),
  currentTier: "frontline",
  currentCostScenarioKey: "economicCost",
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
  return value.toFixed(decimals) + " %";
}

function formatCurrencyInr(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return "₹ " + value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
}

function formatCurrency(valueInInr, currency = "INR", decimalsInr = 0) {
  if (valueInInr === null || valueInInr === undefined || isNaN(valueInInr)) {
    return "-";
  }
  if (currency === "USD") {
    const rate = state.epiSettings.general.inrPerUsd || 83;
    const valueUsd = valueInInr / rate;
    return "US$ " + valueUsd.toLocaleString("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1
    });
  }
  return formatCurrencyInr(valueInInr, decimalsInr);
}

function formatMillionInr(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  const millions = value / 1_000_000;
  return millions.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

function logistic(x) {
  if (x > 50) return 1;
  if (x < -50) return 0;
  return 1 / (1 + Math.exp(-x));
}

function getModelCoefs() {
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
    inperson: "Fully in person",
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

function computeEndorsementAndWtp(cfg) {
  const coefs = getModelCoefs();
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
    endorsement: endorseProb,
    optOutShare: optOutProb,
    wtpPerTraineePerMonth: wtp.totalPerTraineePerMonth,
    wtpComponents: wtp.components
  };
}

/* ===========================
   Cost and epidemiology helpers
   =========================== */

function getCostScenarioKeyFromUi() {
  const scenarioSelect = document.getElementById("costing-scenario-select");
  if (scenarioSelect) {
    const val = scenarioSelect.value;
      if (val === "financialCost" || val === "economicCost" || val === "economicHighOpportunityCost") {
      return val;
    }
  }
  return state.currentCostScenarioKey || "economicCost";
}

function getAggregatedCostRowForTier(tier) {
  return AGGREGATED_COSTS[tier] || null;
}

function computeCostTotalsFromAggregated(tier, cfg, scenarioKey, includeOpp) {
  const row = getAggregatedCostRowForTier(tier);
  if (!row) {
    return {
      programCostPerCohortBudget: 0,
      opportunityCostPerCohort: 0,
      totalEconomicCostPerCohort: 0,
      totalEconomicCostAllCohorts: 0
    };
  }

  const cohortSizeRef = row.cohortSize || cfg.traineesPerCohort || 1;
  const scaleFactor =
    cfg.traineesPerCohort > 0 ? cfg.traineesPerCohort / cohortSizeRef : 0;

  const directPlusIndirectPerRefCohort = row.totalProgramCost;
  const indirectPerRefCohort = row.indirectCosts;

  const directPerRefCohort =
    directPlusIndirectPerRefCohort - indirectPerRefCohort;

  const directPerCohortScaled =
    directPerRefCohort * scaleFactor;
  const indirectPerCohortScaled =
    indirectPerRefCohort * scaleFactor;

  let oppMultiplier = 1.0;
  if (scenarioKey === "economicHighOpportunityCost") {
    oppMultiplier = 1.25;
  }

  const opportunityCostPerCohort =
    includeOpp ? indirectPerCohortScaled * (oppMultiplier - 1 + 1) : 0;

  const programCostPerCohortBudget = directPerCohortScaled;
  const totalEconomicCostPerCohort =
    programCostPerCohortBudget +
    (includeOpp ? indirectPerCohortScaled * oppMultiplier : 0);

  const totalEconomicCostAllCohorts =
    totalEconomicCostPerCohort * cfg.numberOfCohorts;

  return {
    programCostPerCohortBudget,
    opportunityCostPerCohort: includeOpp ? indirectPerCohortScaled * oppMultiplier : 0,
    totalEconomicCostPerCohort,
    totalEconomicCostAllCohorts
  };
}

function getEpiTierSettings(tier) {
  return state.epiSettings.tiers[tier] || state.epiSettings.tiers.frontline;
}

/* ===========================
   Scenario calculations
   =========================== */

function computeScenarioResults(cfg) {
  const months = getTierMonths(cfg.tier);
  const epiTier = getEpiTierSettings(cfg.tier);
  const horizonYears = state.epiSettings.general.planningHorizonYears || 5;
  const responseMultiplier = RESPONSE_TIME_MULTIPLIERS[cfg.response] || 1.0;

  const endo = computeEndorsementAndWtp(cfg);

  const endorse = endo.endorsement;
  const optOut = endo.optOutShare;

  const trainees = cfg.traineesPerCohort;
  const cohorts = cfg.numberOfCohorts;

  const costScenarioKey = getCostScenarioKeyFromUi();
  state.currentCostScenarioKey = costScenarioKey;

  const includeOppToggle = document.getElementById("costing-include-opportunity-toggle");
  const includeOpp =
    includeOppToggle && includeOppToggle.classList.contains("on");

  const costTotals = computeCostTotalsFromAggregated(
    cfg.tier,
    cfg,
    costScenarioKey,
    includeOpp
  );

  const wtpPerTraineePerMonth = endo.wtpPerTraineePerMonth || 0;
  const wtpComponents = endo.wtpComponents || null;
  const responseWtpPerTraineePerMonth =
    wtpComponents && wtpComponents.response ? wtpComponents.response : 0;

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
    epiBenefitPerCohort - costTotals.totalEconomicCostPerCohort;

  const bcrPerCohort =
    costTotals.totalEconomicCostPerCohort > 0
      ? epiBenefitPerCohort / costTotals.totalEconomicCostPerCohort
      : null;

  const natNetBenefit =
    epiBenefitAllCohorts - costTotals.totalEconomicCostAllCohorts;

  const natBcr =
    costTotals.totalEconomicCostAllCohorts > 0
      ? epiBenefitAllCohorts / costTotals.totalEconomicCostAllCohorts
      : null;

  const natGraduatesAllCohorts = gradsPerCohort * cohorts;
  const natOutbreaksPerYearAllCohorts =
    outbreaksPerCohortPerYear * cohorts;

  return {
    cfg,
    months,
    horizonYears,
    endorse,
    optOut,
    wtpPerTraineePerMonth,
    wtpComponents,
    responseWtpPerTraineePerMonth,
    wtpTotalPerCohort,
    wtpTotalAllCohorts,
    wtpResponseTotalAllCohorts,
    programCostPerCohortBudget: costTotals.programCostPerCohortBudget,
    oppCostPerCohort: costTotals.opportunityCostPerCohort,
    totalEconomicCostPerCohort: costTotals.totalEconomicCostPerCohort,
    totalEconomicCostAllCohorts: costTotals.totalEconomicCostAllCohorts,
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
        "Once a configuration is applied, this box provides a short narrative summary that you can copy into briefing notes, World Bank documents or meeting minutes.";
    }
    return;
  }

  const { cfg } = results;

  const rows = [];

  rows.push({
    label: "Programme tier",
    value: getTierLabel(cfg.tier) + " (" + getTierMonths(cfg.tier) + " months)"
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

    headlineTag.className = "status-pill " + statusClass;
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
      "Under the current settings, a " +
      getTierLabel(cfg.tier) +
      " configuration with " +
      cfg.traineesPerCohort +
      " trainees per cohort and " +
      cfg.numberOfCohorts +
      " cohorts is predicted to attract endorsement from around " +
      endorseText +
      " of stakeholders. Total economic cost across all cohorts is " +
      natCostText +
      ", while indicative epidemiological benefits over a planning horizon of " +
      results.horizonYears +
      " years are valued at approximately " +
      natBenefitText +
      ". This corresponds to a national epidemiological benefit cost ratio of about " +
      natBcrText +
      ". These figures provide a concise summary for concept notes, steering committee briefings and discussions with ministries and partners.";
  }
}

/* ===========================
   DOM updates: charts and results
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

  ensureChart("chart-uptake", "uptake", {
    type: "doughnut",
    data: {
      labels: ["Endorse FETP option", "Choose opt out"],
      datasets: [
        {
          data: [results.endorse * 100, results.optOut * 100]
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
  });

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
      results.bcrPerCohort !== null ? results.bcrPerCohort.toFixed(2) : "-";
  }

  ensureChart("chart-bcr", "bcr", {
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
  });

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

  ensureChart("chart-epi", "epi", {
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
  });
}

/* ===========================
   DOM updates: costing tab
   =========================== */

function updateCostingView(results) {
  const summaryContainer = document.getElementById("cost-breakdown-summary");
  const tbody = document.getElementById("cost-components-list");

  if (!summaryContainer || !tbody) return;

  summaryContainer.innerHTML = "";
  tbody.innerHTML = "";

  if (!results) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      "Apply a configuration to view detailed cost shares and opportunity costs.";
    summaryContainer.appendChild(note);
    return;
  }

  const cfg = results.cfg;
  const aggRow = getAggregatedCostRowForTier(cfg.tier);

  if (!aggRow) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      "No aggregated cost data are available for this tier.";
    summaryContainer.appendChild(note);
    return;
  }

  const costScenarioKey = state.currentCostScenarioKey || "economicCost";
  const includeOppToggle = document.getElementById("costing-include-opportunity-toggle");
  const includeOpp =
    includeOppToggle && includeOppToggle.classList.contains("on");

  const cards = [
    {
      label: "Programme cost per cohort (budgetary, direct costs)",
      value: formatCurrency(results.programCostPerCohortBudget, state.currency)
    },
    {
      label: "Opportunity cost per cohort",
      value: formatCurrency(results.oppCostPerCohort, state.currency)
    },
    {
      label: "Total economic cost per cohort",
      value: formatCurrency(results.totalEconomicCostPerCohort, state.currency)
    },
    {
      label: "Total economic cost, all cohorts (million ₹)",
      value: formatMillionInr(results.totalEconomicCostAllCohorts)
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

  const components = aggRow.components || [];
  const months = results.months || getTierMonths(cfg.tier);

  components.forEach((comp) => {
    const tr = document.createElement("tr");

    const amountPerCohort =
      results.programCostPerCohortBudget * (comp.shareOfProgramCost || 0);
    const amountPerTraineePerMonth =
      cfg.traineesPerCohort > 0 && months > 0
        ? amountPerCohort / (cfg.traineesPerCohort * months)
        : 0;

    const tdName = document.createElement("td");
    tdName.textContent = comp.label;

    const tdShare = document.createElement("td");
    tdShare.textContent = formatPercent(
      (comp.shareOfProgramCost || 0) * 100,
      1
    );

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
    tdNotes.textContent =
      costScenarioKey === "financialCost"
        ? "Financial cost perspective"
        : includeOpp
        ? "Economic cost including opportunity cost"
        : "Base programme cost";

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

  ensureChart("chart-nat-cost-benefit", "natCostBenefit", {
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
  });

  ensureChart("chart-nat-epi", "natEpi", {
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
  });

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
    const natNetText = formatCurrency(results.natNetBenefit, state.currency);
    const natBcrText =
      results.natBcr !== null ? results.natBcr.toFixed(2) : "-";
    const gradsText = formatNumber(results.natGraduatesAllCohorts);
    const outbreaksText = formatNumber(
      results.natOutbreaksPerYearAllCohorts,
      1
    );

    summaryTextEl.textContent =
      "With " +
      cfg.numberOfCohorts +
      " cohorts of " +
      cfg.traineesPerCohort +
      " trainees at the " +
      getTierLabel(cfg.tier) +
      " tier, this configuration generates an estimated " +
      gradsText +
      " FETP graduates in total and supports around " +
      outbreaksText +
      " outbreak responses per year once graduates are in post. Total economic cost across all cohorts is " +
      natCostText +
      ", while indicative epidemiological benefits over a " +
      results.horizonYears +
      " year horizon are valued at about " +
      natBenefitText +
      ". This yields a national epidemiological benefit cost ratio of approximately " +
      natBcrText +
      " and a national net benefit of " +
      natNetText +
      ".";
  }
}

/* ===========================
   Sensitivity and DCE benefits tab
   =========================== */

function getBenefitDefinitionSettings() {
  const defSelect = document.getElementById("benefit-definition-select");
  const epiToggle = document.getElementById("sensitivity-epi-toggle");
  const endorsementOverrideInput = document.getElementById("endorsement-override");

  const benefitDefinition = defSelect ? defSelect.value : "wtp_only";
  const includeEpi =
    epiToggle && epiToggle.classList.contains("on");

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
    endorsementOverride
  };
}

function computeScenarioForBenefits(baseCfg, includeEpi, benefitDefinition, endorsementOverride) {
  const results = computeScenarioResults(baseCfg);

  const endorseUsed =
    typeof endorsementOverride === "number"
      ? endorsementOverride
      : results.endorse;

  const epiPart = includeEpi ? results.epiBenefitAllCohorts : 0;
  const totalWtpAllCohorts = results.wtpTotalAllCohorts;

  let wtpUsedForRatios = totalWtpAllCohorts;
  if (benefitDefinition === "endorsement_adjusted") {
    wtpUsedForRatios = totalWtpAllCohorts * endorseUsed;
  }

  const combinedBenefitAllCohorts =
    includeEpi ? wtpUsedForRatios + epiPart : wtpUsedForRatios;

  const costAllCohorts = results.totalEconomicCostAllCohorts;

  const bcrWtpOnly =
    costAllCohorts > 0 ? wtpUsedForRatios / costAllCohorts : null;
  const npvWtpOnly = wtpUsedForRatios - costAllCohorts;

  const bcrCombined =
    costAllCohorts > 0 ? combinedBenefitAllCohorts / costAllCohorts : null;
  const npvCombined = combinedBenefitAllCohorts - costAllCohorts;

  const effectiveWtp = totalWtpAllCohorts * endorseUsed;
  const effectiveCombined = (totalWtpAllCohorts + epiPart) * endorseUsed;

  return {
    results,
    endorseUsed,
    epiAllCohorts: epiPart,
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
  const { benefitDefinition, includeEpi, endorsementOverride } = settings;

  const calc = computeScenarioForBenefits(
    scenarioCfg,
    includeEpi,
    benefitDefinition,
    endorsementOverride
  );
  const { results } = calc;

  const row = document.createElement("tr");

  const endorsePctUsed = calc.endorseUsed * 100;

  const tdScenario = document.createElement("td");
  tdScenario.textContent = label;

  const tdCostAllCohorts = document.createElement("td");
  tdCostAllCohorts.textContent = formatCurrency(
    calc.costAllCohorts,
    state.currency
  );
  tdCostAllCohorts.className = "numeric-cell";

  const tdCostAllCohortsMillion = document.createElement("td");
  tdCostAllCohortsMillion.textContent = formatMillionInr(
    calc.costAllCohorts
  );
  tdCostAllCohortsMillion.className = "numeric-cell";

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
    calc.epiAllCohorts,
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

  const tdNetBenefitAllCohortsMillion = document.createElement("td");
  tdNetBenefitAllCohortsMillion.textContent = formatMillionInr(
    calc.npvCombined
  );
  tdNetBenefitAllCohortsMillion.className = "numeric-cell";

  row.appendChild(tdScenario);
  row.appendChild(tdCostAllCohorts);
  row.appendChild(tdCostAllCohortsMillion);
  row.appendChild(tdTotalWtp);
  row.appendChild(tdWtpResponse);
  row.appendChild(tdEpi);
  row.appendChild(tdEndorseUsed);
  row.appendChild(tdEffectiveWtp);
  row.appendChild(tdBcrWtpOnly);
  row.appendChild(tdNpvWtpOnly);
  row.appendChild(tdBcrCombined);
  row.appendChild(tdNpvCombined);
  row.appendChild(tdNetBenefitAllCohortsMillion);

  return row;
}

function buildSensitivityMatrixRow(label, scenarioCfg, includeEpi) {
  const calc = computeScenarioForBenefits(
    scenarioCfg,
    includeEpi,
    "wtp_only",
    null
  );
  const { results } = calc;

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

  const epiPerCohort = includeEpi
    ? results.valueFromOutbreaksPerCohort
    : 0;

  const tdEpiBenefitPerCohort = document.createElement("td");
  tdEpiBenefitPerCohort.textContent = formatCurrency(
    epiPerCohort,
    state.currency
  );
  tdEpiBenefitPerCohort.className = "numeric-cell";

  const tdBcrWtpOverall = document.createElement("td");
  const bcrWtpOverall =
    results.totalEconomicCostPerCohort > 0
      ? results.wtpTotalPerCohort / results.totalEconomicCostPerCohort
      : null;
  tdBcrWtpOverall.textContent =
    bcrWtpOverall !== null ? bcrWtpOverall.toFixed(2) : "-";
  tdBcrWtpOverall.className = "numeric-cell";

  const tdNpvWtpOverall = document.createElement("td");
  const npvWtpOverall =
    results.wtpTotalPerCohort - results.totalEconomicCostPerCohort;
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
      ? combinedBenefitPerCohort / results.totalEconomicCostPerCohort
      : null;
  tdBcrCombinedOverall.textContent =
    bcrCombinedOverall !== null ? bcrCombinedOverall.toFixed(2) : "-";
  tdBcrCombinedOverall.className = "numeric-cell";

  const tdNpvCombinedOverall = document.createElement("td");
  const npvCombinedOverall =
    combinedBenefitPerCohort - results.totalEconomicCostPerCohort;
  tdNpvCombinedOverall.textContent = formatCurrency(
    npvCombinedOverall,
    state.currency
  );
  tdNpvCombinedOverall.className = "numeric-cell";

  const tdEffectiveWtpOverall = document.createElement("td");
  const effectiveWtpOverall =
    results.wtpTotalPerCohort * results.endorse;
  tdEffectiveWtpOverall.textContent = formatCurrency(
    effectiveWtpOverall,
    state.currency
  );
  tdEffectiveWtpOverall.className = "numeric-cell";

  const tdEffectiveCombinedOverall = document.createElement("td");
  const effectiveCombinedOverall =
    (results.wtpTotalPerCohort + epiPerCohort) * results.endorse;
  tdEffectiveCombinedOverall.textContent = formatCurrency(
    effectiveCombinedOverall,
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
    buildDceBenefitsTableRow(currentLabel, state.lastResults.cfg, settings)
  );
  sensTbody.appendChild(
    buildSensitivityMatrixRow(
      currentLabel,
      state.lastResults.cfg,
      settings.includeEpi
    )
  );

  state.scenarios.forEach((sc, index) => {
    const label = sc.name || "Scenario " + (index + 1);
    benefitsTbody.appendChild(
      buildDceBenefitsTableRow(label, sc.cfg, settings)
    );
    sensTbody.appendChild(
      buildSensitivityMatrixRow(label, sc.cfg, settings.includeEpi)
    );
  });
}

/* ===========================
   Scenarios tab and exports
   =========================== */

function showToast(message, type) {
  const toast = document.getElementById("global-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast toast-visible toast-" + (type || "info");
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function addScenarioFromCurrentResults() {
  if (!state.lastResults) return;

  const { cfg } = state.lastResults;

  const name =
    cfg.scenarioName && cfg.scenarioName.length > 0
      ? cfg.scenarioName
      : "Scenario " + (state.scenarios.length + 1);

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

    const tdTier = document.createElement("td");
    tdTier.textContent = getTierLabel(sc.cfg.tier);

    const tdEndorse = document.createElement("td");
    tdEndorse.textContent = formatPercent(r.endorse * 100, 1);

    const tdCostMillion = document.createElement("td");
    tdCostMillion.textContent = formatMillionInr(r.totalEconomicCostAllCohorts);
    tdCostMillion.className = "numeric-cell";

    const tdBcr = document.createElement("td");
    tdBcr.textContent =
      r.natBcr !== null ? r.natBcr.toFixed(2) : "-";
    tdBcr.className = "numeric-cell";

    const tdNetMillion = document.createElement("td");
    tdNetMillion.textContent = formatMillionInr(r.natNetBenefit);
    tdNetMillion.className = "numeric-cell";

    tr.appendChild(tdShortlist);
    tr.appendChild(tdName);
    tr.appendChild(tdTier);
    tr.appendChild(tdEndorse);
    tr.appendChild(tdCostMillion);
    tr.appendChild(tdBcr);
    tr.appendChild(tdNetMillion);

    tbody.appendChild(tr);
  });
}

/* ===========================
   Copilot tab
   =========================== */

function buildCopilotPromptFromLastResults() {
  if (!state.lastResults) return "";

  const scenarioPayload = {
    meta: {
      tool: "STEPS FETP India Decision Aid",
      version: "1.0",
      generatedAt: new Date().toISOString()
    },
    configuration: state.lastResults.cfg,
    results: {
      endorsement: state.lastResults.endorse,
      optOutShare: state.lastResults.optOut,
      wtpPerTraineePerMonth: state.lastResults.wtpPerTraineePerMonth,
      wtpTotalPerCohort: state.lastResults.wtpTotalPerCohort,
      wtpTotalAllCohorts: state.lastResults.wtpTotalAllCohorts,
      wtpResponseTotalAllCohorts:
        state.lastResults.wtpResponseTotalAllCohorts,
      programCostPerCohortBudget:
        state.lastResults.programCostPerCohortBudget,
      totalEconomicCostPerCohort:
        state.lastResults.totalEconomicCostPerCohort,
      totalEconomicCostAllCohorts:
        state.lastResults.totalEconomicCostAllCohorts,
      epiBenefitPerCohort: state.lastResults.epiBenefitPerCohort,
      epiBenefitAllCohorts: state.lastResults.epiBenefitAllCohorts,
      natNetBenefit: state.lastResults.natNetBenefit,
      natBcr: state.lastResults.natBcr,
      natGraduatesAllCohorts:
        state.lastResults.natGraduatesAllCohorts,
      natOutbreaksPerYearAllCohorts:
        state.lastResults.natOutbreaksPerYearAllCohorts
    }
  };

  const jsonText = JSON.stringify(scenarioPayload, null, 2);
  return COPILOT_INTERPRETATION_PROMPT_TEMPLATE + jsonText;
}

async function handleCopilotOpenAndCopy() {
  const textarea = document.getElementById("copilot-prompt-textarea");
  const helpText = document.getElementById("copilot-help-text");

  if (!state.lastResults) {
    if (helpText) {
      helpText.textContent =
        "Please apply a configuration on the main tabs before using Copilot. The tool needs results from at least one scenario.";
    }
    return;
  }

  const prompt = buildCopilotPromptFromLastResults();

  if (textarea) {
    textarea.value = prompt;
  }

  let copied = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(prompt);
      copied = true;
    } catch (e) {
      copied = false;
    }
  }

  if (helpText) {
    if (copied) {
      helpText.textContent =
        "The full prompt has been copied to your clipboard and Copilot has opened in a new tab. Paste the prompt into Copilot and run the analysis.";
    } else {
      helpText.textContent =
        "Your browser or organisation settings did not allow automatic copying. Please select and copy the prompt from the box below and paste it into Copilot.";
    }
  }

  window.open("https://copilot.microsoft.com/", "_blank", "noopener");
}

/* ===========================
   Main apply and event wiring
   =========================== */

function applyConfigurationAndUpdateAll() {
  const cfg = readConfigurationFromInputs();
  const results = computeScenarioResults(cfg);
  state.currentTier = cfg.tier;
  state.lastResults = results;

  updateConfigSummary(results);
  updateResultsView(results);
  updateCostingView(results);
  updateNationalSimulationView(results);
  updateSensitivityTables();
}

function initEventHandlers() {
  const applyBtn = document.getElementById("apply-config-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      applyConfigurationAndUpdateAll();
      showToast("Configuration applied and results updated", "success");
    });
  }

  const saveScenarioBtn = document.getElementById("save-scenario-btn");
  if (saveScenarioBtn) {
    saveScenarioBtn.addEventListener("click", addScenarioFromCurrentResults);
  }

  const epiToggle = document.getElementById("sensitivity-epi-toggle");
  if (epiToggle) {
    epiToggle.addEventListener("click", () => {
      epiToggle.classList.toggle("on");
      updateSensitivityTables();
    });
  }

  const benefitDefSelect = document.getElementById("benefit-definition-select");
  if (benefitDefSelect) {
    benefitDefSelect.addEventListener("change", updateSensitivityTables);
  }

  const endorsementOverrideInput = document.getElementById("endorsement-override");
  if (endorsementOverrideInput) {
    endorsementOverrideInput.addEventListener("input", updateSensitivityTables);
  }

  const costScenarioSelect = document.getElementById("costing-scenario-select");
  if (costScenarioSelect) {
    costScenarioSelect.addEventListener("change", () => {
      if (state.lastResults) {
        const cfg = state.lastResults.cfg;
        state.lastResults = computeScenarioResults(cfg);
        updateCostingView(state.lastResults);
        updateNationalSimulationView(state.lastResults);
        updateSensitivityTables();
      }
    });
  }

  const oppToggle = document.getElementById("costing-include-opportunity-toggle");
  if (oppToggle) {
    oppToggle.addEventListener("click", () => {
      oppToggle.classList.toggle("on");
      if (state.lastResults) {
        const cfg = state.lastResults.cfg;
        state.lastResults = computeScenarioResults(cfg);
        updateCostingView(state.lastResults);
        updateNationalSimulationView(state.lastResults);
        updateSensitivityTables();
      }
    });
  }

  const copilotBtn = document.getElementById("copilot-open-btn");
  if (copilotBtn) {
    copilotBtn.addEventListener("click", handleCopilotOpenAndCopy);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initEventHandlers();
});
