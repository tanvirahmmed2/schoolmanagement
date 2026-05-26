"use client";

import { useState, useEffect } from "react";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/ui/Button";
import { slugify } from "@/utils/helpers";

export default function ClientSettingsPage() {
  const [tenant, setTenant] = useState(null);
  const [form, setForm] = useState({
    institutionName: "",
    type: "school",
    email: "",
    phone: "",
    country: "Bangladesh"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function loadTenantSettings() {
    try {
      const res = await fetch("/api/tenants/me");
      const json = await res.json();
      if (json.success && json.data) {
        setTenant(json.data);
        setForm({
          institutionName: json.data.institution_name || "",
          type: json.data.institution_type || "school",
          email: json.data.email || "",
          phone: json.data.phone || "",
          country: json.data.country || "Bangladesh"
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load settings data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenantSettings();
  }, []);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!tenant) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName: form.institutionName,
          institutionType: form.type,
          email: form.email,
          phone: form.phone,
          country: form.country,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTenant(data.data);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Settings</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>Update your institution profile</p>

      {error && (
        <div style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.5rem" }}>Institution Profile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <Input id="s-name" label="Institution Name" name="institutionName" value={form.institutionName} onChange={change} />
          <Select id="s-type" label="Institution Type" name="type" value={form.type} onChange={change}
            options={[
              { value: "school", label: "School" },
              { value: "college", label: "College" },
              { value: "madrasah", label: "Madrasah" },
              { value: "coaching", label: "Coaching Centre" }
            ]}
          />
          <Input id="s-email" label="Contact Email" name="email" type="email" value={form.email} onChange={change} />
          <Input id="s-phone" label="Phone Number" name="phone" value={form.phone} onChange={change} />
          <Input id="s-country" label="Country" name="country" value={form.country} onChange={change} />
        </div>
        <Button onClick={save} loading={saving}>{saved ? "✓ Saved!" : "Save Changes"}</Button>
      </div>

      {tenant && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "1.25rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1rem" }}>Domain / Subdomain</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem" }}>Your institution's EduSaaS subdomain</p>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <code style={{ padding: "0.625rem 1rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#6366f1", fontWeight: 700, fontSize: "0.9375rem" }}>
              {slugify(tenant.institution_name)}.edusaas.app
            </code>
            <button style={{ padding: "0.625rem 1rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              Request Custom Domain
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1.5px solid #fecaca", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 800, color: "#dc2626", fontSize: "1rem", marginBottom: "0.75rem" }}>Danger Zone</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem" }}>Delete your institution and all associated data. This cannot be undone.</p>
        <button style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "#ef4444", color: "#fff", fontWeight: 700, border: "none", cursor: "not-allowed", opacity: 0.6, fontSize: "0.875rem" }} disabled>
          Delete Institution (Contact Admin)
        </button>
      </div>
    </div>
  );
}
