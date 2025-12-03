 /* ===================================================
   STEPS FETP India Decision Aid
   Script with interactive DCE sensitivity tab
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

const LC2_COEFS = {
    ascProgram: 0.098,
    ascOptOut: -2.543,
    tier: {
        frontline: 0.0,
        intermediate: 0.087,
        advanced: 0.422
    },
    career: {
        certificate: 0.0,
        uniqual: -0.024,
        career_path: -0.123
    },
    mentorship: {
        low: 0.0,
        medium: 0.342,
        high: 0.486
    },
    delivery: {
        blended: 0.0,
        inperson: -0.017,
        online: -0.700
    },
    response: {
        30: 0.0,
        15: 0.317,
        7: 0.504
    },
    costPerThousand: -0.001
};

/* Conservative / resister class.
   We will use these coefficients for endorsement only.
   We deliberately do not construct WTP-based CBA metrics
   for this class because the cost coefficient is very small
   and statistically weak (cost-insensitive group). */
const LC1_COEFS = {
    ascProgram: 0.181,
    ascOptOut: 1.222,
    tier: {
        frontline: 0.0,
        intermediate: 0.070,
        advanced: 0.045
    },
    career: {
        certificate: 0.0,
        uniqual: 0.098,
        career_path: -0.027
    },
    mentorship: {
        low: 0.0,
        medium: 0.327,
        high: 0.636
    },
    delivery: {
        blended: 0.0,
        inperson: -0.476,
        online: -0.798
    },
    response: {
        30: 0.0,
        15: 0.640,
        7: 0.513
    },
    costPerThousand: 0.0001
};

/* ===========================
   Cost templates (fallback)
   =========================== */

const COST_TEMPLATES = {
    frontline: {
        who: {
            id: "who",
            label: "Frontline - WHO template (6 cohorts)",
            description: "WHO costing template for Frontline FETP with six cohorts. Includes staff, travel, supervision and management costs.",
            oppRate: 0.15,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.40 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.20 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.15 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.15 },
                { id: "overheads", label: "Management and overheads", directShare: 0.10 }
            ]
        }
    },
    intermediate: {
        who: {
            id: "who",
            label: "Intermediate - WHO template",
            description: "WHO costing template for Intermediate FETP. Reflects a mix of direct training and supervision costs.",
            oppRate: 0.20,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.38 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.18 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.14 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.18 },
                { id: "overheads", label: "Management and overheads", directShare: 0.12 }
            ]
        },
        nie: {
            id: "nie",
            label: "Intermediate - NIE template",
            description: "NIE budget template for Intermediate FETP. Slightly higher supervision share.",
            oppRate: 0.22,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.36 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.18 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.12 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.22 },
                { id: "overheads", label: "Management and overheads", directShare: 0.12 }
            ]
        },
        ncdc: {
            id: "ncdc",
            label: "Intermediate - NCDC template",
            description: "NCDC costing assumptions for Intermediate FETP. Higher management share.",
            oppRate: 0.18,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.35 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.17 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.13 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.20 },
                { id: "overheads", label: "Management and overheads", directShare: 0.15 }
            ]
        }
    },
    advanced: {
        nie: {
            id: "nie",
            label: "Advanced - NIE template",
            description: "NIE budget template for Advanced FETP. Reflects intensive staff time and supervision.",
            oppRate: 0.25,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.45 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.18 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.10 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.17 },
                { id: "overheads", label: "Management and overheads", directShare: 0.10 }
            ]
        },
        ncdc: {
            id: "ncdc",
            label: "Advanced - NCDC template",
            description: "NCDC costing assumptions for Advanced FETP. Slightly higher overhead share.",
            oppRate: 0.23,
            components: [
                { id: "staff", label: "Staff and tutors", directShare: 0.42 },
                { id: "travel", label: "Trainee travel and field work", directShare: 0.19 },
                { id: "materials", label: "Training materials and supplies", directShare: 0.11 },
                { id: "supervision", label: "Supervision and mentoring costs", directShare: 0.16 },
                { id: "overheads", label: "Management and overheads", directShare: 0.12 }
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
            gradShare: 0.90,
            outbreaksPerCohortPerYear: 0.30,
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
            outbreaksPerCohortPerYear: 0.80,
            valuePerGraduate: 1200000,
            valuePerOutbreak: 40000000
        }
    }
};

/* Response time multipliers m_30, m_15, m_7 used to
   scale outbreak benefits by timeliness of response. */
const RESPONSE_TIME_MULTIPLIERS = {
    "30": 1.0,
    "15": 1.2,
    "7": 1.5
};

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
    dceScenario: null, // scenario-level object for the DCE benefits tab
    scenarios: [],
    charts: {
        uptake: null,
        bcr: null,
        epi: null,
        natCostBenefit: null,
        natGradOutbreak: null,
        natBcr: null
    },
    tour: {
        seen: false,
        active: false,
        stepIndex: 0
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
    if (valueInInr === null || valueInInr === undefined || isNaN(valueInInr)) return "-";
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

/* For the DCE sensitivity tab we sometimes want to
   display large amounts in millions of INR with 2 d.p. */
function formatCurrencyInrMillions(valueInInr, decimals = 2) {
    if (valueInInr === null || valueInInr === undefined || isNaN(valueInInr)) return "-";
    const millions = valueInInr / 1000000;
    return `INR ${millions.toLocaleString("en-IN", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
    })} M`;
}

function logistic(x) {
    if (x > 50) return 1;
    if (x < -50) return 0;
    return 1 / (1 + Math.exp(-x));
}

/* ===========================
   Preference utilities and WTP
   =========================== */

/* Return utility from all non-cost attributes for a given configuration. */
function computeNonCostUtility(cfg, coefs) {
    const uTier = coefs.tier[cfg.tier] || 0;
    const uCareer = coefs.career[cfg.career] || 0;
    const uMentor = coefs.mentorship[cfg.mentorship] || 0;
    const uDelivery = coefs.delivery[cfg.delivery] || 0;
    const uResponse = coefs.response[cfg.response] || 0;
    return uTier + uCareer + uMentor + uDelivery + uResponse;
}

/*
   Compute WTP components for each active attribute level.

   Internally this uses the ratio of each attribute coefficient
   to the cost coefficient (per 1,000 INR per month) and then
   scales to INR per trainee per month. It returns:

   - totalPerTraineePerMonth: sum of WTP across tier, career,
     mentorship, delivery and response attributes, in INR.
   - components: same breakdown by attribute group.

   This is purely internal; no formulas are displayed in the UI.
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

    // Each component is converted to INR per trainee per month.
    const tierWtp = -1000 * betaTier / betaCost;
    const careerWtp = -1000 * betaCareer / betaCost;
    const mentorshipWtp = -1000 * betaMentor / betaCost;
    const deliveryWtp = -1000 * betaDelivery / betaCost;
    const responseWtp = -1000 * betaResponse / betaCost;

    const total = tierWtp + careerWtp + mentorshipWtp + deliveryWtp + responseWtp;

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

function getModelCoefs(modelId) {
    if (modelId === "lc2") return LC2_COEFS;
    if (modelId === "lc1") return LC1_COEFS;
    return MXL_COEFS;
}

/*
   Compute endorsement and, where appropriate, WTP for a given model.

   - cfg: configuration
   - modelId: "mxl", "lc2" or "lc1"
   - options.suppressWtp: when true, endorsement is still computed
     but WTP-related outputs are omitted (used for the conservative class).
*/
function computeEndorsementAndWtp(cfg, modelId, options = {}) {
    const { suppressWtp = false } = options;

    const coefs = getModelCoefs(modelId);
    const designUtility = computeNonCostUtility(cfg, coefs);

    const uAsc = typeof coefs.ascProgram === "number" ? coefs.ascProgram : 1;
    const nonCostUtilityWithAsc = uAsc + designUtility;

    const costThousands = cfg.costPerTraineePerMonth / 1000;
    const costUtil = (coefs.costPerThousand || 0) * costThousands;

    const ascOptOut = coefs.ascOptOut || 0;
    const deltaV = -ascOptOut + nonCostUtilityWithAsc + costUtil;

    const endorseProb = logistic(deltaV);
    const optOutProb = 1 - endorseProb;

    const betaCost = coefs.costPerThousand || 0;
    let wtpConfig = null;
    let wtpComponents = null;
    if (!suppressWtp && betaCost !== 0) {
        const wtp = computeWtpComponents(cfg, coefs);
        wtpConfig = wtp.totalPerTraineePerMonth;
        wtpComponents = wtp.components;
    }

    return {
        designUtility,
        nonCostUtilityWithAsc,
        costUtil,
        deltaV,
        endorseProb,
        optOutProb,
        wtpConfig,
        wtpComponents
    };
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
   Cost calculations
   =========================== */

function getProgrammeDurationMonths(tier) {
    if (tier === "intermediate") return 12;
    if (tier === "advanced") return 24;
    return 3;
}

function getCurrentCostTemplate(tier) {
    let chosenId = state.currentCostSourceId || null;

    if (COST_CONFIG && COST_CONFIG[tier]) {
        const tierConfig = COST_CONFIG[tier];
        const ids = Object.keys(tierConfig);
        if (ids.length) {
            if (!chosenId || !tierConfig[chosenId]) {
                chosenId = ids[0];
                state.currentCostSourceId = chosenId;
            }
            const src = tierConfig[chosenId];

            const allComponents = src.components || [];
            const nonOpp = allComponents.filter(c => !c.isOpportunityCost);
            const opp = allComponents.filter(c => c.isOpportunityCost);

            const totalNonOpp = nonOpp.reduce((sum, c) => sum + (c.amountTotal || 0), 0);
            const totalOpp = opp.reduce((sum, c) => sum + (c.amountTotal || 0), 0);
            const oppRate = totalNonOpp > 0 ? totalOpp / totalNonOpp : 0;

            const components = nonOpp.map((c, idx) => {
                const share = totalNonOpp > 0 ? (c.amountTotal || 0) / totalNonOpp : 0;
                const labelParts = [];
                if (c.major) labelParts.push(c.major);
                if (c.category) labelParts.push(c.category);
                if (c.subCategory) labelParts.push(c.subCategory);
                const labelBase = labelParts.length ? labelParts.join(" / ") : `Cost component ${idx + 1}`;
                const label = c.label || labelBase;
                return {
                    id: c.id || `comp_${idx}`,
                    label,
                    directShare: share,
                    major: c.major || "",
                    category: c.category || "",
                    subCategory: c.subCategory || "",
                    description: c.description || ""
                };
            });

            return {
                id: src.id || chosenId,
                label: src.label || chosenId,
                description: src.description || "",
                oppRate,
                components
            };
        }
    }

    const templatesForTier = COST_TEMPLATES[tier] || {};
    const availableIds = Object.keys(templatesForTier);
    if (!availableIds.length) return null;

    if (!chosenId || !templatesForTier[chosenId]) {
        chosenId = availableIds[0];
        state.currentCostSourceId = chosenId;
    }
    return templatesForTier[chosenId];
}

function computeCosts(cfg) {
    const durationMonths = getProgrammeDurationMonths(cfg.tier);
    const programmeCostPerCohort = cfg.costPerTraineePerMonth * cfg.traineesPerCohort * durationMonths;

    const template = getCurrentCostTemplate(cfg.tier);
    if (!template) {
        const opportunityCostPerCohort = 0;
        const totalEconomicCostPerCohort = programmeCostPerCohort;
        return {
            durationMonths,
            programmeCostPerCohort,
            // keep both spellings for backward compatibility
            opportunityCostPerCort: opportunityCostPerCohort,
            opportunityCostPerCohort,
            totalEconomicCostPerCohort,
            components: []
        };
    }

    const oppRate = template.oppRate || 0;
    const directCostPerCohort = programmeCostPerCohort;
    const opportunityCostPerCohort = state.includeOpportunityCost ? directCostPerCohort * oppRate : 0;
    const totalEconomicCostPerCohort = directCostPerCohort + opportunityCostPerCohort;

    const components = (template.components || []).map(comp => {
        const compAmountPerCohort = directCostPerCohort * (comp.directShare || 0);
        const amountPerTraineePerMonth = durationMonths > 0 && cfg.traineesPerCohort > 0
            ? compAmountPerCohort / (durationMonths * cfg.traineesPerCohort)
            : 0;
        return {
            id: comp.id,
            label: comp.label,
            share: comp.directShare || 0,
            amountPerCohort: compAmountPerCohort,
            amountPerTraineePerMonth,
            major: comp.major || "",
            category: comp.category || "",
            subCategory: comp.subCategory || "",
            description: comp.description || ""
        };
    });

    return {
        durationMonths,
        programmeCostPerCohort: directCostPerCohort,
        opportunityCostPerCohort,
        totalEconomicCostPerCohort,
        components
    };
}

/* ===========================
   Epidemiological calculations
   =========================== */

function getResponseTimeMultiplier(responseValue) {
    const key = String(responseValue);
    if (Object.prototype.hasOwnProperty.call(RESPONSE_TIME_MULTIPLIERS, key)) {
        return RESPONSE_TIME_MULTIPLIERS[key];
    }
    return 1.0;
}

/*
   Epidemiological benefit calculation.

   Outbreak benefits are scaled by:
   - number of outbreaks supported,
   - planning horizon,
   - indicative value per outbreak,
   - and the response-time multiplier m_30 / m_15 / m_7.
*/
function computeEpi(cfg, endorseProb) {
    const tierConfig = state.epiSettings.tiers[cfg.tier];
    if (!tierConfig) {
        return {
            graduatesAllCohorts: 0,
            outbreaksPerYearAllCohorts: 0,
            benefitGraduatesAllCohorts: 0,
            benefitOutbreaksAllCohorts: 0,
            totalBenefitAllCohorts: 0,
            benefitPerCohort: 0
        };
    }

    const horizon = state.epiSettings.general.planningHorizonYears || 5;
    const gradShare = tierConfig.gradShare || 0;
    const outbreaksPerCohortYear = tierConfig.outbreaksPerCohortPerYear || 0;
    const valuePerGrad = tierConfig.valuePerGraduate || 0;
    const valuePerOutbreak = tierConfig.valuePerOutbreak || 0;

    const totalTrainees = cfg.traineesPerCohort * cfg.numberOfCohorts;

    const graduatesAllCohorts = totalTrainees * gradShare * endorseProb;
    const outbreaksPerYearAllCohorts = cfg.numberOfCohorts * outbreaksPerCohortYear * endorseProb;

    const responseMultiplier = getResponseTimeMultiplier(cfg.response);

    const benefitGraduatesAllCohorts = graduatesAllCohorts * valuePerGrad;
    const benefitOutbreaksAllCohortsBase = outbreaksPerYearAllCohorts * horizon * valuePerOutbreak;
    const benefitOutbreaksAllCohorts = benefitOutbreaksAllCohortsBase * responseMultiplier;

    const totalBenefitAllCohorts = benefitGraduatesAllCohorts + benefitOutbreaksAllCohorts;

    const benefitPerCohort = cfg.numberOfCohorts > 0
        ? totalBenefitAllCohorts / cfg.numberOfCohorts
        : 0;

    return {
        graduatesAllCohorts,
        outbreaksPerYearAllCohorts,
        benefitGraduatesAllCohorts,
        benefitOutbreaksAllCohorts,
        totalBenefitAllCohorts,
        benefitPerCohort
    };
}

/* ===========================
   DCE benefits & sensitivity
   =========================== */

/*
   Endorsement override for sensitivity tab.

   - If user enters 70 treat as 70%
   - If user enters 0.7 treat as 70%
   - If left empty, fall back to model-based endorsement.
*/
function getEndorsementRateForSensitivity(defaultRate) {
    let rate = defaultRate;
    const input =
        document.getElementById("sens-endorsement-rate") ||
        document.getElementById("dce-endorsement-rate");
    if (input) {
        const raw = parseFloat(input.value);
        if (!isNaN(raw) && raw > 0) {
            rate = raw > 1.5 ? raw / 100 : raw;
        }
    }
    if (!isFinite(rate) || isNaN(rate)) rate = 0;
    if (rate < 0) rate = 0;
    if (rate > 1) rate = 1;
    return rate;
}

/*
   DCE and EPI multipliers for the sensitivity tab.

   Inputs are allowed either in percentage form (100 = baseline)
   or as direct multipliers between 0 and 2.
*/
function getSensitivityScales() {
    function parseScale(id) {
        const el = document.getElementById(id);
        if (!el) return 1;
        let v = parseFloat(el.value);
        if (isNaN(v) || v <= 0) return 1;
        if (v > 2) v = v / 100;
        return v;
    }
    return {
        dceScale: parseScale("sens-dce-benefit-scale"),
        epiScale: parseScale("sens-epi-benefit-scale")
    };
}

/*
   Benefit definition selection for the sensitivity tab.

   - "total_wtp": BCR/NPV based on total WTP
   - "effective_wtp": BCR/NPV based on endorsement-adjusted WTP
*/
function getBenefitDefinitionSelection() {
    const el = document.getElementById("dce-benefit-definition");
    if (!el) return "total_wtp";
    const val = (el.value || "").toLowerCase();
    if (val === "effective" || val === "effective_wtp") return "effective_wtp";
    return "total_wtp";
}

/*
   Class filter selection for the sensitivity tab.

   - "all": show all classes
   - "overall": mixed logit average
   - "supportive": supportive LC class
   - "conservative": conservative/resister LC class
*/
function getClassFilterSelection() {
    const el = document.getElementById("dce-class-filter");
    if (!el) return "all";
    const val = (el.value || "").toLowerCase();
    if (val === "overall" || val === "supportive" || val === "conservative" || val === "all") {
        return val;
    }
    return "all";
}

/*
   Core DCE-based benefit and simple CBA profiles.

   For each preference group (overall mixed logit, supportive LC,
   and conservative LC) we compute:

   - WTP per trainee per month and by component
   - WTP per cohort and across all cohorts
   - WTP attributable specifically to outbreak response time
   - Endorsement-adjusted (effective) WTP
   - NPV and BCR using:
       • Total WTP only (DCE benefit)
       • Total WTP + outbreak benefit
       • Effective WTP only
       • Effective WTP + outbreak benefit

   For the conservative class we suppress WTP-based metrics and
   only retain endorsement, as this group is cost-insensitive.
*/
function computeDceCbaProfiles(cfg, costs, epi, options) {
    const opts = options || {};
    const useUiOverrides = !!opts.useUiOverrides;
    const dceScale = typeof opts.dceScale === "number" ? opts.dceScale : 1;
    const epiScale = typeof opts.epiScale === "number" ? opts.epiScale : 1;

    const durationMonths = costs.durationMonths || 0;
    const trainees = cfg.traineesPerCohort || 0;
    const cohorts = cfg.numberOfCohorts || 0;
    const totalCostAllCohorts = costs.totalEconomicCostPerCohort * cohorts;

    const epiOutbreakBenefitAllCohorts =
        (epi.benefitOutbreaksAllCohorts || 0) * epiScale;

    const overallUtil = computeEndorsementAndWtp(cfg, "mxl");
    const supportiveUtil = computeEndorsementAndWtp(cfg, "lc2");
    const conservativeUtil = computeEndorsementAndWtp(cfg, "lc1", { suppressWtp: true });

    function buildProfile(label, utilObj, allowWtp) {
        const baseRate = utilObj.endorseProb || 0;
        const endorsementRate = useUiOverrides
            ? getEndorsementRateForSensitivity(baseRate)
            : baseRate;

        let wtpPerTraineePerMonth = null;
        let components = null;
        let wtpRespPerTraineePerMonth = null;

        let wtpPerCohort = null;
        let wtpRespPerCohort = null;
        let baseWtpAllCohorts = null;
        let baseWtpRespAllCohorts = null;

        let wtpAllCohorts = null;
        let wtpRespAllCohorts = null;
        let effectiveBenefitAllCohorts = null;

        let npvDce = null;
        let bcrDce = null;

        let npvCombined = null;
        let bcrCombined = null;

        let npvEffective = null;
        let bcrEffective = null;

        let npvEffectiveCombined = null;
        let bcrEffectiveCombined = null;

        if (allowWtp && typeof utilObj.wtpConfig === "number" && isFinite(utilObj.wtpConfig)) {
            wtpPerTraineePerMonth = utilObj.wtpConfig;
            components = utilObj.wtpComponents || {};
            if (typeof components.response === "number") {
                wtpRespPerTraineePerMonth = components.response;
            }

            wtpPerCohort = wtpPerTraineePerMonth * trainees * durationMonths;
            wtpRespPerCohort = (wtpRespPerTraineePerMonth || 0) * trainees * durationMonths;

            baseWtpAllCohorts = wtpPerCohort * cohorts;
            baseWtpRespAllCohorts = wtpRespPerCohort * cohorts;

            wtpAllCohorts = baseWtpAllCohorts * dceScale;
            wtpRespAllCohorts = baseWtpRespAllCohorts * dceScale;

            effectiveBenefitAllCohorts = wtpAllCohorts * endorsementRate;

            npvDce = wtpAllCohorts - totalCostAllCohorts;
            if (totalCostAllCohorts > 0) {
                bcrDce = wtpAllCohorts / totalCostAllCohorts;
            }

            const combinedBenefit = wtpAllCohorts + epiOutbreakBenefitAllCohorts;
            npvCombined = combinedBenefit - totalCostAllCohorts;
            if (totalCostAllCohorts > 0) {
                bcrCombined = combinedBenefit / totalCostAllCohorts;
            }

            npvEffective = effectiveBenefitAllCohorts - totalCostAllCohorts;
            if (totalCostAllCohorts > 0) {
                bcrEffective = effectiveBenefitAllCohorts / totalCostAllCohorts;
            }

            const effectiveCombinedBenefit = effectiveBenefitAllCohorts + epiOutbreakBenefitAllCohorts;
            npvEffectiveCombined = effectiveCombinedBenefit - totalCostAllCohorts;
            if (totalCostAllCohorts > 0) {
                bcrEffectiveCombined = effectiveCombinedBenefit / totalCostAllCohorts;
            }
        }

        return {
            label,
            endorsementRate,
            wtpPerTraineePerMonth,
            wtpPerCohort,
            wtpAllCohorts,
            wtpRespPerTraineePerMonth,
            wtpRespPerCohort,
            wtpRespAllCohorts,
            effectiveBenefitAllCohorts,
            npvDce,
            bcrDce,
            npvCombined,
            bcrCombined,
            npvEffective,
            bcrEffective,
            npvEffectiveCombined,
            bcrEffectiveCombined
        };
    }

    const profiles = {
        overall: buildProfile("Overall (mixed logit)", overallUtil, true),
        supportive: buildProfile("Supportive class (latent class)", supportiveUtil, true),
        conservative: buildProfile("Conservative/resister class (latent class)", conservativeUtil, false)
    };

    return {
        profiles,
        totalCostAllCohorts,
        epiOutbreakBenefitAllCohorts
    };
}

/*
   Scenario-level summary for the DCE sensitivity tab.

   This bundles together:
   - a scenario identifier and label
   - total economic cost across cohorts
   - outbreak-related epi benefit
   - class-specific DCE benefit profiles
   - information on whether epi benefits are active
*/
function buildDceScenarioSummary(results, overrides) {
    if (!results) return null;

    const overrideScales = (overrides && overrides.scales) || getSensitivityScales();
    const dceScale = overrideScales.dceScale;
    const epiScaleRaw = overrideScales.epiScale;

    const epiToggle = document.getElementById("dce-epi-benefit-toggle");
    const epiActive = overrides && typeof overrides.epiActive === "boolean"
        ? overrides.epiActive
        : (!epiToggle || epiToggle.checked);

    const epiScale = epiActive ? epiScaleRaw : 0;

    const dceCba = computeDceCbaProfiles(results.cfg, results.costs, results.epi, {
        useUiOverrides: true,
        dceScale,
        epiScale
    });

    const { profiles, totalCostAllCohorts, epiOutbreakBenefitAllCohorts } = dceCba;

    const scenarioLabel = results.cfg.scenarioName || "Current configuration";
    const scenarioId = [
        results.cfg.tier,
        results.cfg.career,
        results.cfg.mentorship,
        results.cfg.delivery,
        results.cfg.response
    ].join("_");

    return {
        scenarioId,
        scenarioLabel,
        totalCostAllCohorts,
        epiOutbreakBenefitAllCohorts,
        profiles,
        epiActive,
        scales: { dceScale, epiScale }
    };
}

/* ===========================
   Combined results
   =========================== */

function computeFullResults(cfg) {
    const util = computeEndorsementAndWtp(cfg, state.model);
    const costs = computeCosts(cfg);
    const epi = computeEpi(cfg, util.endorseProb);

    const totalCostAllCohorts = costs.totalEconomicCostPerCohort * cfg.numberOfCohorts;
    const totalBenefitAllCohorts = epi.totalBenefitAllCohorts;
    const netBenefitAllCohorts = totalBenefitAllCohorts - totalCostAllCohorts;
    const bcr =
        totalCostAllCohorts > 0
            ? totalBenefitAllCohorts / totalCostAllCohorts
            : null;

    const dceCba = computeDceCbaProfiles(cfg, costs, epi, {
        useUiOverrides: false
    });

    return {
        cfg,
        util,
        costs,
        epi,
        totalCostAllCohorts,
        totalBenefitAllCohorts,
        netBenefitAllCohorts,
        bcr,
        dceCba
    };
}

/* ===========================
   Global refresh helper
   =========================== */

function refreshAll(results, options = {}) {
    if (!results) return;
    const { skipToast } = options;

    state.lastResults = results;

    updateConfigSummary(results);
    updateResultsTab(results);
    updateCostingTab(results);
    updateNationalSimulation(results);
    updateSensitivityTab(results);

    if (!skipToast) {
        showToast("Configuration applied. Results updated.", "success");
    }
}

/* ===========================
   DOM helpers
   =========================== */

function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
}

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;

    toast.classList.remove("toast-success", "toast-warning", "toast-error", "hidden");
    if (type === "success") toast.classList.add("toast-success");
    if (type === "warning") toast.classList.add("toast-warning");
    if (type === "error") toast.classList.add("toast-error");

    toast.classList.add("show");

    if (showToast._timeoutId) {
        clearTimeout(showToast._timeoutId);
    }

    showToast._timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

/* ===========================
   Tabs
   =========================== */

function setupTabs() {
    const tabLinks = document.querySelectorAll(".tab-link");
    tabLinks.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.getAttribute("data-tab");
            if (!tab) return;
            tabLinks.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.querySelectorAll(".tab-panel").forEach(panel => {
                panel.classList.remove("active");
            });
            const panel = document.getElementById(`tab-${tab}`);
            if (panel) panel.classList.add("active");
        });
    });
}

/* ===========================
   Info tooltips
   =========================== */

let activeTooltip = null;
let activeTooltipIcon = null;

function hideTooltip() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
        activeTooltipIcon = null;
    }
}

function showTooltipForIcon(icon) {
    if (!icon) return;
    const text = icon.dataset.tooltip || icon.getAttribute("aria-label") || "";
    if (!text) return;

    hideTooltip();

    const bubble = document.createElement("div");
    bubble.className = "tooltip-bubble";
    bubble.innerHTML = `<p>${text}</p>`;
    document.body.appendChild(bubble);

    const rect = icon.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    let top = rect.bottom + 8;
    let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);

    if (left < 8) left = 8;
    if (left + bubbleRect.width > window.innerWidth - 8) {
        left = window.innerWidth - bubbleRect.width - 8;
    }

    if (top + bubbleRect.height > window.innerHeight - 8) {
        top = rect.top - bubbleRect.height - 8;
    }

    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;

    const arrow = document.createElement("div");
    arrow.className = "tooltip-arrow";
    arrow.style.bottom = "-4px";
    arrow.style.left = "calc(50% - 4px)";
    bubble.appendChild(arrow);

    activeTooltip = bubble;
    activeTooltipIcon = icon;
}

function setupInfoTooltips() {
    const icons = document.querySelectorAll(".info-icon");
    icons.forEach(icon => {
        const title = icon.getAttribute("title");
        if (title) {
            icon.dataset.tooltip = title;
            icon.removeAttribute("title");
        }
        icon.setAttribute("tabindex", "0");
        icon.setAttribute("role", "button");
        icon.setAttribute("aria-label", icon.dataset.tooltip || "More information");

        icon.addEventListener("mouseenter", () => showTooltipForIcon(icon));
        icon.addEventListener("mouseleave", () => hideTooltip());
        icon.addEventListener("focus", () => showTooltipForIcon(icon));
        icon.addEventListener("blur", () => hideTooltip());
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            if (activeTooltipIcon === icon) {
                hideTooltip();
            } else {
                showTooltipForIcon(icon);
            }
        });
        icon.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (activeTooltipIcon === icon) {
                    hideTooltip();
                } else {
                    showTooltipForIcon(icon);
                }
            }
        });
    });

    document.addEventListener("click", (e) => {
        if (activeTooltip && !e.target.closest(".info-icon")) {
            hideTooltip();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            hideTooltip();
        }
    });
}

/* ===========================
   Cost template UI
   =========================== */

function populateCostSourceOptions(tier) {
    const select = document.getElementById("cost-source");
    if (!select) return;

    let sourcesForTier = null;

    if (COST_CONFIG && COST_CONFIG[tier]) {
        sourcesForTier = COST_CONFIG[tier];
    } else {
        sourcesForTier = COST_TEMPLATES[tier] || {};
    }

    const ids = Object.keys(sourcesForTier);

    select.innerHTML = "";

    if (!ids.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No templates available";
        select.appendChild(opt);
        state.currentCostSourceId = null;
        return;
    }

    if (!state.currentCostSourceId || !sourcesForTier[state.currentCostSourceId]) {
        state.currentCostSourceId = ids[0];
    }

    ids.forEach(id => {
        const tpl = sourcesForTier[id];
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = tpl.label || id;
        select.appendChild(opt);
    });

    select.value = state.currentCostSourceId;

    if (!select.dataset.bound) {
        select.addEventListener("change", () => {
            state.currentCostSourceId = select.value;
            const cfg = readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results, { skipToast: true });
        });
        select.dataset.bound = "1";
    }
}

/* ===========================
   Results and summaries
   =========================== */

function updateConfigSummary(results) {
    const container = document.getElementById("config-summary");
    if (!container) return;
    const { cfg, util } = results;
    const endorsementPercent = util.endorseProb * 100;

    const tierLabelMap = {
        frontline: "Frontline (3 months)",
        intermediate: "Intermediate (12 months)",
        advanced: "Advanced (24 months)"
    };

    const careerLabelMap = {
        certificate: "Government and partner certificate",
        uniqual: "University qualification",
        career_path: "Government career pathway"
    };

    const mentorshipLabelMap = {
        low: "Low mentorship",
        medium: "Medium mentorship",
        high: "High mentorship"
    };

    const deliveryLabelMap = {
        blended: "Blended delivery",
        inperson: "Fully in person delivery",
        online: "Fully online delivery"
    };

    const responseLabelMap = {
        30: "Detect and respond within 30 days",
        15: "Detect and respond within 15 days",
        7: "Detect and respond within 7 days"
    };

    const modelLabel = state.model === "lc2"
        ? "Supportive group (latent class)"
        : "Average mixed logit";

    const tierLabel = tierLabelMap[cfg.tier] || cfg.tier;
    const careerLabel = careerLabelMap[cfg.career] || cfg.career;
    const mentorLabel = mentorshipLabelMap[cfg.mentorship] || cfg.mentorship;
    const deliveryLabel = deliveryLabelMap[cfg.delivery] || cfg.delivery;
    const responseLabel = responseLabelMap[cfg.response] || `${cfg.response} days`;

    const template = getCurrentCostTemplate(cfg.tier);
    const templateLabel = template ? template.label : "No template selected";

    const lines = [
        { label: "Programme tier", value: tierLabel },
        { label: "Career incentive", value: careerLabel },
        { label: "Mentorship intensity", value: mentorLabel },
        { label: "Delivery mode", value: deliveryLabel },
        { label: "Expected response time for events", value: responseLabel },
        { label: "Preference model", value: modelLabel },
        { label: "Trainees per cohort", value: formatNumber(cfg.traineesPerCohort, 0) },
        { label: "Number of cohorts", value: formatNumber(cfg.numberOfCohorts, 0) },
        {
            label: "Cost per trainee per month",
            value: formatCurrency(cfg.costPerTraineePerMonth, state.currency)
        },
        { label: "Cost template", value: templateLabel }
    ];

    container.innerHTML = lines.map(row => `
        <div class="config-summary-row">
            <div class="config-summary-label">${row.label}</div>
            <div class="config-summary-value">${row.value}</div>
        </div>
    `).join("");

    const endorsementValueEl = document.getElementById("config-endorsement-value");
    if (endorsementValueEl) {
        endorsementValueEl.textContent = formatPercent(endorsementPercent, 1);
    }

    const headlineStatusEl =
        document.getElementById("headline-status-pill") ||
        document.getElementById("headline-status-tag");
    const headlineTextEl = document.getElementById("headline-recommendation");
    const briefingEl = document.getElementById("headline-briefing-text");

    const resultsForHeadline = buildHeadlineText(results);

    if (headlineStatusEl) {
        headlineStatusEl.className = "status-pill " + resultsForHeadline.statusClass;
        headlineStatusEl.textContent = resultsForHeadline.statusLabel;
    }
    if (headlineTextEl) {
        headlineTextEl.textContent = resultsForHeadline.headline;
    }
    if (briefingEl) {
        briefingEl.textContent = resultsForHeadline.briefing;
    }
}

function buildHeadlineText(results) {
    const { util, bcr, epi, totalCostAllCohorts, totalBenefitAllCohorts } = results;
    const endorsement = util.endorseProb * 100;

    let statusClass = "status-neutral";
    let statusLabel = "Scenario not yet classified";
    let headline = "Apply a configuration to see an interpreted recommendation.";
    let briefing = "Once you apply a configuration, this box will summarise endorsement, costs and benefits in plain language for use in business case documents.";

    if (totalCostAllCohorts <= 0 || !isFinite(totalCostAllCohorts)) {
        return { statusClass, statusLabel, headline, briefing };
    }

    const bcrValue = bcr !== null && isFinite(bcr) ? bcr : 0;

    if (bcrValue >= 1.2 && endorsement >= 70) {
        statusClass = "status-good";
        statusLabel = "High impact and good value";
        headline = "This configuration appears attractive, combining strong endorsement with a benefit cost ratio above one.";
        briefing = "Estimated endorsement is around " +
            formatPercent(endorsement, 1) +
            " and the benefit cost ratio is " +
            (bcrValue ? bcrValue.toFixed(2) : "N/A") +
            ". National scale up is likely to deliver positive net benefits, subject to budget and implementation feasibility.";
    } else if (bcrValue >= 1 && endorsement >= 50) {
        statusClass = "status-warning";
        statusLabel = "Moderate impact and acceptable value";
        headline = "This configuration has positive net benefits and moderate endorsement.";
        briefing = "Estimated endorsement is around " +
            formatPercent(endorsement, 1) +
            " and the benefit cost ratio is close to one. It may be suitable for targeted scale up or as part of a mixed portfolio, especially if budgets are constrained.";
    } else if (bcrValue >= 1 && endorsement < 50) {
        statusClass = "status-warning";
        statusLabel = "Positive value but limited support";
        headline = "Net benefits are positive but endorsement is limited.";
        briefing = "The benefit cost ratio is above one but only about " +
            formatPercent(endorsement, 1) +
            " of stakeholders are predicted to endorse this option. Consider adjustments to career incentives, mentorship or cost before committing to large scale implementation.";
    } else if (bcrValue < 1) {
        statusClass = "status-poor";
        statusLabel = "Low value for money";
        headline = "This configuration does not appear cost effective under current assumptions.";
        briefing = "The benefit cost ratio is below one and net benefits are negative. Before moving forward, consider options to reduce costs or redesign the programme. It may be better used as a comparator or for local pilots rather than national scale up.";
    }

    const graduatesText = formatNumber(epi.graduatesAllCohorts, 0);
    const outbreaksText = formatNumber(epi.outbreaksPerYearAllCohorts, 1);
    const totalCostText = formatCurrency(totalCostAllCohorts, state.currency);
    const totalBenefitText = formatCurrency(totalBenefitAllCohorts, state.currency);

    briefing += " Under these assumptions, the configuration would generate roughly " +
        graduatesText + " graduates, support about " + outbreaksText +
        " outbreak responses per year over the planning horizon, and involve total economic costs of " +
        totalCostText + " for indicative benefits of " + totalBenefitText + ".";

    return { statusClass, statusLabel, headline, briefing };
}

function updateResultsTab(results) {
    const { util, costs, epi, totalCostAllCohorts, netBenefitAllCohorts, bcr } = results;
    const endorsePercent = util.endorseProb * 100;
    const optOutPercent = util.optOutProb * 100;

    setText("endorsement-rate", formatPercent(endorsePercent, 1));
    setText("optout-rate", formatPercent(optOutPercent, 1));

    setText("total-cost", formatCurrency(costs.totalEconomicCostPerCohort, state.currency));
    setText("net-benefit", formatCurrency(netBenefitAllCohorts / (results.cfg.numberOfCohorts || 1), state.currency));
    setText("bcr", (bcr !== null && isFinite(bcr)) ? bcr.toFixed(2) : "-");

    setText("epi-graduates", formatNumber(epi.graduatesAllCohorts, 0));
    setText("epi-outbreaks", formatNumber(epi.outbreaksPerYearAllCohorts, 1));
    setText("epi-benefit", formatCurrency(epi.benefitPerCohort, state.currency));

    if (document.getElementById("wtp-config")) {
        const wtp = util.wtpConfig;
        setText("wtp-config", wtp !== null && isFinite(wtp)
            ? formatCurrency(wtp, state.currency)
            : "-");
    }

    updateResultCharts(results);
}

function updateCostingTab(results) {
    const { cfg, costs } = results;
    const template = getCurrentCostTemplate(cfg.tier);

    const summary = document.getElementById("cost-breakdown-summary");
    const list = document.getElementById("cost-components-list");
    const templateDescrEl = document.getElementById("cost-template-description");

    if (!summary || !list) return;

    const economicCost = costs.totalEconomicCostPerCohort;
    const oppCost = costs.opportunityCostPerCohort;
    const directCost = costs.programmeCostPerCohort;

    summary.innerHTML = `
        <div class="cost-summary-card">
            <div class="cost-summary-label">Programme cost per cohort</div>
            <div class="cost-summary-value">${formatCurrency(directCost, state.currency)}</div>
        </div>
        <div class="cost-summary-card">
            <div class="cost-summary-label">Opportunity cost per cohort</div>
            <div class="cost-summary-value">${formatCurrency(oppCost, state.currency)}</div>
        </div>
        <div class="cost-summary-card">
            <div class="cost-summary-label">Total economic cost per cohort</div>
            <div class="cost-summary-value">${formatCurrency(economicCost, state.currency)}</div>
        </div>
    `;

    if (templateDescrEl) {
        templateDescrEl.textContent = template && template.description ? template.description : "";
    }

    const componentsRows = (costs.components || []).map(comp => {
        const sharePercent = comp.share * 100;

        const metaParts = [];
        if (comp.major) metaParts.push(comp.major);
        if (comp.category) metaParts.push(comp.category);
        if (comp.subCategory) metaParts.push(comp.subCategory);
        const metaText = metaParts.join(" / ");
        const metaBlock = metaText ? `<div class="cost-component-meta">${metaText}</div>` : "";

        const notesText = comp.description || "";

        return `
            <tr>
                <td>
                    <div class="cost-component-name">${comp.label}</div>
                    ${metaBlock}
                </td>
                <td>${sharePercent.toFixed(1)} %</td>
                <td>${formatCurrency(comp.amountPerCohort, state.currency)}</td>
                <td>${formatCurrency(comp.amountPerTraineePerMonth, state.currency)}</td>
                <td>${notesText}</td>
            </tr>
        `;
    }).join("");

    const oppRow = `
        <tr>
            <td>Opportunity cost of trainee time</td>
            <td>${template && typeof template.oppRate === "number"
                ? (template.oppRate * 100).toFixed(1) + " %"
                : "-"}</td>
            <td>${formatCurrency(oppCost, state.currency)}</td>
            <td>-</td>
            <td>Included when the opportunity cost toggle is on.</td>
        </tr>
    `;

    list.innerHTML = componentsRows + oppRow;
}

function updateNationalSimulation(results) {
    const { epi, totalCostAllCohorts, totalBenefitAllCohorts, netBenefitAllCohorts, bcr } = results;

    setText("nat-total-cost", formatCurrency(totalCostAllCohorts, state.currency));
    setText("nat-total-benefit", formatCurrency(totalBenefitAllCohorts, state.currency));
    setText("nat-net-benefit", formatCurrency(netBenefitAllCohorts, state.currency));
    setText("nat-bcr", (bcr !== null && isFinite(bcr)) ? bcr.toFixed(2) : "-");

    setText("nat-graduates", formatNumber(epi.graduatesAllCohorts, 0));
    setText("nat-outbreaks", formatNumber(epi.outbreaksPerYearAllCohorts, 1));

    updateNationalCharts(results);
}

/* ===========================
   Sensitivity tab (interactive)
   =========================== */

/*
   Main renderer for the “Sensitivity / DCE Benefits” tab.

   It takes the current configuration, applies:
   - user-defined endorsement override,
   - DCE and EPI multipliers,
   - epi on/off toggle,
   - benefit definition (total WTP vs effective WTP),
   - preference-class filter,

   and then recomputes WTP-based benefits, epi benefits and
   all BCR / NPV variants for each preference group.
*/
function updateSensitivityTab(results) {
    const tableBody = document.querySelector("#dce-sensitivity-table tbody");
    if (!tableBody || !results) return;

    const scenario = buildDceScenarioSummary(results);
    if (!scenario || !scenario.profiles) return;

    state.dceScenario = scenario;

    const { profiles, totalCostAllCohorts, epiOutbreakBenefitAllCohorts, epiActive } = scenario;

    const benefitDefinition = getBenefitDefinitionSelection();
    const classFilter = getClassFilterSelection();

    tableBody.innerHTML = "";

    const costDisplayText = formatCurrencyInrMillions(totalCostAllCohorts);
    const epiBenefitDisplayText = epiActive
        ? formatCurrencyInrMillions(epiOutbreakBenefitAllCohorts)
        : "—";

    const orderedKeys = ["overall", "supportive", "conservative"];

    orderedKeys.forEach(key => {
        const p = profiles[key];
        if (!p) return;

        if (classFilter !== "all" && classFilter !== key) return;

        let activeBcr = null;
        let activeNpv = null;

        if (benefitDefinition === "effective_wtp") {
            if (epiActive) {
                activeBcr = p.bcrEffectiveCombined;
                activeNpv = p.npvEffectiveCombined;
            } else {
                activeBcr = p.bcrEffective;
                activeNpv = p.npvEffective;
            }
        } else {
            if (epiActive) {
                activeBcr = p.bcrCombined;
                activeNpv = p.npvCombined;
            } else {
                activeBcr = p.bcrDce;
                activeNpv = p.npvDce;
            }
        }

        const endorsementPercent = p.endorsementRate * 100;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.label}</td>
            <td>${costDisplayText}</td>
            <td>${p.wtpAllCohorts !== null && isFinite(p.wtpAllCohorts) ? formatCurrencyInrMillions(p.wtpAllCohorts) : "—"}</td>
            <td>${p.wtpRespAllCohorts !== null && isFinite(p.wtpRespAllCohorts) ? formatCurrencyInrMillions(p.wtpRespAllCohorts) : "—"}</td>
            <td>${epiBenefitDisplayText}</td>
            <td>${isFinite(endorsementPercent) ? formatPercent(endorsementPercent, 1) : "—"}</td>
            <td>${p.effectiveBenefitAllCohorts !== null && isFinite(p.effectiveBenefitAllCohorts) ? formatCurrencyInrMillions(p.effectiveBenefitAllCohorts) : "—"}</td>
            <td>${(p.bcrDce !== null && isFinite(p.bcrDce)) ? p.bcrDce.toFixed(2) : "-"}</td>
            <td>${p.npvDce !== null && isFinite(p.npvDce) ? formatCurrencyInrMillions(p.npvDce) : "-"}</td>
            <td>${(p.bcrCombined !== null && isFinite(p.bcrCombined)) ? p.bcrCombined.toFixed(2) : "-"}</td>
            <td>${p.npvCombined !== null && isFinite(p.npvCombined) ? formatCurrencyInrMillions(p.npvCombined) : "-"}</td>
            <td>${(p.bcrEffective !== null && isFinite(p.bcrEffective)) ? p.bcrEffective.toFixed(2) : "-"}</td>
            <td>${p.npvEffective !== null && isFinite(p.npvEffective) ? formatCurrencyInrMillions(p.npvEffective) : "-"}</td>
            <td>${(activeBcr !== null && isFinite(activeBcr)) ? activeBcr.toFixed(2) : "-"}</td>
            <td>${activeNpv !== null && isFinite(activeNpv) ? formatCurrencyInrMillions(activeNpv) : "-"}</td>
        `;
        tableBody.appendChild(tr);
    });

    const shareEl = document.getElementById("dce-response-share-label");
    if (shareEl && profiles.overall && profiles.overall.wtpAllCohorts && profiles.overall.wtpAllCohorts > 0) {
        const share = (profiles.overall.wtpRespAllCohorts / profiles.overall.wtpAllCohorts) * 100;
        const safeShare = isFinite(share) ? share.toFixed(1) : "0.0";
        shareEl.textContent =
            `${safeShare} % of the DCE-based benefit for this configuration comes from outbreak response capacity (overall mixed logit) under the current sensitivity settings.`;
    }

    const sensSummary = document.getElementById("dce-sensitivity-summary");
    if (sensSummary && profiles.overall) {
        const p = profiles.overall;

        let activeBcrSummary = null;
        let activeNpvSummary = null;
        let activeLabel = "";

        if (benefitDefinition === "effective_wtp") {
            if (epiActive) {
                activeBcrSummary = p.bcrEffectiveCombined;
                activeNpvSummary = p.npvEffectiveCombined;
                activeLabel = "BCR – Effective WTP + outbreak benefits";
            } else {
                activeBcrSummary = p.bcrEffective;
                activeNpvSummary = p.npvEffective;
                activeLabel = "BCR – Effective WTP (endorsers only)";
            }
        } else {
            if (epiActive) {
                activeBcrSummary = p.bcrCombined;
                activeNpvSummary = p.npvCombined;
                activeLabel = "BCR – Total WTP + outbreak benefits";
            } else {
                activeBcrSummary = p.bcrDce;
                activeNpvSummary = p.npvDce;
                activeLabel = "BCR – Total WTP (all respondents)";
            }
        }

        const dceLabel = "Total DCE-based benefit (all cohorts)";
        const effectiveLabel = "Effective benefit (endorsers only)";
        const dceBcrLabel = "BCR (DCE benefit only)";
        const combinedBcrLabel = "BCR (DCE + outbreak benefits)";

        sensSummary.innerHTML = `
            <div class="sens-summary-card">
                <div class="sens-summary-label">${dceLabel}</div>
                <div class="sens-summary-value">${p.wtpAllCohorts !== null && isFinite(p.wtpAllCohorts) ? formatCurrencyInrMillions(p.wtpAllCohorts) : "-"}</div>
            </div>
            <div class="sens-summary-card">
                <div class="sens-summary-label">${effectiveLabel}</div>
                <div class="sens-summary-value">${p.effectiveBenefitAllCohorts !== null && isFinite(p.effectiveBenefitAllCohorts) ? formatCurrencyInrMillions(p.effectiveBenefitAllCohorts) : "-"}</div>
            </div>
            <div class="sens-summary-card">
                <div class="sens-summary-label">${dceBcrLabel}</div>
                <div class="sens-summary-value">${p.bcrDce !== null && isFinite(p.bcrDce) ? p.bcrDce.toFixed(2) : "-"}</div>
            </div>
            <div class="sens-summary-card">
                <div class="sens-summary-label">${combinedBcrLabel}</div>
                <div class="sens-summary-value">${epiActive && p.bcrCombined !== null && isFinite(p.bcrCombined) ? p.bcrCombined.toFixed(2) : "-"}</div>
            </div>
            <div class="sens-summary-card">
                <div class="sens-summary-label">${activeLabel}</div>
                <div class="sens-summary-value">${activeBcrSummary !== null && isFinite(activeBcrSummary) ? activeBcrSummary.toFixed(2) : "-"}</div>
            </div>
        `;
    }
}

/* ===========================
   Charts with Chart.js
   =========================== */

function safeDestroyChart(chart) {
    if (chart && typeof chart.destroy === "function") {
        chart.destroy();
    }
}

function updateResultCharts(results) {
    const { util, costs, epi } = results;
    const endorsePercent = util.endorseProb * 100;
    const optPercent = util.optOutProb * 100;

    if (window.Chart) {
        const uptakeCtx = document.getElementById("chart-uptake");
        if (uptakeCtx) {
            safeDestroyChart(state.charts.uptake);
            state.charts.uptake = new Chart(uptakeCtx, {
                type: "doughnut",
                data: {
                    labels: ["Endorse FETP option", "Choose opt out"],
                    datasets: [{
                        data: [endorsePercent, optPercent],
                        backgroundColor: ["#1D4F91", "#9CA3AF"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: { enabled: true }
                    },
                    cutout: "55%"
                }
            });
        }

        const bcrCtx = document.getElementById("chart-bcr");
        if (bcrCtx) {
            safeDestroyChart(state.charts.bcr);
            const economicCost = costs.totalEconomicCostPerCohort;
            const epiBenefit = epi.benefitPerCohort;
            state.charts.bcr = new Chart(bcrCtx, {
                type: "bar",
                data: {
                    labels: ["Per cohort"],
                    datasets: [
                        {
                            label: "Economic cost",
                            data: [economicCost],
                            backgroundColor: "#1D4F91"
                        },
                        {
                            label: "Indicative benefit",
                            data: [epiBenefit],
                            backgroundColor: "#0F766E"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, state.currency)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => formatCurrency(value, state.currency)
                            }
                        }
                    }
                }
            });
        }

        const epiCtx = document.getElementById("chart-epi");
        if (epiCtx) {
            safeDestroyChart(state.charts.epi);
            state.charts.epi = new Chart(epiCtx, {
                type: "bar",
                data: {
                    labels: ["Graduates", "Outbreak responses per year"],
                    datasets: [{
                        label: "Epidemiological outputs",
                        data: [epi.graduatesAllCohorts, epi.outbreaksPerYearAllCohorts],
                        backgroundColor: ["#1D4F91", "#0F766E"]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => formatNumber(value, 0)
                            }
                        }
                    }
                }
            });
        }
    }
}

function updateNationalCharts(currentResults) {
    if (!window.Chart) return;

    const scenarios = state.scenarios || [];
    const allScenarios = [];

    const currentLabel = currentResults.cfg.scenarioName || "Current configuration";
    allScenarios.push({
        label: currentLabel,
        totalCost: currentResults.totalCostAllCohorts,
        totalBenefit: currentResults.totalBenefitAllCohorts,
        graduates: currentResults.epi.graduatesAllCohorts,
        outbreaks: currentResults.epi.outbreaksPerYearAllCohorts,
        bcr: currentResults.bcr
    });

    scenarios.forEach(s => {
        allScenarios.push({
            label: s.name || `Scenario ${s.id}`,
            totalCost: s.totalCostAllCohorts,
            totalBenefit: s.totalBenefitAllCohorts,
            graduates: s.graduatesAllCohorts,
            outbreaks: s.outbreaksPerYearAllCohorts,
            bcr: s.bcr
        });
    });

    const labels = allScenarios.map(s => s.label);
    const costs = allScenarios.map(s => s.totalCost);
    const benefits = allScenarios.map(s => s.totalBenefit);
    const grads = allScenarios.map(s => s.graduates);
    const outbreaks = allScenarios.map(s => s.outbreaks);
    const bcrs = allScenarios.map(s => (s.bcr !== null && isFinite(s.bcr)) ? s.bcr : 0);

    const natCostCtx = document.getElementById("chart-nat-cost-benefit");
    if (natCostCtx) {
        safeDestroyChart(state.charts.natCostBenefit);
        state.charts.natCostBenefit = new Chart(natCostCtx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Total economic cost (all cohorts)",
                        data: costs,
                        backgroundColor: "#1D4F91"
                    },
                    {
                        label: "Total indicative benefit (all cohorts)",
                        data: benefits,
                        backgroundColor: "#0F766E"
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, state.currency)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value, state.currency)
                        }
                    }
                }
            }
        });
    }

    const natGradCtx = document.getElementById("chart-nat-grad-outbreak");
    if (natGradCtx) {
        safeDestroyChart(state.charts.natGradOutbreak);
        state.charts.natGradOutbreak = new Chart(natGradCtx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Total FETP graduates",
                        data: grads,
                        backgroundColor: "#1D4F91"
                    },
                    {
                        label: "Outbreak responses supported per year",
                        data: outbreaks,
                        backgroundColor: "#0F766E"
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y, 0)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatNumber(value, 0)
                        }
                    }
                }
            }
        });
    }

    const natBcrCtx = document.getElementById("chart-nat-bcr");
    if (natBcrCtx) {
        safeDestroyChart(state.charts.natBcr);
        state.charts.natBcr = new Chart(natBcrCtx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Benefit cost ratio",
                    data: bcrs,
                    backgroundColor: "#1D4F91"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`
                        }
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
}

/* ===========================
   Advanced settings and assumption log
   =========================== */

function loadEpiConfigIfPresent() {
    fetch("epi_config.json")
        .then(resp => {
            if (!resp.ok) throw new Error("No external epi_config.json");
            return resp.json();
        })
        .then(json => {
            state.epiSettings = json;
            populateAdvancedSettingsInputs();
            const cfg = state.lastResults ? state.lastResults.cfg : readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results, { skipToast: true });
            updateAssumptionLog(cfg);
        })
        .catch(() => {
            state.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
            populateAdvancedSettingsInputs();
            const cfg = state.lastResults ? state.lastResults.cfg : readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results, { skipToast: true });
            updateAssumptionLog(cfg);
        });
}

function loadCostConfigIfPresent() {
    fetch("cost_config.json")
        .then(resp => {
            if (!resp.ok) throw new Error("No external cost_config.json");
            return resp.json();
        })
        .then(json => {
            COST_CONFIG = json;
            const cfg = readConfigurationFromInputs();
            populateCostSourceOptions(cfg.tier);
            const results = computeFullResults(cfg);
            refreshAll(results, { skipToast: true });
        })
        .catch(() => {
            COST_CONFIG = null;
        });
}

function populateAdvancedSettingsInputs() {
    const s = state.epiSettings;

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el && typeof value !== "undefined") el.value = value;
    };

    setVal("adv-inr-per-usd", s.general.inrPerUsd);

    setVal("adv-frontline-grads", s.tiers.frontline.gradShare);
    setVal("adv-frontline-outbreaks", s.tiers.frontline.outbreaksPerCohortPerYear);
    setVal("adv-frontline-vgrad", s.tiers.frontline.valuePerGraduate);
    setVal("adv-frontline-voutbreak", s.tiers.frontline.valuePerOutbreak);

    setVal("adv-intermediate-grads", s.tiers.intermediate.gradShare);
    setVal("adv-intermediate-outbreaks", s.tiers.intermediate.outbreaksPerCohortPerYear);
    setVal("adv-intermediate-vgrad", s.tiers.intermediate.valuePerGraduate);
    setVal("adv-intermediate-voutbreak", s.tiers.intermediate.valuePerOutbreak);

    setVal("adv-advanced-grads", s.tiers.advanced.gradShare);
    setVal("adv-advanced-outbreaks", s.tiers.advanced.outbreaksPerCohortPerYear);
    setVal("adv-advanced-vgrad", s.tiers.advanced.valuePerGraduate);
    setVal("adv-advanced-voutbreak", s.tiers.advanced.valuePerOutbreak);
}

function applyAdvancedSettings() {
    const getNum = (id, fallback) => {
        const el = document.getElementById(id);
        if (!el) return fallback;
        const v = parseFloat(el.value);
        return isNaN(v) ? fallback : v;
    };

    const s = state.epiSettings;

    s.general.inrPerUsd = getNum("adv-inr-per-usd", s.general.inrPerUsd);

    s.tiers.frontline.gradShare = getNum("adv-frontline-grads", s.tiers.frontline.gradShare);
    s.tiers.frontline.outbreaksPerCohortPerYear = getNum("adv-frontline-outbreaks", s.tiers.frontline.outbreaksPerCohortPerYear);
    s.tiers.frontline.valuePerGraduate = getNum("adv-frontline-vgrad", s.tiers.frontline.valuePerGraduate);
    s.tiers.frontline.valuePerOutbreak = getNum("adv-frontline-voutbreak", s.tiers.frontline.valuePerOutbreak);

    s.tiers.intermediate.gradShare = getNum("adv-intermediate-grads", s.tiers.intermediate.gradShare);
    s.tiers.intermediate.outbreaksPerCohortPerYear = getNum("adv-intermediate-outbreaks", s.tiers.intermediate.outbreaksPerCohortPerYear);
    s.tiers.intermediate.valuePerGraduate = getNum("adv-intermediate-vgrad", s.tiers.intermediate.valuePerGraduate);
    s.tiers.intermediate.valuePerOutbreak = getNum("adv-intermediate-voutbreak", s.tiers.intermediate.valuePerOutbreak);

    s.tiers.advanced.gradShare = getNum("adv-advanced-grads", s.tiers.advanced.gradShare);
    s.tiers.advanced.outbreaksPerCohortPerYear = getNum("adv-advanced-outbreaks", s.tiers.advanced.outbreaksPerCohortPerYear);
    s.tiers.advanced.valuePerGraduate = getNum("adv-advanced-vgrad", s.tiers.advanced.valuePerGraduate);
    s.tiers.advanced.valuePerOutbreak = getNum("adv-advanced-voutbreak", s.tiers.advanced.valuePerOutbreak);

    const cfg = readConfigurationFromInputs();
    const results = computeFullResults(cfg);
    refreshAll(results, { skipToast: true });
    updateAssumptionLog(cfg);
    showToast("Advanced settings applied to current calculations.", "success");
}

function resetAdvancedSettings() {
    state.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
    populateAdvancedSettingsInputs();
    const cfg = readConfigurationFromInputs();
    const results = computeFullResults(cfg);
    refreshAll(results, { skipToast: true });
    updateAssumptionLog(cfg);
    showToast("Advanced settings reset to default values.", "success");
}

function updateAssumptionLog(cfg) {
    const el = document.getElementById("assumption-log-text");
    if (!el) return;

    const s = state.epiSettings;
    const nowIso = new Date().toISOString();

    const logLines = [
        `STEPS assumption log - ${nowIso}`,
        "",
        `Planning horizon (years): ${s.general.planningHorizonYears}`,
        "",
        "Outbreak responses per cohort per year by tier:",
        `  Frontline:     ${s.tiers.frontline.outbreaksPerCohortPerYear}`,
        `  Intermediate:  ${s.tiers.intermediate.outbreaksPerCohortPerYear}`,
        `  Advanced:      ${s.tiers.advanced.outbreaksPerCohortPerYear}`,
        "",
        "Graduates per cohort as share of trainees by tier:",
        `  Frontline:     ${s.tiers.frontline.gradShare}`,
        `  Intermediate:  ${s.tiers.intermediate.gradShare}`,
        `  Advanced:      ${s.tiers.advanced.gradShare}`,
        "",
        "Indicative monetary values (INR):",
        `  Frontline graduate:      ${s.tiers.frontline.valuePerGraduate}`,
        `  Frontline outbreak:      ${s.tiers.frontline.valuePerOutbreak}`,
        `  Intermediate graduate:   ${s.tiers.intermediate.valuePerGraduate}`,
        `  Intermediate outbreak:   ${s.tiers.intermediate.valuePerOutbreak}`,
        `  Advanced graduate:       ${s.tiers.advanced.valuePerGraduate}`,
        `  Advanced outbreak:       ${s.tiers.advanced.valuePerOutbreak}`,
        "",
        `Exchange rate (INR per USD): ${s.general.inrPerUsd}`,
        "",
        "Current configuration snapshot:",
        `  Programme tier:           ${cfg.tier}`,
        `  Mentorship intensity:     ${cfg.mentorship}`,
        `  Delivery mode:            ${cfg.delivery}`,
        `  Response time:            ${cfg.response} days`,
        `  Trainees per cohort:      ${cfg.traineesPerCohort}`,
        `  Number of cohorts:        ${cfg.numberOfCohorts}`,
        `  Cost per trainee per month: ${cfg.costPerTraineePerMonth}`,
        `  Preference model:         ${state.model}`
    ];

    el.textContent = logLines.join("\n");
}

/* ===========================
   Scenario saving and table
   =========================== */

function saveScenarioFromCurrentResults() {
    if (!state.lastResults) {
        const cfg = readConfigurationFromInputs();
        state.lastResults = computeFullResults(cfg);
    }

    const r = state.lastResults;
    const cfg = r.cfg;

    const id = Date.now();
    const name = cfg.scenarioName || `Scenario ${state.scenarios.length + 1}`;
    const notes = cfg.scenarioNotes || "";

    const scenario = {
        id,
        name,
        notes,
        tier: cfg.tier,
        career: cfg.career,
        mentorship: cfg.mentorship,
        delivery: cfg.delivery,
        response: cfg.response,
        costPerTraineePerMonth: cfg.costPerTraineePerMonth,
        traineesPerCohort: cfg.traineesPerCohort,
        numberOfCohorts: cfg.numberOfCohorts,
        model: state.model,
        endorsementRate: r.util.endorseProb * 100,
        optOutRate: r.util.optOutProb * 100,
        wtpConfig: r.util.wtpConfig,
        perCohortEconomicCost: r.costs.totalEconomicCostPerCohort,
        perCohortBenefit: r.epi.benefitPerCohort,
        totalCostAllCohorts: r.totalCostAllCohorts,
        totalBenefitAllCohorts: r.totalBenefitAllCohorts,
        netBenefitAllCohorts: r.netBenefitAllCohorts,
        bcr: r.bcr
    };

    state.scenarios.push(scenario);
    updateScenarioTable();
    updateNationalCharts(r);
    showToast("Scenario saved for comparison.", "success");
}

function updateScenarioTable() {
    const tbody = document.querySelector("#scenario-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!state.scenarios.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="8" class="scenario-empty-row">
                No saved scenarios yet. Apply a configuration and use “Save scenario” to add it here.
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    state.scenarios.forEach((s, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="scenario-name-cell">${s.name}</div>
                ${s.notes ? `<div class="scenario-notes-cell">${s.notes}</div>` : ""}
            </td>
            <td>${s.tier}</td>
            <td>${formatNumber(s.traineesPerCohort, 0)}</td>
            <td>${formatNumber(s.numberOfCohorts, 0)}</td>
            <td>${formatCurrency(s.totalCostAllCohorts, state.currency)}</td>
            <td>${formatCurrency(s.totalBenefitAllCohorts, state.currency)}</td>
            <td>${(s.bcr !== null && isFinite(s.bcr)) ? s.bcr.toFixed(2) : "-"}</td>
            <td>${formatPercent(s.endorsementRate, 1)}</td>
            <td class="scenario-actions-cell">
                <button type="button"
                        class="btn btn-ghost btn-xs"
                        data-action="apply"
                        data-id="${s.id}">
                    Load
                </button>
                <button type="button"
                        class="btn btn-text btn-xs text-danger"
                        data-action="delete"
                        data-id="${s.id}">
                    Remove
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!tbody.dataset.bound) {
        tbody.addEventListener("click", handleScenarioTableClick);
        tbody.dataset.bound = "1";
    }
}

function handleScenarioTableClick(event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const idStr = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    if (!idStr || !action) return;

    const id = parseInt(idStr, 10);
    if (!isFinite(id)) return;

    if (action === "apply") {
        applyScenarioById(id);
    } else if (action === "delete") {
        deleteScenarioById(id);
    }
}

function applyScenarioById(id) {
    const s = state.scenarios.find(sc => sc.id === id);
    if (!s) return;

    const tierEl = document.getElementById("program-tier");
    const careerEl = document.getElementById("career-track");
    const mentorEl = document.getElementById("mentorship");
    const deliveryEl = document.getElementById("delivery");
    const responseEl = document.getElementById("response");
    const costEl = document.getElementById("cost-slider");
    const traineesEl = document.getElementById("trainees");
    const cohortsEl = document.getElementById("cohorts");
    const nameEl = document.getElementById("scenario-name");
    const notesEl = document.getElementById("scenario-notes");
    const modelSelect = document.getElementById("model-select");

    if (tierEl) tierEl.value = s.tier;
    if (careerEl) careerEl.value = s.career;
    if (mentorEl) mentorEl.value = s.mentorship;
    if (deliveryEl) deliveryEl.value = s.delivery;
    if (responseEl) responseEl.value = String(s.response);
    if (costEl) costEl.value = s.costPerTraineePerMonth;
    if (traineesEl) traineesEl.value = s.traineesPerCohort;
    if (cohortsEl) cohortsEl.value = s.numberOfCohorts;
    if (nameEl) nameEl.value = s.name || "";
    if (notesEl) notesEl.value = s.notes || "";

    state.model = s.model || "mxl";
    if (modelSelect) {
        modelSelect.value = state.model;
    }

    populateCostSourceOptions(s.tier);

    const cfg = readConfigurationFromInputs();
    const results = computeFullResults(cfg);
    refreshAll(results);
    updateAssumptionLog(cfg);
    showToast("Scenario loaded into controls.", "success");
}

function deleteScenarioById(id) {
    const before = state.scenarios.length;
    state.scenarios = state.scenarios.filter(sc => sc.id !== id);
    if (state.scenarios.length !== before) {
        updateScenarioTable();
        const baseResults = state.lastResults
            ? state.lastResults
            : computeFullResults(readConfigurationFromInputs());
        updateNationalCharts(baseResults);
        showToast("Scenario removed from comparison table.", "success");
    }
}

/* ===========================
   Configuration controls
   =========================== */

function updateCostSliderDisplay() {
    const slider = document.getElementById("cost-slider");
    const label = document.getElementById("cost-slider-value");
    if (!slider || !label) return;

    const value = parseFloat(slider.value) || 0;
    label.textContent = formatCurrency(value, state.currency);
}

function setupMainControls() {
    const applyBtn = document.getElementById("apply-config-btn");
    if (applyBtn && !applyBtn.dataset.bound) {
        applyBtn.addEventListener("click", () => {
            const cfg = readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results);
            updateAssumptionLog(cfg);
        });
        applyBtn.dataset.bound = "1";
    }

    const saveScenarioBtn = document.getElementById("save-scenario-btn");
    if (saveScenarioBtn && !saveScenarioBtn.dataset.bound) {
        saveScenarioBtn.addEventListener("click", () => {
            saveScenarioFromCurrentResults();
        });
        saveScenarioBtn.dataset.bound = "1";
    }

    const clearScenariosBtn = document.getElementById("clear-scenarios-btn");
    if (clearScenariosBtn && !clearScenariosBtn.dataset.bound) {
        clearScenariosBtn.addEventListener("click", () => {
            state.scenarios = [];
            updateScenarioTable();
            const baseResults = state.lastResults
                ? state.lastResults
                : computeFullResults(readConfigurationFromInputs());
            updateNationalCharts(baseResults);
            showToast("All saved scenarios cleared.", "warning");
        });
        clearScenariosBtn.dataset.bound = "1";
    }

    const modelSelect = document.getElementById("model-select");
    if (modelSelect && !modelSelect.dataset.bound) {
        modelSelect.addEventListener("change", () => {
            const val = (modelSelect.value || "").toLowerCase();
            if (val === "lc2" || val === "supportive") {
                state.model = "lc2";
            } else if (val === "lc1" || val === "conservative") {
                state.model = "lc1";
            } else {
                state.model = "mxl";
            }
            const cfg = readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results);
            updateAssumptionLog(cfg);
        });
        modelSelect.dataset.bound = "1";
    }

    const currencySelect = document.getElementById("currency-select");
    if (currencySelect && !currencySelect.dataset.bound) {
        currencySelect.addEventListener("change", () => {
            const val = (currencySelect.value || "").toUpperCase();
            state.currency = (val === "USD") ? "USD" : "INR";
            if (state.lastResults) {
                refreshAll(state.lastResults, { skipToast: true });
            }
            updateCostSliderDisplay();
        });
        currencySelect.dataset.bound = "1";
    } else {
        const inrBtn = document.getElementById("currency-inr");
        const usdBtn = document.getElementById("currency-usd");
        if (inrBtn && usdBtn && !inrBtn.dataset.bound) {
            const handler = () => {
                state.currency = usdBtn.checked ? "USD" : "INR";
                if (state.lastResults) {
                    refreshAll(state.lastResults, { skipToast: true });
                }
                updateCostSliderDisplay();
            };
            inrBtn.addEventListener("change", handler);
            usdBtn.addEventListener("change", handler);
            inrBtn.dataset.bound = "1";
            usdBtn.dataset.bound = "1";
        }
    }

    const oppToggle = document.getElementById("opp-cost-toggle");
    if (oppToggle && !oppToggle.dataset.bound) {
        state.includeOpportunityCost = !!oppToggle.checked;
        oppToggle.addEventListener("change", () => {
            state.includeOpportunityCost = !!oppToggle.checked;
            const cfg = readConfigurationFromInputs();
            const results = computeFullResults(cfg);
            refreshAll(results);
        });
        oppToggle.dataset.bound = "1";
    }

    const advApplyBtn = document.getElementById("adv-apply-btn");
    if (advApplyBtn && !advApplyBtn.dataset.bound) {
        advApplyBtn.addEventListener("click", applyAdvancedSettings);
        advApplyBtn.dataset.bound = "1";
    }

    const advResetBtn = document.getElementById("adv-reset-btn");
    if (advResetBtn && !advResetBtn.dataset.bound) {
        advResetBtn.addEventListener("click", resetAdvancedSettings);
        advResetBtn.dataset.bound = "1";
    }

    const costSlider = document.getElementById("cost-slider");
    if (costSlider && !costSlider.dataset.bound) {
        costSlider.addEventListener("input", updateCostSliderDisplay);
        costSlider.dataset.bound = "1";
        updateCostSliderDisplay();
    }

    const sensEndorseInput =
        document.getElementById("sens-endorsement-rate") ||
        document.getElementById("dce-endorsement-rate");
    if (sensEndorseInput && !sensEndorseInput.dataset.bound) {
        sensEndorseInput.addEventListener("input", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        sensEndorseInput.dataset.bound = "1";
    }

    const sensDceScale = document.getElementById("sens-dce-benefit-scale");
    if (sensDceScale && !sensDceScale.dataset.bound) {
        sensDceScale.addEventListener("input", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        sensDceScale.dataset.bound = "1";
    }

    const sensEpiScale = document.getElementById("sens-epi-benefit-scale");
    if (sensEpiScale && !sensEpiScale.dataset.bound) {
        sensEpiScale.addEventListener("input", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        sensEpiScale.dataset.bound = "1";
    }

    const dceBenefitDefinition = document.getElementById("dce-benefit-definition");
    if (dceBenefitDefinition && !dceBenefitDefinition.dataset.bound) {
        dceBenefitDefinition.addEventListener("change", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        dceBenefitDefinition.dataset.bound = "1";
    }

    const dceClassFilter = document.getElementById("dce-class-filter");
    if (dceClassFilter && !dceClassFilter.dataset.bound) {
        dceClassFilter.addEventListener("change", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        dceClassFilter.dataset.bound = "1";
    }

    const epiToggle = document.getElementById("dce-epi-benefit-toggle");
    if (epiToggle && !epiToggle.dataset.bound) {
        epiToggle.addEventListener("change", () => {
            if (state.lastResults) updateSensitivityTab(state.lastResults);
        });
        epiToggle.dataset.bound = "1";
    }

    updateScenarioTable();
}

/* ===========================
   Initialisation
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupInfoTooltips();

    const cfg = readConfigurationFromInputs();
    populateCostSourceOptions(cfg.tier);

    const initialResults = computeFullResults(cfg);
    state.lastResults = initialResults;
    refreshAll(initialResults, { skipToast: true });
    updateAssumptionLog(cfg);

    setupMainControls();

    loadEpiConfigIfPresent();
    loadCostConfigIfPresent();
});
