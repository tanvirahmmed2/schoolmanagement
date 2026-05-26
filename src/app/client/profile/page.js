"use client";

import { useState, useEffect } from "react";
import Input from "@/components/forms/Input";
import Button from "@/components/ui/Button";

export default function ClientProfilePage() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/users/me");
        const json = await res.json();
        if (json.success && json.data) {
          setProfile({
            name: json.data.name || "",
            email: json.data.email || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Profile details updated successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "New passwords do not match!", type: "error" });
      return;
    }
    setSavingPassword(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Password changed successfully!", type: "success" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ text: data.message || "Failed to change password", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>My Profile</h1>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>Update your personal credentials and login security details</p>

      {message.text && (
        <div style={{
          padding: "0.875rem 1rem",
          borderRadius: "10px",
          background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: message.type === "success" ? "1px solid #a7f3d0" : "1px solid #fecaca",
          color: message.type === "success" ? "#047857" : "#b91c1c",
          fontSize: "0.875rem",
          marginBottom: "1.5rem"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Profile Form */}
        <form onSubmit={saveProfile} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.5rem" }}>Personal Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <Input id="p-name" label="Full Name" name="name" value={profile.name} onChange={handleProfileChange} required />
            <Input id="p-email" label="Email Address" name="email" type="email" value={profile.email} onChange={handleProfileChange} required />
          </div>
          <Button type="submit" loading={savingProfile}>Save Credentials</Button>
        </form>

        {/* Password Form */}
        <form onSubmit={savePassword} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "1.5rem" }}>Change Password</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <Input id="p-curr" label="Current Password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
            <Input id="p-new" label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
            <Input id="p-conf" label="Confirm New Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
          </div>
          <Button type="submit" loading={savingPassword}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
