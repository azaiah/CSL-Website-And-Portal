"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  Stethoscope,
  Truck,
  Building2,
  Users,
  Warehouse,
  Zap,
  CalendarClock,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const serviceOptions = [
  { value: "medical-courier", label: "Medical Courier", icon: Stethoscope },
  { value: "freight-delivery", label: "Freight & Delivery", icon: Truck },
  { value: "facilities-management", label: "Facilities Mgmt", icon: Building2 },
  { value: "workforce-solutions", label: "Workforce", icon: Users },
  { value: "warehouse-storage", label: "Warehouse Storage", icon: Warehouse },
];

const urgencyOptions = [
  { value: "stat", label: "STAT", desc: "Urgent / same-hour", icon: Zap },
  { value: "same-day", label: "Same-day", desc: "Today", icon: CalendarClock },
  { value: "scheduled", label: "Scheduled", desc: "Recurring / future", icon: CalendarDays },
];

interface FormState {
  service: string;
  urgency: string;
  pickup: string;
  dropoff: string;
  details: string;
  name: string;
  company: string;
  email: string;
  phone: string;
}

const initial: FormState = {
  service: "",
  urgency: "",
  pickup: "",
  dropoff: "",
  details: "",
  name: "",
  company: "",
  email: "",
  phone: "",
};

const inputClass =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus-visible:border-gold";

const steps = ["Service", "Route", "Contact"];

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateStep(current: number): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (current === 0) {
      if (!form.service) next.service = "Choose a service.";
      if (!form.urgency) next.urgency = "Choose an urgency.";
    }
    if (current === 1) {
      if (!form.pickup.trim()) next.pickup = "Enter a pickup location.";
      if (!form.dropoff.trim()) next.dropoff = "Enter a drop-off location.";
    }
    if (current === 2) {
      if (!form.name.trim()) next.name = "Enter your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        next.email = "Enter a valid email.";
      if (form.phone.replace(/\D/g, "").length < 10)
        next.phone = "Enter a valid phone number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(2)) return;
    // TODO: POST the quote/pickup request to email or CRM here.
    // e.g. await fetch("/api/quote", { method: "POST", body: JSON.stringify(form) })
    // No backend is wired in Phase 1 — this confirms the request client-side.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card border-success/30 bg-success/5 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h3 className="mt-4 text-2xl font-semibold text-navy-deep">
          Request received
        </h3>
        <p className="mx-auto mt-2 max-w-md text-ink/70">
          Thanks, {form.name.split(" ")[0] || "there"}. Your{" "}
          {form.urgency === "stat" ? "STAT " : ""}request is in. The CSL team will
          confirm availability and pricing shortly — usually within the hour during
          business hours.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-navy/10 bg-white p-4 text-left text-sm">
          <dl className="space-y-1.5 text-ink/70">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Service</dt>
              <dd className="font-medium text-navy-deep">
                {serviceOptions.find((s) => s.value === form.service)?.label}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Urgency</dt>
              <dd className="font-medium text-navy-deep">
                {urgencyOptions.find((u) => u.value === form.urgency)?.label}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Route</dt>
              <dd className="text-right font-medium text-navy-deep">
                {form.pickup} → {form.dropoff}
              </dd>
            </div>
          </dl>
        </div>
        <button
          className="btn-ghost mt-6"
          onClick={() => {
            setForm(initial);
            setStep(0);
            setSubmitted(false);
          }}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card">
      {/* Step indicator */}
      <ol className="flex items-center gap-2" aria-label="Progress">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                i < step
                  ? "bg-success text-white"
                  : i === step
                  ? "bg-gold text-navy-deep"
                  : "bg-surface text-ink/40"
              )}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                i === step ? "text-navy-deep" : "text-ink/50"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className="ml-1 hidden h-px flex-1 bg-navy/10 sm:block" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-navy-deep">
                    What service do you need? <span className="text-gold">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {serviceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("service", opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                          form.service === opt.value
                            ? "border-gold bg-gold/10"
                            : "border-navy/10 bg-white hover:border-navy/25"
                        )}
                        aria-pressed={form.service === opt.value}
                      >
                        <opt.icon className="h-6 w-6 text-navy-deep" aria-hidden />
                        <span className="text-xs font-medium text-navy-deep">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.service && (
                    <p className="mt-2 text-xs text-red-600">{errors.service}</p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-navy-deep">
                    How urgent is it? <span className="text-gold">*</span>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {urgencyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("urgency", opt.value)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                          form.urgency === opt.value
                            ? "border-gold bg-gold/10"
                            : "border-navy/10 bg-white hover:border-navy/25"
                        )}
                        aria-pressed={form.urgency === opt.value}
                      >
                        <opt.icon className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                        <span>
                          <span className="block text-sm font-semibold text-navy-deep">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-ink/60">
                            {opt.desc}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.urgency && (
                    <p className="mt-2 text-xs text-red-600">{errors.urgency}</p>
                  )}
                </fieldset>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field label="Pickup location" error={errors.pickup} required>
                  <input
                    className={inputClass}
                    value={form.pickup}
                    onChange={(e) => set("pickup", e.target.value)}
                    placeholder="e.g. Bon Secours lab, 5801 Bremo Rd, Richmond"
                  />
                </Field>
                <Field label="Drop-off location" error={errors.dropoff} required>
                  <input
                    className={inputClass}
                    value={form.dropoff}
                    onChange={(e) => set("dropoff", e.target.value)}
                    placeholder="e.g. Reference lab, Henrico, VA"
                  />
                </Field>
                <Field label="Details (optional)">
                  <textarea
                    className={inputClass}
                    rows={4}
                    value={form.details}
                    onChange={(e) => set("details", e.target.value)}
                    placeholder="Cargo type, temperature needs, timing windows, frequency, special handling…"
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" error={errors.name} required>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Company / facility">
                  <input
                    className={inputClass}
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="Clinic, lab, pharmacy…"
                  />
                </Field>
                <Field label="Email" error={errors.email} required>
                  <input
                    className={inputClass}
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@facility.com"
                  />
                </Field>
                <Field label="Phone" error={errors.phone} required>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(804) 555-0142"
                    inputMode="tel"
                  />
                </Field>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < steps.length - 1 ? (
          <button type="button" onClick={nextStep} className="btn-gold">
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button type="submit" className="btn-gold">
            Submit request
            <Send className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-deep">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
