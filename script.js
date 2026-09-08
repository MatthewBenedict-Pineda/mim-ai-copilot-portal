// ============================
// 1. HERO TYPING EFFECT
// ============================
const heroText = "An AI-Powered Quick Reference and Incident Response Dashboard for Major Incident Managers";
const heroEl = document.getElementById("heroSubtitle");
let typeIndex = 0;

function typeHero() {
    if (typeIndex <= heroText.length) {
        heroEl.textContent = heroText.slice(0, typeIndex);
        typeIndex++;
        setTimeout(typeHero, 18);
    }
}
document.addEventListener("DOMContentLoaded", typeHero);

// ============================
// 2. SCROLL PROGRESS BAR + BACK TO TOP
// ============================
const progressBar = document.getElementById("progressBar");
const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";

    if (backToTopBtn) {
        backToTopBtn.classList.toggle("visible", scrollTop > 500);
    }
});

// ============================
// 3. SCROLL REVEAL ANIMATION
// ============================
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ============================
// 4. ACTIVE NAV LINK ON SCROLL
// ============================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute("id");
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove("active"));
            if (link) link.classList.add("active");
        }
    });
}, { threshold: 0.4 });

sections.forEach(sec => navObserver.observe(sec));

// ============================
// 5. CLICKABLE CHECKLISTS (generalized for multiple lists)
// ============================
function makeChecklistInteractive(listId, onUpdate) {
    const list = document.getElementById(listId);
    if (!list) return;
    const items = list.querySelectorAll("li");

    function update() {
        const total = items.length;
        const checked = list.querySelectorAll("li.checked").length;
        if (onUpdate) onUpdate(checked, total);
    }

    items.forEach(item => {
        item.addEventListener("click", () => {
            item.classList.toggle("checked");
            update();
        });
    });

    update();
}

const mainProgressFill = document.getElementById("checklistProgressFill");
const mainProgressText = document.getElementById("checklistProgressText");
makeChecklistInteractive("checklistItems", (checked, total) => {
    if (mainProgressFill) mainProgressFill.style.width = (total > 0 ? (checked / total) * 100 : 0) + "%";
    if (mainProgressText) mainProgressText.textContent = `${checked} / ${total} Steps`;
});

const pirProgressText = document.getElementById("pirProgressText");
const pirProgressFill = document.getElementById("pirProgressFill");
const pirProgressSideText = document.getElementById("pirProgressSideText");
makeChecklistInteractive("pirItems", (checked, total) => {
    if (pirProgressText) pirProgressText.textContent = `${checked} / ${total} completed`;
    if (pirProgressFill) pirProgressFill.style.width = (total > 0 ? (checked / total) * 100 : 0) + "%";
    if (pirProgressSideText) pirProgressSideText.textContent = `${checked} / ${total} Steps`;
});

// ============================
// 6. LIVE CLOCK + DATE WIDGET (12-hour AM/PM)
// ============================
const liveClock = document.getElementById("liveClock");
const liveDate = document.getElementById("liveDate");
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function updateClock() {
    const now = new Date();

    if (liveClock) {
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;
        liveClock.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    if (liveDate) {
        const day = dayNames[now.getDay()];
        const month = monthNames[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();
        liveDate.textContent = `${day}, ${month} ${date}, ${year}`;
    }
}

updateClock();
setInterval(updateClock, 1000);

// ============================
// 7. NEXT UPDATE TIMER (cadence countdown)
// ============================
let cadenceMinutes = 30;
let secondsRemaining = cadenceMinutes * 60;
let timerRunning = false;
let timerInterval = null;

const updateTimerEl = document.getElementById("updateTimer");
const timerStartBtn = document.getElementById("timerStartBtn");

function renderTimer() {
    if (!updateTimerEl) return;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    updateTimerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    updateTimerEl.classList.toggle("warning", secondsRemaining <= 60);
}

function setCadence(mins, btn) {
    cadenceMinutes = mins;
    secondsRemaining = mins * 60;
    document.querySelectorAll(".cadence-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderTimer();
}

function toggleTimer() {
    if (!timerStartBtn) return;
    timerRunning = !timerRunning;
    if (timerRunning) {
        timerStartBtn.textContent = "⏸ Pause";
        timerInterval = setInterval(() => {
            if (secondsRemaining > 0) {
                secondsRemaining--;
                renderTimer();
            } else {
                clearInterval(timerInterval);
                timerRunning = false;
                timerStartBtn.textContent = "▶ Start";
                showToast("⏰ Update cadence reached — time to send your next update!");
            }
        }, 1000);
    } else {
        timerStartBtn.textContent = "▶ Start";
        clearInterval(timerInterval);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    if (timerStartBtn) timerStartBtn.textContent = "▶ Start";
    secondsRemaining = cadenceMinutes * 60;
    renderTimer();
}

renderTimer();

// ============================
// 8. COPY TO CLIPBOARD (+ toast feedback)
// ============================
function copyText(button) {
    const container = button.parentElement;
    const pre = container.querySelector("pre");
    const bulletList = container.querySelector(".output-bullets");

    let text = "";
    if (bulletList) {
        text = Array.from(bulletList.querySelectorAll("li"))
            .map(li => `• ${li.textContent}`)
            .join("\n");
    } else if (pre) {
        text = pre.textContent;
    }

    navigator.clipboard.writeText(text).then(() => {
        const original = button.textContent;
        button.textContent = "✅ Copied!";
        showToast("📋 Copied to clipboard");
        setTimeout(() => { button.textContent = original; }, 1500);
    });
}

// ============================
// 9. BUSINESS IMPACT & URGENCY ASSESSMENT QUESTIONS
// ============================
const impactQuestions = {
    general: [
        "How is this critically impacting the business right now?",
        "Can the team continue working at a reduced rate while this is investigated?",
        "Are users completely blocked, or is there a manageable alternative process?",
        "Has this issue happened before? How long ago, and how was it resolved?",
        "What are this site's operational hours right now?",
        "Are there any upcoming or missed deadlines, and what's the impact of missing them?"
    ],
    manufacturing: [
        "What is being produced on the affected line, and how is it used downstream?",
        "What's the average output volume for this time of day?",
        "How large is the production backlog building up?",
        "What's the estimated time to recover once the fix is applied?"
    ],
    shipping: [
        "What's the average shipping volume for this time of day?",
        "How large is the shipment backlog right now?",
        "What's the estimated recovery time once systems are restored?"
    ],
    customer: [
        "Which customer-facing services are affected?",
        "How many customers are impacted, and are they internal or external?",
        "Is this affecting order taking, order processing, or both?",
        "Can affected customers be notified and asked to retry later?"
    ],
    patient: [
        "Which clinical or patient-facing services are affected?",
        "How many patients or care teams are impacted?",
        "What's the average volume of activity for this time of day?",
        "Is there any risk to patient safety that requires immediate escalation?"
    ]
};

function showCategory(cat, btn) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    const list = document.getElementById("questionList");
    if (!list) return;
    list.innerHTML = "";
    (impactQuestions[cat] || []).forEach(q => {
        const li = document.createElement("li");
        li.textContent = q;
        list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => showCategory("general", document.querySelector('.category-btn[data-cat="general"]')));

// ============================
// 10. MIM GENERATOR LIVE (simulated AI, bullet output)
// ============================
const templateHints = {
    summary: "Tip: describe what's down, who's affected, and current status &mdash; this becomes a concise executive summary.",
    impact: "Tip: mention the affected process or site &mdash; this becomes a business impact statement in past/present tense.",
    stakeholder: "Tip: keep it brief &mdash; this becomes a friendly, reassuring update for a broad stakeholder audience.",
    shift: "Tip: summarize current status, point-of-contacts, and next steps &mdash; this becomes a shift handover message."
};

const templateTypeLabels = {
    summary: "Executive Summary",
    impact: "Business Impact Statement",
    stakeholder: "Stakeholder Update",
    shift: "Shift Handover Message"
};

const templateTypeSelect = document.getElementById("templateType");
if (templateTypeSelect) {
    templateTypeSelect.addEventListener("change", () => {
        const hintEl = document.getElementById("templateHint");
        if (hintEl) hintEl.innerHTML = templateHints[templateTypeSelect.value] || "";
    });
}

function buildOutputBullets(type, rawInput) {
    if (type === "summary") {
        return [
            `Incident reported: "${rawInput}"`,
            "Technical teams are actively engaged and investigating the issue",
            "Business impact is being assessed",
            "Further updates will follow as the situation progresses"
        ];
    } else if (type === "impact") {
        return [
            `Reported issue: "${rawInput}"`,
            "Affected users may be unable to complete normal business activity until service is restored",
            "Impact and urgency are being validated with the business lead",
            "This statement will be refined as more detail becomes available"
        ];
    } else if (type === "stakeholder") {
        return [
            `We are currently addressing the following issue: "${rawInput}"`,
            "Our technical teams are actively engaged and working toward resolution",
            "Next update will be shared per our standard communication cadence",
            "Thank you for your patience"
        ];
    } else if (type === "shift") {
        return [
            `Handing over this incident: "${rawInput}"`,
            "Current status, point-of-contacts, and outstanding tasks shared with the incoming MIM offline",
            "Incoming MIM has been briefed and confirmed no open questions",
            "Please direct any new updates to them going forward"
        ];
    }
    return [];
}

function renderOutputBullets(bullets) {
    const outputBox = document.getElementById("outputBox");
    const outputBulletsEl = document.getElementById("outputBullets");
    outputBulletsEl.innerHTML = "";
    bullets.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        outputBulletsEl.appendChild(li);
    });
    outputBox.classList.remove("hidden");
}

function generateOutput() {
    const type = document.getElementById("templateType").value;
    const rawInput = document.getElementById("rawInput").value.trim();
    const ticketNumber = document.getElementById("ticketNumber").value.trim();

    if (!rawInput) {
        renderOutputBullets(["Please enter some raw notes first."]);
        return;
    }

    const bullets = buildOutputBullets(type, rawInput);
    renderOutputBullets(bullets);
    saveToHistory({ ticketNumber, type, rawInput, bullets });
    showToast("⚡ Generated and saved to history");
}

// ============================
// 11. TICKET HISTORY (auto-saved locally, like chat history)
// ============================
const HISTORY_KEY = "mimGeneratorHistory";
const HISTORY_LIMIT = 30;

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function persistHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        // localStorage unavailable - fail silently
    }
}

function formatHistoryTimestamp(ts) {
    const d = new Date(ts);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const month = monthNames[d.getMonth()];
    return `${month} ${d.getDate()}, ${hours}:${minutes} ${ampm}`;
}

function saveToHistory({ ticketNumber, type, rawInput, bullets }) {
    const history = loadHistory();
    const entry = {
        id: Date.now(),
        ticketNumber: ticketNumber || "",
        type,
        rawInput,
        bullets,
        timestamp: Date.now()
    };
    history.unshift(entry);
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
    persistHistory(history);
    renderHistoryList();
}

function renderHistoryList() {
    const listEl = document.getElementById("historyList");
    if (!listEl) return;
    const history = loadHistory();

    listEl.innerHTML = "";

    if (history.length === 0) {
        const empty = document.createElement("li");
        empty.className = "history-empty";
        empty.id = "historyEmpty";
        empty.textContent = "No saved generations yet — they'll appear here right after you click Generate.";
        listEl.appendChild(empty);
        return;
    }

    history.forEach(entry => {
        const li = document.createElement("li");
        li.className = "history-item";

        const main = document.createElement("div");
        main.className = "history-item-main";

        const top = document.createElement("div");
        top.className = "history-item-top";

        const badge = document.createElement("span");
        if (entry.ticketNumber) {
            badge.className = "history-ticket-badge";
            badge.textContent = entry.ticketNumber;
        } else {
            badge.className = "history-ticket-badge untitled";
            badge.textContent = "No ticket";
        }

        const typeEl = document.createElement("span");
        typeEl.className = "history-type";
        typeEl.textContent = templateTypeLabels[entry.type] || entry.type;

        top.appendChild(badge);
        top.appendChild(typeEl);

        const preview = document.createElement("div");
        preview.className = "history-preview";
        preview.textContent = entry.rawInput;

        const time = document.createElement("div");
        time.className = "history-timestamp";
        time.textContent = formatHistoryTimestamp(entry.timestamp);

        main.appendChild(top);
        main.appendChild(preview);
        main.appendChild(time);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "history-delete-btn";
        deleteBtn.textContent = "🗑";
        deleteBtn.title = "Delete this entry";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            removeHistoryItem(entry.id);
        };

        li.appendChild(main);
        li.appendChild(deleteBtn);

        li.addEventListener("click", () => loadHistoryEntry(entry));

        listEl.appendChild(li);
    });
}

function loadHistoryEntry(entry) {
    document.getElementById("ticketNumber").value = entry.ticketNumber || "";
    document.getElementById("templateType").value = entry.type;
    document.getElementById("rawInput").value = entry.rawInput;

    const hintEl = document.getElementById("templateHint");
    if (hintEl) hintEl.innerHTML = templateHints[entry.type] || "";

    renderOutputBullets(entry.bullets);

    const tryItSection = document.getElementById("try-it");
    if (tryItSection) tryItSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeHistoryItem(id) {
    const history = loadHistory().filter(e => e.id !== id);
    persistHistory(history);
    renderHistoryList();
}

function clearAllHistory() {
    persistHistory([]);
    renderHistoryList();
    showToast("🗑 Ticket history cleared");
}

document.addEventListener("DOMContentLoaded", renderHistoryList);

// ============================
// 12. LIVE MIM ASSISTANT — runbook process + broader ITSM/SRE knowledge
// Stopword-aware, confidence-scored matching with "did you mean" fallback
// so short/ambiguous questions never get a wrong answer with false confidence.
// ============================
const mimKnowledgeBase = [
    // --- Runbook-grounded process knowledge ---
    {
        topic: "ServiceNow outage during a MIM",
        keywords: ["servicenow down", "servicenow is down", "snow down", "snow is down", "ticketing tool down", "ticketing system down"],
        answer: "If ServiceNow is down but Teams is available: start a Teams bridge immediately, gather incident details manually, and log the ticket retroactively once ServiceNow is back online. Don't let a tooling outage delay your response."
    },
    {
        topic: "Teams outage during a MIM",
        keywords: ["teams is down", "teams down", "microsoft teams down", "bridge tool down", "collaboration tool down"],
        answer: "If Microsoft Teams is down but ServiceNow is available: use your organization's alternate bridge/call method (e.g. phone conference) and log all actions directly in the ticket as they happen."
    },
    {
        topic: "Second Pair of Eyes review",
        keywords: ["second pair of eyes", "second pair", "peer review process", "review process for communications"],
        answer: "Second Pair of Eyes is a peer-review step: before sending a communication or resolving a ticket, have another MIM review it for accuracy, tone, and completeness. It catches mistakes before they reach stakeholders — good practice even outside formal MIM processes."
    },
    {
        topic: "Demoting a Major Incident",
        keywords: ["demote incident", "demote major incident", "demote the mim", "demoting an incident", "demote"],
        answer: "To demote a Major Incident: confirm with stakeholders it no longer qualifies as an MI, send the demote notification communication, then change the ticket type back to a standard incident."
    },
    {
        topic: "Rejecting a Major Incident candidate",
        keywords: ["reject major incident", "reject incident candidate", "reject candidate", "how to reject", "rejecting an incident", "reject this incident", "reject mim"],
        answer: "Reject a Major Incident candidate when it doesn't meet MI criteria — e.g. impact is isolated to a single user, there's a stable workaround, or urgency/impact scoring doesn't reach the threshold. Document your reasoning directly on the ticket, redirect it to the standard incident queue, and let the reporter know the decision plus rationale. If you're unsure, loop in your Second Pair of Eyes before rejecting."
    },
    {
        topic: "Shift handover process",
        keywords: ["shift change process", "handover", "shift handover", "end of shift", "shift transition", "handing over an incident"],
        answer: "For shift handover: update the ticket owner, brief the incoming MIM on impact/contacts/current tasks/roadblocks, then announce the handover on the bridge before dropping off. Tip: use the 'Shift Handover Message' option in the MIM Generator above to draft it instantly."
    },
    {
        topic: "Dropping a bridge call to chat-only",
        keywords: ["drop to chat", "chat only", "dropped to chat", "call remains chat only", "end the bridge call"],
        answer: "Dropping to chat means ending the live bridge call but continuing coordination via chat. Only do this once the situation is stable enough that a live call is no longer needed, and confirm the decision with your team first."
    },
    {
        topic: "Post-Incident Report (PIR)",
        keywords: ["post incident report", "post-incident report", "post mim report", "pir checklist", "what is a pir"],
        answer: "The Post-Incident Report (PIR) closes the loop after resolution: confirm timestamps, CI accuracy, resolution notes, RCA SLA ownership, and final business impact. Check the PIR Checklist section above and track your progress live in the sidebar."
    },
    {
        topic: "Priority and the impact/urgency matrix",
        keywords: ["priority ranking", "impact matrix", "urgency matrix", "how is priority calculated", "priority matrix"],
        answer: "Priority is calculated from Impact × Urgency, not just 'fully down vs degraded'. Use the whole priority matrix and real business context — avoid limiting an incident to binary phrasing. Try the Impact Assessment section above for category-specific triage questions."
    },
    {
        topic: "Update communication cadence",
        keywords: ["update cadence", "how often should i send updates", "how frequently should i update", "update frequency", "communication cadence"],
        answer: "Standard update cadence is every 30-60 minutes depending on priority (P1 = more frequent). Use the 'Next Update Due' timer in the sidebar to keep yourself on track."
    },
    {
        topic: "RCA SLA timelines",
        keywords: ["rca sla", "root cause sla", "rca timeline", "rca deadline", "how long for root cause analysis"],
        answer: "RCA SLA targets are typically 15 days for P1 incidents and 20 days for P2 incidents. Make sure the owning group is informed of this timeline as part of your PIR."
    },
    {
        topic: "Using the word 'workaround' carefully",
        keywords: ["acceptable workaround", "workaround guidelines", "what counts as a workaround"],
        answer: "Avoid casually using the word 'workaround' when assessing impact — instead determine if users are truly 'hard down' or have a viable, sustainable, manageable alternative process. That distinction materially changes the priority assessment."
    },
    {
        topic: "Creating a PTASK",
        keywords: ["create ptask", "what is a ptask", "ptask process"],
        answer: "A PTASK is created as part of the Post-MIM Report process to capture follow-up work — for example, missing CMDB entries, a support group not in the paging tool, or single points of failure discovered during the incident. It's how findings turn into tracked action items instead of getting lost."
    },
    {
        topic: "Vendor-caused or change-caused incidents",
        keywords: ["caused by vendor", "vendor caused incident", "caused by change", "change caused incident"],
        answer: "If a vendor caused the incident, mark the vendor-caused field and document the vendor's details even if the exact vendor record is missing from your CMDB — capture it in the description instead and follow up via PTASK. If a change caused it, validate the change request field is populated so the change ticket is properly linked."
    },

    // --- Broader ITSM / SRE / incident management knowledge (not runbook-specific) ---
    {
        topic: "Incident management vs. problem management",
        keywords: ["incident vs problem", "difference between incident and problem management", "incident management versus problem management"],
        answer: "Incident management is about restoring service fast (the 'what's broken right now'). Problem management is about finding and eliminating the underlying root cause so the incident doesn't recur. A single problem can cause many incidents — that's usually why a PIR feeds into a problem ticket (PTASK) rather than closing the loop entirely on its own."
    },
    {
        topic: "Blameless postmortems",
        keywords: ["blameless postmortem", "blameless culture", "psychological safety incident", "no blame culture"],
        answer: "A blameless postmortem focuses on 'what in the system allowed this to happen' rather than 'who caused it'. This encourages honest reporting, faster learning, and better fixes — punishing individuals just teaches people to hide problems next time."
    },
    {
        topic: "What an SLA is",
        keywords: ["what is an sla", "service level agreement meaning", "define sla"],
        answer: "An SLA (Service Level Agreement) is a commitment on response and resolution times for a given priority level. In MIM context, SLAs typically apply to update cadence, resolution targets by priority, and RCA turnaround — missed SLAs are usually a key metric leadership tracks."
    },
    {
        topic: "SLO vs SLI vs SLA",
        keywords: ["slo vs sla", "sli vs slo", "difference between slo and sla", "what is an slo", "what is an sli"],
        answer: "SLI (Service Level Indicator) is the actual measured metric, like 'percentage of successful requests'. SLO (Service Level Objective) is your internal target for that metric, like '99.9% success rate'. SLA (Service Level Agreement) is the external, often contractual, promise built on top of an SLO — usually with consequences if missed. Think: SLI = the measurement, SLO = your goal, SLA = your promise."
    },
    {
        topic: "When to escalate",
        keywords: ["when to escalate", "escalation path", "how to escalate an incident", "escalate an incident"],
        answer: "Escalate when: the current resolver group lacks the access/expertise to fix it, business impact is increasing, deadlines are at risk, or you're not getting timely engagement. A good escalation is specific — state the blocker, the ask, and the urgency, don't just say 'this is urgent'."
    },
    {
        topic: "Change management and emergency changes",
        keywords: ["change management process", "emergency change", "echg", "change advisory board", "cab meeting"],
        answer: "Change management governs how modifications are made to production systems, usually reviewed by a Change Advisory Board (CAB). An emergency change (eCHG) is a fast-tracked approval used when a fix can't wait for the normal change window — common during MIMs when a code/config fix needs to go in immediately to restore service."
    },
    {
        topic: "What a Major Incident Manager does",
        keywords: ["what is a mim", "major incident manager role", "what does a mim do", "responsibilities of a mim"],
        answer: "A Major Incident Manager (MIM) owns the coordination of a major incident end-to-end: running the bridge call, driving technical teams toward resolution, keeping stakeholders informed, and ensuring proper documentation and follow-up (PIR) once resolved. The MIM isn't expected to fix the issue themselves — they orchestrate the people who can."
    },
    {
        topic: "Incident Commander vs MIM",
        keywords: ["incident commander", "ic role", "incident commander vs mim", "sre incident commander"],
        answer: "'Incident Commander' is the SRE-world term for essentially the same role as a Major Incident Manager: someone who coordinates the response without necessarily fixing the issue themselves. Different companies use different titles (IC, MIM, Incident Manager) but the core job — drive the bridge, manage comms, keep things moving — is the same."
    },
    {
        topic: "Writing a strong business impact statement",
        keywords: ["writing impact statement", "good business impact statement", "business impact statement tips", "how to write business impact"],
        answer: "A strong business impact statement answers: who is affected, how many people/sites, what they can't do, and what the consequence is (e.g. revenue, compliance, safety, customer experience). Avoid vague language like 'some users are affected' — be specific and update it as facts change. Try the Business Impact Generator above for a quick draft."
    },
    {
        topic: "P1 vs P2 priority levels",
        keywords: ["priority levels", "what is p1", "what is p2", "difference between p1 and p2"],
        answer: "P1 (Priority 1) is typically a critical, widespread outage with severe business impact and urgent resolution targets. P2 is high-impact but narrower in scope or with a viable workaround. Priority is generally impact × urgency, not just how loud the reporter is."
    },
    {
        topic: "Building a communication plan",
        keywords: ["communication plan", "stakeholder communication", "who to notify during an incident"],
        answer: "A good communication plan identifies: who needs to know (technical teams, business leads, executives, customers), how often, and through which channel. Keep initial communications fast and simple, then refine detail as the picture becomes clearer."
    },
    {
        topic: "Root cause analysis technique",
        keywords: ["root cause analysis", "how to do rca", "5 whys", "five whys technique"],
        answer: "Root Cause Analysis (RCA) digs past the symptom to the actual failure point. A simple technique is the '5 Whys' — keep asking why something happened until you reach a systemic cause (e.g. a process gap or missing safeguard) rather than stopping at 'the server crashed'."
    },
    {
        topic: "Known Error and KEDB",
        keywords: ["known error", "kedb", "known error database"],
        answer: "A Known Error is a problem with a documented root cause and, ideally, a workaround, tracked in the Known Error Database (KEDB). If a new incident matches a Known Error, you can often apply the existing workaround immediately instead of starting root-cause work from scratch."
    },
    {
        topic: "Error budgets (SRE concept)",
        keywords: ["error budget", "what is an error budget", "error budget policy"],
        answer: "An error budget is the acceptable amount of unreliability you're allowed before you must prioritize stability work over new features — e.g. if your SLO is 99.9% uptime, your error budget is the 0.1% you're allowed to 'spend' on incidents, deploys, and risk."
    },
    {
        topic: "Swarming incident response model",
        keywords: ["swarming", "swarm response", "swarming incident model"],
        answer: "Swarming is a response model where available responders jump on an incident together in real time (instead of a rigid escalation chain), pooling expertise fast. It works well for ambiguous incidents where you don't yet know which team owns the root cause."
    },
    {
        topic: "Runbook vs playbook",
        keywords: ["runbook vs playbook", "difference between runbook and playbook", "what is a playbook"],
        answer: "A runbook is a structured, prescriptive set of steps for a known process (e.g. this MIM runbook). A playbook is usually broader guidance for a category of scenario, allowing more judgment calls. In practice the terms are often used interchangeably, but runbooks tend to be more procedural."
    },
    {
        topic: "Managing a chaotic bridge call",
        keywords: ["chaotic bridge call", "keep calm during incident", "manage a bridge call", "control a bridge call", "too many people on the call"],
        answer: "Keep control of a chaotic bridge by: restating the current known impact at the top, assigning clear owners for each workstream, muting side conversations, and explicitly stating who should speak next. A brief, calm recap every 10-15 minutes keeps latecomers and stakeholders aligned without derailing the technical work."
    },
    {
        topic: "Documentation during an incident",
        keywords: ["documentation during incident", "how to document an incident", "incident timeline notes"],
        answer: "Capture a running timeline as you go: timestamp key actions, decisions, and who made them. It's much easier to jot brief notes live than to reconstruct a timeline afterward for the PIR — and it protects you if anyone questions the sequence of events later."
    },
    {
        topic: "Root cause vs contributing factor",
        keywords: ["root cause vs contributing factor", "contributing factor", "difference between root cause and contributing factor"],
        answer: "A root cause is the fundamental reason the failure occurred — fix it and the issue can't recur the same way. A contributing factor made things worse or harder to catch (e.g. missing alerting, unclear ownership) but isn't the core trigger. Good PIRs list both, since fixing only the root cause without addressing contributing factors leaves you exposed to slower detection or messier response next time."
    },
    {
        topic: "Availability, MTTR, MTTD, MTBF metrics",
        keywords: ["mttr", "mttd", "mtbf", "availability metrics", "mean time to recovery", "mean time to detect"],
        answer: "MTTD (Mean Time To Detect) is how long until you notice an incident. MTTR (Mean Time To Recovery/Repair) is how long from detection to resolution. MTBF (Mean Time Between Failures) measures overall reliability. As a MIM, your biggest lever is usually MTTR — faster bridge activation, clearer ownership, and tighter comms cadence all shrink it."
    },
    {
        topic: "Continual Service Improvement (CSI)",
        keywords: ["continual service improvement", "csi", "continuous improvement itil"],
        answer: "Continual Service Improvement (CSI) is the ongoing practice of using PIR findings, trend data, and metrics (like recurring incident categories) to drive process and system improvements over time — it's the reason a good PIR isn't just paperwork, it feeds real change."
    },
    {
        topic: "Greeting",
        keywords: ["hello", "good morning", "good afternoon", "good evening"],
        answer: "Hey! 👋 I can help with MIM runbook process (ServiceNow/Teams outages, demote, reject, shift handover, PIR) or broader incident management/SRE concepts (problem management, RCA, escalation, SLAs, error budgets, and more). What's on your mind?"
    },
    {
        topic: "Thanks",
        keywords: ["thank you", "thanks", "appreciate it"],
        answer: "You're welcome! Good luck on the bridge call. 🛡️"
    }
];

// Common English stopwords that should never drive a keyword match on their own —
// this is what caused "how to reject" to incorrectly match "how often" (update cadence).
const STOPWORDS = new Set([
    "a","an","the","is","are","was","were","to","of","in","on","for","and","or","do","does","did",
    "how","what","why","when","where","who","which","i","you","we","they","it","this","that","these",
    "those","can","could","should","would","will","shall","my","our","your","their","his","her","its",
    "be","been","being","have","has","had","not","no","so","if","then","than","from","with","about",
    "up","down","out","just","get","got","make","need","please","me","us","them","am","also","as","at",
    "by","into","like","over","after","before","during","while","between"
]);

function tokenize(text) {
    return text.toLowerCase().split(/\W+/).filter(Boolean);
}

function meaningfulWords(words) {
    return words.filter(w => !STOPWORDS.has(w) && w.length > 2);
}

// Confidence-scored matching:
//  - Exact multi-word phrase match (substring) = strong signal (+4)
//  - Overlap of MEANINGFUL (non-stopword) words only, weighted by how much
//    of the keyword phrase that overlap covers = weaker signal
// Returns { entry, score } for the best match, plus a ranked list for
// "did you mean" suggestions when confidence is too low to answer directly.
function scoreKnowledgeBase(question) {
    const q = question.toLowerCase();
    const qWords = meaningfulWords(tokenize(q));
    const qWordSet = new Set(qWords);

    const results = mimKnowledgeBase.map(entry => {
        let score = 0;
        entry.keywords.forEach(k => {
            if (q.includes(k)) {
                score += 4;
            } else {
                const kWords = meaningfulWords(tokenize(k));
                if (kWords.length === 0) return;
                const overlap = kWords.filter(w => qWordSet.has(w)).length;
                if (overlap === 0) return;
                const coverage = overlap / kWords.length; // how much of the keyword phrase matched
                // Only count meaningful overlap: require at least half the keyword's
                // significant words to be present, otherwise it's too weak/coincidental.
                if (coverage >= 0.5) {
                    score += overlap * 1.2 * coverage;
                }
            }
        });
        return { entry, score };
    });

    results.sort((a, b) => b.score - a.score);
    return results;
}

const CONFIDENT_THRESHOLD = 2.4;
const SUGGESTION_THRESHOLD = 1.0;

function findMimAnswer(question) {
    const ranked = scoreKnowledgeBase(question);
    const top = ranked[0];

    if (top && top.score >= CONFIDENT_THRESHOLD) {
        return { type: "answer", text: top.entry.answer };
    }

    // Not confident enough to answer directly — offer up to 2 "did you mean" topics
    // instead of guessing wrong, but only if there's at least a weak real signal.
    const suggestions = ranked.filter(r => r.score >= SUGGESTION_THRESHOLD).slice(0, 2);

    if (suggestions.length > 0) {
        return { type: "suggestions", options: suggestions.map(s => s.entry) };
    }

    return {
        type: "fallback",
        text: "I don't have a precise answer for that yet. I cover MIM runbook steps (ServiceNow/Teams outages, demote, reject, shift handover, PIR) plus general incident management/SRE concepts (problem management, RCA, escalation, SLAs, error budgets, change management). Try rephrasing, or check the Impact Assessment and Checklist sections above for structured guidance."
    };
}

function appendChatMessage(text, sender) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;
    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return msg;
}

function showTypingIndicator() {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return null;
    const typing = document.createElement("div");
    typing.className = "chat-msg typing";
    typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatWindow.appendChild(typing);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return typing;
}

// Renders a "did you mean" bot message with clickable topic chips.
// Clicking a chip re-asks using that topic's own best keyword phrase,
// so the follow-up question scores as a confident direct match.
function appendSuggestionMessage(options) {
    const chatWindow = document.getElementById("chatWindow");
    if (!chatWindow) return;

    const msg = document.createElement("div");
    msg.className = "chat-msg bot";

    const intro = document.createElement("div");
    intro.textContent = "I'm not fully sure what you're asking — did you mean one of these?";
    msg.appendChild(intro);

    const chipRow = document.createElement("div");
    chipRow.className = "chat-suggestion-chips";

    options.forEach(entry => {
        const chip = document.createElement("button");
        chip.className = "chip-btn chat-inline-chip";
        chip.textContent = entry.topic;
        chip.onclick = () => askSuggested(entry.keywords[0]);
        chipRow.appendChild(chip);
    });

    msg.appendChild(chipRow);
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    if (!input) return;
    const question = input.value.trim();
    if (!question) return;

    appendChatMessage(question, "user");
    input.value = "";

    const typingEl = showTypingIndicator();

    setTimeout(() => {
        if (typingEl) typingEl.remove();
        const result = findMimAnswer(question);

        if (result.type === "answer" || result.type === "fallback") {
            appendChatMessage(result.text, "bot");
        } else if (result.type === "suggestions") {
            appendSuggestionMessage(result.options);
        }
    }, 600 + Math.random() * 400);
}

function askSuggested(question) {
    const input = document.getElementById("chatInput");
    if (input) input.value = question;
    sendChatMessage();
}

// ============================
// 13. TOAST NOTIFICATIONS
// ============================
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2500);
}

// ============================
// 14. CURSOR-FOLLOWING GLOW (desktop only, cosmetic)
// ============================
const cursorGlow = document.getElementById("cursorGlow");
if (cursorGlow && window.matchMedia("(min-width: 1101px)").matches) {
    document.addEventListener("mousemove", (e) => {
        cursorGlow.style.left = e.clientX + "px";
        cursorGlow.style.top = e.clientY + "px";
    });
}

// ============================
// 15. CARD TILT ON HOVER (subtle 3D interactivity)
// ============================
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    });
});
