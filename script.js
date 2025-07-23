/* ============================================================
 *  FETP Cost–Value Decision Aid Tool  (with WTP tab)
 * ============================================================ */

/* --------------- Global --------------- */
let currentScenario = null;
let costBenefitChart = null;
let netBenefitChart   = null;
let savedScenarios    = [];

/* --------------- DCE coefficients (logit-scale) --------------- */
const mainCoefficients = {
  base: -0.1,
  delivery_inperson:0.30,     delivery_hybrid:0.50,     delivery_online:0,
  capacity_100:0,             capacity_500:0.20,        capacity_1000:0.40,      capacity_2000:0.60,
  stipend_75000:0,            stipend_100000:0.20,      stipend_150000:0.40,
  trainingModel_parttime:0,   trainingModel_fulltime:0.30,
  career_government:0,        career_international:0.30,career_academic:0.20,     career_private:0.10,
  geographic_centralized:0,   geographic_regional:0.20, geographic_nationwide:0.40,
  accreditation_unaccredited:-0.50, accreditation_national:0.20, accreditation_international:0.50,
  trainingType_frontline:0,   trainingType_intermediate:0.30,   trainingType_advanced:0.50,
  cost_low:0.50,              cost_medium:0,            cost_high:-0.50
};

/* --------------- WTP values (₹ per trainee) ------------------- */
const attributeWTP = {
  delivery_online:0,               delivery_hybrid:20000,            delivery_inperson:30000,
  trainingModel_parttime:0,        trainingModel_fulltime:25000,
  trainingType_frontline:0,        trainingType_intermediate:20000,  trainingType_advanced:40000,
  capacity_100:0,                  capacity_500:10000,               capacity_1000:20000,          capacity_2000:40000,
  cost_low:20000,                  cost_medium:0,                    cost_high:-20000,
  career_government:0,             career_international:20000,       career_academic:15000,         career_private:10000,
  geographic_centralized:0,        geographic_regional:15000,        geographic_nationwide:25000,
  accreditation_unaccredited:-20000, accreditation_national:10000,  accreditation_international:30000
};

/* --------------- Attribute option lists ----------------------- */
const attributeOptions = {
  deliveryMethod:['inperson','hybrid','online'],
  trainingModel:['parttime','fulltime'],
  trainingType:['frontline','intermediate','advanced'],
  annualCapacity:['100','500','1000','2000'],
  stipendSupport:['75000','100000','150000'],
  careerPathway:['government','international','academic','private'],
  geographicDistribution:['centralized','regional','nationwide'],
  accreditation:['unaccredited','national','international'],
  totalCost:['low','medium','high']
};

/* ============================================================
 *  Utility & Uptake
 * ============================================================ */
function utility(sc){
  let U = mainCoefficients.base;
  U+=mainCoefficients[`delivery_${sc.deliveryMethod}`]||0;
  U+=mainCoefficients[`trainingModel_${sc.trainingModel}`]||0;
  U+=mainCoefficients[`trainingType_${sc.trainingType}`]||0;
  U+=mainCoefficients[`capacity_${sc.annualCapacity}`]||0;
  U+=mainCoefficients[`stipend_${sc.stipendSupport}`]||0;
  U+=mainCoefficients[`career_${sc.careerPathway}`]||0;
  U+=mainCoefficients[`geographic_${sc.geographicDistribution}`]||0;
  U+=mainCoefficients[`accreditation_${sc.accreditation}`]||0;
  U+=mainCoefficients[`cost_${sc.totalCost}`]||0;
  return U;
}
function uptake(sc){return Math.exp(utility(sc))/(1+Math.exp(utility(sc)));}

/* ============================================================
 *  WTP
 * ============================================================ */
function wtpPerTrainee(sc){
  let w = 0;
  w+=attributeWTP[`delivery_${sc.deliveryMethod}`]||0;
  w+=attributeWTP[`trainingModel_${sc.trainingModel}`]||0;
  w+=attributeWTP[`trainingType_${sc.trainingType}`]||0;
  w+=attributeWTP[`capacity_${sc.annualCapacity}`]||0;
  w+=attributeWTP[`cost_${sc.totalCost}`]||0;
  w+=attributeWTP[`career_${sc.careerPathway}`]||0;
  w+=attributeWTP[`geographic_${sc.geographicDistribution}`]||0;
  w+=attributeWTP[`accreditation_${sc.accreditation}`]||0;
  return w;
}

/* ============================================================
 *  Scenario builder
 * ============================================================ */
function buildScenario(){
  const sc={}; let ok=true;
  document.querySelectorAll('select[name]').forEach(sel=>{
    sc[sel.name]=sel.value; if(!sel.value) ok=false;
  });
  return ok?sc:null;
}

/* ============================================================
 *  Implausible warnings
 * ============================================================ */
function warnings(sc){
  const w=[];
  if(+sc.annualCapacity>=1000 && +sc.stipendSupport>=150000)
    w.push("High stipend at ≥1 000 trainees may be unrealistic.");
  if(sc.trainingModel==="fulltime" && sc.geographicDistribution==="nationwide" && +sc.stipendSupport<100000)
    w.push("Nation-wide full-time trainees usually need ≥₹100 000 stipend.");
  if(sc.trainingType==="advanced" && sc.accreditation==="unaccredited")
    w.push("Advanced training without accreditation may hurt credibility.");
  if(sc.deliveryMethod==="inperson" && sc.geographicDistribution==="nationwide" && sc.totalCost==="low")
    w.push("Nation-wide in-person delivery rarely feasible at “Low” cost.");
  return w;
}
function warnHTML(arr){
  if(!arr.length)return"";
  return `<div class="alert alert-warning"><strong>Check:</strong><ul class="warning-list">${arr.map(t=>`<li>${t}</li>`).join("")}</ul></div>`;
}

/* ============================================================
 *  Calculate & Modal
 * ============================================================ */
function calculateScenario(){
  currentScenario=buildScenario();
  if(!currentScenario){alert("Fill all fields.");return;}

  const pct=uptake(currentScenario)*100;
  const rec=pct<30?"Uptake low – revise":
            pct<70?"Moderate – tweaks may help":"High – promising";
  const html=`
    <p><strong>Predicted uptake:</strong> ${pct.toFixed(2)} %</p>
    <p><strong>WTP per trainee:</strong> ₹${wtpPerTrainee(currentScenario).toLocaleString()}</p>
    <p><strong>Note:</strong> ${rec}</p>`;
  document.getElementById("modalResults").innerHTML=html;
  document.getElementById("implausibleWarnings").innerHTML=warnHTML(warnings(currentScenario));

  bootstrap.Modal.getOrCreateInstance('#resultModal').show();
  renderAll();
}

/* ============================================================
 *  Render Helpers
 * ============================================================ */
function renderUptakeBar(){
  if(!currentScenario)return;
  const pct=uptake(currentScenario)*100;
  const bar=document.getElementById("uptakeBar");
  bar.textContent=`${pct.toFixed(2)}%`; bar.style.width=`${pct}%`;
  bar.className="progress-bar "+(pct<30?"bg-danger":pct<70?"bg-warning":"bg-success");
}
function renderWTP(){
  const div=document.getElementById("wtpResults");
  if(!currentScenario){div.innerHTML="<p>Please calculate a scenario first.</p>";return;}
  const sc=currentScenario;
  const rows=[
    ["Delivery",attributeWTP[`delivery_${sc.deliveryMethod}`]||0],
    ["Training model",attributeWTP[`trainingModel_${sc.trainingModel}`]||0],
    ["Training type",attributeWTP[`trainingType_${sc.trainingType}`]||0],
    ["Capacity",attributeWTP[`capacity_${sc.annualCapacity}`]||0],
    ["Cost signal",attributeWTP[`cost_${sc.totalCost}`]||0],
    ["Career",attributeWTP[`career_${sc.careerPathway}`]||0],
    ["Geographic",attributeWTP[`geographic_${sc.geographicDistribution}`]||0],
    ["Accreditation",attributeWTP[`accreditation_${sc.accreditation}`]||0]
  ];
  const wtp=wtpPerTrainee(sc);
  const eff=Math.round(+sc.annualCapacity*uptake(sc));
  const value=eff*wtp;
  div.innerHTML=`<table class="table table-sm"><tbody>
    ${rows.map(r=>`<tr><td>${r[0]}</td><td class="text-end">₹${r[1].toLocaleString()}</td></tr>`).join("")}
    <tr class="table-primary"><th>Total WTP/trainee</th><th class="text-end">₹${wtp.toLocaleString()}</th></tr>
    <tr class="table-success"><th>Stakeholder value (total)</th><th class="text-end">₹${value.toLocaleString()}</th></tr>
  </tbody></table>`;
}

/* -------- Cost aggregation -------- */
function g(id){return parseFloat(document.getElementById(id).value)||0;}
function totalCost(){
  return g("direct_salary_inCountry")+g("direct_salary_other")+g("direct_equipment_office")+g("direct_equipment_software")+
         g("direct_facilities_rent")+g("direct_trainee_allowances")+g("direct_trainee_equipment")+g("direct_trainee_software")+
         g("direct_training_materials")+g("direct_training_workshops")+g("direct_travel_inCountry")+g("direct_travel_international")+
         g("direct_other")+g("indirect_admin_management")+g("indirect_admin_maintenance")+g("indirect_inKind_salary")+
         g("indirect_infra_upgrades")+g("indirect_infra_depreciation")+g("indirect_utilities_shared")+g("indirect_prof_legal")+
         g("indirect_training_staff")+g("indirect_opportunity")+g("indirect_other");
}

/* -------- Cost–Value charts -------- */
function renderCostValue(){
  const div=document.getElementById("costsBenefitsResults");
  if(!currentScenario){div.innerHTML="<p>Please calculate a scenario first.</p>";return;}

  const sc=currentScenario;
  const eff=Math.round(+sc.annualCapacity*uptake(sc));
  const cost=totalCost(), value=eff*wtpPerTrainee(sc), net=value-cost;

  /* Column chart */
  if(costBenefitChart)costBenefitChart.destroy();
  costBenefitChart=new Chart(document.getElementById("costBenefitChart"),{
    type:"bar",
    data:{labels:["Cost","Value","Net"],datasets:[{data:[cost,value,net],backgroundColor:["#ef4444","#22c55e","#f59e0b"]}]},
    options:{responsive:true,plugins:{legend:{display:false},title:{display:true,text:"Cost–Value Summary"}},scales:{y:{beginAtZero:true}}}
  });

  /* Doughnut */
  if(netBenefitChart)netBenefitChart.destroy();
  netBenefitChart=new Chart(document.getElementById("netBenefitChart"),{
    type:"doughnut",
    data:{labels:["Surplus","Shortfall"],datasets:[{data:[Math.max(net,0),Math.max(-net,0)],backgroundColor:[net>0?"#22c55e":"#ef4444","#f3f4f6"]}]},
    options:{plugins:{title:{display:true,text:"Net Surplus"}}}
  });

  /* Text */
  const advice=net<0?"Revise design – value < cost":net<50000?"Small surplus – optimise":"Strong surplus";
  div.innerHTML=`
    <p><strong>Effective enrolment:</strong> ${eff.toLocaleString()}</p>
    <p><strong>Total cost:</strong> ₹${cost.toLocaleString()}</p>
    <p><strong>Stakeholder value:</strong> ₹${value.toLocaleString()}</p>
    <p><strong>Net surplus:</strong> ₹${net.toLocaleString()}</p>
    <p><strong>Advice:</strong> ${advice}</p>`;
}

/* ============================================================
 *  Save scenario / table / export
 * ============================================================ */
function saveScenario(){
  if(!currentScenario){alert("Calculate first.");return;}
  const sc=currentScenario;
  const u=uptake(sc), eff=+sc.annualCapacity*u, cost=totalCost(), value=eff*wtpPerTrainee(sc), net=value-cost;
  savedScenarios.push({...sc,name:`Scenario ${savedScenarios.length+1}`,uptake:u*100,value,net});
  updateTable();
}
function updateTable(){
  const tbody=document.querySelector("#scenarioTable tbody"); tbody.innerHTML="";
  savedScenarios.forEach(s=>{
    tbody.insertAdjacentHTML("beforeend",`
      <tr><td>${s.name}</td><td>${s.deliveryMethod}</td><td>${s.trainingModel}</td><td>${s.trainingType}</td>
      <td>${s.annualCapacity}</td><td>₹${(+s.stipendSupport).toLocaleString()}</td><td>${s.careerPathway}</td>
      <td>${s.geographicDistribution}</td><td>${s.accreditation}</td><td>${s.totalCost}</td>
      <td>${s.uptake.toFixed(1)}%</td><td>₹${s.value.toLocaleString()}</td><td>₹${s.net.toLocaleString()}</td></tr>`);
  });
}
/* PDF & CSV (same as earlier; omitted here for brevity – keep previous implementation) */

/* ============================================================
 *  Optimiser
 * ============================================================ */
function optimizeConfiguration(){
  let best=null,max=0;
  const attrs=Object.keys(attributeOptions);
  const dfs=(idx,temp)=>{
    if(idx===attrs.length){
      const u=uptake(temp);
      if(u>max){max=u;best={...temp};}
      return;
    }
    attributeOptions[attrs[idx]].forEach(opt=>{
      temp[attrs[idx]]=opt; dfs(idx+1,temp);
    });
  };
  dfs(0,{});
  Object.keys(best).forEach(k=>document.querySelector(`select[name="${k}"]`).value=best[k]);
  currentScenario=best; renderAll();
  alert(`Optimised: ${ (max*100).toFixed(2) } % uptake.`);
}

/* ============================================================
 *  Misc
 * ============================================================ */
function resetInputs(){
  document.getElementById("inputsForm").reset();
  currentScenario=null; renderAll();
}
function renderAll(){renderUptakeBar();renderWTP();renderCostValue();}

/* -------- Live updates -------- */
["probTab-tab","wtpTab-tab","costsTab-tab"].forEach(id=>{
  document.getElementById(id).addEventListener("shown.bs.tab",renderAll);
});
[
 "direct_salary_inCountry","direct_salary_other","direct_equipment_office","direct_equipment_software",
 "direct_facilities_rent","direct_trainee_allowances","direct_trainee_equipment","direct_trainee_software",
 "direct_training_materials","direct_training_workshops","direct_travel_inCountry","direct_travel_international",
 "direct_other","indirect_admin_management","indirect_admin_maintenance","indirect_inKind_salary",
 "indirect_infra_upgrades","indirect_infra_depreciation","indirect_utilities_shared","indirect_prof_legal",
 "indirect_training_staff","indirect_opportunity","indirect_other"
].forEach(id=>{
  const el=document.getElementById(id); if(el) el.addEventListener("input",renderCostValue);
});

/* Tooltips */
document.addEventListener("DOMContentLoaded",()=>{[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).forEach(el=>new bootstrap.Tooltip(el));});
