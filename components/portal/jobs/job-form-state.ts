/**
 * components/portal/jobs/job-form-state.ts
 * ---------------------------------------------------------------------------
 * Converting a Job row to and from the shape a form can edit.
 *
 * Numeric columns are held as STRINGS while editing. Binding a number straight
 * to an input makes an in-progress value like "3." unrepresentable, so the
 * decimal point disappears the moment it is typed and the field fights the
 * user. They are converted back to numbers once, on save.
 *
 * fuel_cost is absent from both types on purpose: it is GENERATED ALWAYS in
 * Postgres, which rejects any write to it. Leaving it out means the compiler
 * catches the mistake instead of the database.
 * ---------------------------------------------------------------------------
 */

import type { Job } from "@/lib/quotes/types";

/** Columns edited as text and parsed on save. */
const NUMERIC_KEYS = [
  "odometer_start",
  "odometer_end",
  "total_miles",
  "fuel_gallons",
  "cost_per_gallon",
  "billed_amount",
  "pickup_temp_f",
  "dropoff_temp_f",
] as const;

type NumericKey = (typeof NUMERIC_KEYS)[number];

/** Columns the database owns, so the form never carries them. */
type NotEditable =
  | "id"
  | "uid"
  | "fuel_cost"
  | "customer_id"
  | "quote_id"
  | "created_at"
  | "updated_at"
  | "created_by";

export type JobForm = Omit<Job, NotEditable | NumericKey> & {
  [K in NumericKey]: string;
};

const numToText = (v: number | null): string => (v === null ? "" : String(v));

/**
 * Text to number. Blank means "not recorded", which is null rather than 0 —
 * a job with no odometer reading has not travelled zero miles.
 */
const textToNum = (s: string): number | null => {
  const trimmed = s.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

export function toForm(job: Job): JobForm {
  return {
    delivery_type: job.delivery_type,
    service_code: job.service_code,
    delivery_status: job.delivery_status,
    delay_reason: job.delay_reason,
    delay_notes: job.delay_notes,
    delivery_notes: job.delivery_notes,

    pickup_date: job.pickup_date,
    pickup_time: job.pickup_time,
    pickup_location: job.pickup_location,
    dropoff_date: job.dropoff_date,
    dropoff_time: job.dropoff_time,
    dropoff_location: job.dropoff_location,
    recipient_names: job.recipient_names,
    time_slot: job.time_slot,

    vehicle_id: job.vehicle_id,

    cold_chain_logged: job.cold_chain_logged,
    coc_required: job.coc_required,
    coc_number: job.coc_number,
    coc_pickup_person: job.coc_pickup_person,
    coc_pickup_at: job.coc_pickup_at,
    coc_pickup_location: job.coc_pickup_location,
    coc_handoff_person: job.coc_handoff_person,
    coc_handoff_at: job.coc_handoff_at,
    coc_handoff_location: job.coc_handoff_location,
    hazard_class: job.hazard_class,
    hazard_class_other: job.hazard_class_other,

    odometer_start: numToText(job.odometer_start),
    odometer_end: numToText(job.odometer_end),
    total_miles: numToText(job.total_miles),
    fuel_gallons: numToText(job.fuel_gallons),
    cost_per_gallon: numToText(job.cost_per_gallon),
    billed_amount: numToText(job.billed_amount),
    pickup_temp_f: numToText(job.pickup_temp_f),
    dropoff_temp_f: numToText(job.dropoff_temp_f),
  };
}

/** The patch sent to updateJob(). Numbers parsed, fuel_cost never included. */
export function toPatch(form: JobForm) {
  return {
    delivery_type: form.delivery_type,
    service_code: form.service_code,
    delivery_status: form.delivery_status,
    delay_reason: form.delay_reason,
    delay_notes: form.delay_notes,
    delivery_notes: form.delivery_notes,

    pickup_date: form.pickup_date,
    pickup_time: form.pickup_time,
    pickup_location: form.pickup_location,
    dropoff_date: form.dropoff_date,
    dropoff_time: form.dropoff_time,
    dropoff_location: form.dropoff_location,
    recipient_names: form.recipient_names,
    time_slot: form.time_slot,

    vehicle_id: form.vehicle_id,

    cold_chain_logged: form.cold_chain_logged,
    coc_required: form.coc_required,
    coc_number: form.coc_number,
    coc_pickup_person: form.coc_pickup_person,
    coc_pickup_at: form.coc_pickup_at,
    coc_pickup_location: form.coc_pickup_location,
    coc_handoff_person: form.coc_handoff_person,
    coc_handoff_at: form.coc_handoff_at,
    coc_handoff_location: form.coc_handoff_location,
    hazard_class: form.hazard_class,
    hazard_class_other: form.hazard_class_other,

    odometer_start: textToNum(form.odometer_start),
    odometer_end: textToNum(form.odometer_end),
    total_miles: textToNum(form.total_miles),
    fuel_gallons: textToNum(form.fuel_gallons),
    cost_per_gallon: textToNum(form.cost_per_gallon),
    billed_amount: textToNum(form.billed_amount),
    pickup_temp_f: textToNum(form.pickup_temp_f),
    dropoff_temp_f: textToNum(form.dropoff_temp_f),
  };
}

/**
 * Miles from the odometer pair, or null when they cannot give an answer.
 *
 * A backwards pair returns null rather than a negative: it means one of the two
 * readings was mistyped, and silently writing a negative mileage would feed a
 * wrong number into the per-mile figures downstream.
 */
export function milesFromOdometer(startText: string, endText: string): number | null {
  const start = textToNum(startText);
  const end = textToNum(endText);
  if (start === null || end === null) return null;
  if (end < start) return null;
  // One decimal place, matching the numeric(12,1) column.
  return Math.round((end - start) * 10) / 10;
}

/** Have any editable values changed since the row was loaded? */
export function isDirty(form: JobForm, job: Job): boolean {
  return JSON.stringify(form) !== JSON.stringify(toForm(job));
}

/** The fuel cost Postgres will compute, for a live preview before saving. */
export function previewFuelCost(form: JobForm): number | null {
  const gallons = textToNum(form.fuel_gallons);
  const price = textToNum(form.cost_per_gallon);
  if (gallons === null || price === null) return null;
  return Math.round(gallons * price * 100) / 100;
}
