"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

interface Fields {
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  availability: string;
  experience: string;
}

const initial: Fields = {
  name: "",
  email: "",
  phone: "",
  vehicle: "",
  availability: "",
  experience: "",
};

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus-visible:border-gold";

export function CareersForm() {
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      next.email = "Enter a valid email address.";
    if (fields.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a valid phone number.";
    if (!fields.vehicle.trim()) next.vehicle = "Let us know your vehicle type.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // TODO: POST driver application to email/CRM (e.g. /api/careers or a
    // form service). No backend wired in Phase 1 — this confirms client-side.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card border-success/30 bg-success/5 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
        <h3 className="mt-4 text-xl font-semibold text-navy-deep">
          Application received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">
          Thank you, {fields.name.split(" ")[0] || "driver"}. The CSL team will
          review your application and reach out about next steps, including the
          compliance onboarding you&apos;ll complete before your first route.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card">
      <h3 className="text-xl font-semibold text-navy-deep">Driver application</h3>
      <p className="mt-1 text-sm text-ink/60">
        Independent-contractor drivers — tell us about yourself.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} required>
          <input
            className={inputClass}
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jordan Smith"
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Phone" error={errors.phone} required>
          <input
            className={inputClass}
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(804) 555-0142"
            inputMode="tel"
            aria-invalid={!!errors.phone}
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <input
            className={inputClass}
            type="email"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@email.com"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Vehicle type" error={errors.vehicle} required>
          <select
            className={inputClass}
            value={fields.vehicle}
            onChange={(e) => update("vehicle", e.target.value)}
            aria-invalid={!!errors.vehicle}
          >
            <option value="">Select…</option>
            <option>Sedan / compact</option>
            <option>SUV / crossover</option>
            <option>Cargo van</option>
            <option>Pickup truck</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Availability">
          <select
            className={inputClass}
            value={fields.availability}
            onChange={(e) => update("availability", e.target.value)}
          >
            <option value="">Select…</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>On-call / STAT</option>
            <option>Weekends</option>
          </select>
        </Field>
        <Field label="Relevant experience" className="sm:col-span-2">
          <textarea
            className={inputClass}
            rows={4}
            value={fields.experience}
            onChange={(e) => update("experience", e.target.value)}
            placeholder="Courier, medical, or delivery experience; clean driving record; certifications, etc."
          />
        </Field>
      </div>

      <button type="submit" className="btn-gold mt-6 w-full sm:w-auto">
        Submit application
        <Send className="h-4 w-4" aria-hidden />
      </button>
      <p className="mt-3 text-xs text-ink/50">
        By applying you agree to complete CSL&apos;s compliance onboarding
        (HIPAA, OSHA bloodborne pathogens, and safe-handling training) before
        your first route.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-navy-deep">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
