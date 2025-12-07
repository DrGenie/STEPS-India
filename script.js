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
   Cost templates (combined, all institutions)
   Based on provided totals (grand total, indirect including opportunity cost)
   =========================== */

const COST_TEMPLATES = {
  frontline: {
    combined: {
      id: "frontline_combined",
      label: "Frontline combined template (all institutions)",
      description:
        "Combined cost structure for Frontline FETP across all institutions, including staff, travel, training, trainee support and indirect costs.",
      grandTotal: 17413793.0,
      indirectAmount: 9089142.0,
      cohortSize: 35,
      components: [
        {
          id: "salary_program_staff",
          label: "Salary and benefits: in country program staff",
          amount: 1782451.0,
          notes: "Salaries and benefits for local staff dedicated to the program."
        },
        {
          id: "salary_other",
          label: "Salary and benefits: consultants and advisors",
          amount: 0.0,
          notes: "Consultants and advisors (not used in this tier in the provided data)."
        },
        {
          id: "office_equipment",
          label: "Office equipment (staff and faculty)",
          amount: 33333.0,
          notes: "Desktops, laptops, projectors, printers and related equipment."
        },
        {
          id: "office_software",
          label: "Office software (staff and faculty)",
          amount: 3333.0,
          notes: "Software for data analysis, training delivery and office use."
        },
        {
          id: "rent_utilities",
          label: "Rent and utilities (staff and faculty)",
          amount: 200000.0,
          notes: "Office rent and utilities used by FETP staff and faculty."
        },
        {
          id: "trainee_allowances",
          label: "Trainee allowances",
          amount: 0.0,
          notes: "Stipends or scholarships (no allowance recorded for Frontline in the provided data)."
        },
        {
          id: "trainee_equipment",
          label: "Trainee equipment",
          amount: 0.0,
          notes: "Laptops, internet and similar support for trainees."
        },
        {
          id: "trainee_software",
          label: "Trainee software",
          amount: 0.0,
          notes: "Software licenses provided directly to trainees."
        },
        {
          id: "training_materials",
          label: "Training materials",
          amount: 5000.0,
          notes: "Printing of manuals, handouts and other learning materials."
        },
        {
          id: "workshops_seminars",
          label: "Workshops and seminars",
          amount: 890117.0,
          notes: "Venue hire, catering and other costs for training workshops."
        },
        {
          id: "travel_in_country",
          label: "In country travel",
          amount: 5410417.0,
          notes: "Travel within India for training, outbreaks, meetings and conferences."
        },
        {
          id: "travel_international",
          label: "International travel",
          amount: 0.0,
          notes: "International meetings and conferences (none for Frontline in the provided data)."
        },
        {
          id: "other_direct",
          label: "Other direct expenses",
          amount: 0.0,
          notes: "Other direct program costs not captured in specific categories."
        }
      ]
    }
  },
  intermediate: {
    combined: {
      id: "intermediate_combined",
      label: "Intermediate combined template (all institutions)",
      description:
        "Combined cost structure for Intermediate FETP across all institutions, including staff, travel, training, trainee support and indirect costs.",
      grandTotal: 361096904.0,
      indirectAmount: 93200454.0,
      cohortSize: 80,
      components: [
        {
          id: "salary_program_staff",
          label: "Salary and benefits: in country program staff",
          amount: 24751500.0,
          notes: "Salaries and benefits for local staff dedicated to the program."
        },
        {
          id: "salary_other",
          label: "Salary and benefits: consultants and advisors",
          amount: 100000.0,
          notes: "Consultants and advisors."
        },
        {
          id: "office_equipment",
          label: "Office equipment (staff and faculty)",
          amount: 1720000.0,
          notes: "Desktops, laptops, projectors, printers and related equipment."
        },
        {
          id: "office_software",
          label: "Office software (staff and faculty)",
          amount: 7230000.0,
          notes: "Software for data analysis, training delivery and office use."
        },
        {
          id: "rent_utilities",
          label: "Rent and utilities (staff and faculty)",
          amount: 4595000.0,
          notes: "Office rent and utilities used by FETP staff and faculty."
        },
        {
          id: "trainee_allowances",
          label: "Trainee allowances",
          amount: 0.0,
          notes: "Stipends or scholarships (not listed for Intermediate in the provided data)."
        },
        {
          id: "trainee_equipment",
          label: "Trainee equipment",
          amount: 0.0,
          notes: "Laptops, internet and similar support for trainees."
        },
        {
          id: "trainee_software",
          label: "Trainee software",
          amount: 0.0,
          notes: "Software licenses provided directly to trainees."
        },
        {
          id: "training_materials",
          label: "Training materials",
          amount: 145000.0,
          notes: "Printing of manuals, handouts and other learning materials."
        },
        {
          id: "workshops_seminars",
          label: "Workshops and seminars",
          amount: 6899950.0,
          notes: "Venue hire, catering and other costs for training workshops."
        },
        {
          id: "travel_in_country",
          label: "In country travel",
          amount: 152756875.0,
          notes: "Travel within India for training, outbreaks, meetings and conferences."
        },
        {
          id: "travel_international",
          label: "International travel",
          amount: 34816125.0,
          notes: "International meetings, conferences and outbreak related travel."
        },
        {
          id: "other_direct",
          label: "Other direct expenses",
          amount: 34882000.0,
          notes: "Other direct program costs associated with the FETP."
        }
      ]
    }
  },
  advanced: {
    combined: {
      id: "advanced_combined",
      label: "Advanced combined template (all institutions)",
      description:
        "Combined cost structure for Advanced FETP across all institutions, including staff, travel, trainee allowances and indirect costs.",
      grandTotal: 375747710.0,
      indirectAmount: 86711010.0,
      cohortSize: 40,
      components: [
        {
          id: "salary_program_staff",
          label: "Salary and benefits: in country program staff",
          amount: 47660000.0,
          notes: "Salaries and benefits for local staff dedicated to the program."
        },
        {
          id: "salary_other",
          label: "Salary and benefits: consultants and advisors",
          amount: 0.0,
          notes: "Consultants and advisors (not listed for Advanced in the provided data)."
        },
        {
          id: "office_equipment",
          label: "Office equipment (staff and faculty)",
          amount: 4020000.0,
          notes: "Desktops, laptops, projectors, printers and related equipment."
        },
        {
          id: "office_software",
          label: "Office software (staff and faculty)",
          amount: 5310000.0,
          notes: "Software for data analysis, training delivery and office use."
        },
        {
          id: "rent_utilities",
          label: "Rent and utilities (staff and faculty)",
          amount: 7375000.0,
          notes: "Office rent and utilities used by FETP staff and faculty."
        },
        {
          id: "trainee_allowances",
          label: "Trainee allowances",
          amount: 25000000.0,
          notes: "Stipends, scholarships or other allowances for trainees."
        },
        {
          id: "trainee_equipment",
          label: "Trainee equipment",
          amount: 1000000.0,
          notes: "Laptops, internet and similar support for trainees."
        },
        {
          id: "trainee_software",
          label: "Trainee software",
          amount: 500000.0,
          notes: "Software licenses provided directly to trainees."
        },
        {
          id: "training_materials",
          label: "Training materials",
          amount: 700000.0,
          notes: "Printing of manuals, handouts and other learning materials."
        },
        {
          id: "workshops_seminars",
          label: "Workshops and seminars",
          amount: 5441200.0,
          notes: "Venue hire, catering and other costs for training workshops."
        },
        {
          id: "travel_in_country",
          label: "In country travel",
          amount: 107499500.0,
          notes: "Travel within India for training, outbreaks, meetings and conferences."
        },
        {
          id: "travel_international",
          label: "International travel",
          amount: 83300000.0,
          notes: "International meetings, conferences and outbreak related travel."
        },
        {
          id: "other_direct",
          label: "Other direct expenses",
          amount: 1231000.0,
          notes: "Other direct program costs associated with the FETP."
        }
      ]
    }
  }
};

/* ===========================
   Epidemiological settings
   =========================== */

const DEFAULT_EPI_SETTINGS = {
  general: {
    planningHorizonYears: 10,
    // USD per INR for display (for example 0.012 means 1 INR is 0.012 USD)
    inrPerUsd: 0.012,
    completionRate: 0.9,
    outbreaksPerGraduatePerYear: 0.5,
    discountRateEpi: 0.03
  },
  tiers: {
    frontline: {
      valuePerGraduate: 500000,
      valuePerOutbreak: 2000000
    },
    intermediate: {
      valuePerGraduate: 500000,
      valuePerOutbreak: 2000000
    },
    advanced: {
      valuePerGraduate: 500000,
      valuePerOutbreak: 2000000
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
STEPS Tool Copilot Interpretation Prompt

Act as a senior health economist advising the Ministry of Health and Family Welfare in India on the national scale up of Field Epidemiology Training Programs. You are working with outputs from the STEPS FETP India Decision Aid. The scenario JSON you will receive summarises the configuration selected by the user, including programme tier, career pathway, mentorship intensity, delivery mode, outbreak response time, cost per trainee per month, number of cohorts and all model based outputs. Latent class results have been removed and should not be discussed. All other model components remain valid and must be interpreted.

Use the JSON provided to reconstruct the scenario in clear plain language. Describe the configuration by stating which FETP tier is being scaled, the intake size, the main design elements related to careers, mentorship, delivery and response time, and the implied cost per trainee and the total economic cost across all cohorts. Present this description with precision so that senior decision makers can immediately understand what the configuration represents and the resources it requires.

Explain the discrete choice experiment endorsement results in intuitive terms and state what proportion of key stakeholders are predicted to support the configuration. Clarify whether support appears low, moderate or strong in the context of national scale up decisions in India. If there are any differences in endorsement associated with faster response time or stronger mentorship, articulate these clearly for policy makers.

Interpret the willingness to pay estimates as monetary summaries of how strongly stakeholders value the configuration. Make clear that willingness to pay is considered a benefit measure because it reflects the maximum monetary amount that informed stakeholders would hypothetically exchange to secure improvements in epidemiological training, mentoring, outbreak response and system capacity relative to the status quo. State that willingness to pay captures perceived programme value in financial units, allowing direct comparison with the economic costs of scale up and enabling the economic case to be assessed in terms of whether the perceived value generated by the programme exceeds its cost. Explain how total willingness to pay across all cohorts compares with total economic cost. Indicate whether stakeholders appear willing to pay more, about the same or less than the programme would cost to implement. Discuss the implications of this relationship for political feasibility, acceptability to partners and the strength of the economic case from a preference based perspective. If there are separate elements of willingness to pay related to response time, explain how much additional value stakeholders attach to faster detection and earlier control of outbreaks.

Summarise the epidemiological outputs by describing the expected number of graduates, the number of outbreak responses supported per year and the approximate monetary value of these epidemiological benefits. Clarify what these figures imply for India surveillance and response capacity and how the selected tier contributes to detecting events at the front line, analysing and interpreting surveillance data at the intermediate level or providing advanced leadership for complex responses. State whether the combined costs and epidemiological benefits yield a benefit cost ratio that is clearly above one, close to one or below one and interpret what that means for value for money in the Indian context.

Bring the results together in a concise policy interpretation suitable for a cabinet note or a national steering committee briefing. Make an explicit judgement about whether the scenario appears highly attractive, promising but in need of refinement or weak from a value for money perspective. Refer directly to endorsement, willingness to pay, epidemiological benefits, total economic cost, benefit cost ratio and net benefits when forming this judgement. Where useful, highlight trade offs between the selected tier and other tiers. Comment on affordability and fiscal space by situating the total economic cost against the likely scale up budget envelope for FETP within the health system.

Provide a short set of policy recommendations. Indicate whether the scenario is suitable for national scale up, targeted scale up in selected states, further piloting or redesign. Suggest practical adjustments that could improve feasibility or value. Present the final output as a polished policy brief with clear section headings and well structured paragraphs. Include a results table that summarises the configuration, endorsement, willingness to pay results, epidemiological benefits, total economic costs, benefit cost ratio and net benefit.
`.trim();

/* ===========================
   Global state
   =========================== */

const state = {
  model: "mxl",
  currency: "INR",
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
    const rate = state.epiSettings.general.inrPerUsd || 0.012;
    const valueUsd = valueInInr * rate;
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

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ===========================
   Toast and snapshot helpers
   =========================== */

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.bottom = "16px";
    container.style.right = "16px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.background = type === "error" ? "#b91c1c" : type === "success" ? "#0f766e" : "#334155";
  toast.style.color = "#f9fafb";
  toast.style.padding = "8px 12px";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "13px";
  toast.style.boxShadow = "0 4px 10px rgba(15,23,42,0.4)";
  toast.style.maxWidth = "360px";

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.4s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }, 3200);
}

function showSnapshotPanel(results) {
  if (!results) {
    showToast("Apply a configuration first to view a summary.", "info");
    return;
  }

  const existing = document.getElementById("steps-snapshot-panel");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const cfg = results.cfg;

  const panel = document.createElement("div");
  panel.id = "steps-snapshot-panel";
  panel.style.position = "fixed";
  panel.style.bottom = "16px";
  panel.style.right = "16px";
  panel.style.width = "360px";
  panel.style.maxWidth = "90vw";
  panel.style.background = "#0b1120";
  panel.style.color = "#e5e7eb";
  panel.style.borderRadius = "10px";
  panel.style.boxShadow = "0 12px 30px rgba(15,23,42,0.7)";
  panel.style.padding = "12px 14px";
  panel.style.zIndex = "9998";
  panel.style.fontSize = "13px";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const title = document.createElement("div");
  title.textContent = "Scenario summary";
  title.style.fontWeight = "600";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "×";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.color = "#9ca3af";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "16px";
  closeBtn.onclick = () => {
    if (panel.parentNode) panel.parentNode.removeChild(panel);
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.style.display = "flex";
  body.style.flexDirection = "column";
  body.style.gap = "4px";

  const endorseText = formatPercent(results.endorse * 100, 1);
  const natCostText = formatCurrency(results.totalEconomicCostAllCohorts, state.currency);
  const natBenefitText = formatCurrency(results.epiBenefitAllCohorts, state.currency);
  const natBcrText = results.natBcr !== null ? results.natBcr.toFixed(2) : "-";
  const natWtpText = formatCurrency(results.wtpTotalAllCohorts, state.currency);

  const lines = [
    `${getTierLabel(cfg.tier)} tier; ${cfg.numberOfCohorts} cohorts of ${cfg.traineesPerCohort} trainees; response time ${getResponseLabel(cfg.response).toLowerCase()}.`,
    `Predicted endorsement: ${endorseText}.`,
    `Total economic cost (all cohorts): ${natCostText}.`,
    `Indicative epidemiological benefits (all cohorts): ${natBenefitText}.`,
    `Benefit cost ratio (epidemiological): ${natBcrText}.`,
    `Total willingness to pay (all cohorts): ${natWtpText}.`
  ];

  lines.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.margin = "0";
    body.appendChild(p);
  });

  panel.appendChild(header);
  panel.appendChild(body);

  document.body.appendChild(panel);

  setTimeout(() => {
    if (panel.parentNode) {
      panel.style.opacity = "0";
      panel.style.transition = "opacity 0.4s ease";
      setTimeout(() => {
        if (panel.parentNode) panel.parentNode.removeChild(panel);
      }, 400);
    }
  }, 12000);
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
   Cost configuration helpers
   =========================== */

function getCostConfigForTier(tier) {
  return COST_TEMPLATES[tier] || {};
}

function getCostTemplate(tier, sourceId) {
  const cfg = getCostConfigForTier(tier);
  const keys = Object.keys(cfg);
  if (keys.length === 0) return null;

  if (sourceId && cfg[sourceId]) {
    const tpl = cfg[sourceId];
    normaliseCostTemplate(tpl);
    return tpl;
  }

  const tpl = cfg[keys[0]];
  normaliseCostTemplate(tpl);
  return tpl;
}

function normaliseCostTemplate(tpl) {
  if (!tpl) return;
  const indirect = tpl.indirectAmount || 0;
  const grandTotal = tpl.grandTotal || 0;
  const directTotal = grandTotal - indirect;
  tpl.directTotal = directTotal > 0 ? directTotal : grandTotal;
  if (tpl.oppRate === undefined || tpl.oppRate === null) {
    tpl.oppRate =
      tpl.directTotal > 0 && indirect > 0 ? indirect / tpl.directTotal : 0;
  }
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
    tpl.id = id;
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

function computeScenarioResults(cfg) {
  const months = getTierMonths(cfg.tier);
  const epiTier = getEpiTierSettings(cfg.tier);
  const horizonYears = state.epiSettings.general.planningHorizonYears || 10;
  const responseMultiplier = RESPONSE_TIME_MULTIPLIERS[cfg.response] || 1.0;

  const completionRate =
    state.epiSettings.general.completionRate !== undefined
      ? state.epiSettings.general.completionRate
      : 0.9;

  const outbreaksPerGraduate =
    state.epiSettings.general.outbreaksPerGraduatePerYear !== undefined
      ? state.epiSettings.general.outbreaksPerGraduatePerYear
      : 0.5;

  const overall = computeEndorsementAndWtp(cfg);
  const endorse = overall.endorsement;
  const optOut = overall.optOutShare;

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

  const wtpPerTraineePerMonth = overall.wtpPerTraineePerMonth || 0;
  const wtpComponents = overall.wtpComponents || null;
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
    trainees * completionRate * endorse;

  const outbreaksPerCohortPerYear =
    gradsPerCohort * outbreaksPerGraduate;

  const discountRate = state.epiSettings.general.discountRateEpi || 0.03;
  let discountFactor = horizonYears;
  if (discountRate > 0) {
    const r = discountRate;
    discountFactor = (1 - Math.pow(1 + r, -horizonYears)) / r;
  }

  const valueFromGraduatesPerCohort =
    gradsPerCohort * epiTier.valuePerGraduate;

  const valueFromOutbreaksPerCohort =
    outbreaksPerCohortPerYear *
    epiTier.valuePerOutbreak *
    discountFactor *
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
   Charts
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

/* ===========================
   DOM updates: results tab
   =========================== */

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
    epiGraduatesEl.textContent = formatNumber(results.natGraduatesAllCohorts);
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
  const select = document.getElementById("cost-source");

  if (!summaryContainer || !tbody || !results) return;

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
      "No cost template is available for this tier. The costing view requires a combined template for each tier.";
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

  const directTotal = template.directTotal || template.grandTotal || 1;
  const components = template.components || [];
  const trainees = cfg.traineesPerCohort || 0;
  const months = results.months || 1;

  components.forEach((comp) => {
    const tr = document.createElement("tr");

    const shareDirect =
      comp.amount && directTotal > 0 ? comp.amount / directTotal : 0;

    const amountPerCohort = budgetCost * shareDirect;
    const amountPerTraineePerMonth =
      trainees > 0 && months > 0
        ? amountPerCohort / (trainees * months)
        : 0;

    const tdName = document.createElement("td");
    tdName.textContent = comp.label;

    const tdShare = document.createElement("td");
    tdShare.textContent = formatPercent(shareDirect * 100, 1);

    const tdAmount = document.createElement("td");
    tdAmount.textContent = formatCurrency(amountPerCohort, state.currency);
    tdAmount.className = "numeric-cell";

    const tdPerTrainee = document.createElement("td");
    tdPerTrainee.textContent = formatCurrency(
      amountPerTraineePerMonth,
      state.currency
    );
    tdPerTrainee.className = "numeric-cell";

    const tdNotes = document.createElement("td");
    tdNotes.textContent = comp.notes || "";

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
          label: "Total willingness to pay (all cohorts)",
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
   Sensitivity and DCE benefits
   =========================== */

function getBenefitDefinitionSettings() {
  const defSelect = document.getElementById("benefit-definition-select");
  const epiToggle = document.getElementById("sensitivity-epi-toggle");
  const endorsementOverrideInput = document.getElementById(
    "endorsement-override"
  );

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

function computeScenarioForSensitivity(
  baseCfg,
  includeEpi,
  benefitDefinition,
  endorsementOverride
) {
  const results = computeScenarioResults(baseCfg);

  const endorseUsed =
    typeof endorsementOverride === "number"
      ? endorsementOverride
      : results.endorse;

  const epiFromOutbreaksAllCohorts =
    results.valueFromOutbreaksPerCohort *
    results.cfg.numberOfCohorts;

  const totalWtpAllCohorts = results.wtpTotalAllCohorts;

  let wtpUsedForRatios = totalWtpAllCohorts;
  if (benefitDefinition === "endorsement_adjusted") {
    wtpUsedForRatios = totalWtpAllCohorts * endorseUsed;
  }

  const combinedBenefitAllCohorts = includeEpi
    ? wtpUsedForRatios + epiFromOutbreaksAllCohorts
    : wtpUsedForRatios;

  const costAllCohorts = results.totalEconomicCostAllCohorts;

  const bcrWtpOnly =
    costAllCohorts > 0 ? wtpUsedForRatios / costAllCohorts : null;
  const npvWtpOnly = wtpUsedForRatios - costAllCohorts;

  const bcrCombined =
    costAllCohorts > 0 ? combinedBenefitAllCohorts / costAllCohorts : null;
  const npvCombined = combinedBenefitAllCohorts - costAllCohorts;

  const effectiveWtp = totalWtpAllCohorts * endorseUsed;
  const effectiveCombined =
    (totalWtpAllCohorts + epiFromOutbreaksAllCohorts) * endorseUsed;

  return {
    results,
    endorseUsed,
    epiAllCohorts: epiFromOutbreaksAllCohorts,
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
    endorsementOverride
  } = settings;

  const calc = computeScenarioForSensitivity(
    scenarioCfg,
    includeEpi,
    benefitDefinition,
    endorsementOverride
  );

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

  const tdCostMillion = document.createElement("td");
  tdCostMillion.textContent = formatNumber(
    calc.costAllCohorts / 1_000_000,
    2
  );
  tdCostMillion.className = "numeric-cell";

  const totalBenefitForNet = includeEpi
    ? calc.totalWtpAllCohorts + epiBenefitFromOutbreaks
    : calc.totalWtpAllCohorts;
  const netAllCohorts = totalBenefitForNet - calc.costAllCohorts;

  const tdNetMillion = document.createElement("td");
  tdNetMillion.textContent = formatNumber(
    netAllCohorts / 1_000_000,
    2
  );
  tdNetMillion.className = "numeric-cell";

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
  row.appendChild(tdCostMillion);
  row.appendChild(tdNetMillion);
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
  const calc = computeScenarioForSensitivity(
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

  const tdTotalWtpPerCohort = document.createElement("td");
  tdTotalWtpPerCohort.textContent = formatCurrency(
    results.wtpTotalPerCohort,
    state.currency
  );
  tdTotalWtpPerCohort.className = "numeric-cell";

  const tdWtpResponsePerCohort = document.createElement("td");
  tdWtpResponsePerCohort.textContent = formatCurrency(
    results.responseWtpPerTraineePerMonth *
      results.cfg.traineesPerCohort *
      results.months,
    state.currency
  );
  tdWtpResponsePerCohort.className = "numeric-cell";

  const epiPerCohort = includeEpi
    ? results.valueFromOutbreaksPerCohort
    : 0;

  const tdEpiBenefitPerCohort = document.createElement("td");
  tdEpiBenefitPerCohort.textContent = formatCurrency(
    epiPerCohort,
    state.currency
  );
  tdEpiBenefitPerCohort.className = "numeric-cell";

  const bcrWtpPerCohort =
    results.totalEconomicCostPerCohort > 0
      ? results.wtpTotalPerCohort / results.totalEconomicCostPerCohort
      : null;

  const tdBcrWtpPerCohort = document.createElement("td");
  tdBcrWtpPerCohort.textContent =
    bcrWtpPerCohort !== null ? bcrWtpPerCohort.toFixed(2) : "-";
  tdBcrWtpPerCohort.className = "numeric-cell";

  const npvWtpPerCohort =
    results.wtpTotalPerCohort - results.totalEconomicCostPerCohort;

  const tdNpvWtpPerCohort = document.createElement("td");
  tdNpvWtpPerCohort.textContent = formatCurrency(
    npvWtpPerCohort,
    state.currency
  );
  tdNpvWtpPerCohort.className = "numeric-cell";

  const combinedBenefitPerCohort =
    results.wtpTotalPerCohort + epiPerCohort;

  const bcrCombinedPerCohort =
    results.totalEconomicCostPerCohort > 0
      ? combinedBenefitPerCohort / results.totalEconomicCostPerCohort
      : null;

  const tdBcrCombinedPerCohort = document.createElement("td");
  tdBcrCombinedPerCohort.textContent =
    bcrCombinedPerCohort !== null
      ? bcrCombinedPerCohort.toFixed(2)
      : "-";
  tdBcrCombinedPerCohort.className = "numeric-cell";

  const npvCombinedPerCohort =
    combinedBenefitPerCohort - results.totalEconomicCostPerCohort;

  const tdNpvCombinedPerCohort = document.createElement("td");
  tdNpvCombinedPerCohort.textContent = formatCurrency(
    npvCombinedPerCohort,
    state.currency
  );
  tdNpvCombinedPerCohort.className = "numeric-cell";

  const effectiveWtpPerCohort =
    results.wtpTotalPerCohort * results.endorse;

  const tdEffectiveWtpPerCohort = document.createElement("td");
  tdEffectiveWtpPerCohort.textContent = formatCurrency(
    effectiveWtpPerCohort,
    state.currency
  );
  tdEffectiveWtpPerCohort.className = "numeric-cell";

  const effectiveCombinedPerCohort =
    (results.wtpTotalPerCohort + epiPerCohort) *
    results.endorse;

  const tdEffectiveCombinedPerCohort = document.createElement("td");
  tdEffectiveCombinedPerCohort.textContent = formatCurrency(
    effectiveCombinedPerCohort,
    state.currency
  );
  tdEffectiveCombinedPerCohort.className = "numeric-cell";

  row.appendChild(tdScenario);
  row.appendChild(tdModel);
  row.appendChild(tdEndorse);
  row.appendChild(tdCostPerCohort);
  row.appendChild(tdTotalWtpPerCohort);
  row.appendChild(tdWtpResponsePerCohort);
  row.appendChild(tdEpiBenefitPerCohort);
  row.appendChild(tdBcrWtpPerCohort);
  row.appendChild(tdNpvWtpPerCohort);
  row.appendChild(tdBcrCombinedPerCohort);
  row.appendChild(tdNpvCombinedPerCohort);
  row.appendChild(tdEffectiveWtpPerCohort);
  row.appendChild(tdEffectiveCombinedPerCohort);

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
  if (!state.lastResults) {
    showToast("Apply a configuration before saving a scenario.", "info");
    return;
  }

  const { cfg } = state.lastResults;

  const name =
    cfg.scenarioName && cfg.scenarioName.length > 0
      ? cfg.scenarioName
      : `Scenario ${state.scenarios.length + 1}`;

  const scenario = {
    id: Date.now(),
    name,
    notes: cfg.scenarioNotes || "",
    cfg: deepClone(cfg),
    resultsSnapshot: deepClone(state.lastResults)
  };

  state.scenarios.push(scenario);
  updateScenarioTable();
  updateSensitivityTables();
  showToast("Scenario saved for comparison.", "success");
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
    showToast("Excel export library is not available.", "error");
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
    showToast("PDF export library is not available.", "error");
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
      `Net epidemiological benefit (all cohorts): ${formatCurrencyInr(
        r.natNetBenefit
      )}, national benefit cost ratio: ${
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
    showToast("Excel export library is not available.", "error");
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
    showToast("PDF export library is not available.", "error");
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
      career: cfg.career,
      careerLabel: getCareerLabel(cfg.career),
      mentorship: cfg.mentorship,
      mentorshipLabel: getMentorshipLabel(cfg.mentorship),
      delivery: cfg.delivery,
      deliveryLabel: getDeliveryLabel(cfg.delivery),
      response: cfg.response,
      responseLabel: getResponseLabel(cfg.response),
      costPerTraineePerMonthINR: cfg.costPerTraineePerMonth,
      traineesPerCohort: cfg.traineesPerCohort,
      numberOfCohorts: cfg.numberOfCohorts,
      monthsInProgramme: results.months,
      scenarioName: cfg.scenarioName || "",
      scenarioNotes: cfg.scenarioNotes || ""
    },
    preferenceModel: {
      type: "Mixed logit (overall sample)",
      ascProgram: MXL_COEFS.ascProgram,
      ascOptOut: MXL_COEFS.ascOptOut,
      betaCostPerThousandINR: MXL_COEFS.costPerThousand
    },
    outputs: {
      endorsementRate: results.endorse,
      optOutRate: results.optOut,
      wtpPerTraineePerMonthINR: results.wtpPerTraineePerMonth,
      wtpTotalPerCohortINR: results.wtpTotalPerCohort,
      wtpTotalAllCohortsINR: results.wtpTotalAllCohorts,
      wtpResponseTotalAllCohortsINR:
        results.wtpResponseTotalAllCohorts,
      programCostPerCohortBudgetINR:
        results.programCostPerCohortBudget,
      opportunityCostPerCohortINR: results.oppCostPerCohort,
      totalEconomicCostPerCohortINR:
        results.totalEconomicCostPerCohort,
      totalEconomicCostAllCohortsINR:
        results.totalEconomicCostAllCohorts,
      graduatesPerCohort: results.gradsPerCohort,
      graduatesAllCohorts: results.natGraduatesAllCohorts,
      outbreakResponsesPerCohortPerYear:
        results.outbreaksPerCohortPerYear,
      outbreakResponsesPerYearAllCohorts:
        results.natOutbreaksPerYearAllCohorts,
      epidemiologicalBenefitPerCohortINR:
        results.epiBenefitPerCohort,
      epidemiologicalBenefitAllCohortsINR:
        results.epiBenefitAllCohorts,
      netBenefitPerCohortINR: results.netBenefitPerCohort,
      benefitCostRatioPerCohort: results.bcrPerCohort,
      nationalNetBenefitINR: results.natNetBenefit,
      nationalBenefitCostRatio: results.natBcr
    },
    assumptions: {
      planningHorizonYears: results.horizonYears,
      includeOpportunityCost: state.includeOpportunityCost,
      currencyDisplay: state.currency,
      valuePerGraduateINR: getEpiTierSettings(cfg.tier).valuePerGraduate,
      valuePerOutbreakINR: getEpiTierSettings(cfg.tier).valuePerOutbreak,
      completionRate: state.epiSettings.general.completionRate,
      outbreaksPerGraduatePerYear:
        state.epiSettings.general.outbreaksPerGraduatePerYear,
      usdPerInr: state.epiSettings.general.inrPerUsd
    }
  };
}

function buildCopilotPromptText() {
  if (!state.lastResults) {
    return (
"Apply a configuration in STEPS and click \"Open in Copilot and copy prompt"
   return;
  }
   
 function updateCopilotPreparedText() {
  const textarea = document.getElementById(
    "copilot-prepared-text"
  );
  if (!textarea) return;

  if (!state.lastResults) {
    textarea.value =
      "Apply a configuration and update the results in STEPS to generate the full Copilot prompt and scenario JSON here. The prepared text will include the STEPS Copilot Interpretation Prompt followed by a JSON block that summarises your current scenario.";
    return;
  }

  const scenarioJson = buildCopilotScenarioJson(state.lastResults);
  const jsonText = JSON.stringify(scenarioJson, null, 2);

  const combined = [
    COPILOT_INTERPRETATION_PROMPT.trim(),
    "",
    "STEPS scenario JSON",
    "-------------------",
    jsonText
  ].join("\n");

  textarea.value = combined;
}

function setupCopilotCopyButton() {
  const btn = document.getElementById("copilot-copy-button");
  const textarea = document.getElementById(
    "copilot-prepared-text"
  );
  if (!btn || !textarea) return;

  btn.addEventListener("click", () => {
    if (!state.lastResults) {
      showToast(
        "Run an analysis first so the Copilot text can be prepared."
      );
      updateCopilotPreparedText();
    }

    const text = textarea.value || "";
    if (!text.trim()) {
      showToast(
        "There is no prepared text yet. Apply a configuration first."
      );
      return;
    }

    const copyPromise =
      navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(text)
        : new Promise((resolve, reject) => {
            textarea.select();
            const ok = document.execCommand("copy");
            if (ok) resolve();
            else reject();
          });

    copyPromise
      .then(() => {
        showToast("Prepared prompt copied. A new Copilot tab is opening.");
      })
      .catch(() => {
        showToast(
          "Could not copy automatically. Use the box below to copy the text manually."
        );
      })
      .finally(() => {
        window.open("https://copilot.microsoft.com/", "_blank", "noopener");
      });
  });
}

/* ===========================
   DCE sensitivity tables
   =========================== */

function buildSensitivityScenarioList() {
  const list = [];

  if (state.lastResults) {
    list.push({
      kind: "current",
      label:
        state.lastResults.config.scenarioName ||
        "Current configuration",
      config: state.lastResults.config,
      costSourceId: state.lastResults.costSourceId
    });
  }

  state.scenarios.forEach((sc, idx) => {
    list.push({
      kind: "saved",
      label: sc.name || "Saved scenario " + (idx + 1),
      config: sc.config,
      costSourceId: sc.costSourceId
    });
  });

  return list;
}

function refreshSensitivityTables(showToastFlag) {
  const benefitDefSelect = document.getElementById(
    "benefit-definition-select"
  );
  const benefitDefinition = benefitDefSelect
    ? benefitDefSelect.value
    : "wtp_only";
  const includeEpi = isSensitivityEpiIncluded();
  const dceTbody = document.getElementById(
    "dce-benefits-table-body"
  );
  const sensTbody = document.getElementById(
    "sensitivity-table-body"
  );

  if (!dceTbody || !sensTbody) return;

  while (dceTbody.firstChild) dceTbody.removeChild(dceTbody.firstChild);
  while (sensTbody.firstChild) sensTbody.removeChild(sensTbody.firstChild);

  const scenarios = buildSensitivityScenarioList();
  if (!scenarios.length) {
    if (showToastFlag) {
      showToast(
        "Apply a configuration or save scenarios before updating the sensitivity table."
      );
    }
    return;
  }

  scenarios.forEach(item => {
    const res = computeScenarioResults(
      item.config,
      item.costSourceId
    );
    const profile = computeDceCbaProfile(
      item.config,
      res.costs,
      res.epi,
      {
        benefitDefinition,
        includeEpi,
        useOverride: true
      }
    );
    const scenLabel = item.label;

    const trHead = document.createElement("tr");

    const costAll = profile.totalCostAllCohorts;
    const wtpAll = profile.wtpAllCohorts;
    const wtpRespAll = profile.wtpRespAllCohorts;
    const epiOutbreakAll = profile.epiOutbreakAllCohorts;
    const endorseUsedPct = profile.endorsementUsed * 100;
    const effectiveWtp = profile.effectiveWtpAll;
    const bcrDce = profile.bcrDce;
    const npvDce = profile.npvDce;
    const bcrCombined = profile.bcrCombined;
    const npvCombined = profile.npvCombined;

    const cellsHead = [
      scenLabel,
      formatCurrency(costAll || 0, state.currency),
      formatCurrency(wtpAll || 0, state.currency),
      formatCurrency(wtpRespAll || 0, state.currency),
      formatCurrency(epiOutbreakAll || 0, state.currency),
      endorseUsedPct.toFixed(1) + " %",
      effectiveWtp !== null
        ? formatCurrency(effectiveWtp, state.currency)
        : "-",
      bcrDce !== null && isFinite(bcrDce)
        ? bcrDce.toFixed(2)
        : "-",
      npvDce !== null
        ? formatCurrency(npvDce, state.currency)
        : "-",
      bcrCombined !== null && isFinite(bcrCombined)
        ? bcrCombined.toFixed(2)
        : "-",
      npvCombined !== null
        ? formatCurrency(npvCombined, state.currency)
        : "-"
    ];

    cellsHead.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      trHead.appendChild(td);
    });

    dceTbody.appendChild(trHead);

    const trDet = document.createElement("tr");
    const resModel = "MXL overall";

    const detCells = [
      scenLabel,
      resModel,
      formatPercent(res.util.endorseProb || 0, 1),
      formatCurrency(
        res.costs.totalEconomicCostPerCohort || 0,
        state.currency
      ),
      formatCurrency(
        profile.wtpAllCohorts || 0,
        state.currency
      ),
      formatCurrency(
        profile.wtpRespAllCohorts || 0,
        state.currency
      ),
      formatCurrency(
        profile.epiOutbreakAllCohorts || 0,
        state.currency
      ),
      bcrDce !== null && isFinite(bcrDce)
        ? bcrDce.toFixed(2)
        : "-",
      npvDce !== null
        ? formatCurrency(npvDce, state.currency)
        : "-",
      bcrCombined !== null && isFinite(bcrCombined)
        ? bcrCombined.toFixed(2)
        : "-",
      npvCombined !== null
        ? formatCurrency(npvCombined, state.currency)
        : "-",
      profile.effectiveWtpAll !== null
        ? formatCurrency(
            profile.effectiveWtpAll,
            state.currency
          )
        : "-",
      profile.effectiveCombinedAll !== null
        ? formatCurrency(
            profile.effectiveCombinedAll,
            state.currency
          )
        : "-"
    ];

    detCells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      trDet.appendChild(td);
    });

    sensTbody.appendChild(trDet);
  });

  if (showToastFlag) {
    showToast("Sensitivity summary updated.");
  }
}

/* ===========================
   Sensitivity exports
   =========================== */

function exportSensitivityToExcel() {
  if (typeof XLSX === "undefined") {
    showToast("Excel export library not available.");
    return;
  }

  const benefitDefSelect = document.getElementById(
    "benefit-definition-select"
  );
  const benefitDefinition = benefitDefSelect
    ? benefitDefSelect.value
    : "wtp_only";
  const includeEpi = isSensitivityEpiIncluded();

  const scenarios = buildSensitivityScenarioList();
  if (!scenarios.length) {
    showToast("No scenarios available for export.");
    return;
  }

  const rows = [];

  scenarios.forEach(item => {
    const res = computeScenarioResults(
      item.config,
      item.costSourceId
    );
    const profile = computeDceCbaProfile(
      item.config,
      res.costs,
      res.epi,
      {
        benefitDefinition,
        includeEpi,
        useOverride: true
      }
    );
    rows.push({
      Scenario: item.label,
      Model: "MXL overall",
      "Endorsement rate used": profile.endorsementUsed,
      "Cost all cohorts (INR)": profile.totalCostAllCohorts,
      "Total WTP benefit (INR)": profile.wtpAllCohorts,
      "WTP from response capacity (INR)":
        profile.wtpRespAllCohorts,
      "Epi based outbreak benefit (INR)":
        profile.epiOutbreakAllCohorts,
      "Effective WTP benefit (INR)":
        profile.effectiveWtpAll,
      "Effective combined benefit (INR)":
        profile.effectiveCombinedAll,
      "BCR DCE": profile.bcrDce,
      "NPV DCE (INR)": profile.npvDce,
      "BCR DCE plus epi": profile.bcrCombined,
      "NPV DCE plus epi (INR)": profile.npvCombined
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Sensitivity");
  XLSX.writeFile(wb, "STEPS_sensitivity_table.xlsx");
  showToast("Sensitivity table exported to Excel.");
}

function exportSensitivityToPdf() {
  const jspdf = window.jspdf;
  if (!jspdf || !jspdf.jsPDF) {
    showToast("PDF export library not available.");
    return;
  }
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const benefitDefSelect = document.getElementById(
    "benefit-definition-select"
  );
  const benefitDefinition = benefitDefSelect
    ? benefitDefSelect.value
    : "wtp_only";
  const includeEpi = isSensitivityEpiIncluded();

  const scenarios = buildSensitivityScenarioList();
  if (!scenarios.length) {
    showToast("No scenarios available for export.");
    return;
  }

  doc.setFontSize(14);
  doc.text(
    "STEPS FETP India Decision Aid - Sensitivity table",
    40,
    40
  );
  doc.setFontSize(9);
  doc.text(
    "Benefit definition view: " +
      benefitDefinition +
      ", outbreak benefits included: " +
      (includeEpi ? "yes" : "no") +
      ".",
    40,
    60
  );

  let y = 80;

  scenarios.forEach((item, idx) => {
    const res = computeScenarioResults(
      item.config,
      item.costSourceId
    );
    const profile = computeDceCbaProfile(
      item.config,
      res.costs,
      res.epi,
      {
        benefitDefinition,
        includeEpi,
        useOverride: true
      }
    );

    if (y > 760) {
      doc.addPage();
      y = 50;
    }

    doc.setFontSize(11);
    doc.text((idx + 1) + ". " + item.label, 40, y);
    y += 14;

    doc.setFontSize(9);
    doc.text(
      "Endorsement used: " +
        (profile.endorsementUsed * 100).toFixed(1) +
        " %, cost (all cohorts): " +
        formatCurrencyInr(profile.totalCostAllCohorts || 0, 0) +
        ".",
      40,
      y
    );
    y += 11;

    doc.text(
      "Total WTP: " +
        formatCurrencyInr(profile.wtpAllCohorts || 0, 0) +
        ", WTP from response: " +
        formatCurrencyInr(profile.wtpRespAllCohorts || 0, 0) +
        ", epi outbreak benefit: " +
        formatCurrencyInr(profile.epiOutbreakAllCohorts || 0, 0) +
        ".",
      40,
      y
    );
    y += 11;

    doc.text(
      "BCR (DCE): " +
        (profile.bcrDce !== null && isFinite(profile.bcrDce)
          ? profile.bcrDce.toFixed(2)
          : "-") +
        ", NPV (DCE): " +
        (profile.npvDce !== null
          ? formatCurrencyInr(profile.npvDce, 0)
          : "-") +
        ".",
      40,
      y
    );
    y += 11;

    doc.text(
      "BCR (DCE plus epi): " +
        (profile.bcrCombined !== null &&
        isFinite(profile.bcrCombined)
          ? profile.bcrCombined.toFixed(2)
          : "-") +
        ", NPV (DCE plus epi): " +
        (profile.npvCombined !== null
          ? formatCurrencyInr(profile.npvCombined, 0)
          : "-") +
        ".",
      40,
      y
    );
    y += 16;
  });

  doc.save("STEPS_sensitivity_table.pdf");
  showToast("Sensitivity table exported to PDF.");
}

/* ===========================
   Scenario table and exports
   =========================== */

function renderScenarioTable() {
  const tbody = document.querySelector(
    "#scenario-table tbody"
  );
  if (!tbody) return;

  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  state.scenarios.forEach((sc, idx) => {
    const tr = document.createElement("tr");

    const tdShort = document.createElement("td");
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!sc.shortlisted;
    chk.addEventListener("change", () => {
      sc.shortlisted = chk.checked;
    });
    tdShort.appendChild(chk);
    tr.appendChild(tdShort);

    const cells = [
      sc.name || "Scenario " + (idx + 1),
      sc.tags || "",
      sc.config.tier,
      sc.config.career,
      sc.config.mentorship,
      sc.config.delivery,
      sc.config.response,
      sc.config.numberOfCohorts,
      sc.config.traineesPerCohort,
      formatCurrency(
        sc.config.costPerTraineePerMonth,
        state.currency
      ),
      sc.modelLabel || "MXL overall",
      formatPercent(sc.endorsementRate || 0, 1),
      sc.wtpPerTraineePerMonth !== null &&
      typeof sc.wtpPerTraineePerMonth === "number"
        ? formatCurrencyInr(
            sc.wtpPerTraineePerMonth,
            0
          )
        : "-",
      sc.totalWtpAllCohorts !== null
        ? formatCurrency(
            sc.totalWtpAllCohorts,
            state.currency
          )
        : "-",
      sc.bcr !== null && isFinite(sc.bcr)
        ? sc.bcr.toFixed(2)
        : "-",
      formatCurrency(
        sc.totalCostAllCohorts || 0,
        state.currency
      ),
      formatCurrency(
        sc.totalEpiBenefitAllCohorts || 0,
        state.currency
      ),
      formatCurrency(
        sc.netEpiBenefitAllCohorts || 0,
        state.currency
      ),
      formatNumber(
        sc.outbreakResponsesPerYear || 0,
        1
      ),
      sc.notes || ""
    ];

    cells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

function saveCurrentScenario() {
  if (!state.lastResults) {
    showToast("Apply a configuration before saving a scenario.");
    return;
  }

  const res = state.lastResults;
  const cfg = res.config;

  const scenario = {
    id: Date.now(),
    name:
      cfg.scenarioName ||
      "Scenario " + (state.scenarios.length + 1),
    tags: "",
    config: { ...cfg },
    modelLabel: "MXL overall",
    endorsementRate: res.util.endorseProb || 0,
    wtpPerTraineePerMonth: res.wtpPerTraineePerMonth,
    totalWtpAllCohorts: res.wtpAllCohorts,
    bcr: res.natBcr,
    totalCostAllCohorts: res.totalCostAllCohorts,
    totalEpiBenefitAllCohorts:
      res.epi.totalBenefitAllCohorts,
    netEpiBenefitAllCohorts: res.natNetBenefit,
    outbreakResponsesPerYear:
      res.epi.outbreaksPerYearAllCohorts,
    notes: cfg.scenarioNotes || "",
    costSourceId: res.costSourceId || null,
    shortlisted: false
  };

  state.scenarios.push(scenario);
  renderScenarioTable();
  refreshSensitivityTables(false);
  showToast("Scenario saved.");
}

function exportScenariosToExcel() {
  if (typeof XLSX === "undefined") {
    showToast("Excel export library not available.");
    return;
  }

  if (!state.scenarios.length && !state.lastResults) {
    showToast("No scenarios available for export.");
    return;
  }

  const rows = [];

  state.scenarios.forEach(sc => {
    rows.push({
      Shortlisted: sc.shortlisted ? "Yes" : "No",
      Name: sc.name,
      Tier: sc.config.tier,
      Career: sc.config.career,
      Mentorship: sc.config.mentorship,
      Delivery: sc.config.delivery,
      Response_days: sc.config.response,
      Cohorts: sc.config.numberOfCohorts,
      Trainees_per_cohort: sc.config.traineesPerCohort,
      Cost_per_trainee_per_month_inr:
        sc.config.costPerTraineePerMonth,
      Model: sc.modelLabel,
      Endorsement_rate: sc.endorsementRate,
      WTP_per_trainee_per_month_inr:
        sc.wtpPerTraineePerMonth,
      Total_WTP_all_cohorts_inr: sc.totalWtpAllCohorts,
      BCR: sc.bcr,
      Total_economic_cost_all_cohorts_inr:
        sc.totalCostAllCohorts,
      Total_epi_benefit_all_cohorts_inr:
        sc.totalEpiBenefitAllCohorts,
      Net_epi_benefit_all_cohorts_inr:
        sc.netEpiBenefitAllCohorts,
      Outbreak_responses_per_year:
        sc.outbreakResponsesPerYear,
      Notes: sc.notes
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Scenarios");
  XLSX.writeFile(wb, "STEPS_saved_scenarios.xlsx");
  showToast("Saved scenarios exported to Excel.");
}

function exportScenariosToPdf() {
  const jspdf = window.jspdf;
  if (!jspdf || !jspdf.jsPDF) {
    showToast("PDF export library not available.");
    return;
  }
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  if (!state.scenarios.length && !state.lastResults) {
    showToast("No scenarios available for export.");
    return;
  }

  doc.setFontSize(14);
  doc.text(
    "STEPS FETP India Decision Aid - Saved scenarios",
    40,
    40
  );
  let y = 60;

  state.scenarios.forEach((sc, idx) => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }

    doc.setFontSize(11);
    doc.text((idx + 1) + ". " + sc.name, 40, y);
    y += 14;

    doc.setFontSize(9);
    doc.text(
      "Tier: " +
        sc.config.tier +
        ", mentorship: " +
        sc.config.mentorship +
        ", delivery: " +
        sc.config.delivery +
        ", response: " +
        sc.config.response +
        " days.",
      40,
      y
    );
    y += 11;

    doc.text(
      "Cohorts: " +
        sc.config.numberOfCohorts +
        ", trainees per cohort: " +
        sc.config.traineesPerCohort +
        ", cost per trainee per month: " +
        formatCurrencyInr(
          sc.config.costPerTraineePerMonth,
          0
        ) +
        ".",
      40,
      y
    );
    y += 11;

    doc.text(
      "Endorsement rate: " +
        formatPercent(sc.endorsementRate || 0, 1) +
        ", total cost: " +
        formatCurrencyInr(
          sc.totalCostAllCohorts || 0,
          0
        ) +
        ", total epidemiological benefit: " +
        formatCurrencyInr(
          sc.totalEpiBenefitAllCohorts || 0,
          0
        ) +
        ".",
      40,
      y
    );
    y += 11;

    doc.text(
      "Net epidemiological benefit: " +
        formatCurrencyInr(
          sc.netEpiBenefitAllCohorts || 0,
          0
        ) +
        ", benefit cost ratio: " +
        (sc.bcr !== null && isFinite(sc.bcr)
          ? sc.bcr.toFixed(2)
          : "-") +
        ".",
      40,
      y
    );
    y += 11;

    if (sc.notes) {
      doc.text("Notes: " + sc.notes, 40, y);
      y += 11;
    }

    y += 8;
  });

  doc.save("STEPS_saved_scenarios.pdf");
  showToast("Saved scenarios exported to PDF.");
}

/* ===========================
   Save and load project JSON
   =========================== */

function buildProjectObject() {
  return {
    version: "1.0",
    currency: state.currency,
    includeOpportunityCost: state.includeOpportunityCost,
    epiSettings: state.epiSettings,
    scenarios: state.scenarios,
    lastConfig: state.lastResults ? state.lastResults.config : null,
    lastCostSourceId: state.currentCostSourceId
  };
}

function saveProjectJson() {
  const dataStr = JSON.stringify(buildProjectObject(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "STEPS_project.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Project JSON saved.");
}

function applyConfigToInputs(cfg) {
  if (!cfg) return;
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.value = value;
    }
  };

  setVal("program-tier", cfg.tier);
  setVal("career-track", cfg.career);
  setVal("mentorship", cfg.mentorship);
  setVal("delivery", cfg.delivery);
  setVal("response", cfg.response);
  setVal("cost-slider", cfg.costPerTraineePerMonth);
  setVal("trainees", cfg.traineesPerCohort);
  setVal("cohorts", cfg.numberOfCohorts);
  setVal("scenario-name", cfg.scenarioName || "");
  setVal("scenario-notes", cfg.scenarioNotes || "");
}

function loadProjectObject(obj) {
  if (!obj || typeof obj !== "object") {
    showToast("Invalid project file.");
    return;
  }

  if (obj.epiSettings) {
    state.epiSettings = obj.epiSettings;
  } else {
    state.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
  }

  state.currency = obj.currency || "INR";
  state.includeOpportunityCost =
    typeof obj.includeOpportunityCost === "boolean"
      ? obj.includeOpportunityCost
      : true;

  state.scenarios = Array.isArray(obj.scenarios)
    ? obj.scenarios
    : [];

  state.currentCostSourceId = obj.lastCostSourceId || null;

  renderScenarioTable();
  populateAdvancedSettingsForm();

  if (obj.lastConfig) {
    applyConfigToInputs(obj.lastConfig);
    applyConfiguration(false);
  }

  showToast("Project JSON loaded.");
}

function setupProjectSaveLoad() {
  const saveBtnIds = ["saveProject", "btn-save-project"];
  const loadBtnIds = ["loadProject", "btn-load-project"];
  const fileInputIds = ["loadFile", "project-file-input"];

  let saveBtn = null;
  let loadBtn = null;
  let fileInput = null;

  saveBtnIds.forEach(id => {
    if (!saveBtn) {
      const el = document.getElementById(id);
      if (el) saveBtn = el;
    }
  });
  loadBtnIds.forEach(id => {
    if (!loadBtn) {
      const el = document.getElementById(id);
      if (el) loadBtn = el;
    }
  });
  fileInputIds.forEach(id => {
    if (!fileInput) {
      const el = document.getElementById(id);
      if (el) fileInput = el;
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", saveProjectJson);
  }

  if (loadBtn && fileInput) {
    loadBtn.addEventListener("click", () => {
      fileInput.value = "";
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const obj = JSON.parse(evt.target.result);
          loadProjectObject(obj);
        } catch (e) {
          showToast("Could not read project JSON.");
        }
      };
      reader.readAsText(file);
    });
  }
}

/* ===========================
   Main apply configuration
   =========================== */

function updateHeadlineUi(results) {
  const cfgSummaryEl = document.getElementById("config-summary-text");
  const headTagEl = document.getElementById("headline-tag");
  const headTextEl = document.getElementById("headline-text");
  const headBriefEl = document.getElementById("headline-briefing-text");
  const natSummaryEl = document.getElementById("national-summary-text");

  if (cfgSummaryEl) {
    cfgSummaryEl.textContent = buildConfigSummaryText(
      results.config,
      results.costs
    );
  }

  const head = classifyHeadline(results);
  if (headTagEl) {
    headTagEl.textContent = head.tagText;
    headTagEl.classList.remove(
      "headline-status-good",
      "headline-status-watch",
      "headline-status-poor",
      "headline-status-neutral"
    );
    const cls =
      head.status === "good"
        ? "headline-status-good"
        : head.status === "watch"
        ? "headline-status-watch"
        : head.status === "poor"
        ? "headline-status-poor"
        : "headline-status-neutral";
    headTagEl.classList.add(cls);
  }
  if (headTextEl) {
    headTextEl.textContent = head.text;
  }
  if (headBriefEl) {
    headBriefEl.textContent = buildHeadlineBriefing(results);
  }
  if (natSummaryEl) {
    natSummaryEl.textContent = buildNationalSummaryText(results);
  }
}

function applyConfiguration(switchToResultsTab) {
  const cfg = readConfigurationFromInputs();

  if (
    cfg.traineesPerCohort <= 0 ||
    cfg.numberOfCohorts <= 0 ||
    cfg.costPerTraineePerMonth <= 0
  ) {
    showToast(
      "Please set trainees, cohorts and cost per trainee per month to values above zero."
    );
  }

  state.currentTier = cfg.tier;

  populateCostSourceOptions(cfg.tier);

  const results = computeScenarioResults(cfg);
  state.lastResults = results;

  updateCostBreakdown(results);
  updateUptakeChart(results);
  updateBcrChart(results);
  updateEpiChart(results);
  updateNationalCharts(results);
  updateAssumptionLog(results);
  updateHeadlineUi(results);
  updateCopilotPreparedText();
  refreshSensitivityTables(false);

  if (switchToResultsTab) {
    setActiveTab("results");
  }

  showToast("Configuration applied and results updated.");
}

/* ===========================
   Initialisation
   =========================== */

function setupTabs() {
  const tabs = document.querySelectorAll(".tab-link");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) {
        setActiveTab(tabId);
      }
    });
  });
}

function setupCoreButtons() {
  const applyIds = ["apply-config", "apply-configuration", "btn-apply-config"];
  const viewResultsIds = ["view-results-summary", "btn-view-results"];
  const saveScenarioIds = ["save-scenario", "btn-save-scenario"];
  const exportScenExcelIds = ["export-scenarios-excel"];
  const exportScenPdfIds = ["export-scenarios-pdf"];
  const exportSensExcelIds = ["export-sensitivity-excel"];
  const exportSensPdfIds = ["export-sensitivity-pdf"];
  const updateSensIds = ["update-sensitivity", "btn-update-sensitivity"];

  const attachClick = (ids, handler) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("click", handler);
      }
    });
  };

  attachClick(applyIds, () => applyConfiguration(true));
  attachClick(viewResultsIds, () => setActiveTab("results"));
  attachClick(saveScenarioIds, saveCurrentScenario);
  attachClick(exportScenExcelIds, exportScenariosToExcel);
  attachClick(exportScenPdfIds, exportScenariosToPdf);
  attachClick(exportSensExcelIds, exportSensitivityToExcel);
  attachClick(exportSensPdfIds, exportSensitivityToPdf);
  attachClick(updateSensIds, () => refreshSensitivityTables(true));
}

function setupCurrencyAndOppToggles() {
  const currencySelect =
    document.getElementById("currency-select") ||
    document.getElementById("currency");
  if (currencySelect) {
    currencySelect.addEventListener("change", () => {
      const val = currencySelect.value === "USD" ? "USD" : "INR";
      state.currency = val;
      if (state.lastResults) {
        applyConfiguration(false);
      }
    });
  }

  const oppToggleIds = ["opp-cost-toggle", "toggle-opportunity-cost"];
  oppToggleIds.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.classList.toggle("on");
      state.includeOpportunityCost = btn.classList.contains("on");
      if (state.lastResults) {
        applyConfiguration(false);
      }
    });
  });
}

function setupAdvancedButtons() {
  const advApplyIds = ["advanced-apply", "btn-advanced-apply"];
  const advResetIds = ["advanced-reset", "btn-advanced-reset"];

  advApplyIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", applyAdvancedSettings);
    }
  });

  advResetIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", resetAdvancedSettings);
    }
  });
}

function loadCostConfigJson() {
  if (typeof fetch === "undefined") return;

  fetch("cost_config.json")
    .then(resp => resp.ok ? resp.json() : null)
    .then(data => {
      if (data) {
        COST_CONFIG = data;
        populateCostSourceOptions(state.currentTier);
        if (state.lastResults) {
          applyConfiguration(false);
        }
      }
    })
    .catch(() => {
      // Fallback to hard coded templates
    });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveTab("configuration");
  populateCostSourceOptions(state.currentTier);
  populateAdvancedSettingsForm();
  setupTabs();
  setupCoreButtons();
  setupCurrencyAndOppToggles();
  setupAdvancedButtons();
  setupCopilotCopyButton();
  setupProjectSaveLoad();
  loadCostConfigJson();
  updateCopilotPreparedText();
});
