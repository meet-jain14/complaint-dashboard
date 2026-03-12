import { useState, useEffect } from "react";

const COMPLAINTS = [
  { id: "CMP-001", customer: "Rajesh Sharma", type: "Transaction Dispute", product: "Savings Account", severity: "High", sentiment: "Angry", status: "Open", sla: 2, slaDue: "2h left", channel: "Email", summary: "Unauthorized debit of ₹45,000 from account on 10th March.", assigned: "Priya Mehta", created: "2024-03-11", escalated: true },
  { id: "CMP-002", customer: "Anita Desai", type: "Loan Query", product: "Home Loan", severity: "Medium", sentiment: "Frustrated", status: "In Progress", sla: 8, slaDue: "8h left", channel: "Phone", summary: "EMI deducted twice in March. Requesting reversal immediately.", assigned: "Rahul Gupta", created: "2024-03-11", escalated: false },
  { id: "CMP-003", customer: "Mohammed Farouk", type: "Card Block", product: "Credit Card", severity: "Critical", sentiment: "Angry", status: "Escalated", sla: 0, slaDue: "Overdue", channel: "Chat", summary: "Card blocked without prior notice during international travel.", assigned: "Sneha Iyer", created: "2024-03-10", escalated: true },
  { id: "CMP-004", customer: "Sunita Patel", type: "KYC Issue", product: "Current Account", severity: "Low", sentiment: "Neutral", status: "Resolved", sla: 24, slaDue: "Done", channel: "Branch", summary: "Documents submitted 3 times, KYC still pending for 2 weeks.", assigned: "Amit Singh", created: "2024-03-09", escalated: false },
  { id: "CMP-005", customer: "Vikram Nair", type: "Interest Rate", product: "Fixed Deposit", severity: "Medium", sentiment: "Dissatisfied", status: "Open", sla: 12, slaDue: "12h left", channel: "App", summary: "Interest rate changed without notification on FD renewal.", assigned: "Priya Mehta", created: "2024-03-11", escalated: false },
  { id: "CMP-006", customer: "Deepa Krishnan", type: "Fund Transfer", product: "Savings Account", severity: "High", sentiment: "Angry", status: "In Progress", sla: 4, slaDue: "4h left", channel: "Email", summary: "NEFT transfer of ₹1.2L stuck for 3 days, beneficiary not credited.", assigned: "Rahul Gupta", created: "2024-03-10", escalated: true },
  { id: "CMP-007", customer: "Arjun Mehta", type: "Mobile Banking", product: "Net Banking", severity: "Low", sentiment: "Neutral", status: "Resolved", sla: 24, slaDue: "Done", channel: "App", summary: "Unable to login to mobile app after password reset.", assigned: "Sneha Iyer", created: "2024-03-08", escalated: false },
  { id: "CMP-008", customer: "Kavitha Rao", type: "Fraud Alert", product: "Debit Card", severity: "Critical", sentiment: "Angry", status: "Escalated", sla: 0, slaDue: "Overdue", channel: "Phone", summary: "Multiple small transactions from unknown merchant in UAE.", assigned: "Amit Singh", created: "2024-03-11", escalated: true },
];

const TRENDS = [
  { month: "Oct", complaints: 142, resolved: 128 },
  { month: "Nov", complaints: 168, resolved: 145 },
  { month: "Dec", complaints: 195, resolved: 172 },
  { month: "Jan", complaints: 178, resolved: 160 },
  { month: "Feb", complaints: 210, resolved: 188 },
  { month: "Mar", complaints: 156, resolved: 124 },
];

const TYPE_DATA = [
  { type: "Transaction Dispute", count: 34, color: "#F59E0B" },
  { type: "Card Issues", count: 28, color: "#EF4444" },
  { type: "Loan Query", count: 22, color: "#3B82F6" },
  { type: "KYC / Docs", count: 18, color: "#8B5CF6" },
  { type: "Mobile Banking", count: 14, color: "#10B981" },
  { type: "Fraud", count: 12, color: "#EC4899" },
];

const severityColor = { Critical: "#EF4444", High: "#F59E0B", Medium: "#3B82F6", Low: "#10B981" };
const statusColor = { Open: "#F59E0B", "In Progress": "#3B82F6", Escalated: "#EF4444", Resolved: "#10B981" };
const sentimentEmoji = { Angry: "😠", Frustrated: "😤", Dissatisfied: "😞", Neutral: "😐", Satisfied: "😊" };

export default function App() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiMode, setAiMode] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateStats(true), 300);
  }, []);

  const filtered = COMPLAINTS.filter(c => {
    const matchFilter = filter === "All" || c.status === filter;
    const matchSearch = searchQuery === "" ||
      c.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: COMPLAINTS.length,
    open: COMPLAINTS.filter(c => c.status === "Open").length,
    escalated: COMPLAINTS.filter(c => c.status === "Escalated").length,
    resolved: COMPLAINTS.filter(c => c.status === "Resolved").length,
    overdue: COMPLAINTS.filter(c => c.slaDue === "Overdue").length,
  };

  const callClaude = async (prompt, mode) => {
    setAiLoading(true);
    setAiResponse("");
    setAiMode(mode);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.[0]?.text || "No response received.");
    } catch (e) {
      setAiResponse("Error connecting to AI. Please try again.");
    }
    setAiLoading(false);
  };

  const handleDraftResponse = (c) => {
    callClaude(
      `You are a senior banking customer service manager. Draft a professional, empathetic response to this customer complaint for agent review.

Customer: ${c.customer}
Complaint Type: ${c.type}
Product: ${c.product}
Severity: ${c.severity}
Customer Sentiment: ${c.sentiment}
Issue Summary: ${c.summary}

Write a warm, professional response (3-4 sentences) that:
1. Acknowledges their frustration
2. Confirms the issue is being investigated
3. Gives a realistic timeline
4. Provides a reference number

Keep it concise and human.`,
      "Draft Response"
    );
  };

  const handleRootCause = () => {
    callClaude(
      `You are a banking operations analyst. Analyze these customer complaints and identify root causes and patterns:

${COMPLAINTS.map(c => `- ${c.type} (${c.product}): ${c.summary}`).join("\n")}

Provide:
1. Top 3 root causes with brief explanation
2. Which departments are most impacted
3. One immediate action recommendation

Be concise and actionable. Use bullet points.`,
      "Root Cause Analysis"
    );
  };

  const handleTrendInsight = () => {
    callClaude(
      `You are a banking analytics expert. Based on this complaint trend data for a bank:
- October: 142 complaints, 128 resolved
- November: 168 complaints, 145 resolved  
- December: 195 complaints, 172 resolved
- January: 178 complaints, 160 resolved
- February: 210 complaints, 188 resolved
- March: 156 so far, 124 resolved

Top complaint types: Transaction Disputes (34), Card Issues (28), Loan Queries (22)

Give a 3-point trend analysis with predictions for next month and one strategic recommendation. Be brief and sharp.`,
      "Trend Insight"
    );
  };

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1535 50%, #0a1628 100%)",
      minHeight: "100vh",
      color: "#e2e8f0",
    }}>
      {/* Top Nav */}
      <nav style={{
        background: "rgba(10,15,30,0.95)",
        borderBottom: "1px solid rgba(212,175,55,0.3)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "8px",
            background: "linear-gradient(135deg, #D4AF37, #F59E0B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "bold", color: "#0a0f1e"
          }}>⚡</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "bold", color: "#D4AF37", letterSpacing: "0.5px" }}>ComplaintIQ</div>
            <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>Unified Intelligence Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["dashboard", "complaints", "analytics"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              background: tab === t ? "linear-gradient(135deg, #D4AF37, #F59E0B)" : "rgba(255,255,255,0.05)",
              color: tab === t ? "#0a0f1e" : "#94a3b8",
              fontSize: "13px", fontWeight: tab === t ? "bold" : "normal",
              textTransform: "capitalize", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }}></div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Live · {new Date().toLocaleTimeString()}</span>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#fff", margin: 0 }}>
                Good morning, <span style={{ color: "#D4AF37" }}>Operations Team</span> 👋
              </h1>
              <p style={{ color: "#64748b", marginTop: "4px", fontSize: "14px" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {stats.overdue} complaints need immediate attention
              </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { label: "Total Complaints", value: stats.total, icon: "📋", color: "#3B82F6", sub: "This month" },
                { label: "Open", value: stats.open, icon: "🔴", color: "#F59E0B", sub: "Awaiting action" },
                { label: "Escalated", value: stats.escalated, icon: "⚠️", color: "#EF4444", sub: "Needs urgency" },
                { label: "Resolved", value: stats.resolved, icon: "✅", color: "#10B981", sub: "This month" },
                { label: "SLA Breached", value: stats.overdue, icon: "⏰", color: "#EC4899", sub: "Act now" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderTop: `3px solid ${s.color}`,
                  borderRadius: "12px", padding: "1.25rem",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
                  <div style={{
                    fontSize: "32px", fontWeight: "bold", color: s.color,
                    transform: animateStats ? "scale(1)" : "scale(0.5)",
                    transition: `all 0.5s ease ${i * 0.1}s`,
                  }}>{s.value}</div>
                  <div style={{ fontSize: "13px", color: "#fff", fontWeight: "600", marginTop: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* AI Insight Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { label: "🤖 Root Cause Analysis", desc: "AI identifies patterns across all complaints", action: handleRootCause, mode: "Root Cause Analysis" },
                { label: "📈 Trend Insights", desc: "AI predicts next month's complaint volume", action: handleTrendInsight, mode: "Trend Insight" },
                { label: "⚡ Bulk Draft Responses", desc: "Auto-generate responses for open complaints", action: () => callClaude(`List 3 best practices for resolving banking complaints quickly. Be concise with bullet points.`, "Best Practices"), mode: "Best Practices" },
              ].map((card, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px", padding: "1.25rem",
                }}>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#D4AF37", marginBottom: "6px" }}>{card.label}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>{card.desc}</div>
                  <button onClick={card.action} style={{
                    background: "linear-gradient(135deg, #D4AF37, #F59E0B)",
                    color: "#0a0f1e", border: "none", borderRadius: "6px",
                    padding: "6px 14px", fontSize: "12px", fontWeight: "bold",
                    cursor: "pointer",
                  }}>Run AI Analysis →</button>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>Complaint Volume Trend</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Monthly complaints vs resolved — last 6 months</div>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                  <span><span style={{ color: "#F59E0B" }}>■</span> Received</span>
                  <span><span style={{ color: "#10B981" }}>■</span> Resolved</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", height: "120px" }}>
                {TRENDS.map((t, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "90px" }}>
                      <div style={{
                        width: "18px", borderRadius: "4px 4px 0 0",
                        background: "linear-gradient(to top, #F59E0B, #FCD34D)",
                        height: `${(t.complaints / 210) * 90}px`,
                        transition: "height 1s ease",
                      }}></div>
                      <div style={{
                        width: "18px", borderRadius: "4px 4px 0 0",
                        background: "linear-gradient(to top, #10B981, #34D399)",
                        height: `${(t.resolved / 210) * 90}px`,
                        transition: "height 1s ease",
                      }}></div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{t.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Breakdown */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "1.5rem"
            }}>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>Complaint Type Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {TYPE_DATA.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "130px", fontSize: "12px", color: "#94a3b8" }}>{t.type}</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{
                        width: `${(t.count / 34) * 100}%`, height: "100%",
                        background: t.color, borderRadius: "4px",
                        transition: "width 1s ease",
                      }}></div>
                    </div>
                    <div style={{ width: "30px", fontSize: "12px", color: t.color, fontWeight: "bold" }}>{t.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* COMPLAINTS TAB */}
        {tab === "complaints" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ margin: 0, color: "#fff", fontSize: "22px" }}>All Complaints</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>{filtered.length} complaints shown</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  placeholder="Search by name, ID, type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px", padding: "8px 14px", color: "#fff", fontSize: "13px", width: "220px",
                    outline: "none",
                  }}
                />
                {["All", "Open", "In Progress", "Escalated", "Resolved"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer",
                    background: filter === f ? "linear-gradient(135deg, #D4AF37, #F59E0B)" : "rgba(255,255,255,0.06)",
                    color: filter === f ? "#0a0f1e" : "#94a3b8",
                    fontSize: "12px", fontWeight: filter === f ? "bold" : "normal",
                  }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "1.5rem" }}>
              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map(c => (
                  <div key={c.id} onClick={() => { setSelected(c); setAiResponse(""); }} style={{
                    background: selected?.id === c.id ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                    border: selected?.id === c.id ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `4px solid ${severityColor[c.severity]}`,
                    borderRadius: "10px", padding: "1rem 1.25rem",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold" }}>{c.id}</span>
                          <span style={{ fontSize: "12px", color: "#fff", fontWeight: "600" }}>{c.customer}</span>
                          <span style={{ fontSize: "18px" }}>{sentimentEmoji[c.sentiment]}</span>
                          {c.escalated && <span style={{ background: "#EF444420", color: "#EF4444", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>ESCALATED</span>}
                        </div>
                        <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>{c.summary}</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {[
                            { label: c.type, color: "#3B82F6" },
                            { label: c.product, color: "#8B5CF6" },
                            { label: c.channel, color: "#6B7280" },
                          ].map((tag, i) => (
                            <span key={i} style={{
                              background: `${tag.color}20`, color: tag.color,
                              fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                            }}>{tag.label}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", marginLeft: "1rem", minWidth: "100px" }}>
                        <div style={{
                          background: `${statusColor[c.status]}20`, color: statusColor[c.status],
                          fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                          fontWeight: "bold", marginBottom: "6px", display: "inline-block"
                        }}>{c.status}</div>
                        <div style={{ fontSize: "11px", color: c.slaDue === "Overdue" ? "#EF4444" : "#F59E0B" }}>⏱ {c.slaDue}</div>
                        <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>👤 {c.assigned}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail Panel */}
              {selected && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px", padding: "1.5rem",
                  height: "fit-content", position: "sticky", top: "80px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#D4AF37" }}>{selected.id}</div>
                      <div style={{ fontSize: "14px", color: "#fff", marginTop: "2px" }}>{selected.customer}</div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{
                      background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
                      borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "16px"
                    }}>✕</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
                    {[
                      ["Type", selected.type], ["Product", selected.product],
                      ["Severity", selected.severity], ["Sentiment", `${sentimentEmoji[selected.sentiment]} ${selected.sentiment}`],
                      ["Channel", selected.channel], ["Assigned", selected.assigned],
                      ["Created", selected.created], ["SLA", selected.slaDue],
                    ].map(([k, v], i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px" }}>
                        <div style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>{k}</div>
                        <div style={{ fontSize: "13px", color: "#e2e8f0", marginTop: "2px", fontWeight: "500" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "12px", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Issue Summary</div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>{selected.summary}</div>
                  </div>

                  {/* Communication History */}
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold", marginBottom: "8px" }}>📨 Communication History</div>
                    {[
                      { from: "Customer", msg: "I need this resolved urgently.", time: "10:24 AM" },
                      { from: selected.assigned, msg: "We have logged your complaint and are investigating.", time: "11:05 AM" },
                      { from: "System", msg: "Complaint escalated due to SLA breach.", time: "2:30 PM" },
                    ].map((h, i) => (
                      <div key={i} style={{
                        background: h.from === "Customer" ? "rgba(59,130,246,0.08)" : h.from === "System" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                        borderRadius: "8px", padding: "8px 10px", marginBottom: "6px",
                        borderLeft: `3px solid ${h.from === "Customer" ? "#3B82F6" : h.from === "System" ? "#EF4444" : "#10B981"}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#94a3b8" }}>{h.from}</span>
                          <span style={{ fontSize: "10px", color: "#475569" }}>{h.time}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "3px" }}>{h.msg}</div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handleDraftResponse(selected)} style={{
                    width: "100%", background: "linear-gradient(135deg, #D4AF37, #F59E0B)",
                    color: "#0a0f1e", border: "none", borderRadius: "8px",
                    padding: "10px", fontSize: "13px", fontWeight: "bold",
                    cursor: "pointer", marginBottom: "8px",
                  }}>🤖 Generate AI Draft Response</button>

                  {aiLoading && aiMode === "Draft Response" && (
                    <div style={{ textAlign: "center", padding: "16px", color: "#D4AF37", fontSize: "13px" }}>
                      ✨ AI is drafting response...
                    </div>
                  )}

                  {aiResponse && aiMode === "Draft Response" && (
                    <div style={{
                      background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#e2e8f0", lineHeight: "1.6"
                    }}>
                      <div style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "bold", marginBottom: "8px" }}>✅ AI DRAFT — Ready for Agent Review</div>
                      {aiResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <>
            <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "1.5rem" }}>AI-Powered Analytics</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Severity Distribution */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>Severity Distribution</div>
                {Object.entries(severityColor).map(([sev, col]) => {
                  const count = COMPLAINTS.filter(c => c.severity === sev).length;
                  return (
                    <div key={sev} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "70px", fontSize: "12px", color: "#94a3b8" }}>{sev}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "10px" }}>
                        <div style={{ width: `${(count / COMPLAINTS.length) * 100}%`, height: "100%", background: col, borderRadius: "4px" }}></div>
                      </div>
                      <div style={{ width: "20px", fontSize: "13px", color: col, fontWeight: "bold" }}>{count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Channel Distribution */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>Channel Distribution</div>
                {["Email", "Phone", "Chat", "Branch", "App"].map((ch, i) => {
                  const count = COMPLAINTS.filter(c => c.channel === ch).length;
                  const colors = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];
                  return (
                    <div key={ch} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "60px", fontSize: "12px", color: "#94a3b8" }}>{ch}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "10px" }}>
                        <div style={{ width: `${(count / COMPLAINTS.length) * 100}%`, height: "100%", background: colors[i], borderRadius: "4px" }}></div>
                      </div>
                      <div style={{ width: "20px", fontSize: "13px", color: colors[i], fontWeight: "bold" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis Panel */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem" }}>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", marginBottom: "1rem" }}>🤖 Gen-AI Intelligence Center</div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "🔍 Root Cause Analysis", action: handleRootCause, mode: "Root Cause Analysis" },
                  { label: "📈 Trend Prediction", action: handleTrendInsight, mode: "Trend Insight" },
                  { label: "⚡ Best Practices", action: () => callClaude("List 5 best practices for a banking complaint resolution team using AI. Be specific and concise.", "Best Practices"), mode: "Best Practices" },
                  { label: "📊 Regulatory Summary", action: () => callClaude("Generate a brief regulatory compliance summary for a bank's complaint management system, mentioning RBI guidelines for complaint resolution. Be concise.", "Regulatory Summary"), mode: "Regulatory Summary" },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} style={{
                    background: aiMode === btn.mode && (aiLoading || aiResponse) ? "linear-gradient(135deg, #D4AF37, #F59E0B)" : "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.3)", color: aiMode === btn.mode && (aiLoading || aiResponse) ? "#0a0f1e" : "#D4AF37",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "13px",
                    cursor: "pointer", fontWeight: "600",
                  }}>{btn.label}</button>
                ))}
              </div>

              {aiLoading && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#D4AF37" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>✨</div>
                  <div style={{ fontSize: "14px" }}>AI is analyzing complaint data...</div>
                </div>
              )}

              {!aiLoading && aiResponse && (
                <div style={{
                  background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: "10px", padding: "1.25rem",
                }}>
                  <div style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    ✅ {aiMode} — Generated by Gen-AI
                  </div>
                  <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{aiResponse}</div>
                </div>
              )}

              {!aiLoading && !aiResponse && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤖</div>
                  <div style={{ fontSize: "14px" }}>Click any button above to run AI analysis on your complaint data</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
