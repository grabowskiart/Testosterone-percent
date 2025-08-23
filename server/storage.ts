import { type User, type InsertUser, type TestosteroneAssessment, type InsertTestosteroneAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTestosteroneAssessment(assessment: InsertTestosteroneAssessment): Promise<TestosteroneAssessment>;
  getTestosteroneAssessment(id: string): Promise<TestosteroneAssessment | undefined>;
  getTestosteroneAssessments(): Promise<TestosteroneAssessment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private testosteroneAssessments: Map<string, TestosteroneAssessment>;

  constructor() {
    this.users = new Map();
    this.testosteroneAssessments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTestosteroneAssessment(insertAssessment: InsertTestosteroneAssessment): Promise<TestosteroneAssessment> {
    const id = randomUUID();
    const assessment: TestosteroneAssessment = {
      ...insertAssessment,
      testosteroneLevel: insertAssessment.testosteroneLevel.toString(),
      id,
      createdAt: new Date(),
      percentile: null,
      aiAssessment: null,
      confidence: null,
      error: null,
    };
    this.testosteroneAssessments.set(id, assessment);
    return assessment;
  }

  async getTestosteroneAssessment(id: string): Promise<TestosteroneAssessment | undefined> {
    return this.testosteroneAssessments.get(id);
  }

  async getTestosteroneAssessments(): Promise<TestosteroneAssessment[]> {
    return Array.from(this.testosteroneAssessments.values());
  }
}

export const storage = new MemStorage();
