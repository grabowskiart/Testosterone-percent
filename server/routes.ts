import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTestosteroneAssessmentSchema } from "@shared/schema";
import { calculateTestosteronePercentile } from "./services/testosterone";
import { analyzeHypogonadism } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create testosterone assessment
  app.post("/api/assessments", async (req, res) => {
    try {
      const validatedData = insertTestosteroneAssessmentSchema.parse(req.body);
      
      // Calculate percentile
      const percentile = calculateTestosteronePercentile(
        validatedData.testosteroneLevel, 
        validatedData.age, 
        validatedData.testosteroneUnit
      );

      // Create initial assessment
      const assessment = await storage.createTestosteroneAssessment({
        ...validatedData,
      });

      // Get AI analysis
      try {
        const aiResult = await analyzeHypogonadism(
          validatedData.testosteroneLevel,
          validatedData.testosteroneUnit,
          validatedData.age,
          validatedData.adamScore,
          percentile
        );

        // Update assessment with AI results and percentile
        const updatedAssessment = {
          ...assessment,
          percentile: percentile.toString(),
          aiAssessment: JSON.stringify(aiResult),
          confidence: aiResult.confidence.toString(),
          error: null,
        };

        res.json(updatedAssessment);
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        // Return assessment with percentile but no AI analysis
        res.json({
          ...assessment,
          percentile: percentile.toString(),
          aiAssessment: null,
          confidence: null,
          error: "AI analysis unavailable - API key required"
        });
      }
    } catch (error) {
      console.error("Assessment creation error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid assessment data" 
      });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getTestosteroneAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Get assessment error:", error);
      res.status(500).json({ message: "Failed to retrieve assessment" });
    }
  });

  // Get all assessments
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getTestosteroneAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Get assessments error:", error);
      res.status(500).json({ message: "Failed to retrieve assessments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
