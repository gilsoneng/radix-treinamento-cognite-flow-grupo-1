/**
 * Phase 1 — SST classification lookup nodes.
 * Generates all static lookup tables: EquipmentCategory, InspectionShift,
 * ObservationCategory, SeverityLevel, MeasurementUnit, InspectionItemType.
 */
import { id }      from '../lib/deterministic-id.mjs';
import { dmNode }  from '../lib/dms-payload.mjs';

export function generateClassification() {
  const nodes = [];

  // ─── EquipmentCategory ────────────────────────────────────────────────────
  const categories = [
    { code: 'rotating-pump',   name: 'Centrifugal Pump',          description: 'Rotating centrifugal pump',           icon: 'pump',       measurements: ['IB-BEARING-TEMP','OB-BEARING-TEMP','MOTOR-AMPS','FLOW-GPM'] },
    { code: 'positive-disp-pump', name: 'Positive Displacement Pump', description: 'PD pump — piston or diaphragm',   icon: 'pump',       measurements: ['IB-BEARING-TEMP','MOTOR-AMPS','OUTLET-PRESSURE-PSI'] },
    { code: 'motor',           name: 'Electric Motor',             description: 'AC/DC drive motor',                  icon: 'motor',      measurements: ['MOTOR-TEMP','MOTOR-AMPS','IB-BEARING-TEMP','OB-BEARING-TEMP'] },
    { code: 'gearbox',         name: 'Gearbox / Reducer',          description: 'Gear reducer or transmission',        icon: 'gear',       measurements: ['IB-BEARING-TEMP','OB-BEARING-TEMP','IB-VIBRATION-IPS'] },
    { code: 'agitator',        name: 'Agitator / Mixer',           description: 'Tank agitator or in-line mixer',      icon: 'agitator',   measurements: ['MOTOR-AMPS','IB-VIBRATION-IPS'] },
    { code: 'screen',          name: 'Pressure Screen',            description: 'Pulp pressure screen',                icon: 'screen',     measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','INLET-PRESSURE-PSI'] },
    { code: 'feeder',          name: 'Chip Feeder',                description: 'High/Low pressure chip feeder',       icon: 'feeder',     measurements: ['MOTOR-TEMP','MOTOR-AMPS','GAP-MM'] },
    { code: 'vessel',          name: 'Pressure Vessel / Tank',     description: 'Static vessel, tank or flash tank',   icon: 'tank',       measurements: ['TEMP-DEGF','LEVEL-PERCENT','STEAM-PRESSURE-PSI'] },
    { code: 'valve',           name: 'Control / Manual Valve',     description: 'Process valve',                       icon: 'valve',      measurements: [] },
    { code: 'conveyor',        name: 'Belt Conveyor / Screw',      description: 'Material transport conveyor',         icon: 'conveyor',   measurements: ['MOTOR-AMPS','IB-BEARING-TEMP'] },
    { code: 'heat-exchanger',  name: 'Heat Exchanger',             description: 'Shell-and-tube or plate HX',          icon: 'heatx',      measurements: ['INLET-TEMP-DEGF','OUTLET-TEMP-DEGF','DP-PSI'] },
    { code: 'compressor',      name: 'Compressor / Blower',        description: 'Gas compression',                     icon: 'compressor', measurements: ['DISCHARGE-PRESSURE-PSI','IB-BEARING-TEMP','MOTOR-AMPS','MOTOR-TEMP'] },
    { code: 'refiner',         name: 'Refiner',                    description: 'Disc refiner for reject/TMP',         icon: 'refiner',    measurements: ['MOTOR-AMPS','IB-BEARING-TEMP','GAP-MM'] },
    { code: 'strain-gauge',    name: 'Strain Gauge / Sensor',      description: 'Static measurement instrument',       icon: 'sensor',     measurements: [] },
    { code: 'chemical-system', name: 'Chemical Dosing System',     description: 'Descaler, defoamer, antiscalant',     icon: 'chemical',   measurements: ['FLOW-GPM','OUTLET-PRESSURE-PSI','MOTOR-AMPS'] },
  ];

  for (const cat of categories) {
    nodes.push(dmNode(
      id.equipmentCategory(cat.code),
      'EquipmentCategory',
      { code: cat.code, name: cat.name, description: cat.description, icon: cat.icon, typicalMeasurements: cat.measurements },
    ));
  }

  // ─── InspectionShift ──────────────────────────────────────────────────────
  const shifts = [
    { code: 'D', name: 'Day Shift',       startHour: 6,  endHour: 14 },
    { code: 'A', name: 'Afternoon Shift', startHour: 14, endHour: 22 },
    { code: 'N', name: 'Night Shift',     startHour: 22, endHour: 6  },
  ];

  for (const s of shifts) {
    nodes.push(dmNode(id.shift(s.code), 'InspectionShift', {
      name: s.name, startHour: s.startHour, endHour: s.endHour, shiftCode: s.code,
    }));
  }

  // ─── ObservationCategory ─────────────────────────────────────────────────
  const obsCats = [
    { code: 'safety',       name: 'Safety',       description: 'Personal safety or machine guarding issue', requiresWorkOrder: true },
    { code: 'quality',      name: 'Quality',       description: 'Process parameter out of spec',             requiresWorkOrder: false },
    { code: 'maintenance',  name: 'Maintenance',   description: 'Mechanical degradation requiring repair',   requiresWorkOrder: true },
    { code: 'housekeeping', name: 'Housekeeping',  description: 'Cleanliness, spills, sawdust',              requiresWorkOrder: false },
    { code: 'environment',  name: 'Environmental', description: 'Leak or spill with environmental risk',     requiresWorkOrder: true },
    { code: 'reliability',  name: 'Reliability',   description: 'Repeated issue, trending degradation',      requiresWorkOrder: true },
  ];

  for (const oc of obsCats) {
    nodes.push(dmNode(id.observationCat(oc.code), 'ObservationCategory', {
      name: oc.name, description: oc.description, requiresWorkOrder: oc.requiresWorkOrder,
    }));
  }

  // ─── SeverityLevel ────────────────────────────────────────────────────────
  const severities = [
    { code: 'critical', name: 'Critical',      numericLevel: 5, colorCode: '#D32F2F', slaHours: 2,  escalateTo: 'Shift Supervisor + Maintenance Manager' },
    { code: 'high',     name: 'High',           numericLevel: 4, colorCode: '#F57C00', slaHours: 8,  escalateTo: 'Shift Supervisor' },
    { code: 'medium',   name: 'Medium',         numericLevel: 3, colorCode: '#FBC02D', slaHours: 24, escalateTo: 'Team Lead' },
    { code: 'low',      name: 'Low',            numericLevel: 2, colorCode: '#388E3C', slaHours: 72, escalateTo: null },
    { code: 'info',     name: 'Informational',  numericLevel: 1, colorCode: '#1976D2', slaHours: null, escalateTo: null },
  ];

  for (const sv of severities) {
    nodes.push(dmNode(id.severity(sv.code), 'SeverityLevel', {
      name: sv.name, numericLevel: sv.numericLevel,
      colorCode: sv.colorCode, slaHours: sv.slaHours, escalateTo: sv.escalateTo,
    }));
  }

  // ─── MeasurementUnit ──────────────────────────────────────────────────────
  const units = [
    { code: 'degF',    symbol: '°F',  description: 'Degrees Fahrenheit',       quantityType: 'Temperature' },
    { code: 'ips',     symbol: 'ips', description: 'Inches per second (RMS vibration)', quantityType: 'Vibration' },
    { code: 'mm',      symbol: 'mm',  description: 'Millimeters (feeder gap)',  quantityType: 'Length' },
    { code: 'gpm',     symbol: 'GPM', description: 'US Gallons per minute',    quantityType: 'Flow' },
    { code: 'psi',     symbol: 'PSI', description: 'Pounds per square inch',   quantityType: 'Pressure' },
    { code: 'rpm',     symbol: 'RPM', description: 'Revolutions per minute',   quantityType: 'Rotational Speed' },
    { code: 'amps',    symbol: 'A',   description: 'Amperes (motor current)',   quantityType: 'Current' },
    { code: 'percent', symbol: '%',   description: 'Percentage',               quantityType: 'Ratio' },
  ];

  for (const u of units) {
    nodes.push(dmNode(id.measUnit(u.code), 'MeasurementUnit', {
      symbol: u.symbol, description: u.description, quantityType: u.quantityType,
    }));
  }

  // ─── InspectionItemType ───────────────────────────────────────────────────
  const itemTypes = [
    { code: 'ok-nok',   name: 'OK / Not OK',         responseOptions: ['OK', 'Not OK', 'N/A'], isMeasurement: false },
    { code: 'yes-no',   name: 'Yes / No',             responseOptions: ['Yes', 'No', 'N/A'],    isMeasurement: false },
    { code: 'numeric',  name: 'Numeric Measurement',  responseOptions: null,                     isMeasurement: true },
    { code: 'count',    name: 'Count / Integer',       responseOptions: null,                     isMeasurement: true },
    { code: 'text',     name: 'Free Text',             responseOptions: null,                     isMeasurement: false },
  ];

  for (const it of itemTypes) {
    nodes.push(dmNode(id.itemType(it.code), 'InspectionItemType', {
      name: it.name,
      responseOptions: it.responseOptions,
      isMeasurement: it.isMeasurement,
    }));
  }

  return nodes;
}
