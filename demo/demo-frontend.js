// demo-frontend.js
// ============================================================
// APLYER WRITEDNA: DEMO PAGE FRONTEND (reference)
// Goes in the aplyer.ai repo, next to demo.html. NOT in aplyer-api.
// Handles resume upload and parsing, the two clarifying prompts,
// the call to the demo endpoint, the editable output (Fix 4), the
// four error states, and edit capture for the memory bank.
// Reference only. Wire into the existing page and test for real.
// ============================================================

const API = "https://aplyer-api.vercel.app";
const DEMO_ENDPOINT = API + "/api/demo";
const FEEDBACK_ENDPOINT = API + "/api/feedback";

// A stable id for this candidate session, so the stored voice
// profile and the memory bank follow them across questions.
const sessionId = "web-" + Math.random().toString(36).slice(2) + Date.now();

// ---------- Resume parsing (pdf, docx, txt) ----------
const parseResumeFile = async (file) => {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".txt")) return await file.text();
  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const r = await window.mammoth.extractRawText({ arrayBuffer: buf });
    return r.value;
  }
  if (name.endsWith(".pdf")) {
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return text;
  }
  throw new Error("Please upload a .pdf, .docx, or .txt resume.");
};

let resumeText = "";
let lastAnswer = "";        // for edit capture
let lastQuestion = "";

// ---------- Upload wiring ----------
const wireUpload = (dropZoneId, fileInputId, statusId) => {
  const zone = document.getElementById(dropZoneId);
  const input = document.getElementById(fileInputId);
  const status = document.getElementById(statusId);

  const handleFile = async (file) => {
    if (!file) return;
    status.textContent = "Reading your resume...";
    try {
      resumeText = await parseResumeFile(file);
      status.textContent = "Resume loaded: " + file.name;
    } catch (err) {
      resumeText = "";
      status.textContent = err.message;
    }
  };

  zone.addEventListener("click", () => input.click());
  input.addEventListener("change", (e) => handleFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragging"); }));
  zone.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));
};

// ---------- Generate ----------
// clarifyingAnswers is an array of up to two strings from the two
// clarifying prompts. compare true also returns plainAnswer.
const generate = async ({ jobDescription, question, clarifyingAnswers, compare }, outputEl, buttonEl, plainEl) => {
  if (!resumeText) { outputEl.value = "Upload your resume first."; return; }
  if (!jobDescription || !question) { outputEl.value = "Add a job description and a question."; return; }

  buttonEl.disabled = true;
  outputEl.value = "Writing your answer...";
  lastQuestion = question;

  let res;
  try {
    res = await fetch(DEMO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId, resume: resumeText, jobDescription, question,
        clarifyingAnswers: clarifyingAnswers || [], compare: !!compare
      })
    });
  } catch (err) {
    outputEl.value = "Network problem. Please try again.";
    buttonEl.disabled = false;
    return;
  }

  let data;
  try { data = await res.json(); } catch (e) { data = {}; }

  if (res.status === 200 && data.answer) {
    outputEl.value = data.answer;       // editable (Fix 4)
    lastAnswer = data.answer;
    if (plainEl && data.plainAnswer) plainEl.value = data.plainAnswer;
  } else if (res.status === 429) {
    outputEl.value = "You have reached the demo limit. Please try again in an hour.";
  } else if (res.status === 400) {
    outputEl.value = data.error || "Something was missing. Check your inputs.";
  } else {
    outputEl.value = data.error || "The demo is busy. Please try again in a moment.";
  }
  buttonEl.disabled = false;
};

// ---------- Edit capture (the memory bank learns) ----------
// Call this when the candidate has edited the answer and is keeping
// it, for example on a Use this answer button or on blur.
const captureEdit = async (outputEl) => {
  const edited = outputEl.value;
  if (!lastAnswer || !edited || edited.trim() === lastAnswer.trim()) return;
  try {
    await fetch(FEEDBACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, question: lastQuestion, original: lastAnswer, edited })
    });
    lastAnswer = edited; // so we only log new changes
  } catch (err) {
    // Logging must never interrupt the candidate. Ignore failures.
  }
};

window.AplyerDemo = { wireUpload, generate, captureEdit, sessionId };
