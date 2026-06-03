/**
 * Generation rules — NOK rates, distributions, Gaussian noise, calendar effects.
 * All functions are pure (no side effects) for testability.
 */
import { EVENTS_CALENDAR } from './config.mjs';

// ─── Gaussian noise ───────────────────────────────────────────────────────────

/** Box-Muller Gaussian random (mean=0, std=1) — deterministic given a seed */
export function gaussianRandom(mean, std, rng = Math.random) {
  let u1, u2;
  do { u1 = rng(); } while (u1 === 0);
  do { u2 = rng(); } while (u2 === 0);
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + std * z;
}

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Round to N decimal places */
export function round(val, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(val * f) / f;
}

// ─── Calendar event lookup ────────────────────────────────────────────────────

const _events = EVENTS_CALENDAR.map(e => ({
  ...e,
  fromTs: new Date(e.from).getTime(),
  toTs:   new Date(e.to).getTime(),
}));

/**
 * Get all active events for a given date + route.
 * @param {Date} date
 * @param {string} routeSlug
 * @returns {Array}
 */
export function getActiveEvents(date, routeSlug) {
  const ts = date.getTime();
  return _events.filter(ev => {
    if (ts < ev.fromTs || ts > ev.toTs) return false;
    if (ev.routes.includes('all')) return true;
    return ev.routes.includes(routeSlug);
  });
}

// ─── NOK rate calculation ─────────────────────────────────────────────────────

/**
 * Calculate effective NOK rate for a given context.
 * @param {{ nokRateBase: number }} persona
 * @param {string} routeSlug
 * @param {Date} date
 * @param {string} [equipmentSlug]
 * @returns {number} 0–1 probability of a NOK result for any given item
 */
export function nokRate(persona, routeSlug, date, equipmentSlug) {
  let rate = persona.nokRateBase;
  const events = getActiveEvents(date, routeSlug);

  for (const ev of events) {
    if (ev.operator && ev.operator !== persona.externalId) continue;
    if (ev.equipment && ev.equipment !== equipmentSlug) continue;
    rate += (ev.nokRateBoost ?? 0);
  }

  return clamp(rate, 0.01, 0.4);
}

/**
 * Calculate effective N/A rate for a given context.
 */
export function naRate(routeSlug, date, equipmentSlug) {
  let rate = 0.02; // baseline 2% N/A
  const events = getActiveEvents(date, routeSlug);

  for (const ev of events) {
    if (ev.equipment && ev.equipment !== equipmentSlug) continue;
    rate += (ev.naRateBoost ?? 0);
  }

  return clamp(rate, 0, 1.0);
}

/**
 * Calculate item result: 'OK' | 'NotOk' | 'NotApplicable'
 * @param {{ nokRateBase: number }} persona
 * @param {string} routeSlug
 * @param {Date} date
 * @param {string} equipmentSlug
 * @param {boolean} isMeasurement
 * @param {string} [forcedNokTitle] - if title matches a forced NOK event
 */
export function itemResult(persona, routeSlug, date, equipmentSlug, isMeasurement, itemTitle = '') {
  const naR   = naRate(routeSlug, date, equipmentSlug);
  const nokR  = nokRate(persona, routeSlug, date, equipmentSlug);
  const events = getActiveEvents(date, routeSlug);

  // Check forced NOK (e.g., seal failure)
  const forceNok = events.some(ev =>
    ev.forcedNok && ev.forcedNok.some(t => itemTitle.toLowerCase().includes(t.toLowerCase()))
  );
  if (forceNok) return 'NotOk';

  const rnd = Math.random();
  if (rnd < naR)       return 'NotApplicable';
  if (rnd < naR + nokR) return 'NotOk';
  return 'OK';
}

// ─── Measurement value simulation ─────────────────────────────────────────────

/**
 * Generate a realistic measurement value with calendar-aware offsets.
 * @param {{ typical, stddev, min, max, threshold }} spec
 * @param {string} routeSlug
 * @param {Date} date
 * @param {string} equipmentSlug
 * @param {string} measSlug
 * @returns {{ value: number, isAlarm: boolean }}
 */
export function measurementValue(spec, routeSlug, date, equipmentSlug, measSlug) {
  const events = getActiveEvents(date, routeSlug);

  let mean = spec.typical;
  let std  = spec.stddev;

  for (const ev of events) {
    if (ev.equipment && ev.equipment !== equipmentSlug) continue;
    if (ev.measurement && ev.measurement !== measSlug) continue;

    // Temperature ramp (linear within event window)
    if (ev.tempRamp && (measSlug.includes('TEMP') || measSlug.includes('BEARING'))) {
      const progress = (date.getTime() - ev.fromTs) / (ev.toTs - ev.fromTs);
      mean = ev.tempRamp.start + (ev.tempRamp.end - ev.tempRamp.start) * progress;
      std  = spec.stddev * 0.5; // less noise during known degradation
    } else if (ev.tempOffset && measSlug.includes('TEMP')) {
      mean += ev.tempOffset;
    }

    if (ev.vibrationOffset && measSlug.includes('VIBRATION')) {
      mean += ev.vibrationOffset;
    }
  }

  const raw   = gaussianRandom(mean, std);
  const value = round(clamp(raw, spec.min, spec.max));
  return { value, isAlarm: value >= spec.threshold };
}

// ─── Duration simulation ──────────────────────────────────────────────────────

/**
 * Estimated inspection duration in minutes.
 * Base: 45 min for a full route checklist; varies by events and operator.
 */
export function inspectionDuration(persona, routeSlug, date, itemCount) {
  const events = getActiveEvents(date, routeSlug);
  const base = Math.round(itemCount * 0.25 + 15); // ~0.25 min/item + overhead
  let boost = 1.0;

  for (const ev of events) {
    if (ev.operator && ev.operator !== persona.externalId) continue;
    boost += (ev.durationBoost ?? 0);
  }

  const minutes = Math.round(base * boost * (0.85 + Math.random() * 0.30));
  return clamp(minutes, 20, 180);
}

// ─── Observation severity ─────────────────────────────────────────────────────

/**
 * Determine observation severity based on events + randomness.
 * @returns {{ priority: string, categoryCode: string, requiresWorkOrder: boolean }}
 */
export function observationSeverity(routeSlug, date, equipmentSlug) {
  const events = getActiveEvents(date, routeSlug).filter(
    ev => !ev.equipment || ev.equipment === equipmentSlug
  );
  const hasCritical = events.some(ev => ev.criticalObsRate && Math.random() < ev.criticalObsRate);

  if (hasCritical) return { priority: 'Urgent', categoryCode: 'safety', requiresWorkOrder: true };

  const r = Math.random();
  if (r < 0.15) return { priority: 'Urgent',  categoryCode: 'maintenance',  requiresWorkOrder: true };
  if (r < 0.35) return { priority: 'High',    categoryCode: 'maintenance',  requiresWorkOrder: true };
  if (r < 0.60) return { priority: 'Medium',  categoryCode: 'reliability',  requiresWorkOrder: false };
  if (r < 0.80) return { priority: 'Low',     categoryCode: 'housekeeping', requiresWorkOrder: false };
  return           { priority: 'Low',     categoryCode: 'quality',      requiresWorkOrder: false };
}
