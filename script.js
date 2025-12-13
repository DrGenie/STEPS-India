/*****************************************************
STEPS FETP India Decision Aid
Next generation script with working tooltips,
WTP based benefits, sensitivity, Copilot integration and exports
***************************************************** */

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
valuePerOutbreak: 20000000000
},
intermediate: {
completionRate: 0.9,
outbreaksPerGraduatePerYear: 0.5,
valuePerGraduate: 0,
valuePerOutbreak: 20000000000
},
advanced: {
completionRate: 0.9,
outbreaksPerGraduatePerYear: 0.5,
valuePerGraduate: 0,
valuePerOutbreak: 20000000000
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
bubbleEl: null,
arrowEl: null,
currentTarget: null,
hideTimeout: null
},
tour: {
steps: [],
currentIndex: 0,
overlayEl: null,
popoverEl: null
}
};

/* ===========================
Utility functions
=========================== */

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
if (amountInINR === null || amountInINR === undefined || isNaN(amountInINR))
return "-";
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

function getFirstExistingElement(selectorsOrIds) {
for (const key of selectorsOrIds) {
const el =
(typeof key === "string" && key.startsWith("#")
? document.querySelector(key)
: document.getElementById(key)) || document.querySelector(key);
if (el) return el;
}
return null;
}

function readFirstNumber(selectorsOrIds, fallback = null) {
const el = getFirstExistingElement(selectorsOrIds);
if (!el) return fallback;
const raw = el.value !== undefined ? el.value : el.getAttribute("data-value");
const val = Number(raw);
return isNaN(val) ? fallback : val;
}

function safeSetButtonEnabled(btn) {
if (!btn) return;
if (btn.hasAttribute("disabled")) btn.removeAttribute("disabled");
btn.setAttribute("aria-disabled", "false");
if (btn.classList && btn.classList.contains("disabled")) {
btn.classList.remove("disabled");
}
try {
const pe = window.getComputedStyle(btn).pointerEvents;
if (pe === "none") btn.style.pointerEvents = "auto";
} catch (e) {}
}

/* Toasts */

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
setTimeout(() => {
toastEl.classList.remove("show");
}, 3000);
}

/* ===========================
Tooltip definitions
=========================== */

const TOOLTIP_LIBRARY = {
optout_alt:
"The opt out alternative represents a situation where no new FETP training is funded under the scenario being considered. STEPS treats this as the benchmark of no new FETP investment when calculating endorsement and opt out rates.",
cost_components:
"Cost components group programme expenses for each tier, including salaries and benefits, travel, training inputs, trainee support and indirect items such as opportunity cost. STEPS combines these shares into a single cost per trainee per month for the configuration.",
opp_cost:
"The opportunity cost of trainee time reflects the value of salary time that trainees spend in training instead of normal duties, per trainee per month. If the opportunity cost switch is on, STEPS adds this value to the economic cost of each cohort."
};

/* ===========================
Tooltip system
=========================== */

function initTooltips() {
const bubble = document.createElement("div");
bubble.className = "tooltip-bubble tooltip-hidden";
bubble.setAttribute("role", "tooltip");
bubble.setAttribute("aria-hidden", "true");
const textP = document.createElement("p");
const arrow = document.createElement("div");
arrow.className = "tooltip-arrow";
bubble.appendChild(textP);
bubble.appendChild(arrow);
document.body.appendChild(bubble);

appState.tooltip.bubbleEl = bubble;
appState.tooltip.arrowEl = arrow;

function showTooltip(target) {
const text =
target.getAttribute("data-tooltip") ||
target.getAttribute("aria-label") ||
"";
if (!text) return;

appState.tooltip.currentTarget = target;
textP.textContent = text;
bubble.classList.remove("tooltip-hidden");
bubble.classList.add("tooltip-visible");
bubble.setAttribute("aria-hidden", "false");
positionTooltip(target);


}

function hideTooltip() {
bubble.classList.remove("tooltip-visible");
bubble.classList.add("tooltip-hidden");
bubble.setAttribute("aria-hidden", "true");
appState.tooltip.currentTarget = null;
}

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
let left =
  rect.left +
  window.scrollX +
  rect.width / 2 -
  bubbleRect.width / 2;

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

function attachToIcon(icon) {
if (!icon || icon.dataset.tooltipWired === "1") return;
const dataTip = icon.getAttribute("data-tooltip");
const title = icon.getAttribute("title");
if (!dataTip && title) {
icon.setAttribute("data-tooltip", title);
}
icon.removeAttribute("title");

icon.addEventListener("mouseenter", () => {
  if (appState.tooltip.hideTimeout) {
    clearTimeout(appState.tooltip.hideTimeout);
  }
  showTooltip(icon);
});

icon.addEventListener("mouseleave", () => {
  appState.tooltip.hideTimeout = setTimeout(hideTooltip, 120);
});

icon.addEventListener("focus", () => {
  showTooltip(icon);
});

icon.addEventListener("blur", hideTooltip);

icon.addEventListener("click", (e) => {
  e.stopPropagation();
  if (appState.tooltip.currentTarget === icon) {
    hideTooltip();
  } else {
    showTooltip(icon);
  }
});

icon.dataset.tooltipWired = "1";


}

function scanAndAttach() {
const icons = Array.from(
document.querySelectorAll(".info-icon,[data-tooltip],[data-tooltip-key],[data-tip-key],[data-info-key]")
);
icons.forEach(attachToIcon);
}

scanAndAttach();

const mo = new MutationObserver(() => {
scanAndAttach();
});
mo.observe(document.body, { childList: true, subtree: true });

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

document.addEventListener("click", (e) => {
if (!bubble.contains(e.target)) {
hideTooltip();
}
});
}

/* Definitions for WTP, mixed logit and key sections */

function initDefinitionTooltips() {
const wtpInfo = document.getElementById("wtp-info");
if (wtpInfo) {
wtpInfo.setAttribute(
"data-tooltip",
"WTP per trainee per month is derived from the preference model by dividing attribute coefficients by the cost coefficient. It is an approximate rupee value stakeholders attach to this configuration. Total WTP aggregates this value across trainees and cohorts. All benefit values are indicative approximations."
);
}

const wtpSectionInfo = document.getElementById("wtp-section-info");
if (wtpSectionInfo && !wtpSectionInfo.getAttribute("data-tooltip")) {
wtpSectionInfo.setAttribute(
"data-tooltip",
"WTP indicators summarise how much value stakeholders attach to each configuration in rupees per trainee and over all cohorts. They are based on the mixed logit preference model and should be read as indicative support rather than precise market prices."
);
}

const mxlInfo = document.getElementById("mixedlogit-info");
if (mxlInfo && !mxlInfo.getAttribute("data-tooltip")) {
mxlInfo.setAttribute(
"data-tooltip",
"The mixed logit preference model allows preferences to vary across decision makers instead of assuming a single average pattern, which makes endorsement and WTP estimates more flexible."
);
}

const epiInfo = document.getElementById("epi-implications-info");
if (epiInfo && !epiInfo.getAttribute("data-tooltip")) {
epiInfo.setAttribute(
"data-tooltip",
"Graduates and outbreak responses are obtained by combining endorsement with cohort size and number of cohorts. The indicative outbreak cost saving per cohort converts expected outbreak responses into monetary terms using the outbreak value and planning horizon set in the settings."
);
}

const endorseInfo = document.getElementById("endorsement-optout-info");
if (endorseInfo && !endorseInfo.getAttribute("data-tooltip")) {
endorseInfo.setAttribute(
"data-tooltip",
"These percentages come from the mixed logit preference model and show how attractive the configuration is relative to opting out in the preference study."
);
}

const sensInfo = document.getElementById("sensitivity-headline-info");
if (sensInfo && !sensInfo.getAttribute("data-tooltip")) {
sensInfo.setAttribute(
"data-tooltip",
"In this summary, the cost column shows the economic cost for each scenario over the selected time horizon. Total economic cost and net benefit are aggregated across all cohorts in millions of rupees. Total WTP benefits summarise how much value stakeholders place on each configuration, while the outbreak response column isolates the part of that value linked to faster detection and response. Epidemiological outbreak benefits appear when the outbreak benefit switch is on and the epidemiological module is active. The effective WTP benefit scales total WTP by the endorsement rate used in the calculation. Benefit cost ratios compare total benefits with total costs, and net present values show the difference between benefits and costs in rupee terms. Values above one for benefit cost ratios and positive net present values indicate that estimated benefits exceed costs under the current assumptions."
);
}

const copilotInfo = document.getElementById("copilot-howto-info");
const copilotText = document.getElementById("copilot-howto-text");
if (copilotInfo && !copilotInfo.getAttribute("data-tooltip")) {
copilotInfo.setAttribute(
"data-tooltip",
"First, use the other STEPS tabs to define a scenario you want to interpret. Apply the configuration, review endorsement, WTP, costs and epidemiological outbreak benefits, and check the national and sensitivity views. When you are ready, move to the Copilot tab to prepare a narrative briefing. When you press the Copilot button, STEPS rebuilds the interpretation prompt using the latest scenario and model outputs. The prompt combines a short description of STEPS, instructions for Copilot and the full JSON export for the current scenario. The aim is to guide Copilot to prepare a three to five page policy brief for discussions with ministries, World Bank staff and other partners. The brief is requested as a narrative report with clear sections such as background, scenario description, endorsement patterns, costs, epidemiological benefits, benefit cost ratios, net present values, distributional considerations and implementation notes, and includes compact tables for key indicators. After copying the text from the prompt panel, open Microsoft Copilot in a new browser tab or in the window that STEPS opens, paste the full content into the prompt box and run it. You can then edit the draft policy brief in Copilot or in your preferred word processor, keeping a record of the assumptions and JSON values supplied by STEPS."
);
}
if (copilotText) {
copilotText.textContent =
"Define a scenario in the other tabs, then use this Copilot tab to generate a draft policy brief. Copy the prepared prompt into Microsoft Copilot and refine the brief there.";
}

const optOutAltInfo = document.getElementById("optout-alt-info");
if (optOutAltInfo && !optOutAltInfo.getAttribute("data-tooltip")) {
optOutAltInfo.setAttribute("data-tooltip", TOOLTIP_LIBRARY.optout_alt);
}

const costComponentsInfo = document.getElementById("cost-components-info");
if (costComponentsInfo && !costComponentsInfo.getAttribute("data-tooltip")) {
costComponentsInfo.setAttribute("data-tooltip", TOOLTIP_LIBRARY.cost_components);
}

const oppCostInfo = document.getElementById("opp-cost-info");
if (oppCostInfo && !oppCostInfo.getAttribute("data-tooltip")) {
oppCostInfo.setAttribute("data-tooltip", TOOLTIP_LIBRARY.opp_cost);
}

const prefModelInfo = document.getElementById("preference-model-info");
if (prefModelInfo && !prefModelInfo.getAttribute("data-tooltip")) {
prefModelInfo.setAttribute(
"data-tooltip",
"The preference model is a mixed logit estimated from the preference study. It predicts endorsement and opt out shares and provides willingness to pay values that STEPS uses to summarise how much value stakeholders attach to each configuration."
);
}

const resEndorseInfo = document.getElementById("result-endorsement-info");
if (resEndorseInfo && !resEndorseInfo.getAttribute("data-tooltip")) {
resEndorseInfo.setAttribute(
"data-tooltip",
"The endorsement rate is the predicted share of decision makers who would choose this FETP configuration rather than the opt out alternative, based on the mixed logit preference model."
);
}

const resOptOutInfo = document.getElementById("result-optout-info");
if (resOptOutInfo && !resOptOutInfo.getAttribute("data-tooltip")) {
resOptOutInfo.setAttribute(
"data-tooltip",
"The opt out rate is the predicted share of decision makers who would prefer not to fund any new FETP training under this configuration. It complements the endorsement rate and always sums to one hundred percent with it."
);
}

const resWtpTraineeInfo = document.getElementById("result-wtp-trainee-info");
if (resWtpTraineeInfo && !resWtpTraineeInfo.getAttribute("data-tooltip")) {
resWtpTraineeInfo.setAttribute(
"data-tooltip",
"Willingness to pay per trainee per month is calculated by dividing the non cost utility for the configuration by the absolute value of the cost coefficient and multiplying by one thousand. It is an approximate rupee value that stakeholders attach to the training package for each trainee per month."
);
}

const resWtpCohortInfo = document.getElementById("result-wtp-cohort-info");
if (resWtpCohortInfo && !resWtpCohortInfo.getAttribute("data-tooltip")) {
resWtpCohortInfo.setAttribute(
"data-tooltip",
"Total willingness to pay per cohort multiplies the willingness to pay per trainee per month by the number of months in the programme and the trainees per cohort. It summarises the indicative value stakeholders attach to one cohort of the chosen configuration."
);
}

const resProgCostInfo = document.getElementById("result-prog-cost-info");
if (resProgCostInfo && !resProgCostInfo.getAttribute("data-tooltip")) {
resProgCostInfo.setAttribute(
"data-tooltip",
"Programme cost per cohort is the direct financial cost of running one cohort, calculated as the cost per trainee per month times the number of months in the programme and the number of trainees."
);
}

const resTotalCostInfo = document.getElementById("result-total-cost-info");
if (resTotalCostInfo && !resTotalCostInfo.getAttribute("data-tooltip")) {
resTotalCostInfo.setAttribute(
"data-tooltip",
"Total economic cost per cohort adds the opportunity cost of trainee time to the programme cost when the opportunity cost switch is on. It is the cost concept used in the benefit cost ratios and net benefits."
);
}

const resNetBenefitInfo = document.getElementById("result-net-benefit-info");
if (resNetBenefitInfo && !resNetBenefitInfo.getAttribute("data-tooltip")) {
resNetBenefitInfo.setAttribute(
"data-tooltip",
"Net outbreak benefit per cohort is the difference between the discounted outbreak related epidemiological benefit and the total economic cost per cohort. Positive values indicate that outbreak benefits exceed costs under the current assumptions."
);
}

const resBcrInfo = document.getElementById("result-bcr-info");
if (resBcrInfo && !resBcrInfo.getAttribute("data-tooltip")) {
resBcrInfo.setAttribute(
"data-tooltip",
"The benefit cost ratio per cohort divides the discounted outbreak benefit per cohort by the total economic cost per cohort. Values above one indicate that estimated benefits exceed costs."
);
}

const resEpiGradsInfo = document.getElementById("result-epi-graduates-info");
if (resEpiGradsInfo && !resEpiGradsInfo.getAttribute("data-tooltip")) {
resEpiGradsInfo.setAttribute(
"data-tooltip",
"The number of graduates across all cohorts is based on the trainees per cohort, the completion rate for the chosen tier and the endorsement rate from the preference model. It describes how many additional field epidemiologists complete training under the configuration."
);
}

const resEpiOutbreaksInfo = document.getElementById("result-epi-outbreaks-info");
if (resEpiOutbreaksInfo && !resEpiOutbreaksInfo.getAttribute("data-tooltip")) {
resEpiOutbreaksInfo.setAttribute(
"data-tooltip",
"Outbreak responses per year combine the number of graduates with the assumed outbreaks handled per graduate per year and the response time multiplier. Faster response times increase the number of outbreak responses credited to the programme."
);
}

const resEpiBenefitInfo = document.getElementById("result-epi-benefit-info");
if (resEpiBenefitInfo && !resEpiBenefitInfo.getAttribute("data-tooltip")) {
resEpiBenefitInfo.setAttribute(
"data-tooltip",
"The outbreak related epidemiological benefit per cohort converts expected outbreak responses into monetary terms using the value per outbreak and the present value factor implied by the discount rate and planning horizon."
);
}

const natTotalCostInfo = document.getElementById("natsim-total-cost-info");
if (natTotalCostInfo && !natTotalCostInfo.getAttribute("data-tooltip")) {
natTotalCostInfo.setAttribute(
"data-tooltip",
"Total economic cost across all cohorts is the economic cost per cohort multiplied by the number of cohorts configured. It is the main cost input to national level benefit cost calculations."
);
}

const natTotalBenefitInfo = document.getElementById("natsim-total-benefit-info");
if (natTotalBenefitInfo && !natTotalBenefitInfo.getAttribute("data-tooltip")) {
natTotalBenefitInfo.setAttribute(
"data-tooltip",
"Total outbreak related economic benefit across all cohorts is the discounted outbreak benefit per cohort multiplied by the number of cohorts. It reflects the monetary value attached to outbreak responses over the planning horizon."
);
}

const natNetBenefitInfo = document.getElementById("natsim-net-benefit-info");
if (natNetBenefitInfo && !natNetBenefitInfo.getAttribute("data-tooltip")) {
natNetBenefitInfo.setAttribute(
"data-tooltip",
"Net outbreak related benefit at national level is the difference between total outbreak related benefits and total economic costs across all cohorts. Positive values indicate that the programme is expected to save more in outbreak related costs than it spends."
);
}

const natBcrInfo = document.getElementById("natsim-bcr-info");
if (natBcrInfo && !natBcrInfo.getAttribute("data-tooltip")) {
natBcrInfo.setAttribute(
"data-tooltip",
"The national benefit cost ratio compares total outbreak related benefits with total economic costs across all cohorts. Values above one suggest that the programme generates more outbreak related savings than it costs."
);
}

const natGradsInfo = document.getElementById("natsim-graduates-info");
if (natGradsInfo && !natGradsInfo.getAttribute("data-tooltip")) {
natGradsInfo.setAttribute(
"data-tooltip",
"Total graduates over the planning horizon combine the number of cohorts, trainees per cohort, completion rates and endorsement rates. They show the scale of trained field epidemiologists produced under the configuration."
);
}

const natOutbreaksInfo = document.getElementById("natsim-outbreaks-info");
if (natOutbreaksInfo && !natOutbreaksInfo.getAttribute("data-tooltip")) {
natOutbreaksInfo.setAttribute(
"data-tooltip",
"Outbreak responses per year at national level aggregate the expected outbreak responses handled by all graduates across all cohorts, after adjusting for the response time multiplier."
);
}

const natTotalWtpInfo = document.getElementById("natsim-total-wtp-info");
if (natTotalWtpInfo && !natTotalWtpInfo.getAttribute("data-tooltip")) {
natTotalWtpInfo.setAttribute(
"data-tooltip",
"Total willingness to pay across all cohorts multiplies the cohort level willingness to pay by the number of cohorts. It summarises the indicative value stakeholders place on the full scale up configuration."
);
}

function bindDefinitionTooltipsByKeyOrContext() {
const keyEls = Array.from(document.querySelectorAll("[data-tooltip-key],[data-tip-key],[data-info-key]"));
keyEls.forEach((el) => {
const key =
el.getAttribute("data-tooltip-key") ||
el.getAttribute("data-tip-key") ||
el.getAttribute("data-info-key");
if (!key) return;
if (el.getAttribute("data-tooltip")) return;
const normalized = String(key).toLowerCase().trim();
if (normalized.includes("opt") && normalized.includes("out")) {
el.setAttribute("data-tooltip", TOOLTIP_LIBRARY.optout_alt);
} else if (normalized.includes("cost") && normalized.includes("component")) {
el.setAttribute("data-tooltip", TOOLTIP_LIBRARY.cost_components);
} else if (normalized.includes("opp") || (normalized.includes("opportunity") && normalized.includes("cost"))) {
el.setAttribute("data-tooltip", TOOLTIP_LIBRARY.opp_cost);
}
});

const icons = Array.from(document.querySelectorAll(".info-icon,[data-tooltip]"));
icons.forEach((icon) => {
  if (icon.getAttribute("data-tooltip")) return;
  const row = icon.closest("tr, .attribute-row, .definition-row, .levels-row, .table-row, .card, .panel");
  const contextText = (row ? row.textContent : icon.parentElement ? icon.parentElement.textContent : "").toLowerCase();
  if (!contextText) return;

  if (contextText.includes("opt out alternative") || contextText.includes("opt-out alternative")) {
    icon.setAttribute("data-tooltip", TOOLTIP_LIBRARY.optout_alt);
  } else if (contextText.includes("cost components") || contextText.includes("cost component")) {
    icon.setAttribute("data-tooltip", TOOLTIP_LIBRARY.cost_components);
  } else if (contextText.includes("opportunity") && contextText.includes("cost")) {
    icon.setAttribute("data-tooltip", TOOLTIP_LIBRARY.opp_cost);
  }
});


}

bindDefinitionTooltipsByKeyOrContext();
}

/* ===========================
Tabs
=========================== */

function initTabs() {
const tabLinks = Array.from(document.querySelectorAll(".tab-link"));
const panels = Array.from(document.querySelectorAll(".tab-panel"));

tabLinks.forEach((btn) => {
btn.addEventListener("click", () => {
const target = btn.getAttribute("data-tab");
tabLinks.forEach((b) => b.classList.remove("active"));
panels.forEach((panel) => panel.classList.remove("active"));

  btn.classList.add("active");
  const panel = document.getElementById(`tab-${target}`);
  if (panel) panel.classList.add("active");
});


});
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
popover.innerHTML = <div class="tour-popover-header"> <h3 id="tour-title"></h3> <button class="tour-close-btn" type="button" aria-label="Close tour">×</button> </div> <div class="tour-popover-body" id="tour-body"></div> <div class="tour-popover-footer"> <span class="tour-step-indicator" id="tour-indicator"></span> <div class="tour-buttons"> <button type="button" class="btn-ghost-small" id="tour-prev">Previous</button> <button type="button" class="btn-primary-small" id="tour-next">Next</button> </div> </div> ;

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

trigger.addEventListener("click", () => {
showStep(0);
});

overlay.addEventListener("click", endTour);
popover.querySelector(".tour-close-btn").addEventListener("click", endTour);
popover.querySelector("#tour-prev").addEventListener("click", () => {
showStep(appState.tour.currentIndex - 1);
});
popover.querySelector("#tour-next").addEventListener("click", () => {
if (appState.tour.currentIndex >= appState.tour.steps.length - 1) {
endTour();
} else {
showStep(appState.tour.currentIndex + 1);
}
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
document.getElementById("scenario-name").value.trim() || ${tier} ${mentorship} ${cohorts} cohorts;
const scenarioNotes = document.getElementById("scenario-notes").value.trim();

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

function computeCosts(config) {
const months = TIER_MONTHS[config.tier] || 12;
const directCostPerTraineePerMonth = config.costPerTraineePerMonth;
const trainees = config.traineesPerCohort;

const programmeCostPerCohort = directCostPerTraineePerMonth * months * trainees;

const templatesForTier = COST_TEMPLATES[config.tier];
const template =
(COST_CONFIG && COST_CONFIG[config.tier] && COST_CONFIG[config.tier].combined) ||
(templatesForTier && templatesForTier.combined);

let oppRate = template ? template.oppRate : 0;
if (!config.opportunityCostIncluded) {
oppRate = 0;
}

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
const tierSettings = appState.epiSettings.tiers[config.tier];
const general = appState.epiSettings.general;

const completionRate = tierSettings.completionRate;
const outbreaksPerGrad = tierSettings.outbreaksPerGraduatePerYear;
const valuePerOutbreak = tierSettings.valuePerOutbreak;

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

const graduateBenefitPerCohort = 0;

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
const ctx = document.getElementById(ctxId)?.getContext("2d");
if (!ctx) return null;
return new Chart(ctx, { type, data, options });
}

function updateUptakeChart(scenario) {
const ctxId = "chart-uptake";
const existing = appState.charts.uptake;
const data = {
labels: ["Endorse FETP option", "Choose opt out"],
datasets: [
{
label: "Share of stakeholders",
data: [scenario.endorseRate, scenario.optOutRate]
}
]
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
datasets: [
{
label: "Epidemiological outputs",
data: [scenario.graduatesAllCohorts, scenario.outbreaksPerYearNational]
}
]
};
const options = {
responsive: true,
plugins: { legend: { display: false } },
scales: { y: { beginAtZero: true } }
};
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
datasets: [
{
label: "National totals (INR)",
data: [scenario.natTotalCost, totalBenefit]
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
appState.charts.natCostBenefit = ensureChart(ctxId, "bar", data, options);
}
}

function updateNatEpiChart(scenario) {
const ctxId = "chart-nat-epi";
const existing = appState.charts.natEpi;
const data = {
labels: ["Total graduates", "Outbreak responses per year"],
datasets: [
{
label: "National epidemiological outputs",
data: [scenario.graduatesAllCohorts, scenario.outbreaksPerYearNational]
}
]
};
const options = {
responsive: true,
plugins: { legend: { display: false } },
scales: { y: { beginAtZero: true } }
};
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
if (c === appState.currency) {
btn.classList.add("active");
} else {
btn.classList.remove("active");
}
});
if (label) {
label.textContent = appState.currency;
}
if (appState.currentScenario) {
refreshAllOutputs(appState.currentScenario);
}
}

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
{
label: "Response time",
value: "Detect and respond within 7 days"
},
{
label: "Cost per trainee per month",
value: formatCurrencyDisplay(c.costPerTraineePerMonth, 0)
},
{
label: "Trainees per cohort",
value: formatNumber(c.traineesPerCohort, 0)
},
{
label: "Number of cohorts",
value: formatNumber(c.cohorts, 0)
},
{
label: "Planning horizon (years)",
value: formatNumber(c.planningHorizonYears || appState.epiSettings.general.planningHorizonYears, 0)
},
{
label: "Opportunity cost",
value: c.opportunityCostIncluded ? "Included in economic cost" : "Not included"
}
];

rows.forEach((row) => {
const div = document.createElement("div");
div.className = "config-summary-row";
div.innerHTML = <span class="config-summary-label">${row.label}</span> <span class="config-summary-value">${row.value}</span> ;
container.appendChild(div);
});

const endorsementEl = document.getElementById("config-endorsement-value");
if (endorsementEl) {
endorsementEl.textContent = formatNumber(scenario.endorseRate, 1) + "%";
}

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
  statusText = "Challenging configuration";
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
The mixed logit preference model points to an endorsement rate of about ${endorse} percent, an economic cost of ${cost} per cohort and an indicative outbreak cost saving to cost ratio near ${bcr}. These values give a concise starting point for discussions with ministries and partners.;
}

const briefingEl = document.getElementById("headline-briefing-text");
if (briefingEl) {
const natCost = formatCurrencyDisplay(scenario.natTotalCost, 0);
const natBenefit = formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0);
const natBcr = scenario.natBcr !== null ? formatNumber(scenario.natBcr, 2) : "-";
briefingEl.textContent =
With this configuration, about ${formatNumber(scenario.endorseRate, 1)} percent of stakeholders are expected to endorse the investment. Running ${formatNumber( scenario.config.cohorts, 0 )} cohorts of ${formatNumber( scenario.config.traineesPerCohort, 0 )} trainees leads to a total economic cost of roughly ${natCost} over the planning horizon and an indicative outbreak related economic cost saving of roughly ${natBenefit}. The national benefit cost ratio is around ${natBcr}, based on the outbreak value and epidemiological assumptions set in the settings and methods.;
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
if (templates && templates.combined) {
select.value = templates.combined.id;
}
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
div.innerHTML = <div class="cost-summary-label">${c.label}</div> <div class="cost-summary-value">${c.value}</div> ;
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
tr.innerHTML = <td>${comp.label}</td> <td class="numeric-cell">${formatNumber(comp.directShare * 100, 1)}%</td> <td class="numeric-cell">${formatCurrencyDisplay(amount, 0)}</td> <td class="numeric-cell">${formatCurrencyDisplay(perTraineePerMonth, 0)}</td> <td>Included in combined template for this tier.</td> ;
tbody.appendChild(tr);
});
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
At national level, this configuration would produce about ${formatNumber( scenario.graduatesAllCohorts, 0 )} graduates over the planning horizon and support around ${formatNumber( scenario.outbreaksPerYearNational, 1 )} outbreak responses per year once all cohorts are complete. The total economic cost across all cohorts is roughly ${formatCurrencyDisplay( natCost, 0 )}, while the indicative outbreak related economic cost saving is roughly ${formatCurrencyDisplay( natBenefit, 0 )}. This implies a national benefit cost ratio of about ${ natBcr !== null ? formatNumber(natBcr, 2) : "-" } and a net outbreak related cost saving of ${formatCurrencyDisplay( natNet, 0 )}. Total willingness to pay across all cohorts is roughly ${formatCurrencyDisplay( natTotalWtp, 0 )}, which can be viewed alongside outbreak benefits when preparing business cases.;
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
const careerLabel =
c.career === "certificate" ? "Certificate" : c.career === "uniqual" ? "University qualification" : "Government career pathway";

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

/* ===========================
Excel and PDF export
=========================== */

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
c.response,
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
doc.text(${idx + 1}. ${c.name || "Scenario"}, 10, y);
y += 5;
doc.text(
Tier: ${c.tier} | Career: ${c.career} | Mentorship: ${c.mentorship} | Delivery: ${c.delivery} | Response: ${c.response} days,
10,
y
);
y += 5;
doc.text(
Cohorts: ${c.cohorts}, Trainees per cohort: ${c.traineesPerCohort}, Cost per trainee per month (INR): ${formatNumber( c.costPerTraineePerMonth, 0 )},
10,
y
);
y += 5;
doc.text(
Endorsement: ${formatNumber(s.endorseRate, 1)}% | WTP per trainee per month (INR): ${formatNumber(s.wtpPerTraineePerMonth, 0)},
10,
y
);
y += 5;
doc.text(Total WTP all cohorts (INR): ${formatNumber(s.wtpAllCohorts, 0)}, 10, y);
y += 5;
doc.text(
Total economic cost all cohorts (INR): ${formatNumber(s.natTotalCost, 0)} | Indicative outbreak cost saving (INR): ${formatNumber( s.epiBenefitAllCohorts, 0 )},
10,
y
);
y += 5;
doc.text(
Net outbreak cost saving (INR): ${formatNumber(s.netBenefitAllCohorts, 0)} | Benefit cost ratio: ${ s.natBcr !== null ? formatNumber(s.natBcr, 2) : "-" },
10,
y
);
y += 7;
});

doc.save("steps_saved_scenarios.pdf");
showToast("Policy summary PDF downloaded.", "success");
}

/* ===========================
WTP based benefits and sensitivity
=========================== */

function getSensitivityControls() {
const benefitModeSelect = document.getElementById("benefit-definition-select");
const epiToggle = document.getElementById("sensitivity-epi-toggle");
const endorsementOverrideInput = document.getElementById("endorsement-override");

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

return {
costAll,
epiAll,
netAll,
epiBcr,
wtpAll,
wtpOutbreak,
combinedBenefit,
npvDceOnly,
npvCombined
};
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
label: s.config.name || Saved scenario ${idx + 1},
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
const npvCombined = s.npvCombined;

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
  <td class="numeric-cell">${formatCurrencyINR(((combinedBenefit * (endorsementUsed / 100)) / c.cohorts), 0)}</td>
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

function exportSensitivityToPdf() {
if (!window.jspdf || !window.jspdf.jsPDF) {
showToast("PDF export is not available in this browser.", "error");
return;
}

const table = document.getElementById("dce-benefits-table");
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
if (headRow) {
head.push(Array.from(headRow.children).map((th) => th.textContent.trim()));
}

const body = [];
const bodyRows = table.querySelectorAll("tbody tr");
bodyRows.forEach((tr) => {
const row = Array.from(tr.children).map((td) => td.textContent.trim());
body.push(row);
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
const headerLine = head[0].join(" | ");
doc.text(headerLine, 10, y);
y += 6;
}
body.forEach((row, idx) => {
if (y > 190) {
doc.addPage();
y = 10;
if (head.length) {
const headerLine = head[0].join(" | ");
doc.text(headerLine, 10, y);
y += 6;
}
}
const text = row.join(" | ");
doc.text(${idx + 1}. ${text}, 10, y);
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
const candidates = [
"settings-log",
"settings-log-session",
"settings-log-box",
"settingsLog",
"adv-settings-log"
];
candidates.forEach((id) => {
const el = document.getElementById(id);
if (el) targets.push(el);
});

document.querySelectorAll('[data-role="settings-log"],[data-settings-log="true"],.settings-log').forEach((el) => {
if (el && !targets.includes(el)) targets.push(el);
});

if (!targets.length) return;

const time = new Date().toLocaleString();
targets.forEach((box) => {
const p = document.createElement("p");
p.textContent = [${time}] ${message};
box.appendChild(p);
try {
box.scrollTop = box.scrollHeight;
} catch (e) {}
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
safeSetButtonEnabled(applyBtn);
applyBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
if (
valueGradInput &&
valueOutbreakInput &&
completionInput &&
outbreaksPerGradInput &&
horizonInput &&
discInput &&
usdRateInput
) {
const vGrad = Number(valueGradInput.value);
const vOut = Number(valueOutbreakInput.value);
const compRate = Number(completionInput.value) / 100;
const outPerGrad = Number(outbreaksPerGradInput.value);
const horizon = Number(horizonInput.value);
const discRate = Number(discInput.value) / 100;
const usdRate = Number(usdRateInput.value);

    ["frontline", "intermediate", "advanced"].forEach((tier) => {
      appState.epiSettings.tiers[tier].valuePerGraduate = vGrad;
      appState.epiSettings.tiers[tier].valuePerOutbreak = vOut;
      appState.epiSettings.tiers[tier].completionRate = clamp(compRate, 0, 1);
      appState.epiSettings.tiers[tier].outbreaksPerGraduatePerYear = outPerGrad;
    });
    appState.epiSettings.general.planningHorizonYears = horizon;
    appState.epiSettings.general.epiDiscountRate = clamp(discRate, 0, 1);
    appState.epiSettings.general.inrToUsdRate = usdRate;
    appState.usdRate = usdRate;

    writeLog(
      "Advanced settings updated for graduate value, value per outbreak, completion rate, outbreaks per graduate, planning horizon, discount rate and INR per USD. Current outbreak cost saving calculations use the outbreak value and planning horizon."
    );

    updateCurrencyToggle();

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
safeSetButtonEnabled(resetBtn);
resetBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
appState.epiSettings = JSON.parse(JSON.stringify(DEFAULT_EPI_SETTINGS));
appState.usdRate = DEFAULT_EPI_SETTINGS.general.inrToUsdRate;

  if (valueGradInput) valueGradInput.value = "0";
  if (valueOutbreakInput) valueOutbreakInput.value = "20000000000";
  if (completionInput) completionInput.value = "90";
  if (outbreaksPerGradInput) outbreaksPerGradInput.value = "0.5";
  if (horizonInput) horizonInput.value = String(DEFAULT_EPI_SETTINGS.general.planningHorizonYears);
  if (discInput) discInput.value = String(DEFAULT_EPI_SETTINGS.general.epiDiscountRate * 100);
  if (usdRateInput) usdRateInput.value = String(DEFAULT_EPI_SETTINGS.general.inrToUsdRate);

  writeLog("Advanced settings reset to default values.");

  updateCurrencyToggle();

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

const valueOutbreakInput = document.getElementById("adv-value-per-outbreak");
if (valueOutbreakInput) {
valueOutbreakInput.value = String(valueInINR);
}

if (appState.currentScenario) {
const newScenario = computeScenario(appState.currentScenario.config);
appState.currentScenario = newScenario;
refreshAllOutputs(newScenario);
}

logSettingsMessage(Value per outbreak updated to ₹${formatNumber(valueInINR, 0)} per outbreak for all tiers from sensitivity controls.);

showToast(Value per outbreak set to ₹${formatNumber(valueInINR, 0)} for all tiers., "success");
}

/* ===========================
Settings tab apply support
=========================== */

function applySettingsFromSettingsTab() {
const horizon = readFirstNumber(
["planning-horizon", "settings-planning-horizon", "settings-horizon", "planning-horizon-years", "#planning-horizon", "#settings-planning-horizon"],
null
);
const discRaw = readFirstNumber(
["epi-discount-rate", "settings-epi-discount-rate", "settings-discount-rate", "discount-rate", "#epi-discount-rate", "#settings-epi-discount-rate"],
null
);
const usdRate = readFirstNumber(
["inr-to-usd-rate", "settings-inr-to-usd", "adv-usd-rate", "usd-rate", "settings-usd-rate", "#inr-to-usd-rate", "#settings-usd-rate"],
null
);
const completionRaw = readFirstNumber(
["completion-rate", "settings-completion-rate", "adv-completion-rate", "settings-completion", "#completion-rate", "#settings-completion-rate"],
null
);
const outPerGrad = readFirstNumber(
["outbreaks-per-graduate", "settings-outbreaks-per-graduate", "adv-outbreaks-per-graduate", "#outbreaks-per-graduate"],
null
);
const outbreakValueRaw = readFirstNumber(
["value-per-outbreak", "settings-value-per-outbreak", "outbreak-value", "settings-outbreak-value", "adv-value-per-outbreak", "#value-per-outbreak"],
null
);

const changes = [];

if (horizon !== null && horizon > 0) {
appState.epiSettings.general.planningHorizonYears = horizon;
changes.push(Planning horizon set to ${formatNumber(horizon, 0)} years);
}

if (discRaw !== null && discRaw >= 0) {
let disc = discRaw;
if (disc > 1) disc = disc / 100;
disc = clamp(disc, 0, 1);
appState.epiSettings.general.epiDiscountRate = disc;
changes.push(epidemiological discount rate set to ${formatNumber(disc * 100, 1)} percent);
}

if (usdRate !== null && usdRate > 0) {
appState.epiSettings.general.inrToUsdRate = usdRate;
appState.usdRate = usdRate;
changes.push(INR per USD exchange rate set to ${formatNumber(usdRate, 2)});
}

if (completionRaw !== null && completionRaw >= 0) {
let comp = completionRaw;
if (comp > 1) comp = comp / 100;
comp = clamp(comp, 0, 1);
["frontline", "intermediate", "advanced"].forEach((tier) => {
appState.epiSettings.tiers[tier].completionRate = comp;
});
changes.push(completion rate set to ${formatNumber(comp * 100, 1)} percent for all tiers);
}

if (outPerGrad !== null && outPerGrad >= 0) {
["frontline", "intermediate", "advanced"].forEach((tier) => {
appState.epiSettings.tiers[tier].outbreaksPerGraduatePerYear = outPerGrad;
});
changes.push(outbreaks per graduate per year set to ${formatNumber(outPerGrad, 3)});
}

if (outbreakValueRaw !== null && outbreakValueRaw > 0) {
let vOut = outbreakValueRaw;
if (vOut < 1e6) vOut = vOut * 1e9;
["frontline", "intermediate", "advanced"].forEach((tier) => {
appState.epiSettings.tiers[tier].valuePerOutbreak = vOut;
});
changes.push(value per outbreak set to ₹${formatNumber(vOut, 0)});
}

updateCurrencyToggle();

if (appState.currentScenario) {
const newScenario = computeScenario(appState.currentScenario.config);
appState.currentScenario = newScenario;
refreshAllOutputs(newScenario);
}

if (changes.length) {
logSettingsMessage(Settings applied. ${changes.join("; ")}.);
} else {
logSettingsMessage("Settings applied. No new values were detected in the settings fields, so existing session settings were kept.");
}

showToast("Settings applied for this session.", "success");
}

function wireSettingsApplyButtons() {
const candidates = [];
const ids = ["settings-apply", "settings-apply-btn", "apply-settings", "btn-apply-settings", "settingsApply", "applySettings"];
ids.forEach((id) => {
const el = document.getElementById(id);
if (el) candidates.push(el);
});
document
.querySelectorAll('[data-settings-apply="true"],[data-role="settings-apply"],button[name="applySettings"],button[name="settingsApply"]')
.forEach((el) => {
if (el && !candidates.includes(el)) candidates.push(el);
});

candidates.forEach((btn) => {
safeSetButtonEnabled(btn);
if (btn.dataset.settingsApplyWired === "1") return;
btn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
applySettingsFromSettingsTab();
});
btn.dataset.settingsApplyWired = "1";
});
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
responseTimeDays: Number(c.response),
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
const btn = document.getElementById("copilot-open-and-copy-btn");
const textarea = document.getElementById("copilot-prompt-output");
const statusPill = document.getElementById("copilot-status-pill");
const statusText = document.getElementById("copilot-status-text");

function setStatus(text) {
if (statusPill) {
statusPill.textContent = text;
}
}

if (!btn || !textarea) return;

safeSetButtonEnabled(btn);

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
  statusText.textContent =
    "The Copilot prompt is ready. When the Copilot window opens in a new tab, paste this text into the Copilot chat box and run it.";
}

let copied = false;
if (navigator.clipboard && navigator.clipboard.writeText) {
  try {
    await navigator.clipboard.writeText(fullText);
    copied = true;
    showToast("Prompt copied. When Copilot opens, paste the text into the new window.", "success");
  } catch (e) {
    copied = false;
  }
}

if (!copied) {
  showToast("Prompt prepared. Copy it from the panel and paste into the Copilot window that opens.", "warning");
}

window.open("https://copilot.microsoft.com/", "_blank");


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
snapshotModal.innerHTML = <div class="modal-content"> <button class="modal-close" type="button" aria-label="Close">×</button> <h2>Scenario summary</h2> <div id="snapshot-body"></div> </div> ;
document.body.appendChild(snapshotModal);

const closeBtn = snapshotModal.querySelector(".modal-close");
closeBtn.addEventListener("click", () => {
snapshotModal.classList.add("hidden");
});
snapshotModal.addEventListener("click", (e) => {
if (e.target === snapshotModal) {
snapshotModal.classList.add("hidden");
}
});
}

function openSnapshotModal(scenario) {
ensureSnapshotModal();
const body = snapshotModal.querySelector("#snapshot-body");
if (body) {
const c = scenario.config;
body.innerHTML = <p><strong>Scenario name:</strong> ${c.name || ""}</p> <p><strong>Tier:</strong> ${c.tier}</p> <p><strong>Career incentive:</strong> ${c.career}</p> <p><strong>Mentorship:</strong> ${c.mentorship}</p> <p><strong>Delivery mode:</strong> ${c.delivery}</p> <p><strong>Response time:</strong> ${c.response} days</p> <p><strong>Cohorts and trainees:</strong> ${formatNumber(c.cohorts, 0)} cohorts of ${formatNumber(c.traineesPerCohort, 0)} trainees</p> <p><strong>Cost per trainee per month:</strong> ${formatCurrencyDisplay(c.costPerTraineePerMonth, 0)}</p> <p><strong>Endorsement:</strong> ${formatNumber(scenario.endorseRate, 1)}%</p> <p><strong>Economic cost per cohort:</strong> ${formatCurrencyDisplay(scenario.costs.totalEconomicCostPerCohort, 0)}</p> <p><strong>Indicative outbreak cost saving per cohort:</strong> ${formatCurrencyDisplay(scenario.epiBenefitPerCohort, 0)}</p> <p><strong>Benefit cost ratio per cohort:</strong> ${scenario.bcrPerCohort !== null ? formatNumber(scenario.bcrPerCohort, 2) : "-"}</p> <p><strong>Total economic cost all cohorts:</strong> ${formatCurrencyDisplay(scenario.natTotalCost, 0)}</p> <p><strong>Indicative outbreak cost saving all cohorts:</strong> ${formatCurrencyDisplay(scenario.epiBenefitAllCohorts, 0)}</p> <p><strong>Net outbreak cost saving all cohorts:</strong> ${formatCurrencyDisplay(scenario.netBenefitAllCohorts, 0)}</p> ;
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
}

function enforceResponseTimeFixed() {
const responseEl = document.getElementById("response");
if (!responseEl) return;
try {
responseEl.value = "7";
const opts = Array.from(responseEl.options || []);
opts.forEach((o) => {
if (String(o.value) !== "7") o.disabled = true;
});
responseEl.addEventListener("change", () => {
if (String(responseEl.value) !== "7") {
responseEl.value = "7";
showToast("Response time is fixed at 7 days for all scenarios.", "info");
}
});
} catch (e) {}
}

function initEventHandlers() {
const costSlider = document.getElementById("cost-slider");
if (costSlider) {
costSlider.addEventListener("input", () => {
updateCostSliderLabel();
});
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
safeSetButtonEnabled(updateBtn);
updateBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
const config = getConfigFromForm();
const scenario = computeScenario(config);
appState.currentScenario = scenario;
refreshAllOutputs(scenario);
showToast("Configuration applied and results updated.", "success");
});
}

wireSettingsApplyButtons();

const snapshotBtn = document.getElementById("open-snapshot");
if (snapshotBtn) {
safeSetButtonEnabled(snapshotBtn);
snapshotBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
if (!appState.currentScenario) {
showToast("Apply a configuration before opening the summary.", "warning");
return;
}
openSnapshotModal(appState.currentScenario);
});
}

const saveScenarioBtn = document.getElementById("save-scenario");
if (saveScenarioBtn) {
safeSetButtonEnabled(saveScenarioBtn);
saveScenarioBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
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
if (exportExcelBtn) {
safeSetButtonEnabled(exportExcelBtn);
exportExcelBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
exportScenariosToExcel();
});
}

const exportPdfBtn = document.getElementById("export-pdf");
if (exportPdfBtn) {
safeSetButtonEnabled(exportPdfBtn);
exportPdfBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
exportScenariosToPdf();
});
}

const sensUpdateBtn = document.getElementById("refresh-sensitivity-benefits");
if (sensUpdateBtn) {
safeSetButtonEnabled(sensUpdateBtn);
sensUpdateBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
if (!appState.currentScenario) {
showToast("Apply a configuration before updating the sensitivity summary.", "warning");
return;
}
refreshSensitivityTables();
showToast("Sensitivity summary updated.", "success");
});
}

const sensExcelBtn = document.getElementById("export-sensitivity-benefits-excel");
if (sensExcelBtn) {
safeSetButtonEnabled(sensExcelBtn);
sensExcelBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
exportSensitivityToExcel();
});
}

const sensPdfBtn = document.getElementById("export-sensitivity-benefits-pdf");
if (sensPdfBtn) {
safeSetButtonEnabled(sensPdfBtn);
sensPdfBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
exportSensitivityToPdf();
});
}

const epiToggle = document.getElementById("sensitivity-epi-toggle");
if (epiToggle) {
epiToggle.addEventListener("click", () => {
const on = epiToggle.classList.toggle("on");
const label = epiToggle.querySelector(".switch-label");
if (label) {
label.textContent = on ? "Outbreak benefits included" : "Outbreak benefits excluded";
}
if (appState.currentScenario) {
refreshSensitivityTables();
}
});
}

const outbreakPresetSelect = document.getElementById("outbreak-value-preset");
if (outbreakPresetSelect) {
outbreakPresetSelect.addEventListener("change", () => {
const raw = Number(outbreakPresetSelect.value);
if (!isNaN(raw) && raw > 0) {
const valueInINR = raw * 1e9;
applyOutbreakPreset(valueInINR);
}
});
}

const outbreakApplyBtn = document.getElementById("apply-outbreak-value");
if (outbreakApplyBtn && outbreakPresetSelect) {
safeSetButtonEnabled(outbreakApplyBtn);
outbreakApplyBtn.addEventListener("click", (e) => {
if (e && e.preventDefault) e.preventDefault();
const raw = Number(outbreakPresetSelect.value);
if (!isNaN(raw) && raw > 0) {
const valueInINR = raw * 1e9;
applyOutbreakPreset(valueInINR);
} else {
showToast("Select a value per outbreak before applying.", "warning");
}
});
}

const benefitDefSelect = document.getElementById("benefit-definition-select");
if (benefitDefSelect) {
benefitDefSelect.addEventListener("change", () => {
if (!appState.currentScenario) return;
refreshSensitivityTables();
});
}

const endorsementOverrideInput = document.getElementById("endorsement-override");
if (endorsementOverrideInput) {
endorsementOverrideInput.addEventListener("change", () => {
if (!appState.currentScenario) return;
refreshSensitivityTables();
});
}

const mo = new MutationObserver(() => {
wireSettingsApplyButtons();
});
mo.observe(document.body, { childList: true, subtree: true });
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
initEventHandlers();
enforceResponseTimeFixed();
wireSettingsApplyButtons();
updateCostSliderLabel();
updateCurrencyToggle();
});
/* ===========================
   HOTFIX v2025-12-13
   Settings Apply + Settings Log + Missing Tooltips
   =========================== */
(function () {
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
  function norm(s) { return String(s || "").trim().toLowerCase(); }

  function safeEnable(btn) {
    if (!btn) return;
    try { btn.disabled = false; } catch (e) {}
    btn.removeAttribute("disabled");
    btn.setAttribute("aria-disabled", "false");
    if (btn.classList) btn.classList.remove("disabled");
    try {
      const pe = window.getComputedStyle(btn).pointerEvents;
      if (pe === "none") btn.style.pointerEvents = "auto";
    } catch (e) {}
  }

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg, "success");
      else console.log(msg);
    } catch (e) { console.log(msg); }
  }

  function getNumberFrom(selectors, fallback) {
    for (const sel of selectors) {
      const el = sel.startsWith("#") ? document.querySelector(sel) : document.getElementById(sel);
      if (!el) continue;
      const raw = (el.value !== undefined ? el.value : el.getAttribute("data-value"));
      const v = Number(raw);
      if (!Number.isNaN(v)) return v;
    }
    return fallback;
  }

  function getBoolFrom(selectors, fallback) {
    for (const sel of selectors) {
      const el = sel.startsWith("#") ? document.querySelector(sel) : document.getElementById(sel);
      if (!el) continue;
      if (typeof el.checked === "boolean") return !!el.checked;
      const raw = norm(el.value || el.getAttribute("data-value") || el.getAttribute("aria-checked"));
      if (raw === "true") return true;
      if (raw === "false") return false;
    }
    return fallback;
  }

  function getCurrencyFromUI() {
    const checked = document.querySelector('input[name="currency"]:checked');
    if (checked && checked.value) return checked.value;
    const sel = document.querySelector("#currency, #currencySelect, #currency-select");
    if (sel && sel.value) return sel.value;
    return (typeof appState !== "undefined" && appState.currency) ? appState.currency : "INR";
  }

  function resolveApplySettingsButton() {
    const direct =
      document.querySelector("#btn-apply-settings, #apply-settings, #applySettingsBtn, #apply-settings-btn, #settings-apply-btn") ||
      document.getElementById("btn-apply-settings") ||
      document.getElementById("apply-settings") ||
      document.getElementById("applySettingsBtn") ||
      document.getElementById("apply-settings-btn") ||
      document.getElementById("settings-apply-btn");
    if (direct) return direct;

    const btnByText = qsa("button").find(b => norm(b.textContent) === "apply settings");
    return btnByText || null;
  }

  function resolveSettingsLogContainer() {
    const direct =
      document.querySelector("#settings-log-session, #settingsLogSession, #settings-log, #settingsLog, #settings-log-list, #settingsLogList, .settings-log, .settings-log-list");
    if (direct) return direct;

    const label = qsa("h1,h2,h3,h4,h5,p,div,strong,span")
      .find(el => /settings log for this session/i.test(el.textContent || ""));
    if (!label) return null;

    const next = label.nextElementSibling;
    if (next && (next.tagName === "UL" || next.tagName === "OL" || /log/i.test(next.className || next.id || ""))) return next;

    const inParent = label.parentElement ? label.parentElement.querySelector("ul,ol,.settings-log,.settings-log-list,#settings-log-session,#settings-log") : null;
    return inParent || null;
  }

  function writeSettingsLogEntry(snapshot) {
    const box = resolveSettingsLogContainer();
    if (!box) return;

    const ts = new Date();
    const stamp = ts.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

    const line =
      `${stamp} | Currency: ${snapshot.currency}` +
      ` | Planning horizon (years): ${snapshot.planningHorizonYears}` +
      ` | Discount rate: ${snapshot.epiDiscountRate}` +
      ` | INR to USD: ${snapshot.inrToUsdRate}` +
      ` | Opportunity cost included: ${snapshot.includeOppCost ? "Yes" : "No"}`;

    if (box.tagName === "UL" || box.tagName === "OL") {
      const li = document.createElement("li");
      li.textContent = line;
      box.appendChild(li);
    } else {
      const div = document.createElement("div");
      div.textContent = line;
      box.appendChild(div);
    }

    try { box.style.display = ""; } catch (e) {}
  }

  function applySettingsFromUI() {
    const snapshot = {
      currency: getCurrencyFromUI(),
      planningHorizonYears: getNumberFrom(
        ["#planningHorizonYears", "#planning-horizon-years", "#planningHorizon", "#planning-horizon", "planningHorizonYears", "planningHorizon"],
        (typeof appState !== "undefined" && appState.epiSettings && appState.epiSettings.general) ? appState.epiSettings.general.planningHorizonYears : 5
      ),
      epiDiscountRate: getNumberFrom(
        ["#epiDiscountRate", "#epi-discount-rate", "#discountRate", "#discount-rate", "epiDiscountRate", "discountRate"],
        (typeof appState !== "undefined" && appState.epiSettings && appState.epiSettings.general) ? appState.epiSettings.general.epiDiscountRate : 0.03
      ),
      inrToUsdRate: getNumberFrom(
        ["#inrToUsdRate", "#inr-to-usd", "#usdRate", "#usd-rate", "inrToUsdRate", "usdRate"],
        (typeof appState !== "undefined" && appState.usdRate) ? appState.usdRate : 83
      ),
      includeOppCost: getBoolFrom(
        ["#includeOppCost", "#include-opp-cost", "#oppCostToggle", "#opp-cost-toggle", "includeOppCost", "oppCostToggle"],
        false
      )
    };

    try {
      if (typeof appState !== "undefined") {
        appState.currency = snapshot.currency;
        appState.usdRate = snapshot.inrToUsdRate;

        if (appState.epiSettings && appState.epiSettings.general) {
          appState.epiSettings.general.planningHorizonYears = snapshot.planningHorizonYears;
          appState.epiSettings.general.epiDiscountRate = snapshot.epiDiscountRate;
          appState.epiSettings.general.inrToUsdRate = snapshot.inrToUsdRate;
        }
      }
    } catch (e) {}

    return snapshot;
  }

  function ensureCoreTooltips() {
    const lib = (typeof TOOLTIP_LIBRARY !== "undefined" && TOOLTIP_LIBRARY) ? TOOLTIP_LIBRARY : {
      optout_alt: "The opt out alternative represents a situation where no new FETP training is funded under the scenario being considered.",
      cost_components: "Cost components group programme expenses for each tier, including salaries and benefits, travel, training inputs, trainee support and indirect items such as opportunity cost.",
      opp_cost: "The opportunity cost of trainee time reflects the value of salary time that trainees spend in training instead of normal duties, per trainee per month."
    };

    const idMap = [
      { id: "#optout-alt-info", tip: lib.optout_alt },
      { id: "#cost-components-info", tip: lib.cost_components },
      { id: "#opp-cost-info", tip: lib.opp_cost }
    ];
    idMap.forEach(x => {
      const el = document.querySelector(x.id);
      if (el && !el.getAttribute("data-tooltip")) el.setAttribute("data-tooltip", x.tip);
    });

    const byKey = qsa("[data-tooltip-key],[data-tip-key],[data-info-key]").filter(el => !el.getAttribute("data-tooltip"));
    byKey.forEach(el => {
      const k = norm(el.getAttribute("data-tooltip-key") || el.getAttribute("data-tip-key") || el.getAttribute("data-info-key"));
      if (k.includes("opt") && k.includes("out")) el.setAttribute("data-tooltip", lib.optout_alt);
      if (k.includes("cost") && k.includes("component")) el.setAttribute("data-tooltip", lib.cost_components);
      if (k.includes("opp") || (k.includes("opportunity") && k.includes("cost"))) el.setAttribute("data-tooltip", lib.opp_cost);
    });

    const rows = qsa("tr, .definition-row, .attribute-row, .levels-row, .table-row, .card, .panel, .settings-row");
    rows.forEach(row => {
      const t = norm(row.textContent);
      if (!t) return;
      const icon = row.querySelector(".info-icon,[data-tooltip],[data-tooltip-key],[data-tip-key],[data-info-key]");
      if (!icon) return;
      if (icon.getAttribute("data-tooltip")) return;

      if (t.includes("opt out alternative") || t.includes("opt-out alternative")) icon.setAttribute("data-tooltip", lib.optout_alt);
      else if (t.includes("cost components") || t.includes("cost component")) icon.setAttribute("data-tooltip", lib.cost_components);
      else if (t.includes("opportunity") && t.includes("cost")) icon.setAttribute("data-tooltip", lib.opp_cost);
    });
  }

  function wireApplySettings() {
    if (window.__STEPS_APPLY_SETTINGS_WIRED === true) return;

    const btn = resolveApplySettingsButton();
    if (!btn) return;

    safeEnable(btn);

    if (btn.dataset && btn.dataset.applySettingsWired === "1") {
      window.__STEPS_APPLY_SETTINGS_WIRED = true;
      return;
    }

    btn.addEventListener("click", function () {
      const snapshot = applySettingsFromUI();
      toast("Settings applied");
      writeSettingsLogEntry(snapshot);

      try {
        if (typeof window.recomputeAll === "function") window.recomputeAll();
        else if (typeof window.updateAllOutputs === "function") window.updateAllOutputs();
        else if (typeof window.updateResults === "function") window.updateResults();
        else if (typeof window.renderAll === "function") window.renderAll();
      } catch (e) {}
    });

    if (btn.dataset) btn.dataset.applySettingsWired = "1";
    window.__STEPS_APPLY_SETTINGS_WIRED = true;
  }

  onReady(function () {
    try {
      if (typeof initTooltips === "function" && window.__STEPS_TOOLTIPS_INIT !== true) {
        initTooltips();
        window.__STEPS_TOOLTIPS_INIT = true;
      }
    } catch (e) {}

    try {
      if (typeof initDefinitionTooltips === "function") initDefinitionTooltips();
    } catch (e) {}

    try { ensureCoreTooltips(); } catch (e) {}
    try { wireApplySettings(); } catch (e) {}
  });
})();
