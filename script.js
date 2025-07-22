/* ============================================================
 * FETP Cost–Value Decision Aid Tool
 * ============================================================
 * Features:
 * - DCE-based utility + uptake prediction
 * - Implausible configuration warnings
 * - Cost entry + stakeholder value modelling
 * - Cost–Value charts + results text
 * - Scenario save / export (PDF & CSV)
 * - Simple brute-force optimiser for max uptake
 * ------------------------------------------------------------
 */

/* ---------- Global state ---------- */
let currentScenario = null;
let costBenefitChart = null;
let netBenefitChart = null;
let savedScenarios = [];

/* ---------- DCE Coefficients ----------
   These are example preference weights (logit scale).
   Adjust to reflect your empirical DCE results. */
const mainCoefficients = {
  base: -0.1,
  delivery_inperson: 0.3,
  delivery_hybrid: 0.5,
  delivery_online: 0,
  capacity_100: 0,
  capacity_500: 0.2,
  capacity_1000: 0.4,
  capacity_2000: 0.6,
  stipend_75000: 0,
  stipend_100000: 0.2,
  stipend_150000: 0.4,
  trainingModel_parttime: 0,
  trainingModel_fulltime: 0.3,
  career_government: 0,
  career_international: 0.3,
  career_academic: 0.2,
  career_private: 0.1,
  geographic_centralized: 0,
  geographic_regional: 0.2,
  geographic_nationwide: 0.4,
  accreditation_unaccredited: -0.5,
  accreditation_national: 0.2,
  accreditation_international: 0.5,
  trainingType_frontline: 0,
  trainingType_intermediate: 0.3,
  trainingType_advanced: 0.5,
  cost_low: 0.5,
  cost_medium: 0,
  cost_high: -0.5
};

/* ---------- Attribute Options ---------- */
const attributeOptions = {
  deliveryMethod: ['inperson', 'hybrid', 'online'],
  trainingModel: ['parttime', 'fulltime'],
  trainingType: ['frontline', 'intermediate', 'advanced'],
  annualCapacity: ['100', '500', '1000', '2000'],
  stipendSupport: ['75000', '100000', '150000'],
  careerPathway: ['government', 'international', 'academic', 'private'],
  geographicDistribution: ['centralized', 'regional', 'nationwide'],
  accreditation: ['unaccredited', 'national', 'international'],
  totalCost: ['low', 'medium', 'high']
};

/* ============================================================
 * Scenario Builder
 * ============================================================ */
function buildFETPScenario() {
  const scenario = {};
  const selects = document.querySelectorAll('select[name]');
  let allSelected = true;
  selects.forEach(select => {
    scenario[select.name] = select.value;
    if (!select.value) allSelected = false;
  });
  return allSelected ? scenario : null;
}

/* ============================================================
 * Utility & Uptake
 * ============================================================ */
function computeUtility(sc) {
  let U = mainCoefficients.base;
  U += mainCoefficients[`delivery_${sc.deliveryMethod}`] || 0;
  U += mainCoefficients[`trainingModel_${sc.trainingModel}`] || 0;
  U += mainCoefficients[`trainingType_${sc.trainingType}`] || 0;
  U += mainCoefficients[`capacity_${sc.annualCapacity}`] || 0;
  U += mainCoefficients[`stipend_${sc.stipendSupport}`] || 0;
  U += mainCoefficients[`career_${sc.careerPathway}`] || 0;
  U += mainCoefficients[`geographic_${sc.geographicDistribution}`] || 0;
  U += mainCoefficients[`accreditation_${sc.accreditation}`] || 0;
  U += mainCoefficients[`cost_${sc.totalCost}`] || 0;
  return U;
}

function computeFETPUptake(sc) {
  const U = computeUtility(sc);
  return Math.exp(U) / (Math.exp(U) + 1); // logit
}

/* ============================================================
 * Implausible Configuration Checks
 * (Simple heuristic rules – edit as needed.)
 * ============================================================ */
function checkImplausibleScenario(sc) {
  const warnings = [];

  // High stipend with very large capacity may strain budgets
  if (parseInt(sc.annualCapacity,10) >= 1000 && parseInt(sc.stipendSupport,10) >= 150000) {
    warnings.push("High stipend at ≥1,000 trainees may be fiscally unrealistic.");
  }

  // Full-time + large geographic + low stipend mismatch
  if (sc.trainingModel === 'fulltime' && sc.geographicDistribution === 'nationwide' && parseInt(sc.stipendSupport,10) < 100000) {
    warnings.push("Full-time nationwide delivery usually requires ≥₹100k stipend to attract candidates.");
  }

  // Advanced training but unaccredited
  if (sc.trainingType === 'advanced' && sc.accreditation === 'unaccredited') {
    warnings.push("Advanced training without accreditation may damage credibility and uptake.");
  }

  // In-person nationwide with low cost signal
  if (sc.deliveryMethod === 'inperson' && sc.geographicDistribution === 'nationwide' && sc.totalCost === 'low') {
    warnings.push("Nationwide in-person delivery rarely feasible at 'Low' cost.");
  }

  return warnings;
}

/* Render warnings list HTML */
function renderWarningsHTML(warnings) {
  if (!warnings.length) return '';
  const lis = warnings.map(w => `<li>${w}</li>`).join('');
  return `
    <div class="alert alert-warning" role="alert">
      <strong>Check these assumptions:</strong>
      <ul class="warning-list">${lis}</ul>
    </div>`;
}

/* ============================================================
 * Calculate Scenario (inputs tab)
 * ============================================================ */
function calculateScenario() {
  currentScenario = buildFETPScenario();
  if (!currentScenario) {
    alert("Please select all required fields before calculating.");
    return;
  }

  const fraction = computeFETPUptake(currentScenario);
  const pct = fraction * 100;
  const recommendation = pct < 30 ? "Predicted uptake is low. Consider revising features."
                    : pct < 70 ? "Uptake is moderate. Targeted adjustments could boost support."
                               : "Uptake is high. This configuration is promising.";

  // Build summary HTML
  const summaryHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Predicted Uptake:</strong> ${pct.toFixed(2)}%</p>
        <p><strong>Recommendation:</strong> ${recommendation}</p>
        <p><strong>Delivery Method:</strong> ${labelDelivery(currentScenario.deliveryMethod)}</p>
        <p><strong>Training Model:</strong> ${labelTrainingModel(currentScenario.trainingModel)}</p>
        <p><strong>Type of Training:</strong> ${labelTrainingType(currentScenario.trainingType)}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Annual Capacity:</strong> ${labelCapacity(currentScenario.annualCapacity)}</p>
        <p><strong>Stipend Support:</strong> ₹${Number(currentScenario.stipendSupport).toLocaleString()}</p>
        <p><strong>Career Pathway:</strong> ${labelCareer(currentScenario.careerPathway)}</p>
        <p><strong>Geographic Distribution:</strong> ${labelGeo(currentScenario.geographicDistribution)}</p>
        <p><strong>Accreditation:</strong> ${labelAccred(currentScenario.accreditation)}</p>
        <p><strong>Cost Signal:</strong> ${labelCostSignal(currentScenario.totalCost)}</p>
      </div>
    </div>`;

  document.getElementById("modalResults").innerHTML = summaryHTML;

  // Implausibility warnings
  const warnings = checkImplausibleScenario(currentScenario);
  document.getElementById("implausibleWarnings").innerHTML = renderWarningsHTML(warnings);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('resultModal'));
  modal.show();
}

/* ============================================================
 * Uptake Bar & Recommendation
 * ============================================================ */
function renderUptakeBar() {
  if (!currentScenario) return;
  const uptake = computeFETPUptake(currentScenario) * 100;
  const uptakeBar = document.getElementById("uptakeBar");
  uptakeBar.style.width = `${uptake}%`;
  uptakeBar.textContent = `${uptake.toFixed(2)}%`;
  uptakeBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
  if (uptake < 30) uptakeBar.classList.add('bg-danger');
  else if (uptake < 70) uptakeBar.classList.add('bg-warning');
  else uptakeBar.classList.add('bg-success');
}

function showUptakeRecommendations() {
  if (!currentScenario) {
    alert("Please calculate a scenario first.");
    return;
  }
  const uptake = computeFETPUptake(currentScenario) * 100;
  let recommendation = '';
  if (uptake < 30) {
    recommendation = 'Predicted uptake is low. Consider revising features.';
  } else if (uptake < 70) {
    recommendation = 'Uptake is moderate. Targeted adjustments could boost support.';
  } else {
    recommendation = 'Uptake is high. This configuration is promising.';
  }
  document.getElementById('uptakeResults').innerHTML = `<p>${recommendation}</p>`;
  const modal = new bootstrap.Modal(document.getElementById('uptakeModal'));
  modal.show();
}

/* ============================================================
 * Cost Aggregation
 * ============================================================ */
function calculateTotalCost() {
  const get = id => parseFloat(document.getElementById(id).value) || 0;

  const totalCost =
      get("direct_salary_inCountry") +
      get("direct_salary_other") +
      get("direct_equipment_office") +
      get("direct_equipment_software") +
      get("direct_facilities_rent") +
      get("direct_trainee_allowances") +
      get("direct_trainee_equipment") +
      get("direct_trainee_software") +
      get("direct_training_materials") +
      get("direct_training_workshops") +
      get("direct_travel_inCountry") +
      get("direct_travel_international") +
      get("direct_other") +
      get("indirect_admin_management") +
      get("indirect_admin_maintenance") +
      get("indirect_inKind_salary") +
      get("indirect_infra_upgrades") +
      get("indirect_infra_depreciation") +
      get("indirect_utilities_shared") +
      get("indirect_prof_legal") +
      get("indirect_training_staff") +
      get("indirect_opportunity") +
      get("indirect_other");

  return totalCost;
}

/* ============================================================
 * Stakeholder Value Selector
 * (₹ per effectively enrolled trainee)
 * ============================================================ */
function getValuePerTrainee() {
  const v = document.getElementById("benefitScenario").value;
  if (v === "low")   return 30000;
  if (v === "high")  return 70000;
  return 50000; // medium
}

/* ============================================================
 * Cost–Value Charts
 * ============================================================ */
function renderCostBenefitChart() {
  if (!currentScenario) return;
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const stakeholderValue = effectiveEnrollment * getValuePerTrainee();
  const netSurplus = stakeholderValue - totalCost;

  const ctx = document.getElementById("costBenefitChart").getContext("2d");
  if (costBenefitChart) costBenefitChart.destroy();
  costBenefitChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Cost", "Stakeholder Value", "Net Surplus"],
      datasets: [{
        label: "₹",
        data: [totalCost, stakeholderValue, netSurplus],
        backgroundColor: ["#ef4444", "#22c55e", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Cost–Value Summary", font: { size: 16 } },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ₹${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Amount (₹)" } }
      }
    }
  });
}

function renderNetBenefitChart() {
  if (!currentScenario) return;
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const stakeholderValue = effectiveEnrollment * getValuePerTrainee();
  const netSurplus = stakeholderValue - totalCost;

  const ctx = document.getElementById("netBenefitChart").getContext("2d");
  if (netBenefitChart) netBenefitChart.destroy();
  netBenefitChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Net Surplus", "Shortfall"],
      datasets: [{
        data: [Math.max(netSurplus, 0), Math.max(-netSurplus, 0)],
        backgroundColor: [netSurplus > 0 ? "#22c55e" : "#ef4444", "#f3f4f6"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Net Surplus Breakdown", font: { size: 16 } },
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ₹${ctx.parsed.toLocaleString()}`
          }
        }
      }
    }
  });
}

/* ============================================================
 * Cost–Value Results Text
 * ============================================================ */
function renderCostsBenefitsResults() {
  const el = document.getElementById("costsBenefitsResults");
  if (!currentScenario) {
    el.innerHTML = "<p>Please calculate a scenario first.</p>";
    return;
  }
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = Math.round(trainees * uptake);
  const totalCost = calculateTotalCost();
  const stakeholderValue = effectiveEnrollment * getValuePerTrainee();
  const netSurplus = stakeholderValue - totalCost;
  const econAdvice =
    netSurplus < 0 ? "Revise design – stakeholder value falls short of cost."
    : netSurplus < 50000 ? "Marginal surplus – further optimisation advisable."
    : "Strong surplus – favourable investment.";

  el.innerHTML = `
    <p><strong>Predicted Uptake:</strong> ${(uptake * 100).toFixed(2)}%</p>
    <p><strong>Number of Trainees:</strong> ${trainees.toLocaleString()}</p>
    <p><strong>Effective Enrolment:</strong> ${effectiveEnrollment.toLocaleString()}</p>
    <p><strong>Total Cost:</strong> ₹${totalCost.toLocaleString()}</p>
    <p><strong>Stakeholder Value:</strong> ₹${stakeholderValue.toLocaleString()}</p>
    <p><strong>Net Surplus:</strong> ₹${netSurplus.toLocaleString()}</p>
    <p><strong>Policy Advice:</strong> ${econAdvice}</p>
  `;
}

/* ============================================================
 * Scenario Save / Table / Export
 * ============================================================ */
function saveScenario() {
  if (!currentScenario) {
    alert("Please calculate a scenario first.");
    return;
  }
  const uptake = computeFETPUptake(currentScenario);
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const stakeholderValue = effectiveEnrollment * getValuePerTrainee();
  const netSurplus = stakeholderValue - totalCost;

  const scToSave = {
    ...currentScenario,
    uptake: uptake * 100,
    stakeholderValue,
    netSurplus,
    name: `Scenario ${savedScenarios.length + 1}`
  };
  savedScenarios.push(scToSave);
  updateScenarioTable();
  bootstrap.Toast && showSaveToast(); // non-blocking
}

/* Update saved scenarios table */
function updateScenarioTable() {
  const tbody = document.querySelector('#scenarioTable tbody');
  tbody.innerHTML = '';
  savedScenarios.forEach(sc => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sc.name}</td>
      <td>${labelDelivery(sc.deliveryMethod)}</td>
      <td>${labelTrainingModel(sc.trainingModel)}</td>
      <td>${labelTrainingType(sc.trainingType)}</td>
      <td>${labelCapacity(sc.annualCapacity)}</td>
      <td>₹${Number(sc.stipendSupport).toLocaleString()}</td>
      <td>${labelCareer(sc.careerPathway)}</td>
      <td>${labelGeo(sc.geographicDistribution)}</td>
      <td>${labelAccred(sc.accreditation)}</td>
      <td>${labelCostSignal(sc.totalCost)}</td>
      <td>${Number(sc.uptake).toFixed(2)}%</td>
      <td>₹${sc.stakeholderValue.toLocaleString()}</td>
      <td>₹${sc.netSurplus.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });
}

/* PDF export */
function openComparison() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let yPos = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FETP Scenarios Comparison", 297.5, yPos, { align: "center" }); // A4 width/2=297.5
  yPos += 30;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  savedScenarios.forEach((sc, index) => {
    if (yPos > 760) { doc.addPage(); yPos = margin; }
    doc.setFont("helvetica", "bold");
    doc.text(`${sc.name}`, margin, yPos); yPos += 14;
    doc.setFont("helvetica", "normal");
    const lines = [
      `Delivery: ${labelDelivery(sc.deliveryMethod)}`,
      `Model: ${labelTrainingModel(sc.trainingModel)}`,
      `Type: ${labelTrainingType(sc.trainingType)}`,
      `Capacity: ${labelCapacity(sc.annualCapacity)}`,
      `Stipend: ₹${Number(sc.stipendSupport).toLocaleString()}`,
      `Career: ${labelCareer(sc.careerPathway)}`,
      `Geographic: ${labelGeo(sc.geographicDistribution)}`,
      `Accreditation: ${labelAccred(sc.accreditation)}`,
      `Cost Signal: ${labelCostSignal(sc.totalCost)}`,
      `Uptake: ${Number(sc.uptake).toFixed(2)}%`,
      `Stakeholder Value: ₹${sc.stakeholderValue.toLocaleString()}`,
      `Net Surplus: ₹${sc.netSurplus.toLocaleString()}`
    ];
    lines.forEach(txt => { doc.text(txt, margin + 10, yPos); yPos += 12; });
    yPos += 8;
  });

  doc.save("fetp_scenarios_comparison.pdf");
}

/* CSV export */
function downloadCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += [
    "Name","Delivery","Model","Type","Capacity","Stipend","Career",
    "Geographic","Accreditation","Cost Signal","Uptake %","Stakeholder Value","Net Surplus"
  ].join(",") + "\n";

  savedScenarios.forEach(sc => {
    const row = [
      sc.name,
      labelDelivery(sc.deliveryMethod),
      labelTrainingModel(sc.trainingModel),
      labelTrainingType(sc.trainingType),
      labelCapacity(sc.annualCapacity),
      `₹${Number(sc.stipendSupport).toLocaleString()}`,
      labelCareer(sc.careerPathway),
      labelGeo(sc.geographicDistribution),
      labelAccred(sc.accreditation),
      labelCostSignal(sc.totalCost),
      Number(sc.uptake).toFixed(2),
      sc.stakeholderValue,
      sc.netSurplus
    ];
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "fetp_scenarios.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Toast confirmation (optional) */
function showSaveToast() {
  let toastEl = document.getElementById("saveToast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "saveToast";
    toastEl.className = "toast align-items-center text-bg-success border-0 position-fixed top-0 end-0 m-3";
    toastEl.setAttribute("role","alert");
    toastEl.setAttribute("aria-live","assertive");
    toastEl.setAttribute("aria-atomic","true");
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">Scenario saved.</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
    document.body.appendChild(toastEl);
  }
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/* ============================================================
 * Reset Inputs
 * ============================================================ */
function resetInputs() {
  document.querySelectorAll('#inputsForm select').forEach(select => {
    // reset to first option (which in some is not default; we reselect actual defaults)
    if (select.name === "deliveryMethod") select.value = "hybrid";
    else if (select.name === "trainingModel") select.value = "parttime";
    else if (select.name === "trainingType") select.value = "advanced";
    else if (select.name === "annualCapacity") select.value = "100";
    else if (select.name === "stipendSupport") select.value = "75000";
    else if (select.name === "careerPathway") select.value = "government";
    else if (select.name === "geographicDistribution") select.value = "regional";
    else if (select.name === "accreditation") select.value = "national";
    else if (select.name === "totalCost") select.value = "medium";
  });
  currentScenario = null;
  document.getElementById("modalResults").innerHTML = "";
  document.getElementById("implausibleWarnings").innerHTML = "";
  renderUptakeBar();
  renderCostsBenefitsResults();
  if (costBenefitChart) costBenefitChart.destroy();
  if (netBenefitChart) netBenefitChart.destroy();
}

/* ============================================================
 * Optimiser (max uptake across all combinations)
 * ============================================================ */
function optimizeConfiguration() {
  let maxUptake = -Infinity;
  let bestScenario = null;

  const attributes = Object.keys(attributeOptions);

  const recurse = (idx, partial) => {
    if (idx === attributes.length) {
      const u = computeFETPUptake(partial);
      if (u > maxUptake) {
        maxUptake = u;
        bestScenario = { ...partial };
      }
      return;
    }
    const attr = attributes[idx];
    attributeOptions[attr].forEach(opt => {
      partial[attr] = opt;
      recurse(idx + 1, partial);
    });
  };

  recurse(0, {});

  if (bestScenario) {
    Object.keys(bestScenario).forEach(key => {
      const select = document.querySelector(`select[name="${key}"]`);
      if (select) select.value = bestScenario[key];
    });
    currentScenario = bestScenario;
    alert(`Optimised configuration set (predicted uptake ${(maxUptake * 100).toFixed(2)}%).`);
    renderUptakeBar();
  } else {
    alert("Optimisation failed.");
  }
}

/* ============================================================
 * Label helpers (for readability in UI / exports)
 * ============================================================ */
function labelDelivery(v){
  return v==="inperson"?"In-Person":v==="hybrid"?"Hybrid":"Fully Online";
}
function labelTrainingModel(v){
  return v==="fulltime"?"Full-Time (Scholarship)":"Part-Time";
}
function labelTrainingType(v){
  if(v==="frontline")return"Frontline";
  if(v==="intermediate")return"Intermediate";
  return"Advanced";
}
function labelCapacity(v){
  if(v==="1000")return"1,000";
  if(v==="2000")return"2,000+";
  return Number(v).toLocaleString();
}
function labelCareer(v){
  return v==="international"?"International":v==="academic"?"Academic & Research":v==="private"?"Private/NGOs":"Government";
}
function labelGeo(v){
  return v==="centralized"?"Centralised":v==="regional"?"Regional":"Nationwide";
}
function labelAccred(v){
  return v==="international"?"International":v==="national"?"National":"Unaccredited";
}
function labelCostSignal(v){
  return v==="low"?"Low":v==="high"?"High":"Medium";
}

/* ============================================================
 * Event Listeners
 * ============================================================ */
document.getElementById('probTab-tab').addEventListener('shown.bs.tab', renderUptakeBar);
document.getElementById('costsTab-tab').addEventListener('shown.bs.tab', () => {
  renderCostBenefitChart();
  renderNetBenefitChart();
  renderCostsBenefitsResults();
});

/* Update Cost–Value panel live when value scenario changes */
document.getElementById('benefitScenario').addEventListener('change', () => {
  renderCostBenefitChart();
  renderNetBenefitChart();
  renderCostsBenefitsResults();
});

/* Update Cost–Value panel live when cost inputs change */
[
  "direct_salary_inCountry","direct_salary_other","direct_equipment_office",
  "direct_equipment_software","direct_facilities_rent","direct_trainee_allowances",
  "direct_trainee_equipment","direct_trainee_software","direct_training_materials",
  "direct_training_workshops","direct_travel_inCountry","direct_travel_international",
  "direct_other","indirect_admin_management","indirect_admin_maintenance",
  "indirect_inKind_salary","indirect_infra_upgrades","indirect_infra_depreciation",
  "indirect_utilities_shared","indirect_prof_legal","indirect_training_staff",
  "indirect_opportunity","indirect_other"
].forEach(id=>{
  const el=document.getElementById(id);
  if(el){
    el.addEventListener('input',()=>{
      renderCostBenefitChart();
      renderNetBenefitChart();
      renderCostsBenefitsResults();
    });
  }
});

/* Initialise bootstrap tooltips */
document.addEventListener('DOMContentLoaded', () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
});
