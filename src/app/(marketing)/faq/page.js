"use client";

import Accordion from "@/components/ui/Accordion";

const CATEGORIES = [
  {
    label: "Getting Started",
    icon: "🚀",
    items: [
      { question: "How do I sign up for EduSaaS?", answer: "Visit our Register page, fill in your institution details, and choose a plan. Your account is ready instantly — no approval required. A 14-day free trial starts automatically." },
      { question: "Is there a free trial?", answer: "Yes! Every plan includes a 14-day free trial with full feature access. No credit card is required to start." },
      { question: "How long does setup take?", answer: "Most institutions are fully set up within a day. Our onboarding wizard guides you through adding classes, teachers, and students step by step." },
      { question: "Do I need to install any software?", answer: "No. EduSaaS is 100% cloud-based. You access it from any browser on any device — desktop, tablet, or phone." },
    ],
  },
  {
    label: "Billing & Plans",
    icon: "💳",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept bKash, Nagad, Visa/Mastercard, and bank transfer (BRAC, Dutch-Bangla, etc.). All transactions are in BDT." },
      { question: "Can I change my plan later?", answer: "Yes. Upgrade or downgrade at any time. When upgrading, we prorate the cost. When downgrading, you'll retain your current tier until the billing period ends." },
      { question: "Is there a discount for annual billing?", answer: "Yes — paying yearly saves you approximately 20% compared to monthly billing. The discount is applied automatically when you select the yearly option." },
      { question: "Do you offer NGO or government school discounts?", answer: "We have special pricing for government-run institutions and registered NGOs. Contact our sales team at hello@edusaas.app for details." },
    ],
  },
  {
    label: "Features & Data",
    icon: "⚙️",
    items: [
      { question: "Can I migrate data from my existing system?", answer: "Yes. We provide CSV import templates for students, teachers, and fee data. Our support team can also assist with custom migrations for large datasets." },
      { question: "Is my data secure?", answer: "Absolutely. All data is encrypted at rest and in transit. We maintain a full audit log of every action. Data is stored in Bangladesh-region servers." },
      { question: "Can multiple staff members use the system simultaneously?", answer: "Yes. EduSaaS is fully multi-user. You can assign roles (admin, teacher, accountant, etc.) with specific permissions for each staff member." },
      { question: "Does it support Bangla?", answer: "Yes. The interface supports Bangla student names, reports, and notices. You can also generate Bangla PDF result cards and invoices." },
    ],
  },
  {
    label: "Support",
    icon: "🎧",
    items: [
      { question: "What support channels are available?", answer: "We offer live chat, email support (hello@edusaas.app), and phone support. Pro and Enterprise users also get access to our priority support queue." },
      { question: "What are your support hours?", answer: "Our support team is available Sunday to Thursday, 9AM – 6PM BST. For urgent issues, Enterprise clients have a dedicated support manager available on WhatsApp." },
      { question: "Is there training available for staff?", answer: "Yes. We offer free onboarding webinars every week. A full video tutorial library is also available in the Help Centre, with walkthroughs in both English and Bangla." },
      { question: "What if I want to cancel?", answer: "You can cancel at any time from your account settings. There are no cancellation fees. You'll retain access until the end of your paid billing period." },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <section style={{ padding: "6rem 0 5rem", background: "var(--gradient-hero)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <span className="tag-pill" style={{ marginBottom: "1.5rem", display: "inline-flex", background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(165,180,252,0.3)" }}>
            FAQ
          </span>
          <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", marginBottom: "1.25rem" }}>
            Frequently asked questions
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Can't find your answer? Contact our team — we respond within 2 hours.
          </p>
        </div>
      </section>

      <section style={{ padding: "5rem 0", background: "var(--bg-subtle)" }}>
        <div className="section-container" style={{ maxWidth: "900px" }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} style={{ marginBottom: "3.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{cat.icon}</span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {cat.label}
                </h2>
              </div>
              <Accordion items={cat.items} />
            </div>
          ))}

          <div style={{ textAlign: "center", padding: "3rem", borderRadius: "var(--radius-2xl)", background: "linear-gradient(135deg, var(--color-primary-50), #f5f3ff)", border: "1px solid var(--color-primary-100)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💬</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Still have questions?
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
              Our team is ready to help you find the right plan and answer any question.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" style={{ padding: "0.75rem 1.75rem", borderRadius: "9999px", background: "var(--gradient-brand)", color: "#fff", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-brand)", fontSize: "0.9375rem" }}>
                Contact Us
              </a>
              <a href="/demo" style={{ padding: "0.75rem 1.75rem", borderRadius: "9999px", border: "1.5px solid var(--color-primary-200)", color: "var(--color-primary-700)", fontWeight: 600, textDecoration: "none", fontSize: "0.9375rem" }}>
                Book a Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
