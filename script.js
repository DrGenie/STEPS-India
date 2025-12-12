// script.js
/****************************************************************************
 * STEPS FETP India Scale-up Decision Aid
 * - Tab switching and tooltips
 * - Configuration, settings and national simulation logic
 * - Sensitivity summary and exports (Excel, PDF)
 * - Copilot soft integration
 ****************************************************************************/

(function () {
    "use strict";

    // ---------------------------------------------------------------------
    // GLOBAL STATE
    // ---------------------------------------------------------------------

    const state = {
        currency: "INR",
        includeOpportunityCost: true,
        includeEpiBenefitsSensitivity: true,
        sensitivityOutbreakValueBillion: 20,
        currentConfig: null,
        currentResults: null,
        savedScenarios: [],
        costConfigs: [],
        charts: {},
        settings: {
            nonOutbreakValuePerGradINR: 0,
            valuePerOutbreakINR: 20000000000,
            completionRatePct: 90,
            outbreaksPerGradPerYear: 0.5,
            planningHorizonYears: 5,
            epiDiscountRatePct: 3,
            usdRate: 83,
            notes: ""
        }
    };

    // Simple deterministic "model coefficients" for illustration.
    // These give sensible monotone responses but are not intended
    // to replicate any external estimation.
    const modelParams = {
        baseUtility: -0.5,
        tier: {
            frontline: 0.1,
            intermediate: 0.3,
            advanced: 0.5
        },
        career: {
            certificate: 0.1,
            uniqual: 0.2,
            career_path: 0.4
        },
        mentorship: {
            low: 0.0,
            medium: 0.2,
            high: 0.4
        },
        delivery: {
            blended: 0.3,
            inperson: 0.25,
            online: 0.15
        },
        costSlope: -0.000002, // per INR
        responseTimeUtility: 0.4 // fixed at 7 days
    };

    // ---------------------------------------------------------------------
    // DOM HELPERS
    // ---------------------------------------------------------------------

    function $(selector) {
        return document.querySelector(selector);
    }

    function $all(selector) {
        return Array.from(document.querySelectorAll(selector));
    }

    function formatINR(value) {
        if (value == null || isNaN(value)) return "-";
        const abs = Math.abs(value);
        let formatted;
        if (abs >= 1e9) {
            formatted = (value / 1e9).toFixed(2) + " billion";
        } else if (abs >= 1e6) {
            formatted = (value / 1e6).toFixed(2) + " million";
        } else {
            formatted = value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
        }
        return "₹" + formatted;
    }

    function formatINRShortMillions(value) {
        if (value == null || isNaN(value)) return "-";
        return value.toFixed(2);
    }

    function formatPercent(p) {
        if (p == null || isNaN(p)) return "-";
        return p.toFixed(1) + "%";
    }

    function formatRatio(r) {
        if (r == null || isNaN(r)) return "-";
        return r.toFixed(2);
    }

    function nowTimeString() {
        const d = new Date();
        return d.toLocaleString();
    }

    // ---------------------------------------------------------------------
    // TOAST NOTIFICATIONS (BOTTOM RIGHT)
    // ---------------------------------------------------------------------

    function ensureToastContainer() {
        let container = $("#steps-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "steps-toast-container";
            container.style.position = "fixed";
            container.style.bottom = "20px";
            container.style.right = "20px";
            container.style.zIndex = "9999";
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.gap = "8px";
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type = "info") {
        const container = ensureToastContainer();
        const toast = document.createElement("div");
        toast.className = "steps-toast steps-toast-" + type;
        toast.textContent = message;

        // Minimal inline styling that should blend with existing theme
        toast.style.minWidth = "260px";
        toast.style.maxWidth = "360px";
        toast.style.padding = "10px 14px";
        toast.style.borderRadius = "6px";
        toast.style.fontSize = "13px";
        toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        toast.style.backgroundColor = type === "success" ? "#115e38" : (type === "error" ? "#8b1a1a" : "#1f4f82");
        toast.style.color = "#ffffff";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(10px)";
            setTimeout(() => {
                toast.remove();
            }, 200);
        }, 3500);
    }

    // ---------------------------------------------------------------------
    // TOOLTIP HANDLING FOR .info-icon WITH data-tooltip
    // ---------------------------------------------------------------------

    let tooltipEl = null;

    function createTooltip() {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "steps-tooltip";
        tooltipEl.style.position = "fixed";
        tooltipEl.style.zIndex = "9998";
        tooltipEl.style.maxWidth = "320px";
        tooltipEl.style.padding = "8px 10px";
        tooltipEl.style.fontSize = "12px";
        tooltipEl.style.lineHeight = "1.4";
        tooltipEl.style.borderRadius = "6px";
        tooltipEl.style.backgroundColor = "#123456";
        tooltipEl.style.color = "#ffffff";
        tooltipEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.opacity = "0";
        tooltipEl.style.transition = "opacity 0.12s ease";
        document.body.appendChild(tooltipEl);
    }

    function showTooltip(target, text) {
        if (!tooltipEl) createTooltip();
        tooltipEl.textContent = text;
        const rect = target.getBoundingClientRect();
        const top = rect.bottom + 8;
        const left = Math.min(
            rect.left,
            window.innerWidth - tooltipEl.offsetWidth - 16
        );
        tooltipEl.style.top = top + "px";
        tooltipEl.style.left = left + "px";
        tooltipEl.style.opacity = "1";
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.style.opacity = "0";
        }
    }

    function initTooltips() {
        document.addEventListener("mouseenter", function (e) {
            const icon = e.target.closest(".info-icon");
            if (!icon) return;
            const text = icon.getAttribute("data-tooltip");
            if (!text) return;
            showTooltip(icon, text);
        }, true);

        document.addEventListener("mouseleave", function (e) {
            const icon = e.target.closest(".info-icon");
            if (!icon) return;
            hideTooltip();
        }, true);

        document.addEventListener("focusin", function (e) {
            const icon = e.target.closest(".info-icon");
            if (!icon) return;
            const text = icon.getAttribute("data-tooltip");
            if (!text) return;
            showTooltip(icon, text);
        });

        document.addEventListener("focusout", function (e) {
            const icon = e.target.closest(".info-icon");
            if (!icon) return;
            hideTooltip();
        });
    }

    // ---------------------------------------------------------------------
    // TAB SWITCHING
    // ---------------------------------------------------------------------

    function initTabs() {
        const tabLinks = $all(".tab-link");
        tabLinks.forEach(btn => {
            btn.addEventListener("click", () => {
                const tab = btn.getAttribute("data-tab");
                if (!tab) return;

                tabLinks.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const panels = $all(".tab-panel");
                panels.forEach(p => p.classList.remove("active"));

                const target = $("#tab-" + tab);
                if (target) target.classList.add("active");
            });
        });
    }

    // ---------------------------------------------------------------------
    // SETTINGS TAB
    // ---------------------------------------------------------------------

    function readAdvancedSettingsFromForm() {
        const s = state.settings;
        const getNum = (id, fallback) => {
            const el = $(id);
            if (!el) return fallback;
            const v = parseFloat(el.value);
            return isNaN(v) ? fallback : v;
        };

        s.nonOutbreakValuePerGradINR = getNum("#adv-non-outbreak-value-per-graduate", s.nonOutbreakValuePerGradINR);
        s.valuePerOutbreakINR = getNum("#adv-value-per-outbreak", s.valuePerOutbreakINR);
        s.completionRatePct = getNum("#adv-completion-rate", s.completionRatePct);
        s.outbreaksPerGradPerYear = getNum("#adv-outbreaks-per-graduate", s.outbreaksPerGradPerYear);
        s.planningHorizonYears = getNum("#adv-planning-horizon", s.planningHorizonYears);
        s.epiDiscountRatePct = getNum("#adv-epi-discount-rate", s.epiDiscountRatePct);
        s.usdRate = getNum("#adv-usd-rate", s.usdRate);
        const notesEl = $("#adv-notes");
        s.notes = notesEl ? notesEl.value.trim() : s.notes;
    }

    function resetAdvancedSettingsFormToDefaults() {
        const s = {
            nonOutbreakValuePerGradINR: 0,
            valuePerOutbreakINR: 20000000000,
            completionRatePct: 90,
            outbreaksPerGradPerYear: 0.5,
            planningHorizonYears: 5,
            epiDiscountRatePct: 3,
            usdRate: 83,
            notes: ""
        };
        Object.assign(state.settings, s);

        $("#adv-non-outbreak-value-per-graduate").value = s.nonOutbreakValuePerGradINR;
        $("#adv-value-per-outbreak").value = s.valuePerOutbreakINR;
        $("#adv-completion-rate").value = s.completionRatePct;
        $("#adv-outbreaks-per-graduate").value = s.outbreaksPerGradPerYear;
        $("#adv-planning-horizon").value = s.planningHorizonYears;
        $("#adv-epi-discount-rate").value = s.epiDiscountRatePct;
        $("#adv-usd-rate").value = s.usdRate;
        $("#adv-notes").value = "";
    }

    function logAdvancedSettingsChange() {
        const logBox = $("#adv-settings-log");
        if (!logBox) return;

        const s = state.settings;
        const entry = document.createElement("div");
        entry.className = "adv-log-entry";
        entry.style.borderTop = "1px solid rgba(0,0,0,0.06)";
        entry.style.padding = "6px 0";

        const header = document.createElement("div");
        header.style.fontSize = "12px";
        header.style.fontWeight = "600";
        header.textContent = "Settings applied at " + nowTimeString();

        const body = document.createElement("div");
        body.style.fontSize = "12px";
        body.style.marginTop = "2px";

        const parts = [
            "Non outbreak value per graduate per year: " + formatINR(s.nonOutbreakValuePerGradINR),
            "Value per outbreak (INR): " + formatINR(s.valuePerOutbreakINR),
            "Completion rate: " + s.completionRatePct + "%",
            "Outbreak responses per graduate per year: " + s.outbreaksPerGradPerYear,
            "Planning horizon: " + s.planningHorizonYears + " years",
            "Benefit discount rate: " + s.epiDiscountRatePct + "% per year",
            "INR per USD for display: " + s.usdRate
        ];
        if (s.notes && s.notes.length > 0) {
            parts.push("Notes: " + s.notes);
        }
        body.textContent = parts.join(" | ");

        entry.appendChild(header);
        entry.appendChild(body);

        // Prepend
        if (logBox.firstChild) {
            logBox.insertBefore(entry, logBox.firstChild);
        } else {
            logBox.appendChild(entry);
        }
    }

    function initAdvancedSettings() {
        const applyBtn = $("#adv-apply-settings");
        const resetBtn = $("#adv-reset-settings");

        if (applyBtn) {
            applyBtn.addEventListener("click", function () {
                readAdvancedSettingsFromForm();
                logAdvancedSettingsChange();
                updateAllOutputs();
                updateSensitivityTablesAndCharts();
                showToast("Settings applied for this session.", "success");
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                resetAdvancedSettingsFormToDefaults();
                logAdvancedSettingsChange();
                updateAllOutputs();
                updateSensitivityTablesAndCharts();
                showToast("Settings reset to default values.", "info");
            });
        }
    }

    // ---------------------------------------------------------------------
    // CONFIGURATION TAB
    // ---------------------------------------------------------------------

    function readConfigFromForm() {
        const tier = $("#program-tier").value;
        const career = $("#career-track").value;
        const mentorship = $("#mentorship").value;
        const delivery = $("#delivery").value;
        // Response is fixed at 7 days; dropdown is disabled for 30 and 15
        const responseDays = 7;
        const costPerTrainee = parseFloat($("#cost-slider").value);
        const trainees = parseInt($("#trainees").value || "0", 10);
        const cohorts = parseInt($("#cohorts").value || "0", 10);
        const planningHorizonFromConfig = parseInt($("#planning-horizon-config").value || "5", 10);
        const scenarioName = $("#scenario-name").value.trim();
        const scenarioNotes = $("#scenario-notes").value.trim();

        return {
            tier,
            career,
            mentorship,
            delivery,
            responseDays,
            costPerTrainee,
            trainees,
            cohorts,
            planningHorizonFromConfig,
            scenarioName,
            scenarioNotes
        };
    }

    function initConfigControls() {
        const costSlider = $("#cost-slider");
        const costDisplay = $("#cost-display");
        if (costSlider && costDisplay) {
            costSlider.addEventListener("input", function () {
                updateCostDisplay();
            });
            updateCostDisplay();
        }

        const currencyButtons = $all(".pill-toggle");
        currencyButtons.forEach(btn => {
            btn.addEventListener("click", function () {
                currencyButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const currency = btn.getAttribute("data-currency") || "INR";
                state.currency = currency;
                $("#currency-label").textContent = currency;
                updateAllOutputs();
                updateSensitivityTablesAndCharts();
            });
        });

        const oppToggle = $("#opp-toggle");
        if (oppToggle) {
            oppToggle.addEventListener("click", function () {
                state.includeOpportunityCost = !state.includeOpportunityCost;
                oppToggle.classList.toggle("on", state.includeOpportunityCost);
                const label = oppToggle.querySelector(".switch-label");
                if (label) {
                    label.textContent = state.includeOpportunityCost
                        ? "Opportunity cost included"
                        : "Opportunity cost excluded";
                }
                updateAllOutputs();
                updateSensitivityTablesAndCharts();
                showToast(
                    state.includeOpportunityCost
                        ? "Opportunity cost is now included in economic costs."
                        : "Opportunity cost is now excluded from economic costs.",
                    "info"
                );
            });
        }

        const applyConfigBtn = $("#update-results");
        if (applyConfigBtn) {
            applyConfigBtn.addEventListener("click", function () {
                state.currentConfig = readConfigFromForm();
                updateAllOutputs();
                updateSensitivityTablesAndCharts();
                showToast("Configuration applied. Results and charts updated.", "success");
            });
        }

        const saveScenarioBtn = $("#save-scenario");
        if (saveScenarioBtn) {
            saveScenarioBtn.addEventListener("click", function () {
                if (!state.currentConfig || !state.currentResults) {
                    showToast("Please apply a configuration before saving a scenario.", "error");
                    return;
                }
                saveCurrentScenario();
            });
        }

        const openSnapshotBtn = $("#open-snapshot");
        if (openSnapshotBtn) {
            openSnapshotBtn.addEventListener("click", function () {
                if (!state.currentConfig || !state.currentResults) {
                    showToast("Apply a configuration first to see the snapshot.", "info");
                    return;
                }
                openSnapshotDialog();
            });
        }
    }

    function updateCostDisplay() {
        const slider = $("#cost-slider");
        const display = $("#cost-display");
        if (!slider || !display) return;
        const val = parseFloat(slider.value);
        if (state.currency === "USD") {
            const usd = val / (state.settings.usdRate || 83);
            display.textContent = "USD " + usd.toFixed(0);
        } else {
            display.textContent = "INR " + val.toLocaleString("en-IN", { maximumFractionDigits: 0 });
        }
    }

    // ---------------------------------------------------------------------
    // SIMPLE MODEL CALCULATIONS
    // ---------------------------------------------------------------------

    function computeModelOutputs(config) {
        const s = state.settings;

        const tierU = modelParams.tier[config.tier] || 0;
        const careerU = modelParams.career[config.career] || 0;
        const mentorU = modelParams.mentorship[config.mentorship] || 0;
        const deliveryU = modelParams.delivery[config.delivery] || 0;

        const costPenalty = modelParams.costSlope * config.costPerTrainee;
        const responseU = modelParams.responseTimeUtility;

        const V = modelParams.baseUtility + tierU + careerU + mentorU + deliveryU + costPenalty + responseU;
        const endorsementProb = 1 / (1 + Math.exp(-V));
        const endorsementRatePct = endorsementProb * 100;
        const optOutRatePct = 100 - endorsementRatePct;

        // Programme duration in months by tier
        const monthsByTier = {
            frontline: 3,
            intermediate: 12,
            advanced: 24
        };
        const durationMonths = monthsByTier[config.tier] || 12;

        const progCostPerCohort =
            config.costPerTrainee * config.trainees * durationMonths;

        // Opportunity cost approximated as twenty percent uplift when included
        const oppCostPerCohort = state.includeOpportunityCost ? progCostPerCohort * 0.2 : 0;
        const totalEconomicCostPerCohort = progCostPerCohort + oppCostPerCohort;

        // WTP per trainee per month scales with relative utility above zero
        const wtpBase = Math.max(0, V + 0.5); // shift so small positive WTP
        const wtpPerTraineePerMonthINR = wtpBase * 30000; // tuning factor

        const totalWTPCohort =
            wtpPerTraineePerMonthINR * config.trainees * durationMonths;

        // Graduates and epidemiological outputs
        const completionRate = s.completionRatePct / 100;
        const gradsAllCohorts =
            config.trainees *
            config.cohorts *
            completionRate *
            endorsementProb;

        const outbreaksPerYearNational =
            gradsAllCohorts * s.outbreaksPerGradPerYear;

        // Approx outbreaks per cohort: national divided by cohorts, scaled by horizon
        const outbreaksPerCohortOverHorizon =
            (outbreaksPerYearNational / Math.max(config.cohorts, 1)) *
            s.planningHorizonYears;

        const discrate = s.epiDiscountRatePct / 100;
        const annuityFactor =
            discrate > 0
                ? (1 - Math.pow(1 + discrate, -s.planningHorizonYears)) / discrate
                : s.planningHorizonYears;

        const epiBenefitPerCohortINR =
            outbreaksPerCohortOverHorizon * s.valuePerOutbreakINR * (annuityFactor / Math.max(s.planningHorizonYears, 1));

        const netBenefitPerCohort =
            epiBenefitPerCohortINR - totalEconomicCostPerCohort;

        const bcr =
            totalEconomicCostPerCohort > 0
                ? epiBenefitPerCohortINR / totalEconomicCostPerCohort
                : null;

        // National
        const totEconCostNational =
            totalEconomicCostPerCohort * config.cohorts;
        const totEpiBenefitNational =
            epiBenefitPerCohortINR * config.cohorts;
        const netBenefitNational =
            totEpiBenefitNational - totEconCostNational;
        const totalWTPTraineesAllCohorts =
            totalWTPCohort * config.cohorts;

        return {
            endorsementRatePct,
            optOutRatePct,
            wtpPerTraineePerMonthINR,
            totalWTPCohort,
            progCostPerCohort,
            totalEconomicCostPerCohort,
            epiBenefitPerCohortINR,
            netBenefitPerCohort,
            bcr,
            gradsAllCohorts,
            outbreaksPerYearNational,
            totEconCostNational,
            totEpiBenefitNational,
            netBenefitNational,
            totalWTPTraineesAllCohorts
        };
    }

    // ---------------------------------------------------------------------
    // UPDATE ALL OUTPUTS (RESULTS, COSTING, NATIONAL, COPILOT)
    // ---------------------------------------------------------------------

    function updateAllOutputs() {
        if (!state.currentConfig) {
            // Nothing to compute yet
            return;
        }

        const cfg = state.currentConfig;
        const res = computeModelOutputs(cfg);
        state.currentResults = res;

        updateConfigSummary(cfg, res);
        updateResultTab(cfg, res);
        updateCostingTab(cfg, res);
        updateNationalSimulationTab(cfg, res);
        updateCopilotStatus(cfg, res);
    }

    // ---------------------------------------------------------------------
    // CONFIG SUMMARY PANEL
    // ---------------------------------------------------------------------

    function updateConfigSummary(cfg, res) {
        const summaryBox = $("#config-summary");
        if (!summaryBox) return;

        const parts = [];
        parts.push("Tier: " + titleFromValue(cfg.tier));
        parts.push("Career incentive: " + titleFromValue(cfg.career));
        parts.push("Mentorship: " + titleFromValue(cfg.mentorship));
        parts.push("Delivery: " + titleFromValue(cfg.delivery));
        parts.push("Response time (assumed): " + cfg.responseDays + " days");
        parts.push("Cohorts: " + cfg.cohorts);
        parts.push("Trainees per cohort: " + cfg.trainees);
        parts.push("Cost per trainee per month: " + formatINR(cfg.costPerTrainee));

        summaryBox.textContent = parts.join(" | ");

        const endorsementSpan = $("#config-endorsement-value");
        if (endorsementSpan) {
            endorsementSpan.textContent = formatPercent(res.endorsementRatePct);
        }

        const statusTag = $("#headline-status-tag");
        const recText = $("#headline-recommendation");
        const briefText = $("#headline-briefing-text");

        if (!statusTag || !recText || !briefText) return;

        let label = "Neutral";
        let cls = "status-pill status-neutral";
        let message = "This configuration has moderate endorsement and a balanced cost benefit profile.";
        if (res.bcr != null && res.bcr > 1.2 && res.endorsementRatePct > 60) {
            label = "Strong candidate";
            cls = "status-pill status-strong";
            message = "This configuration has high endorsement and strong approximate outbreak related benefits relative to economic costs.";
        } else if (res.bcr != null && res.bcr < 0.8) {
            label = "Cautious";
            cls = "status-pill status-caution";
            message = "Approximate outbreak related benefits are lower than economic costs on the current assumptions. Consider revisiting cost or scale.";
        }

        statusTag.className = cls;
        statusTag.textContent = label;

        recText.textContent = message;

        briefText.textContent =
            "For the selected tier, mentorship and delivery mix, the model predicts an endorsement rate of " +
            formatPercent(res.endorsementRatePct) +
            " and an opt out share of " +
            formatPercent(res.optOutRatePct) +
            ". Economic cost per cohort is " +
            formatINR(res.totalEconomicCostPerCohort) +
            " with an indicative outbreak related benefit of " +
            formatINR(res.epiBenefitPerCohortINR) +
            " and a benefit cost ratio of " +
            formatRatio(res.bcr) +
            ". At national level this represents total economic costs of " +
            formatINR(res.totEconCostNational) +
            " for approximately " +
            Math.round(res.gradsAllCohorts).toLocaleString("en-IN") +
            " graduates and around " +
            Math.round(res.outbreaksPerYearNational).toLocaleString("en-IN") +
            " outbreak responses per year.";
    }

    function titleFromValue(value) {
        switch (value) {
            case "frontline":
                return "Frontline";
            case "intermediate":
                return "Intermediate";
            case "advanced":
                return "Advanced";
            case "certificate":
                return "Government and partner certificate";
            case "uniqual":
                return "University qualification";
            case "career_path":
                return "Government career pathway";
            case "low":
                return "Low mentorship";
            case "medium":
                return "Medium mentorship";
            case "high":
                return "High mentorship";
            case "blended":
                return "Blended delivery";
            case "inperson":
                return "Fully in person";
            case "online":
                return "Fully online";
            default:
                return value;
        }
    }

    // ---------------------------------------------------------------------
    // RESULTS TAB
    // ---------------------------------------------------------------------

    function updateResultTab(cfg, res) {
        $("#endorsement-rate").textContent = formatPercent(res.endorsementRatePct);
        $("#optout-rate").textContent = formatPercent(res.optOutRatePct);

        $("#wtp-per-trainee").textContent = formatINR(res.wtpPerTraineePerMonthINR);
        $("#wtp-total-cohort").textContent = formatINR(res.totalWTPCohort);
        $("#prog-cost-per-cohort").textContent = formatINR(res.progCostPerCohort);
        $("#total-cost").textContent = formatINR(res.totalEconomicCostPerCohort);
        $("#net-benefit").textContent = formatINR(res.netBenefitPerCohort);
        $("#bcr").textContent = formatRatio(res.bcr);

        $("#epi-graduates").textContent = Math.round(res.gradsAllCohorts).toLocaleString("en-IN");
        $("#epi-outbreaks").textContent = Math.round(res.outbreaksPerYearNational).toLocaleString("en-IN");
        $("#epi-benefit").textContent = formatINR(res.epiBenefitPerCohortINR);

        updateResultCharts(cfg, res);
    }

    function initOrUpdateChart(name, canvasId, chartConfig) {
        const canvas = $(canvasId);
        if (!canvas) return;
        if (state.charts[name]) {
            state.charts[name].data = chartConfig.data;
            state.charts[name].options = chartConfig.options;
            state.charts[name].update();
            return;
        }
        const ctx = canvas.getContext("2d");
        state.charts[name] = new Chart(ctx, chartConfig);
    }

    function updateResultCharts(cfg, res) {
        // Uptake chart
        initOrUpdateChart("uptake", "#chart-uptake", {
            type: "doughnut",
            data: {
                labels: ["Endorse FETP", "Opt out"],
                datasets: [{
                    data: [res.endorsementRatePct, res.optOutRatePct]
                }]
            },
            options: {
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });

        // Cost vs benefit per cohort
        initOrUpdateChart("bcr", "#chart-bcr", {
            type: "bar",
            data: {
                labels: ["Economic cost per cohort", "Epi benefit per cohort"],
                datasets: [{
                    data: [res.totalEconomicCostPerCohort, res.epiBenefitPerCohortINR]
                }]
            },
            options: {
                indexAxis: "y",
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: function (v) {
                                return (v / 1e6).toFixed(1) + "m";
                            }
                        }
                    }
                }
            }
        });

        // Epidemiological chart
        initOrUpdateChart("epi", "#chart-epi", {
            type: "bar",
            data: {
                labels: ["Graduates (all cohorts)", "Outbreak responses per year"],
                datasets: [{
                    data: [res.gradsAllCohorts, res.outbreaksPerYearNational]
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // ---------------------------------------------------------------------
    // COSTING TAB
    // ---------------------------------------------------------------------

    function initCosting() {
        const costSourceSelect = $("#cost-source");
        if (costSourceSelect) {
            state.costConfigs = [
                { id: "financial", label: "Financial cost only" },
                { id: "economic", label: "Economic cost including opportunity cost" },
                { id: "high_opp", label: "Higher opportunity cost scenario" }
            ];
            state.costConfigs.forEach(cfg => {
                const opt = document.createElement("option");
                opt.value = cfg.id;
                opt.textContent = cfg.label;
                costSourceSelect.appendChild(opt);
            });
            costSourceSelect.value = "economic";
            costSourceSelect.addEventListener("change", function () {
                updateCostingTab(state.currentConfig, state.currentResults);
            });
        }
    }

    function updateCostingTab(cfg, res) {
        if (!cfg || !res) return;
        const costSummaryBox = $("#cost-breakdown-summary");
        if (!costSummaryBox) return;

        const costSourceSelect = $("#cost-source");
        const selectedCostId = costSourceSelect ? costSourceSelect.value : "economic";

        let econCost = res.totalEconomicCostPerCohort;
        let label = "Economic cost per cohort used in benefit cost ratios: " + formatINR(econCost);

        if (selectedCostId === "financial") {
            econCost = res.progCostPerCohort;
            label = "Financial programme cost per cohort without opportunity cost: " + formatINR(econCost);
        } else if (selectedCostId === "high_opp") {
            econCost = res.progCostPerCohort * 1.4;
            label = "Economic cost per cohort under higher opportunity cost assumption: " + formatINR(econCost);
        }

        costSummaryBox.textContent = label;

        const tbody = $("#cost-components-list");
        if (!tbody) return;
        tbody.innerHTML = "";

        // Simple illustrative breakdown
        const components = [
            { name: "Staff salary and benefits", share: 0.45, note: "Faculty, mentors and core staff time." },
            { name: "Trainee support and travel", share: 0.25, note: "Travel, accommodation and trainee allowances." },
            { name: "Training and teaching materials", share: 0.12, note: "Materials, equipment and digital platforms." },
            { name: "Programme management and overhead", share: 0.10, note: "Management, administration and overhead." },
            { name: "Opportunity cost of trainee time", share: 0.08, note: "Trainee salary time in training rather than normal duties, where included." }
        ];

        components.forEach(c => {
            const tr = document.createElement("tr");
            const amountPerCohort = econCost * c.share;
            const monthsByTier = { frontline: 3, intermediate: 12, advanced: 24 };
            const months = monthsByTier[cfg.tier] || 12;
            const amountPerTraineePerMonth = cfg.trainees > 0 && months > 0
                ? amountPerCohort / (cfg.trainees * months)
                : 0;

            tr.innerHTML = `
                <td>${c.name}</td>
                <td>${(c.share * 100).toFixed(1)}%</td>
                <td>${formatINR(amountPerCohort)}</td>
                <td>${formatINR(amountPerTraineePerMonth)}</td>
                <td>${c.note}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ---------------------------------------------------------------------
    // NATIONAL SIMULATION TAB
    // ---------------------------------------------------------------------

    function updateNationalSimulationTab(cfg, res) {
        if (!cfg || !res) return;

        $("#nat-total-cost").textContent = formatINR(res.totEconCostNational);
        $("#nat-total-benefit").textContent = formatINR(res.totEpiBenefitNational);
        $("#nat-net-benefit").textContent = formatINR(res.netBenefitNational);

        const natBCR = res.totEconCostNational > 0
            ? res.totEpiBenefitNational / res.totEconCostNational
            : null;
        $("#nat-bcr").textContent = formatRatio(natBCR);
        $("#nat-total-wtp").textContent = formatINR(res.totalWTPTraineesAllCohorts);

        $("#nat-graduates").textContent = Math.round(res.gradsAllCohorts).toLocaleString("en-IN");
        $("#nat-outbreaks").textContent = Math.round(res.outbreaksPerYearNational).toLocaleString("en-IN");

        initOrUpdateChart("nat-cost-benefit", "#chart-nat-cost-benefit", {
            type: "bar",
            data: {
                labels: ["Total economic cost", "Total epi benefit"],
                datasets: [{
                    data: [res.totEconCostNational, res.totEpiBenefitNational]
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function (v) {
                                return (v / 1e9).toFixed(1) + "b";
                            }
                        }
                    }
                }
            }
        });

        initOrUpdateChart("nat-epi", "#chart-nat-epi", {
            type: "bar",
            data: {
                labels: ["Total graduates", "Outbreak responses per year"],
                datasets: [{
                    data: [res.gradsAllCohorts, res.outbreaksPerYearNational]
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                }
            }
        });

        const summaryText = $("#natsim-summary-text");
        if (summaryText) {
            summaryText.textContent =
                "At national level, this configuration produces around " +
                Math.round(res.gradsAllCohorts).toLocaleString("en-IN") +
                " graduates across " +
                cfg.cohorts +
                " cohorts, with an approximate total economic cost of " +
                formatINR(res.totEconCostNational) +
                " over the chosen planning horizon. The epidemiological module suggests an indicative total outbreak related benefit of " +
                formatINR(res.totEpiBenefitNational) +
                ", giving a national benefit cost ratio of " +
                formatRatio(natBCR) +
                ". The configuration would support roughly " +
                Math.round(res.outbreaksPerYearNational).toLocaleString("en-IN") +
                " outbreak or public health event responses per year once graduates are in post.";
        }
    }

    // ---------------------------------------------------------------------
    // SENSITIVITY TAB
    // ---------------------------------------------------------------------

    function initSensitivityControls() {
        const outbreakValueSelect = $("#outbreak-value-sensitivity");
        const applyValueBtn = $("#apply-outbreak-value-btn");
        const epiToggle = $("#sensitivity-epi-toggle");
        const benefitDefSelect = $("#benefit-definition-select");
        const refreshBtn = $("#refresh-sensitivity-benefits");
        const exportExcelBtn = $("#export-sensitivity-benefits-excel");
        const exportPdfBtn = $("#export-sensitivity-benefits-pdf");

        if (outbreakValueSelect && applyValueBtn) {
            applyValueBtn.addEventListener("click", function () {
                const val = parseFloat(outbreakValueSelect.value);
                if (!isNaN(val)) {
                    state.sensitivityOutbreakValueBillion = val;
                    showToast(
                        "Sensitivity value per outbreak set to ₹" + val + " billion for this tab.",
                        "success"
                    );
                    updateSensitivityTablesAndCharts();
                }
            });
        }

        if (epiToggle) {
            epiToggle.addEventListener("click", function () {
                state.includeEpiBenefitsSensitivity = !state.includeEpiBenefitsSensitivity;
                epiToggle.classList.toggle("on", state.includeEpiBenefitsSensitivity);
                const label = epiToggle.querySelector(".switch-label");
                if (label) {
                    label.textContent = state.includeEpiBenefitsSensitivity
                        ? "Outbreak benefits included"
                        : "Outbreak benefits excluded";
                }
                updateSensitivityTablesAndCharts();
                showToast(
                    state.includeEpiBenefitsSensitivity
                        ? "Epidemiological outbreak benefits are now included in the sensitivity view."
                        : "Epidemiological outbreak benefits are now excluded from the sensitivity view.",
                    "info"
                );
            });
        }

        if (benefitDefSelect) {
            benefitDefSelect.addEventListener("change", function () {
                updateSensitivityTablesAndCharts();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener("click", function () {
                updateSensitivityTablesAndCharts();
                showToast("Sensitivity summary updated.", "success");
            });
        }

        if (exportExcelBtn) {
            exportExcelBtn.addEventListener("click", function () {
                exportTableToExcel("sensitivity-table", "STEPS_sensitivity_summary.xlsx");
            });
        }

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener("click", function () {
                exportTableToPDF("sensitivity-table", "STEPS_sensitivity_summary.pdf", "WTP based benefits and sensitivity");
            });
        }
    }

    function updateSensitivityTablesAndCharts() {
        const headlineBody = $("#dce-benefits-table-body");
        const sensBody = $("#sensitivity-table-body");
        if (!headlineBody || !sensBody) return;

        headlineBody.innerHTML = "";
        sensBody.innerHTML = "";

        if (!state.currentConfig || !state.currentResults) return;

        const allScenarios = [
            {
                label: state.currentConfig.scenarioName || "Current configuration",
                config: state.currentConfig,
                results: state.currentResults
            },
            ...state.savedScenarios.map(s => ({
                label: s.scenarioName || "Saved scenario",
                config: s.config,
                results: s.results
            }))
        ];

        const benefitDef = $("#benefit-definition-select")
            ? $("#benefit-definition-select").value
            : "wtp_only";

        const overrideEndorseEl = $("#endorsement-override");
        const overrideEndorseVal = overrideEndorseEl && overrideEndorseEl.value.trim() !== ""
            ? parseFloat(overrideEndorseEl.value)
            : null;

        const includeEpi = state.includeEpiBenefitsSensitivity;
        const valuePerOutbreakSensINR = state.sensitivityOutbreakValueBillion * 1e9;

        allScenarios.forEach(scen => {
            const cfg = scen.config;
            const base = scen.results;

            const endorseUsed = overrideEndorseVal != null
                ? overrideEndorseVal
                : base.endorsementRatePct;

            // Recompute epi benefit per cohort for sensitivity with chosen outbreak value
            const epiBenefitPerCohortSens =
                base.epiBenefitPerCohortINR *
                (valuePerOutbreakSensINR / state.settings.valuePerOutbreakINR);

            const epiBenefitAllCohortsSens =
                epiBenefitPerCohortSens * cfg.cohorts;

            const totalCostAllCohorts = base.totalEconomicCostPerCohort * cfg.cohorts;

            const totalWTPAllCohorts = base.totalWTPTraineesAllCohorts;

            const effectiveWTPAllCohorts =
                totalWTPAllCohorts * (endorseUsed / 100);

            const combinedBenefitAllCohorts = includeEpi
                ? totalWTPAllCohorts + epiBenefitAllCohortsSens
                : totalWTPAllCohorts;

            const effectiveCombinedBenefitAllCohorts = includeEpi
                ? effectiveWTPAllCohorts + epiBenefitAllCohortsSens
                : effectiveWTPAllCohorts;

            const bcrWtpOnly =
                totalCostAllCohorts > 0
                    ? totalWTPAllCohorts / totalCostAllCohorts
                    : null;

            const npvWtpOnly =
                totalWTPAllCohorts - totalCostAllCohorts;

            const bcrCombined =
                totalCostAllCohorts > 0
                    ? combinedBenefitAllCohorts / totalCostAllCohorts
                    : null;

            const npvCombined =
                combinedBenefitAllCohorts - totalCostAllCohorts;

            // Choose cost and benefit fields for headline given benefit definition
            let headlineCost = totalCostAllCohorts;
            let headlineNet = npvWtpOnly;
            let headlineBcr = bcrWtpOnly;
            let headlineEpi = includeEpi ? epiBenefitAllCohortsSens : 0;
            let headlineEffective = effectiveWTPAllCohorts;

            if (benefitDef === "wtp_plus_epi") {
                headlineNet = npvCombined;
                headlineBcr = bcrCombined;
                headlineEffective = effectiveCombinedBenefitAllCohorts;
            } else if (benefitDef === "endorsement_adjusted") {
                headlineEffective = effectiveWTPAllCohorts;
            }

            const headlineRow = document.createElement("tr");
            headlineRow.innerHTML = `
                <td>${scen.label}</td>
                <td>${formatINR(headlineCost)}</td>
                <td>${formatINRShortMillions(totalCostAllCohorts / 1e6)}</td>
                <td>${formatINRShortMillions(headlineNet / 1e6)}</td>
                <td>${formatINR(totalWTPAllCohorts)}</td>
                <td>${formatINR(totalWTPAllCohorts * 0.4)}</td>
                <td>${includeEpi ? formatINR(epiBenefitAllCohortsSens) : "Not included"}</td>
                <td>${endorseUsed.toFixed(1)}</td>
                <td>${formatINR(headlineEffective)}</td>
                <td>${formatRatio(bcrWtpOnly)}</td>
                <td>${formatINR(npvWtpOnly)}</td>
                <td>${includeEpi ? formatRatio(bcrCombined) : "Not applicable"}</td>
                <td>${includeEpi ? formatINR(npvCombined) : "Not applicable"}</td>
            `;
            headlineBody.appendChild(headlineRow);

            const sensRow = document.createElement("tr");
            sensRow.innerHTML = `
                <td>${scen.label}</td>
                <td>Mixed logit overall</td>
                <td>${base.endorsementRatePct.toFixed(1)}%</td>
                <td>${formatINR(base.totalEconomicCostPerCohort)}</td>
                <td>${formatINR(base.totalWTPCohort)}</td>
                <td>${formatINR(base.totalWTPCohort * 0.4)}</td>
                <td>${includeEpi ? formatINR(epiBenefitPerCohortSens) : "Not included"}</td>
                <td>${formatRatio(bcrWtpOnly)}</td>
                <td>${formatINR(npvWtpOnly)}</td>
                <td>${includeEpi ? formatRatio(bcrCombined) : "Not applicable"}</td>
                <td>${includeEpi ? formatINR(npvCombined) : "Not applicable"}</td>
                <td>${formatINR(effectiveWTPAllCohorts / cfg.cohorts)}</td>
                <td>${includeEpi ? formatINR(effectiveCombinedBenefitAllCohorts / cfg.cohorts) : "Not applicable"}</td>
            `;
            sensBody.appendChild(sensRow);
        });

        // A chart could be added here if needed; for now we keep tables primary.
    }

    // ---------------------------------------------------------------------
    // TABLE EXPORTS
    // ---------------------------------------------------------------------

    function exportTableToExcel(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) {
            showToast("Table not found for Excel export.", "error");
            return;
        }
        const wb = XLSX.utils.table_to_book(table, { sheet: "Sensitivity" });
        XLSX.writeFile(wb, filename || "table.xlsx");
        showToast("Excel file downloaded.", "success");
    }

    function exportTableToPDF(tableId, filename, title) {
        const table = document.getElementById(tableId);
        if (!table) {
            showToast("Table not found for PDF export.", "error");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "landscape" });

        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 10;
        const marginTop = 16;
        const usableWidth = pageWidth - marginLeft * 2;

        doc.setFontSize(14);
        doc.text(title || "Sensitivity summary", marginLeft, marginTop);

        let y = marginTop + 6;
        doc.setFontSize(9);

        const headers = [];
        const headerRow = table.querySelector("thead tr");
        headerRow.querySelectorAll("th").forEach(th => {
            headers.push(th.textContent.trim());
        });

        const rows = [];
        table.querySelectorAll("tbody tr").forEach(tr => {
            const row = [];
            tr.querySelectorAll("td").forEach(td => {
                row.push(td.textContent.trim());
            });
            rows.push(row);
        });

        const colCount = headers.length;
        const colWidth = usableWidth / colCount;

        function drawRow(cells, isHeader) {
            let x = marginLeft;
            const lineHeight = 5;
            let maxLines = 1;
            const splitCells = cells.map(text => {
                const split = doc.splitTextToSize(text, colWidth - 2);
                if (split.length > maxLines) maxLines = split.length;
                return split;
            });
            const rowHeight = lineHeight * maxLines + 2;

            if (y + rowHeight > doc.internal.pageSize.getHeight() - 10) {
                doc.addPage();
                y = marginTop;
            }

            splitCells.forEach((lines, idx) => {
                doc.rect(x, y, colWidth, rowHeight);
                let textY = y + lineHeight;
                lines.forEach(line => {
                    doc.text(line, x + 1, textY);
                    textY += lineHeight;
                });
                x += colWidth;
            });

            y += rowHeight;
        }

        drawRow(headers, true);
        rows.forEach(r => drawRow(r, false));

        doc.save(filename || "table.pdf");
        showToast("PDF file downloaded.", "success");
    }

    // ---------------------------------------------------------------------
    // SCENARIOS TAB
    // ---------------------------------------------------------------------

    function saveCurrentScenario() {
        const cfg = { ...state.currentConfig };
        const res = { ...state.currentResults };

        const scenario = {
            scenarioName: cfg.scenarioName || "Scenario " + (state.savedScenarios.length + 1),
            tags: "",
            config: cfg,
            results: res,
            notes: cfg.scenarioNotes || ""
        };
        state.savedScenarios.push(scenario);
        updateScenariosTable();
        updateSensitivityTablesAndCharts();
        showToast("Scenario saved and added to the comparison table.", "success");
    }

    function updateScenariosTable() {
        const tbody = $("#scenario-table tbody");
        if (!tbody) return;
        tbody.innerHTML = "";

        state.savedScenarios.forEach((s, idx) => {
            const cfg = s.config;
            const res = s.results;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="checkbox" data-scenario-index="${idx}"></td>
                <td>${s.scenarioName}</td>
                <td>${s.tags || ""}</td>
                <td>${titleFromValue(cfg.tier)}</td>
                <td>${titleFromValue(cfg.career)}</td>
                <td>${titleFromValue(cfg.mentorship)}</td>
                <td>${titleFromValue(cfg.delivery)}</td>
                <td>${cfg.responseDays} days</td>
                <td>${cfg.cohorts}</td>
                <td>${cfg.trainees}</td>
                <td>${formatINR(cfg.costPerTrainee)}</td>
                <td>Mixed logit overall</td>
                <td>${formatPercent(res.endorsementRatePct)}</td>
                <td>${formatINR(res.wtpPerTraineePerMonthINR)}</td>
                <td>${formatINR(res.totalWTPTraineesAllCohorts)}</td>
                <td>${formatRatio(res.bcr)}</td>
                <td>${formatINR(res.totEconCostNational)}</td>
                <td>${formatINR(res.totEpiBenefitNational)}</td>
                <td>${formatINR(res.netBenefitNational)}</td>
                <td>${Math.round(res.outbreaksPerYearNational).toLocaleString("en-IN")}</td>
                <td>${s.notes || ""}</td>
            `;
            tbody.appendChild(tr);
        });

        const exportExcelBtn = $("#export-excel");
        const exportPdfBtn = $("#export-pdf");

        if (exportExcelBtn) {
            exportExcelBtn.onclick = function () {
                exportTableToExcel("scenario-table", "STEPS_saved_scenarios.xlsx");
            };
        }

        if (exportPdfBtn) {
            exportPdfBtn.onclick = function () {
                exportTableToPDF("scenario-table", "STEPS_saved_scenarios.pdf", "Saved scenarios and headline indicators");
            };
        }
    }

    function openSnapshotDialog() {
        // For now use a simple alert style text snapshot.
        const cfg = state.currentConfig;
        const res = state.currentResults;
        let text = "";
        text += "Current configuration snapshot\n\n";
        text += "Tier: " + titleFromValue(cfg.tier) + "\n";
        text += "Career incentive: " + titleFromValue(cfg.career) + "\n";
        text += "Mentorship: " + titleFromValue(cfg.mentorship) + "\n";
        text += "Delivery: " + titleFromValue(cfg.delivery) + "\n";
        text += "Response time assumed: " + cfg.responseDays + " days\n";
        text += "Cohorts: " + cfg.cohorts + "\n";
        text += "Trainees per cohort: " + cfg.trainees + "\n";
        text += "Cost per trainee per month: " + formatINR(cfg.costPerTrainee) + "\n\n";
        text += "Endorsement: " + formatPercent(res.endorsementRatePct) + "\n";
        text += "Opt out: " + formatPercent(res.optOutRatePct) + "\n";
        text += "Economic cost per cohort: " + formatINR(res.totalEconomicCostPerCohort) + "\n";
        text += "Indicative epi benefit per cohort: " + formatINR(res.epiBenefitPerCohortINR) + "\n";
        text += "Benefit cost ratio: " + formatRatio(res.bcr) + "\n";

        alert(text);
    }

    // ---------------------------------------------------------------------
    // COPILOT TAB
    // ---------------------------------------------------------------------

    function updateCopilotStatus(cfg, res) {
        const statusPill = $("#copilot-status-pill");
        const statusText = $("#copilot-status-text");
        if (!statusPill || !statusText) return;

        statusPill.textContent = "Prompt ready";
        statusPill.className = "copilot-status-pill copilot-status-ready";
        statusText.textContent =
            "The Copilot interpretation text will be refreshed the next time you click the button, using the latest configuration and results.";
    }

    function initCopilotIntegration() {
        const btn = $("#copilot-open-and-copy-btn");
        const textarea = $("#copilot-prompt-output");

        if (!btn || !textarea) return;

        btn.addEventListener("click", function () {
            if (!state.currentConfig || !state.currentResults) {
                showToast("Apply a configuration before preparing the Copilot prompt.", "error");
                return;
            }

            const cfg = state.currentConfig;
            const res = state.currentResults;
            const s = state.settings;

            const payload = {
                configuration: cfg,
                results: res,
                settings: s,
                sensitivity: {
                    valuePerOutbreakBillion: state.sensitivityOutbreakValueBillion,
                    includeEpiBenefits: state.includeEpiBenefitsSensitivity
                }
            };

            const promptText =
`You are helping to prepare a policy briefing note for the Field Epidemiology Training Program (FETP) in India using the STEPS decision aid.

First carefully read the JSON object at the end of this prompt. It contains the current scenario configuration, modelled endorsement, willingness to pay, economic costs, national epidemiological outputs, benefit cost ratios and sensitivity settings. Interpret all monetary values as Indian rupees unless stated otherwise.

Using this information, prepare a structured three to five page policy brief with the following sections:
1. Background and context for FETP scale up in India.
2. Description of the current training configuration, including tier, mentorship, delivery mode, cohorts and trainees.
3. Predicted endorsement and opt out patterns from the mixed logit preference model.
4. Cost summary including programme cost, total economic cost and the role of opportunity cost.
5. Approximate outbreak related epidemiological benefits and national graduates and outbreak responses.
6. Benefit cost ratios and net benefits, explaining what these numbers mean for decision makers.
7. Sensitivity and alternative assumptions, using the sensitivity settings provided.
8. Key messages for ministries of health and finance, the World Bank and partners.

Include at least two small tables, one summarising the configuration and headline indicators, and one summarising national costs, benefits and benefit cost ratios. Use clear language suitable for a joint government and partner meeting.

Now here is the JSON object from STEPS:

` + JSON.stringify(payload, null, 2);

            textarea.value = promptText;

            navigator.clipboard.writeText(promptText).then(
                () => {
                    showToast("Copilot prompt copied to clipboard.", "success");
                },
                () => {
                    showToast("Prompt updated. Please copy it manually from the panel.", "info");
                }
            );

            window.open("https://copilot.microsoft.com/", "_blank");
        });
    }

    // ---------------------------------------------------------------------
    // INITIALISATION
    // ---------------------------------------------------------------------

    document.addEventListener("DOMContentLoaded", function () {
        initTabs();
        initTooltips();
        initAdvancedSettings();
        initConfigControls();
        initCosting();
        initSensitivityControls();
        updateScenariosTable();
        initCopilotIntegration();
    });

})();
