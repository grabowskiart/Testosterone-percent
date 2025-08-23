import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const testosteroneAssessments = pgTable("testosterone_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testosteroneLevel: decimal("testosterone_level", { precision: 10, scale: 2 }).notNull(),
  testosteroneUnit: varchar("testosterone_unit", { length: 10 }).notNull().default("ng/dl"),
  age: integer("age").notNull(),
  adamScore: integer("adam_score").notNull(),
  percentile: decimal("percentile", { precision: 5, scale: 2 }),
  aiAssessment: text("ai_assessment"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  error: text("error"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTestosteroneAssessmentSchema = createInsertSchema(testosteroneAssessments).omit({
  id: true,
  createdAt: true,
  error: true,
}).extend({
  testosteroneLevel: z.number().min(10).max(5000),
  age: z.number().min(18).max(100),
  adamScore: z.number().min(0).max(10),
  testosteroneUnit: z.enum(["ng/dl", "nmol/l"]).default("ng/dl"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TestosteroneAssessment = typeof testosteroneAssessments.$inferSelect;
export type InsertTestosteroneAssessment = z.infer<typeof insertTestosteroneAssessmentSchema>;
