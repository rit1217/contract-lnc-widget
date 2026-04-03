import { useState, useCallback, useRef } from "react";

/* ───── Default NDA Data ───── */
const DEFAULT_NDA = {
  effectiveDate: new Date().toISOString().split("T")[0],
  disclosingParty: { name: "", title: "", company: "", address: "" },
  receivingParty: { name: "", title: "", company: "", address: "" },
  purpose: "exploring a potential business relationship between the parties",
  duration: "2",
  survivalPeriod: "2",
  governingLaw: "State of Delaware",
  confidentialInfoExclusions: [
    "Information that is or becomes publicly available through no fault of the Receiving Party",
    "Information that was already known to the Receiving Party prior to disclosure",
    "Information that is independently developed by the Receiving Party without use of Confidential Information",
    "Information that is rightfully received from a third party without restriction",
  ],
  obligations: [
    "Use the Confidential Information solely for the Purpose stated herein",
    "Restrict disclosure to employees and advisors who need to know and are bound by similar obligations",
    "Exercise at least the same degree of care used to protect its own confidential information, but no less than reasonable care",
    "Promptly notify the Disclosing Party of any unauthorized use or disclosure",
  ],
  additionalClauses: "",
  fixedClauses: {
    confidentialInfoDef: `"Confidential Information" means any and all non-public information, in any form or medium, disclosed by either Party to the other, whether orally, in writing, electronically, or by inspection. This includes, without limitation, trade secrets, business plans, financial data, technical data, product roadmaps, customer lists, and any other information designated as confidential or that reasonably should be understood to be confidential.`,
    returnOfMaterials: `Upon termination of this Agreement or upon request by the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof, and shall certify in writing that it has done so.`,
    noLicense: `Nothing in this Agreement grants the Receiving Party any license or rights in or to the Confidential Information, except the limited right to use it for the Purpose. All Confidential Information is provided "AS IS" without warranty of any kind.`,
    remedies: `The Parties acknowledge that any breach of this Agreement may cause irreparable harm for which monetary damages would be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.`,
    entireAgreement: `This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior or contemporaneous oral or written agreements concerning such subject matter.`,
  },
};

const PERSPECTIVES = [
  { id: "balanced", label: "Balanced", icon: "⚖️", desc: "Fair to both" },
  { id: "disclosing", label: "Protect Discloser", icon: "🛡️", desc: "Stronger protection" },
  { id: "receiving", label: "Favor Receiver", icon: "🤝", desc: "More flexibility" },
  { id: "aggressive", label: "Max Protection", icon: "🔒", desc: "Strictest terms" },
];

/* ───── Export: Build full NDA text from data ───── */
function buildNDAText(data) {
  const dp = data.disclosingParty, rp = data.receivingParty;
  const v = (val, fb) => val || fb;
  const partyStr = (label, p) => {
    let s = v(p.name, "[NAME]");
    if (p.title) s += `, ${p.title}`;
    if (p.company) s += `, on behalf of ${p.company}`;
    if (p.address) s += `, located at ${p.address}`;
    return `${label}: ${s}`;
  };
  const letterList = (items, trailing = ";") =>
    items.filter(Boolean).map((item, i, arr) =>
      `    (${String.fromCharCode(97 + i)}) ${item}${i < arr.length - 1 ? ";" : "."}`
    ).join("\n");

  let clauseNum = 10;
  let additional = "";
  if (data.additionalClauses) {
    additional = `\n10. ADDITIONAL TERMS\n\n${data.additionalClauses}\n`;
    clauseNum = 11;
  }

  return `NON-DISCLOSURE AGREEMENT
Mutual Confidentiality Agreement

This Non-Disclosure Agreement (the "Agreement") is entered into as of ${v(data.effectiveDate, "[DATE]")} (the "Effective Date"), by and between:

${partyStr("Disclosing Party", dp)}; and

${partyStr("Receiving Party", rp)}.

(each a "Party" and collectively, the "Parties").

1. PURPOSE

The Parties wish to explore ${v(data.purpose, "[PURPOSE]")} (the "Purpose") and, in connection therewith, may disclose to each other certain confidential and proprietary information.

2. DEFINITION OF CONFIDENTIAL INFORMATION

${data.fixedClauses.confidentialInfoDef}

3. EXCLUSIONS

Confidential Information does not include information that:

${letterList(data.confidentialInfoExclusions)}

4. OBLIGATIONS OF THE RECEIVING PARTY

The Receiving Party agrees to:

${letterList(data.obligations)}

5. TERM

This Agreement shall remain in effect for a period of ${v(data.duration, "[N]")} year(s) from the Effective Date, unless terminated earlier by either Party with thirty (30) days' prior written notice. The obligations of confidentiality shall survive termination for an additional ${v(data.survivalPeriod, "[N]")} year(s).

6. RETURN OF MATERIALS

${data.fixedClauses.returnOfMaterials}

7. NO LICENSE OR WARRANTY

${data.fixedClauses.noLicense}

8. REMEDIES

${data.fixedClauses.remedies}

9. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the ${v(data.governingLaw, "[JURISDICTION]")}, without regard to its conflict of laws principles.
${additional}
${clauseNum}. ENTIRE AGREEMENT

${data.fixedClauses.entireAgreement}

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.


________________________________________
${v(dp.name, "Disclosing Party Signature")}
${v(dp.company, "Company")}
Date: _______________


________________________________________
${v(rp.name, "Receiving Party Signature")}
${v(rp.company, "Company")}
Date: _______________`;
}

/* ───── Export: Generate HTML for PDF printing ───── */
function buildNDAHtml(data) {
  const dp = data.disclosingParty, rp = data.receivingParty;
  const v = (val, fb) => val || fb;
  const hl = (val, fb) => val ? val : `<span style="background:#fffbe6;padding:1px 4px;border-radius:3px;font-weight:600">${fb}</span>`;
  const partyHtml = (label, p) => {
    let s = hl(p.name, "[NAME]");
    if (p.title) s += `, ${p.title}`;
    if (p.company) s += `, on behalf of ${p.company}`;
    if (p.address) s += `, located at ${p.address}`;
    return `<p><strong>${label}:</strong> ${s}</p>`;
  };
  const letterItems = (items) =>
    items.filter(Boolean).map((item, i, arr) =>
      `<p style="padding-left:36px">(${String.fromCharCode(97 + i)}) ${item}${i < arr.length - 1 ? ";" : "."}</p>`
    ).join("\n");

  let clauseNum = 10;
  let additional = "";
  if (data.additionalClauses) {
    additional = `<h2>10. ADDITIONAL TERMS</h2><p>${data.additionalClauses}</p>`;
    clauseNum = 11;
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>NDA Agreement</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap');
@page { size: letter; margin: 1in 1.2in; }
body { font-family: 'Source Serif 4', 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.8; color: #1a1a1a; max-width: 7in; margin: 0 auto; padding: 0.5in; }
h1 { text-align: center; font-size: 18pt; letter-spacing: 0.1em; margin-bottom: 2px; }
.subtitle { text-align: center; font-size: 9pt; color: #888; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 28px; }
h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 22px; margin-bottom: 8px; }
p { margin-bottom: 10px; text-align: justify; }
.sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 20px; border-top: 1px solid #ddd; }
.sign-line { border-bottom: 1px solid #999; height: 28px; margin-bottom: 4px; }
.sign-label { font-size: 9pt; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
@media print { body { padding: 0; } }
</style></head><body>
<h1>NON-DISCLOSURE AGREEMENT</h1>
<div class="subtitle">Mutual Confidentiality Agreement</div>
<p>This Non-Disclosure Agreement (the "<strong>Agreement</strong>") is entered into as of ${hl(data.effectiveDate, "[DATE]")} (the "<strong>Effective Date</strong>"), by and between:</p>
${partyHtml("Disclosing Party", dp)}
${partyHtml("Receiving Party", rp)}
<p>(each a "<strong>Party</strong>" and collectively, the "<strong>Parties</strong>").</p>
<h2>1. PURPOSE</h2>
<p>The Parties wish to explore ${v(data.purpose, "[PURPOSE]")} (the "Purpose") and, in connection therewith, may disclose to each other certain confidential and proprietary information.</p>
<h2>2. DEFINITION OF CONFIDENTIAL INFORMATION</h2>
<p>${data.fixedClauses.confidentialInfoDef}</p>
<h2>3. EXCLUSIONS</h2>
<p>Confidential Information does not include information that:</p>
${letterItems(data.confidentialInfoExclusions)}
<h2>4. OBLIGATIONS OF THE RECEIVING PARTY</h2>
<p>The Receiving Party agrees to:</p>
${letterItems(data.obligations)}
<h2>5. TERM</h2>
<p>This Agreement shall remain in effect for a period of ${v(data.duration, "[N]")} year(s) from the Effective Date, unless terminated earlier by either Party with thirty (30) days' prior written notice. The obligations of confidentiality shall survive termination for an additional ${v(data.survivalPeriod, "[N]")} year(s).</p>
<h2>6. RETURN OF MATERIALS</h2>
<p>${data.fixedClauses.returnOfMaterials}</p>
<h2>7. NO LICENSE OR WARRANTY</h2>
<p>${data.fixedClauses.noLicense}</p>
<h2>8. REMEDIES</h2>
<p>${data.fixedClauses.remedies}</p>
<h2>9. GOVERNING LAW</h2>
<p>This Agreement shall be governed by and construed in accordance with the laws of the ${hl(data.governingLaw, "[JURISDICTION]")}, without regard to its conflict of laws principles.</p>
${additional}
<h2>${clauseNum}. ENTIRE AGREEMENT</h2>
<p>${data.fixedClauses.entireAgreement}</p>
<p style="margin-top:24px"><strong>IN WITNESS WHEREOF</strong>, the Parties have executed this Agreement as of the Effective Date.</p>
<div class="sign-grid">
<div><div class="sign-line"></div><div class="sign-label">${v(dp.name, "Disclosing Party")}</div><div class="sign-label">${v(dp.company, "Company")}</div><div class="sign-label">Date: _______________</div></div>
<div><div class="sign-line"></div><div class="sign-label">${v(rp.name, "Receiving Party")}</div><div class="sign-label">${v(rp.company, "Company")}</div><div class="sign-label">Date: _______________</div></div>
</div></body></html>`;
}

/* ───── Export handlers ───── */
function exportAsDocx(data) {
  const text = buildNDAText(data);
  const blob = new Blob([text], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "NDA_Agreement.doc"; a.click();
  URL.revokeObjectURL(url);
}

function exportAsPdf(data) {
  const html = buildNDAHtml(data);
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
  }
}

function exportAsHtml(data) {
  const html = buildNDAHtml(data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "NDA_Agreement.html"; a.click();
  URL.revokeObjectURL(url);
}

/* ───── AI Call ───── */
async function optimizeClause(clauseText, clauseContext, perspective) {
  const instr = {
    balanced: "Optimize for fairness and clarity for both parties.",
    disclosing: "Optimize to better protect the Disclosing Party — tighter restrictions, fewer loopholes.",
    receiving: "Optimize to give the Receiving Party more flexibility — narrower scope, clearer carve-outs.",
    aggressive: "Optimize for maximum legal protection — comprehensive coverage, strict enforcement, broad remedies.",
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      messages: [{ role: "user", content: `You are a legal contract optimization assistant. Analyze this NDA clause and suggest an improved version.\n\nContext: "${clauseContext}" section.\nPerspective: ${instr[perspective]}\n\nOriginal:\n"${clauseText}"\n\nRespond ONLY with JSON (no markdown/backticks):\n{"improved":"...","changes":["..."],"risk_notes":"..."}` }],
    }),
  });
  const d = await res.json();
  const t = d.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
  return JSON.parse(t);
}

/* ───── SuggestionCard ───── */
function SuggestionCard({ suggestion, original, onAccept, onReject, isLoading }) {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  if (isLoading) return (
    <div style={cs.card}><div style={cs.loading}>
      <div style={cs.pulseBar}><div style={cs.pulseAnim} /></div>
      <span style={{ color: "#8a8a8a", fontSize: 13, fontFamily: F.ui }}>Analyzing clause...</span>
    </div></div>
  );
  if (!suggestion) return null;
  return (
    <div style={cs.card}>
      <div style={cs.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontWeight: 700, fontSize: 13, fontFamily: F.ui, color: C.accent }}>AI Suggestion</span>
        </div>
        <button onClick={onReject} style={cs.xBtn}>✕</button>
      </div>
      <div style={cs.diffWrap}>
        <div><div style={cs.diffLbl}><span style={{ color: "#c0392b" }}>━</span> Original</div>
          <div style={{ ...cs.diffTxt, background: "rgba(192,57,43,0.04)", borderLeft: "3px solid rgba(192,57,43,0.3)" }}>{original}</div></div>
        <div><div style={cs.diffLbl}><span style={{ color: "#27ae60" }}>━</span> Suggested</div>
          <div style={{ ...cs.diffTxt, background: "rgba(39,174,96,0.04)", borderLeft: "3px solid rgba(39,174,96,0.3)" }}>{suggestion.improved}</div></div>
      </div>
      <div style={cs.summary}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8a8a8a", marginBottom: 6, fontFamily: F.ui }}>Changes</div>
        {suggestion.changes.map((c, i) => <div key={i} style={cs.chgItem}><span style={{ color: C.accent }}>›</span><span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{c}</span></div>)}
        {suggestion.risk_notes && <div style={cs.risk}><span>⚠</span><span>{suggestion.risk_notes}</span></div>}
      </div>
      {editMode && <div style={{ padding: "0 16px 12px" }}><textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} style={cs.editTA} autoFocus /></div>}
      <div style={cs.actions}>
        <button onClick={() => onAccept(editMode ? editText : suggestion.improved)} style={cs.accBtn}
          onMouseEnter={e => e.target.style.background = "#219a52"} onMouseLeave={e => e.target.style.background = "#27ae60"}>✓ {editMode ? "Apply" : "Accept"}</button>
        <button onClick={() => { if (!editMode) { setEditText(suggestion.improved); setEditMode(true); } else setEditMode(false); }} style={cs.edtBtn}
          onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = C.accent; }}>✎ {editMode ? "Cancel" : "Edit"}</button>
        <button onClick={onReject} style={cs.rejBtn}
          onMouseEnter={e => { e.target.style.background = "#c0392b"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#c0392b"; }}>✕ Reject</button>
      </div>
    </div>
  );
}

/* ───── OptimizableClause ───── */
function OptimizableClause({ text, clauseContext, fieldPath, perspective, onUpdate }) {
  const [sug, setSug] = useState(null); const [loading, setLoading] = useState(false); const [show, setShow] = useState(false);
  const go = async () => { setShow(true); setLoading(true); setSug(null); try { setSug(await optimizeClause(text, clauseContext, perspective)); } catch { setSug({ improved: text, changes: ["Failed — try again"], risk_notes: "" }); } setLoading(false); };
  return (<div style={{ marginBottom: 4 }}>
    <div style={cl.row}><div style={cl.text}>{text}</div>
      <button onClick={go} style={cl.btn} onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = C.accentL; e.target.style.color = C.accent; }}>✦ Optimize</button></div>
    {show && <SuggestionCard suggestion={sug} original={text} isLoading={loading}
      onAccept={t => { onUpdate(fieldPath, t); setShow(false); }} onReject={() => { setShow(false); setSug(null); }} />}
  </div>);
}

function OptimizableListItem({ text, index, label, clauseContext, listPath, perspective, onUpdateList, items }) {
  const [sug, setSug] = useState(null); const [loading, setLoading] = useState(false); const [show, setShow] = useState(false);
  const go = async () => { setShow(true); setLoading(true); setSug(null); try { setSug(await optimizeClause(text, clauseContext, perspective)); } catch { setSug({ improved: text, changes: ["Failed"], risk_notes: "" }); } setLoading(false); };
  return (<div style={{ marginBottom: 4 }}>
    <div style={cl.row}><span style={cl.lbl}>{label}</span><div style={cl.text}>{text}</div>
      <button onClick={go} style={cl.btn} onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }} onMouseLeave={e => { e.target.style.background = C.accentL; e.target.style.color = C.accent; }}>✦</button></div>
    {show && <SuggestionCard suggestion={sug} original={text} isLoading={loading}
      onAccept={t => { const u = [...items]; u[index] = t; onUpdateList(listPath, u); setShow(false); }} onReject={() => { setShow(false); setSug(null); }} />}
  </div>);
}

/* ───── Form Components ───── */
const SectionHeader = ({ number, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 32 }}>
    <div style={fst.badge}>{number}</div><h2 style={fst.secTitle}>{title}</h2>
  </div>
);
const Field = ({ label, value, onChange, type = "text", placeholder, multiline, rows = 2 }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={fst.label}>{label}</label>
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={fst.ta}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "#ddd"} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={fst.inp}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "#ddd"} />}
  </div>
);
const ListEditor = ({ items, onChange, placeholder }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ color: "#8a8a8a", fontSize: 12, fontFamily: F.ui, marginTop: 10, flexShrink: 0, width: 20, textAlign: "right" }}>{String.fromCharCode(97 + i)})</span>
        <textarea value={item} onChange={e => { const u = [...items]; u[i] = e.target.value; onChange(u); }} placeholder={placeholder} rows={2} style={{ ...fst.ta, flex: 1 }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "#ddd"} />
        <button onClick={() => onChange(items.filter((_, x) => x !== i))} style={fst.rmBtn}
          onMouseEnter={e => e.target.style.color = "#e55"} onMouseLeave={e => e.target.style.color = "#8a8a8a"}>×</button>
      </div>
    ))}
    <button onClick={() => onChange([...items, ""])} style={fst.addBtn}
      onMouseEnter={e => { e.target.style.borderColor = C.accent; e.target.style.background = C.accentL; }}
      onMouseLeave={e => { e.target.style.borderColor = "#ddd"; e.target.style.background = "none"; }}>+ Add clause</button>
  </div>
);

/* ───── Preview Document ───── */
const PreviewDocument = ({ data, perspective, onUpdate, showOptimize = true }) => {
  const dp = data.disclosingParty, rp = data.receivingParty;
  const hl = (v, fb) => <span style={v ? {} : ps.hl}>{v || fb}</span>;
  const Clause = showOptimize ? OptimizableClause : ({ text }) => <p style={ps.p}>{text}</p>;
  const ListItem = showOptimize ? OptimizableListItem : ({ text, label }) => <p style={{ ...ps.p, paddingLeft: 24 }}>{label} {text}</p>;

  return (
    <div style={ps.page}>
      <div style={ps.title}>Non-Disclosure Agreement</div>
      <div style={ps.subtitle}>Mutual Confidentiality Agreement</div>
      <p style={ps.p}>This Non-Disclosure Agreement (the "<strong>Agreement</strong>") is entered into as of {hl(data.effectiveDate, "[DATE]")} (the "<strong>Effective Date</strong>"), by and between:</p>
      <p style={ps.p}><strong>Disclosing Party:</strong> {hl(dp.name, "[NAME]")}{dp.title ? `, ${dp.title}` : ""}{dp.company ? `, on behalf of ${dp.company}` : ""}{dp.address ? `, located at ${dp.address}` : ""}; and</p>
      <p style={ps.p}><strong>Receiving Party:</strong> {hl(rp.name, "[NAME]")}{rp.title ? `, ${rp.title}` : ""}{rp.company ? `, on behalf of ${rp.company}` : ""}{rp.address ? `, located at ${rp.address}` : ""}.</p>
      <p style={ps.p}>(each a "<strong>Party</strong>" and collectively, the "<strong>Parties</strong>").</p>

      <div style={ps.h}>1. Purpose</div>
      <Clause text={`The Parties wish to explore ${data.purpose || "[PURPOSE]"} (the "Purpose") and, in connection therewith, may disclose to each other certain confidential and proprietary information.`}
        clauseContext="Purpose" fieldPath="__purpose" perspective={perspective}
        onUpdate={(_, t) => { const m = t.match(/explore\s+(.+?)\s*\(the "Purpose"\)/); if (m) onUpdate("purpose", m[1]); }} />

      <div style={ps.h}>2. Definition of Confidential Information</div>
      <Clause text={data.fixedClauses.confidentialInfoDef} clauseContext="Definition" fieldPath="fixedClauses.confidentialInfoDef" perspective={perspective} onUpdate={onUpdate} />

      <div style={ps.h}>3. Exclusions</div>
      <p style={ps.p}>Confidential Information does not include information that:</p>
      {data.confidentialInfoExclusions.filter(Boolean).map((item, i) => (
        <ListItem key={i} text={item} index={i} label={`(${String.fromCharCode(97 + i)})`} clauseContext="Exclusions" listPath="confidentialInfoExclusions" perspective={perspective} onUpdateList={onUpdate} items={data.confidentialInfoExclusions} />
      ))}

      <div style={ps.h}>4. Obligations of the Receiving Party</div>
      <p style={ps.p}>The Receiving Party agrees to:</p>
      {data.obligations.filter(Boolean).map((item, i) => (
        <ListItem key={i} text={item} index={i} label={`(${String.fromCharCode(97 + i)})`} clauseContext="Obligations" listPath="obligations" perspective={perspective} onUpdateList={onUpdate} items={data.obligations} />
      ))}

      <div style={ps.h}>5. Term</div>
      <Clause text={`This Agreement shall remain in effect for a period of ${data.duration || "[N]"} year(s) from the Effective Date, unless terminated earlier by either Party with thirty (30) days' prior written notice. The obligations of confidentiality shall survive termination for an additional ${data.survivalPeriod || "[N]"} year(s).`}
        clauseContext="Term" fieldPath="__term" perspective={perspective} onUpdate={() => {}} />

      <div style={ps.h}>6. Return of Materials</div>
      <Clause text={data.fixedClauses.returnOfMaterials} clauseContext="Return of Materials" fieldPath="fixedClauses.returnOfMaterials" perspective={perspective} onUpdate={onUpdate} />
      <div style={ps.h}>7. No License or Warranty</div>
      <Clause text={data.fixedClauses.noLicense} clauseContext="No License" fieldPath="fixedClauses.noLicense" perspective={perspective} onUpdate={onUpdate} />
      <div style={ps.h}>8. Remedies</div>
      <Clause text={data.fixedClauses.remedies} clauseContext="Remedies" fieldPath="fixedClauses.remedies" perspective={perspective} onUpdate={onUpdate} />
      <div style={ps.h}>9. Governing Law</div>
      <p style={ps.p}>This Agreement shall be governed by and construed in accordance with the laws of the {hl(data.governingLaw, "[JURISDICTION]")}, without regard to its conflict of laws principles.</p>

      {data.additionalClauses && (<><div style={ps.h}>10. Additional Terms</div>
        <Clause text={data.additionalClauses} clauseContext="Additional Terms" fieldPath="additionalClauses" perspective={perspective} onUpdate={onUpdate} /></>)}

      <div style={ps.h}>{data.additionalClauses ? "11" : "10"}. Entire Agreement</div>
      <Clause text={data.fixedClauses.entireAgreement} clauseContext="Entire Agreement" fieldPath="fixedClauses.entireAgreement" perspective={perspective} onUpdate={onUpdate} />

      <p style={{ ...ps.p, marginTop: 28 }}><strong>IN WITNESS WHEREOF</strong>, the Parties have executed this Agreement as of the Effective Date.</p>
      <div style={ps.signGrid}>
        {[dp, rp].map((p, i) => (
          <div key={i}><div style={ps.signLine} /><div style={ps.signLbl}>{p.name || (i === 0 ? "Disclosing Party" : "Receiving Party")}</div>
            <div style={{ ...ps.signLbl, marginTop: 2 }}>{p.company || "Company"}</div>
            <div style={{ ...ps.signLbl, marginTop: 2 }}>Date: _______________</div></div>
        ))}
      </div>
    </div>
  );
};

/* ───── Main App ───── */
export default function NDAEditor() {
  const [data, setData] = useState(DEFAULT_NDA);
  const [view, setView] = useState("edit");
  const [perspective, setPerspective] = useState("balanced");
  const [exportStatus, setExportStatus] = useState("");

  const update = useCallback((path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split("."); let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value; return next;
    });
  }, []);

  const handleExport = (format) => {
    setExportStatus(`Generating ${format.toUpperCase()}...`);
    try {
      if (format === "doc") exportAsDocx(data);
      else if (format === "pdf") exportAsPdf(data);
      else if (format === "html") exportAsHtml(data);
      setExportStatus(`${format.toUpperCase()} ready!`);
      setTimeout(() => setExportStatus(""), 3000);
    } catch (err) {
      setExportStatus(`Error: ${err.message}`);
      setTimeout(() => setExportStatus(""), 5000);
    }
  };

  return (
    <div style={{ fontFamily: F.ui, minHeight: "100vh", background: "#f5f3ef" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse-slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>

      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#fff", borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700 }}>§</div>
          <div><div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>NDA Generator</div>
            <div style={{ fontSize: 10, color: "#8a8a8a" }}>AI Negotiation · Export</div></div>
        </div>
        <div style={{ display: "flex", background: "#f0f0f0", borderRadius: 8, padding: 3 }}>
          {["edit", "negotiate", "export"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F.ui, transition: "all 0.2s",
              background: view === v ? "#fff" : "transparent", color: view === v ? C.accent : "#8a8a8a",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{{ edit: "✎ Edit", negotiate: "✦ Negotiate", export: "↓ Export" }[v]}</button>
          ))}
        </div>
      </div>

      {/* ── EDIT TAB ── */}
      {view === "edit" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "8px 20px 60px" }}>
          <SectionHeader number="1" title="Effective Date" />
          <Field label="Date" type="date" value={data.effectiveDate} onChange={v => update("effectiveDate", v)} />
          <SectionHeader number="2" title="Disclosing Party" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full Name" value={data.disclosingParty.name} onChange={v => update("disclosingParty.name", v)} placeholder="John Smith" />
            <Field label="Title" value={data.disclosingParty.title} onChange={v => update("disclosingParty.title", v)} placeholder="CEO" />
          </div>
          <Field label="Company" value={data.disclosingParty.company} onChange={v => update("disclosingParty.company", v)} placeholder="Acme Corp." />
          <Field label="Address" value={data.disclosingParty.address} onChange={v => update("disclosingParty.address", v)} placeholder="123 Main St" />
          <SectionHeader number="3" title="Receiving Party" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full Name" value={data.receivingParty.name} onChange={v => update("receivingParty.name", v)} placeholder="Jane Doe" />
            <Field label="Title" value={data.receivingParty.title} onChange={v => update("receivingParty.title", v)} placeholder="CTO" />
          </div>
          <Field label="Company" value={data.receivingParty.company} onChange={v => update("receivingParty.company", v)} placeholder="Beta Inc." />
          <Field label="Address" value={data.receivingParty.address} onChange={v => update("receivingParty.address", v)} placeholder="456 Oak Ave" />
          <SectionHeader number="4" title="Agreement Terms" />
          <Field label="Purpose" value={data.purpose} onChange={v => update("purpose", v)} multiline placeholder="Purpose of disclosure..." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Duration (years)" type="number" value={data.duration} onChange={v => update("duration", v)} />
            <Field label="Survival (years)" type="number" value={data.survivalPeriod} onChange={v => update("survivalPeriod", v)} />
          </div>
          <Field label="Governing Law" value={data.governingLaw} onChange={v => update("governingLaw", v)} placeholder="State of Delaware" />
          <SectionHeader number="5" title="Exclusions" />
          <ListEditor items={data.confidentialInfoExclusions} onChange={v => update("confidentialInfoExclusions", v)} placeholder="Exclusion..." />
          <SectionHeader number="6" title="Obligations" />
          <ListEditor items={data.obligations} onChange={v => update("obligations", v)} placeholder="Obligation..." />
          <SectionHeader number="7" title="Additional Clauses" />
          <Field label="Custom Provisions" value={data.additionalClauses} onChange={v => update("additionalClauses", v)} multiline rows={4} placeholder="Additional terms..." />
          <div style={{ marginTop: 32, textAlign: "center", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setView("negotiate")} style={btnPrimary}>✦ Negotiate →</button>
            <button onClick={() => setView("export")} style={btnSecondary}
              onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = C.accent; }}>↓ Export</button>
          </div>
        </div>
      )}

      {/* ── NEGOTIATE TAB ── */}
      {view === "negotiate" && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 20px 60px" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginTop: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8a8a", marginBottom: 10 }}>Negotiation Perspective</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PERSPECTIVES.map(opt => (
                <button key={opt.id} onClick={() => setPerspective(opt.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px solid", borderRadius: 10, cursor: "pointer", fontFamily: F.ui, textAlign: "left", transition: "all 0.2s", minWidth: 130,
                  background: perspective === opt.id ? C.accent : "#fff", color: perspective === opt.id ? "#fff" : "#1a1a1a", borderColor: perspective === opt.id ? C.accent : "#ddd",
                }}><span style={{ fontSize: 15 }}>{opt.icon}</span><div><div style={{ fontWeight: 700, fontSize: 12 }}>{opt.label}</div><div style={{ fontSize: 10, opacity: 0.8 }}>{opt.desc}</div></div></button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(43,92,138,0.06)", border: "1px solid rgba(43,92,138,0.15)", borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, fontFamily: F.ui }}>
            <span style={{ fontSize: 16 }}>💡</span><div><strong>Click "✦ Optimize"</strong> on any clause for AI suggestions. Then accept, edit, or reject.</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <PreviewDocument data={data} perspective={perspective} onUpdate={update} showOptimize={true} />
          </div>
          <div style={{ textAlign: "center", marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setView("edit")} style={btnSecondary}
              onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = C.accent; }}>← Editor</button>
            <button onClick={() => setView("export")} style={btnPrimary}>↓ Export →</button>
          </div>
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {view === "export" && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 20px 60px" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, marginTop: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8a8a", marginBottom: 16 }}>Export Your NDA</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#555", marginBottom: 24, fontFamily: F.ui }}>
              Choose a format below. All exports are generated entirely in your browser — no data leaves your device.
            </p>

            {exportStatus && (
              <div style={{ padding: "10px 16px", background: exportStatus.startsWith("Error") ? "rgba(192,57,43,0.08)" : "rgba(39,174,96,0.08)",
                borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600, fontFamily: F.ui,
                color: exportStatus.startsWith("Error") ? "#c0392b" : "#27ae60" }}>
                {exportStatus}
              </div>
            )}

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* DOC */}
              <button onClick={() => handleExport("doc")} style={exportCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = "0 4px 20px rgba(43,92,138,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>Word Document</div>
                <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>.doc — Editable in Word / Google Docs</div>
                <div style={expBadge}>Download .doc</div>
              </button>
              {/* PDF */}
              <button onClick={() => handleExport("pdf")} style={exportCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(192,57,43,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📕</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>PDF Document</div>
                <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>.pdf — Print dialog to save as PDF</div>
                <div style={{ ...expBadge, background: "rgba(192,57,43,0.08)", color: "#c0392b" }}>Print / Save PDF</div>
              </button>
              {/* HTML */}
              <button onClick={() => handleExport("html")} style={exportCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#8e44ad"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(142,68,173,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🌐</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>HTML File</div>
                <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>.html — View in any browser</div>
                <div style={{ ...expBadge, background: "rgba(142,68,173,0.08)", color: "#8e44ad" }}>Download .html</div>
              </button>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8a8a", marginBottom: 10, fontFamily: F.ui }}>Preview</div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <PreviewDocument data={data} perspective={perspective} onUpdate={update} showOptimize={false} />
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setView("negotiate")} style={btnSecondary}
              onMouseEnter={e => { e.target.style.background = C.accent; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = C.accent; }}>← Back to Negotiate</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Constants & Styles ───── */
const C = { accent: "#2b5c8a", accentL: "rgba(43,92,138,0.07)" };
const F = { ui: "'DM Sans', sans-serif", body: "'Source Serif 4', Georgia, serif" };

const btnPrimary = { padding: "12px 36px", background: C.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", boxShadow: "0 2px 12px rgba(43,92,138,0.25)", transition: "all 0.15s" };
const btnSecondary = { padding: "12px 36px", background: "#fff", color: C.accent, border: `2px solid ${C.accent}`, borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", transition: "all 0.2s" };
const exportCard = { flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", border: "1.5px solid #ddd", borderRadius: 14, cursor: "pointer", background: "#fff", fontFamily: F.ui, transition: "all 0.2s", textAlign: "center" };
const expBadge = { marginTop: 10, padding: "7px 18px", background: "rgba(43,92,138,0.08)", color: C.accent, borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: F.ui };

const cs = {
  card: { margin: "8px 0 16px 36px", border: "1.5px solid rgba(43,92,138,0.2)", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f0f0f0", background: "rgba(43,92,138,0.03)" },
  xBtn: { background: "none", border: "none", cursor: "pointer", color: "#8a8a8a", fontSize: 16, padding: 4, borderRadius: 4, lineHeight: 1 },
  diffWrap: { padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 },
  diffLbl: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8a8a8a", marginBottom: 3, fontFamily: F.ui, display: "flex", alignItems: "center", gap: 6 },
  diffTxt: { padding: "8px 12px", borderRadius: 6, fontSize: 12.5, lineHeight: 1.7, fontFamily: F.body, color: "#1a1a1a" },
  summary: { padding: "10px 14px", borderTop: "1px solid #f0f0f0", background: "#fafafa" },
  chgItem: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 3, fontFamily: F.ui },
  risk: { display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6, padding: "6px 10px", background: "rgba(243,156,18,0.08)", borderRadius: 6, fontSize: 11, color: "#8a6d3b", fontFamily: F.ui, lineHeight: 1.5 },
  actions: { display: "flex", gap: 6, padding: "10px 14px", borderTop: "1px solid #f0f0f0" },
  accBtn: { padding: "7px 16px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", transition: "background 0.2s" },
  edtBtn: { padding: "7px 16px", background: "transparent", color: C.accent, border: `1.5px solid ${C.accent}`, borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", transition: "all 0.2s" },
  rejBtn: { padding: "7px 16px", background: "transparent", color: "#c0392b", border: "1.5px solid #c0392b", borderRadius: 7, fontSize: 12, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", transition: "all 0.2s", marginLeft: "auto" },
  editTA: { width: "100%", padding: "8px 10px", border: `1.5px solid ${C.accent}`, borderRadius: 7, fontSize: 12, fontFamily: F.body, color: "#1a1a1a", background: "#fff", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" },
  loading: { padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  pulseBar: { width: "60%", height: 4, borderRadius: 2, background: "#eee", overflow: "hidden", position: "relative" },
  pulseAnim: { position: "absolute", top: 0, left: 0, width: "30%", height: "100%", background: C.accent, borderRadius: 2, animation: "pulse-slide 1.2s ease-in-out infinite" },
};

const cl = {
  row: { display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 10px", borderRadius: 8 },
  text: { flex: 1, fontSize: 13.5, lineHeight: 1.7, fontFamily: F.body, color: "#1a1a1a" },
  lbl: { color: "#8a8a8a", fontSize: 12, fontFamily: F.ui, flexShrink: 0, width: 24, textAlign: "right", marginTop: 2 },
  btn: { flexShrink: 0, padding: "4px 10px", background: C.accentL, color: C.accent, border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: F.ui, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", marginTop: 1 },
};

const fst = {
  badge: { width: 30, height: 30, borderRadius: "50%", background: C.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: F.ui, flexShrink: 0 },
  secTitle: { margin: 0, fontSize: 15, fontWeight: 700, fontFamily: F.ui, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" },
  label: { display: "block", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8a8a", marginBottom: 5, fontFamily: F.ui },
  inp: { width: "100%", padding: "9px 11px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: F.body, color: "#1a1a1a", background: "#fafafa", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  ta: { width: "100%", padding: "9px 11px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: F.body, color: "#1a1a1a", background: "#fafafa", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" },
  rmBtn: { background: "none", border: "none", cursor: "pointer", color: "#8a8a8a", fontSize: 18, padding: "6px", marginTop: 4, lineHeight: 1, borderRadius: 4, transition: "color 0.2s" },
  addBtn: { alignSelf: "flex-start", marginLeft: 28, background: "none", border: "1.5px dashed #ddd", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 12, color: C.accent, fontFamily: F.ui, fontWeight: 600, transition: "all 0.2s" },
};

const ps = {
  page: { fontFamily: F.body, fontSize: 13.5, lineHeight: 1.8, color: "#1a1a1a", background: "#fff", padding: "44px 48px", maxWidth: 780, margin: "0 auto" },
  title: { textAlign: "center", fontSize: 20, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, fontFamily: F.ui },
  subtitle: { textAlign: "center", fontSize: 10, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28, fontFamily: F.ui },
  h: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 24, marginBottom: 8, fontFamily: F.ui, color: "#222" },
  p: { marginBottom: 10 },
  hl: { background: "#fffbe6", padding: "1px 4px", borderRadius: 3, fontWeight: 600 },
  signGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 36, paddingTop: 20, borderTop: "1px solid #ddd" },
  signLine: { borderBottom: "1px solid #999", height: 28, marginBottom: 4 },
  signLbl: { fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: F.ui },
};
