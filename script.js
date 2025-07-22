/* Advanced FETP Decision Aid Tool
 * - Tab switching and accordion toggling
 * - DCE model for uptake prediction
 * - Chart rendering for adoption and cost-benefit analysis
 * - Scenario saving and PDF export
 * - Optimization for maximum uptake
 */

/* Global variables */
let currentScenario = null;
let costBenefitChart = null;
let netBenefitChart = null;

/* DCE Coefficients */
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

/* Options for each attribute */
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

/* Build Scenario */
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

/* Compute Utility */
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

/* Compute Uptake */
function computeFETPUptake(sc) {
  const U = computeUtility(sc);
  return Math.exp(U) / (Math.exp(U) + 1);
}

/* Calculate Scenario */
function calculateScenario() {
  currentScenario = buildFETPScenario();
  if (!currentScenario) {
    alert("Please select all required fields before calculating.");
    return;
  }
  const fraction = computeFETPUptake(currentScenario);
  const pct = fraction * 100;
  const recommendation = pct < 30 ? "Uptake is low. Consider revising features." :
                        pct < 70 ? "Uptake is moderate. Some adjustments may boost support." :
                                   "Uptake is high. This configuration is promising.";
  document.getElementById("modalResults").innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Predicted Uptake:</strong> ${pct.toFixed(2)}%</p>
        <p><strong>Recommendation:</strong> ${recommendation}</p>
        <p><strong>Delivery Method:</strong> ${currentScenario.deliveryMethod}</p>
        <p><strong>Training Model:</strong> ${currentScenario.trainingModel}</p>
        <p><strong>Type of Training:</strong> ${currentScenario.trainingType}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Annual Capacity:</strong> ${currentScenario.annualCapacity}</p>
        <p><strong>Stipend Support:</strong> ₹${currentScenario.stipendSupport}</p>
        <p><strong>Career Pathway:</strong> ${currentScenario.careerPathway}</p>
        <p><strong>Geographic Distribution:</strong> ${currentScenario.geographicDistribution}</p>
        <p><strong>Accreditation:</strong> ${currentScenario.accreditation}</p>
        <p><strong>Total Cost:</strong> ${currentScenario.totalCost}</p>
      </div>
    </div>
  `;
  const modal = new bootstrap.Modal(document.getElementById('resultModal'));
  modal.show();
}

/* Render Uptake Bar */
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

/* Show Uptake Recommendations */
function showUptakeRecommendations() {
  if (!currentScenario) {
    alert("Please calculate a scenario first.");
    return;
  }
  const uptake = computeFETPUptake(currentScenario) * 100;
  let recommendation = '';
  if (uptake < 30) {
    recommendation = 'Uptake is low. Consider revising features.';
  } else if (uptake < 70) {
    recommendation = 'Uptake is moderate. Some adjustments may boost support.';
  } else {
    recommendation = 'Uptake is high. This configuration is promising.';
  }
  document.getElementById('uptakeResults').innerHTML = `<p>${recommendation}</p>`;
  const modal = new bootstrap.Modal(document.getElementById('uptakeModal'));
  modal.show();
}

/* Calculate Total Cost from Inputs */
function calculateTotalCost() {
  const direct_salary_inCountry = parseFloat(document.getElementById("direct_salary_inCountry").value) || 0;
  const direct_salary_other = parseFloat(document.getElementById("direct_salary_other").value) || 0;
  const direct_equipment_office = parseFloat(document.getElementById("direct_equipment_office").value) || 0;
  const direct_equipment_software = parseFloat(document.getElementById("direct_equipment_software").value) || 0;
  const direct_facilities_rent = parseFloat(document.getElementById("direct_facilities_rent").value) || 0;
  const direct_trainee_allowances = parseFloat(document.getElementById("direct_trainee_allowances").value) || 0;
  const direct_trainee_equipment = parseFloat(document.getElementById("direct_trainee_equipment").value) || 0;
  const direct_trainee_software = parseFloat(document.getElementById("direct_trainee_software").value) || 0;
  const direct_training_materials = parseFloat(document.getElementById("direct_training_materials").value) || 0;
  const direct_training_workshops = parseFloat(document.getElementById("direct_training_workshops").value) || 0;
  const direct_travel_inCountry = parseFloat(document.getElementById("direct_travel_inCountry").value) || 0;
  const direct_travel_international = parseFloat(document.getElementById("direct_travel_international").value) || 0;
  const direct_other = parseFloat(document.getElementById("direct_other").value) || 0;
  const indirect_admin_management = parseFloat(document.getElementById("indirect_admin_management").value) || 0;
  const indirect_admin_maintenance = parseFloat(document.getElementById("indirect_admin_maintenance").value) || 0;
  const indirect_inKind_salary = parseFloat(document.getElementById("indirect_inKind_salary").value) || 0;
  const indirect_infra_upgrades = parseFloat(document.getElementById("indirect_infra_upgrades").value) || 0;
  const indirect_infra_depreciation = parseFloat(document.getElementById("indirect_infra_depreciation").value) || 0;
  const indirect_utilities_shared = parseFloat(document.getElementById("indirect_utilities_shared").value) || 0;
  const indirect_prof_legal = parseFloat(document.getElementById("indirect_prof_legal").value) || 0;
  const indirect_training_staff = parseFloat(document.getElementById("indirect_training_staff").value) || 0;
  const indirect_opportunity = parseFloat(document.getElementById("indirect_opportunity").value) || 0;
  const indirect_other = parseFloat(document.getElementById("indirect_other").value) || 0;

  const totalCost = direct_salary_inCountry + direct_salary_other + direct_equipment_office + direct_equipment_software + direct_facilities_rent + direct_trainee_allowances + direct_trainee_equipment + direct_trainee_software + direct_training_materials + direct_training_workshops + direct_travel_inCountry + direct_travel_international + direct_other + indirect_admin_management + indirect_admin_maintenance + indirect_inKind_salary + indirect_infra_upgrades + indirect_infra_depreciation + indirect_utilities_shared + indirect_prof_legal + indirect_training_staff + indirect_opportunity + indirect_other;

  return totalCost;
}

/* Render Cost-Benefit Chart */
function renderCostBenefitChart() {
  if (!currentScenario) return;
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const qVal = document.getElementById("benefitScenario").value === "low" ? 0.01 :
               document.getElementById("benefitScenario").value === "high" ? 0.08 : 0.05;
  const monetizedBenefits = effectiveEnrollment * qVal * 50000;
  const netBenefit = monetizedBenefits - totalCost;
  const ctx = document.getElementById("costBenefitChart").getContext("2d");
  if (costBenefitChart) costBenefitChart.destroy();
  costBenefitChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Cost", "Monetized Benefits", "Net Benefit"],
      datasets: [{
        label: "₹",
        data: [totalCost, monetizedBenefits, netBenefit],
        backgroundColor: ["#ef4444", "#22c55e", "#f59e0b"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Cost-Benefit Analysis", font: { size: 16 } },
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ₹${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Amount (₹)" } }
      }
    }
  });
}

/* Render Net Benefit Chart */
function renderNetBenefitChart() {
  if (!currentScenario) return;
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const qVal = document.getElementById("benefitScenario").value === "low" ? 0.01 :
               document.getElementById("benefitScenario").value === "high" ? 0.08 : 0.05;
  const monetizedBenefits = effectiveEnrollment * qVal * 50000;
  const netBenefit = monetizedBenefits - totalCost;
  const ctx = document.getElementById("netBenefitChart").getContext("2d");
  if (netBenefitChart) netBenefitChart.destroy();
  netBenefitChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Net Benefit", "Net Loss"],
      datasets: [{
        data: [Math.max(netBenefit, 0), Math.max(-netBenefit, 0)],
        backgroundColor: [netBenefit > 0 ? "#22c55e" : "#ef4444", "#f3f4f6"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: "Net Benefit Breakdown", font: { size: 16 } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ₹${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

/* Render Costs Benefits Results */
function renderCostsBenefitsResults() {
  if (!currentScenario) {
    document.getElementById("costsBenefitsResults").innerHTML = "<p>Please calculate a scenario first.</p>";
    return;
  }
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const uptake = computeFETPUptake(currentScenario);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const qVal = document.getElementById("benefitScenario").value === "low" ? 0.01 :
               document.getElementById("benefitScenario").value === "high" ? 0.08 : 0.05;
  const monetizedBenefits = effectiveEnrollment * qVal * 50000;
  const netBenefit = monetizedBenefits - totalCost;
  const econAdvice = netBenefit < 0 ? "The program may not be cost-effective. Consider revising features." :
                     netBenefit < 50000 ? "Modest benefits. Some improvements could enhance cost-effectiveness." :
                     "This configuration appears highly cost-effective.";
  document.getElementById("costsBenefitsResults").innerHTML = `
    <p><strong>Predicted Uptake:</strong> ${(uptake * 100).toFixed(2)}%</p>
    <p><strong>Number of Trainees:</strong> ${trainees}</p>
    <p><strong>Effective Enrollment:</strong> ${Math.round(effectiveEnrollment)}</p>
    <p><strong>Total Cost:</strong> ₹${totalCost.toLocaleString()} per year</p>
    <p><strong>Monetized Benefits:</strong> ₹${monetizedBenefits.toLocaleString()}</p>
    <p><strong>Net Benefit:</strong> ₹${netBenefit.toLocaleString()}</p>
    <p><strong>Policy Recommendation:</strong> ${econAdvice}</p>
  `;
}

/* Save Scenario */
let savedScenarios = [];
function saveScenario() {
  if (!currentScenario) {
    alert("Please calculate a scenario first.");
    return;
  }
  const uptake = computeFETPUptake(currentScenario);
  const pct = uptake * 100;
  const qVal = 0.05; // Default to medium
  const trainees = parseInt(currentScenario.annualCapacity, 10);
  const effectiveEnrollment = trainees * uptake;
  const totalCost = calculateTotalCost();
  const monetizedBenefits = effectiveEnrollment * qVal * 50000;
  const netBenefit = monetizedBenefits - totalCost;
  currentScenario.uptake = pct.toFixed(2);
  currentScenario.netBenefit = netBenefit.toLocaleString();
  currentScenario.name = `Scenario ${savedScenarios.length + 1}`;
  savedScenarios.push({...currentScenario});
  updateScenarioTable();
}

/* Update Scenario Table */
function updateScenarioTable() {
  const tbody = document.querySelector('#scenarioTable tbody');
  tbody.innerHTML = '';
  savedScenarios.forEach(sc => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sc.name}</td>
      <td>${sc.deliveryMethod}</td>
      <td>${sc.trainingModel}</td>
      <td>${sc.trainingType}</td>
      <td>${sc.annualCapacity}</td>
      <td>₹${sc.stipendSupport}</td>
      <td>${sc.careerPathway}</td>
      <td>${sc.geographicDistribution}</td>
      <td>${sc.accreditation}</td>
      <td>${sc.totalCost}</td>
      <td>${sc.uptake}%</td>
      <td>₹${sc.netBenefit}</td>
    `;
    tbody.appendChild(row);
  });
}

/* Open Comparison (Export PDF) */
function openComparison() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("FETP Scenarios Comparison", 105, 10, null, null, 'center');
  let yPos = 20;
  savedScenarios.forEach((sc, index) => {
    doc.text(`Scenario ${index + 1}`, 10, yPos);
    yPos += 10;
    doc.text(`Delivery: ${sc.deliveryMethod}`, 10, yPos); yPos += 5;
    doc.text(`Model: ${sc.trainingModel}`, 10, yPos); yPos += 5;
    doc.text(`Type: ${sc.trainingType}`, 10, yPos); yPos += 5;
    doc.text(`Capacity: ${sc.annualCapacity}`, 10, yPos); yPos += 5;
    doc.text(`Stipend: ₹${sc.stipendSupport}`, 10, yPos); yPos += 5;
    doc.text(`Career: ${sc.careerPathway}`, 10, yPos); yPos += 5;
    doc.text(`Geographic: ${sc.geographicDistribution}`, 10, yPos); yPos += 5;
    doc.text(`Accreditation: ${sc.accreditation}`, 10, yPos); yPos += 5;
    doc.text(`Cost: ${sc.totalCost}`, 10, yPos); yPos += 5;
    doc.text(`Uptake: ${sc.uptake}%`, 10, yPos); yPos += 5;
    doc.text(`Net Benefit: ₹${sc.netBenefit}`, 10, yPos); yPos += 15;
  });
  doc.save("fetp_scenarios_comparison.pdf");
}

/* Download CSV */
function downloadCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Name,Delivery,Model,Type,Capacity,Stipend,Career,Geographic,Accreditation,Total Cost,Uptake,Net Benefit\n";
  savedScenarios.forEach(sc => {
    csvContent += `${sc.name},${sc.deliveryMethod},${sc.trainingModel},${sc.trainingType},${sc.annualCapacity},₹${sc.stipendSupport},${sc.careerPathway},${sc.geographicDistribution},${sc.accreditation},${sc.totalCost},${sc.uptake},${sc.netBenefit}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "fetp_scenarios.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Reset Inputs */
function resetInputs() {
  document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  currentScenario = null;
}

/* Optimize Configuration */
function optimizeConfiguration() {
  let maxUptake = 0;
  let bestScenario = null;

  const generateCombinations = (attributes, current = {}, index = 0) => {
    if (index === attributes.length) {
      const uptake = computeFETPUptake(current);
      if (uptake > maxUptake) {
        maxUptake = uptake;
        bestScenario = { ...current };
      }
      return;
    }
    const attr = attributes[index];
    attributeOptions[attr].forEach(option => {
      current[attr] = option;
      generateCombinations(attributes, current, index + 1);
    });
  };

  const attributes = Object.keys(attributeOptions);
  generateCombinations(attributes);

  if (bestScenario) {
    Object.keys(bestScenario).forEach(key => {
      const select = document.querySelector(`select[name="${key}"]`);
      if (select) select.value = bestScenario[key];
    });
    alert(`Optimized configuration set for maximum uptake: ${(maxUptake * 100).toFixed(2)}%`);
    currentScenario = bestScenario;
  } else {
    alert("Optimization failed.");
  }
}

// Event listeners for tabs
document.getElementById('probTab-tab').addEventListener('shown.bs.tab', renderUptakeBar);
document.getElementById('costsTab-tab').addEventListener('shown.bs.tab', () => {
  renderCostBenefitChart();
  renderNetBenefitChart();
  renderCostsBenefitsResults();
});