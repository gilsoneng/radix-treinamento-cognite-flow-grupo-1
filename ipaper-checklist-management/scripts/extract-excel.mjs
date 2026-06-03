const XLSX = require('xlsx');
const fs = require('fs');
const wb = XLSX.readFile('docs/Seed/A Line OEC Routes 2 (1).xlsx');
const result = {};

wb.SheetNames.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1});
  const route = { name: sheetName, sections: [], _noSectionEquips: [] };
  let currentSection = null;
  let currentEquip = null;

  data.forEach((row) => {
    if (!row || !row.some(c => c !== null && c !== undefined && c !== '')) return;
    const c0 = row[0], c1 = row[1], c2 = row[2], c4 = row[4], c5 = row[5];

    // Section header
    if (c0 && typeof c0 === 'string' && !c1 && c0.length < 60 &&
        !c0.includes('Kamyr') && !c0.includes('Route') && !c0.includes('READ') && !c0.includes('NAME')) {
      currentSection = { name: c0.trim(), equipment: [] };
      route.sections.push(currentSection);
      currentEquip = null;
    }
    // Equipment
    else if (c1 === 'Task Complete' && c2) {
      currentEquip = { name: String(c2).trim(), workOrder: row[5] ? String(row[5]) : null, items: [] };
      if (currentSection) currentSection.equipment.push(currentEquip);
      else route._noSectionEquips.push(currentEquip);
    }
    // Inspection item
    else if (c1 && String(c1).includes('\u25a1') && c2 && currentEquip) {
      const typeStr = c4 ? String(c4).trim() : null;
      const isMeasurement = typeStr && typeStr !== 'OK / Not OK' && typeStr !== 'Yes / No' && !typeStr.toLowerCase().includes('ok') && !typeStr.toLowerCase().includes('no');
      currentEquip.items.push({
        name: String(c2).trim(),
        responseType: typeStr,
        threshold: c5 ? String(c5).trim() : null,
        isMeasurement: !!isMeasurement
      });
    }
  });

  if (route._noSectionEquips.length > 0) {
    route.sections.unshift({ name: '(sem seção)', equipment: route._noSectionEquips });
  }
  delete route._noSectionEquips;
  result[sheetName] = route;
});

fs.writeFileSync('docs/Seed/excel-raw-extract.json', JSON.stringify(result, null, 2));
console.log('OK - written to docs/Seed/excel-raw-extract.json');
