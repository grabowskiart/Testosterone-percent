export interface TestosteroneReference {
  ageRange: [number, number];
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
}

// Age-specific testosterone reference ranges (ng/dL) based on clinical studies
const testosteroneReferenceRanges: TestosteroneReference[] = [
  {
    ageRange: [18, 29],
    percentiles: { p5: 270, p10: 300, p25: 400, p50: 550, p75: 700, p90: 850, p95: 950 }
  },
  {
    ageRange: [30, 39],
    percentiles: { p5: 250, p10: 280, p25: 370, p50: 520, p75: 650, p90: 800, p95: 900 }
  },
  {
    ageRange: [40, 49],
    percentiles: { p5: 230, p10: 260, p25: 350, p50: 490, p75: 620, p90: 760, p95: 850 }
  },
  {
    ageRange: [50, 59],
    percentiles: { p5: 210, p10: 240, p25: 320, p50: 460, p75: 590, p90: 720, p95: 800 }
  },
  {
    ageRange: [60, 69],
    percentiles: { p5: 190, p10: 220, p25: 300, p50: 430, p75: 560, p90: 680, p95: 750 }
  },
  {
    ageRange: [70, 100],
    percentiles: { p5: 170, p10: 200, p25: 280, p50: 400, p75: 530, p90: 640, p95: 700 }
  }
];

export function convertTestosteroneUnits(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;
  
  // Conversion factor: 1 ng/dL = 0.0347 nmol/L
  if (fromUnit === "ng/dl" && toUnit === "nmol/l") {
    return Math.round((value * 0.0347) * 10) / 10;
  }
  
  if (fromUnit === "nmol/l" && toUnit === "ng/dl") {
    return Math.round((value / 0.0347) * 10) / 10;
  }
  
  return value;
}

export function calculateTestosteronePercentile(testosteroneLevel: number, age: number, unit: string = "ng/dl"): number {
  // Convert to ng/dL for calculation
  const testosteroneNgDl = unit === "nmol/l" 
    ? convertTestosteroneUnits(testosteroneLevel, "nmol/l", "ng/dl") 
    : testosteroneLevel;

  // Find appropriate age range
  const ageRange = testosteroneReferenceRanges.find(
    range => age >= range.ageRange[0] && age <= range.ageRange[1]
  );

  if (!ageRange) {
    // Fallback to closest range
    if (age < 18) return 0;
    return calculateTestosteronePercentile(testosteroneLevel, 70, unit);
  }

  const { percentiles } = ageRange;
  
  // Calculate percentile based on reference ranges
  if (testosteroneNgDl <= percentiles.p5) return 5;
  if (testosteroneNgDl <= percentiles.p10) return interpolate(testosteroneNgDl, percentiles.p5, percentiles.p10, 5, 10);
  if (testosteroneNgDl <= percentiles.p25) return interpolate(testosteroneNgDl, percentiles.p10, percentiles.p25, 10, 25);
  if (testosteroneNgDl <= percentiles.p50) return interpolate(testosteroneNgDl, percentiles.p25, percentiles.p50, 25, 50);
  if (testosteroneNgDl <= percentiles.p75) return interpolate(testosteroneNgDl, percentiles.p50, percentiles.p75, 50, 75);
  if (testosteroneNgDl <= percentiles.p90) return interpolate(testosteroneNgDl, percentiles.p75, percentiles.p90, 75, 90);
  if (testosteroneNgDl <= percentiles.p95) return interpolate(testosteroneNgDl, percentiles.p90, percentiles.p95, 90, 95);
  
  return Math.min(99, 95 + (testosteroneNgDl - percentiles.p95) / (percentiles.p95 * 0.1) * 4);
}

function interpolate(value: number, x1: number, x2: number, y1: number, y2: number): number {
  return Math.round(y1 + (value - x1) * (y2 - y1) / (x2 - x1));
}

export function getTestosteroneInterpretation(percentile: number, testosteroneLevel: number, unit: string): string {
  const testosteroneNgDl = unit === "nmol/l" 
    ? convertTestosteroneUnits(testosteroneLevel, "nmol/l", "ng/dl") 
    : testosteroneLevel;

  if (testosteroneNgDl < 300) {
    return "below normal range, suggesting possible hypogonadism";
  } else if (percentile < 25) {
    return "in the lower quartile for their age group";
  } else if (percentile >= 25 && percentile < 75) {
    return "within the normal range for their age group";
  } else if (percentile >= 75 && percentile < 90) {
    return "above average for their age group";
  } else {
    return "in the upper range for their age group";
  }
}
