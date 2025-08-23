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
