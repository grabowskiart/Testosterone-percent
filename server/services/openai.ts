import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Validate API key exists and provide secure fallback for development
function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Only allow in development, not production
    if (process.env.NODE_ENV === "production") {
      throw new Error("OpenAI API key is required in production. Please set OPENAI_API_KEY environment variable.");
    }
    console.warn("⚠️  OpenAI API key not provided. AI analysis will be unavailable.");
    return "dev-key-placeholder"; // Safe placeholder for development
  }
  return apiKey;
}

const openai = new OpenAI({ 
  apiKey: getApiKey()
});

export interface HypogonadismAssessment {
  assessment: string;
  confidence: number;
  riskFactors: Array<{
    factor: string;
    risk: "low" | "moderate" | "high";
    description: string;
  }>;
  recommendations: string[];
  interpretation: string;
}

export async function analyzeHypogonadism(
  testosteroneLevel: number,
  testosteroneUnit: string,
  age: number,
  adamScore: number,
  percentile: number
): Promise<HypogonadismAssessment> {
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  
  try {
    // Convert to ng/dL for standardized analysis
    const testosteroneNgDl = testosteroneUnit === "nmol/l" 
      ? testosteroneLevel * 28.84 
      : testosteroneLevel;

    const prompt = `Analyze this testosterone assessment data and provide a JSON response.

Patient Data:
- Testosterone: ${testosteroneNgDl} ng/dL (${testosteroneLevel} ${testosteroneUnit})
- Age: ${age} years
- ADAM Score: ${adamScore}/10
- Age-adjusted percentile: ${percentile}%

Clinical Guidelines:
- Normal testosterone: 300-1000 ng/dL
- Low testosterone: <300 ng/dL
- ADAM score ≥3 suggests possible symptoms

Required JSON format (use these exact field names):
{
  "assessment": "Based on the testosterone level of ${testosteroneNgDl} ng/dL, provide your primary clinical assessment here",
  "confidence": 85,
  "riskFactors": [
    {
      "factor": "Low testosterone level",
      "risk": "high",
      "description": "Testosterone below normal range"
    }
  ],
  "recommendations": [
    "Consider repeat testing",
    "Evaluate for underlying causes"
  ],
  "interpretation": "Patient-friendly explanation of the results"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specializing in endocrinology and testosterone analysis. Provide clinical assessments based on current medical guidelines. Always respond with valid JSON matching the exact structure requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const responseContent = response.choices[0].message.content;
    console.log("OpenAI Response:", responseContent); // Debug logging
    
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    const result = JSON.parse(responseContent);
    console.log("Parsed result:", JSON.stringify(result, null, 2)); // Debug logging
    
    return {
      assessment: result.assessment || result.conclusion || "Clinical assessment pending",
      confidence: Math.max(0, Math.min(100, result.confidence || 75)),
      riskFactors: result.riskFactors || result.risk_factors || [],
      recommendations: result.recommendations || result.clinical_recommendations || [],
      interpretation: result.interpretation || result.summary || "Clinical interpretation available"
    };
  } catch (error) {
    // Log error without exposing sensitive details
    console.error("OpenAI analysis failed:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("AI analysis temporarily unavailable. Please try again.");
  }
}
