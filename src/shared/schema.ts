import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  country: text("country").notNull(),
  employees: integer("employees"),
  revenue: text("revenue"),
  headquarters: text("headquarters"),
  ceo: text("ceo"),
  founded: integer("founded"),
  website: text("website"),
  businessAreas: jsonb("business_areas").$type<string[]>().default([]),
  digitalTwinStatus: text("digital_twin_status").notNull().default("not_started"),
  digitalTwinMaturity: integer("digital_twin_maturity").notNull().default(0),
  opportunityScore: integer("opportunity_score").notNull().default(0),
  estimatedDealValue: text("estimated_deal_value"),
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  nextFollowUp: timestamp("next_follow_up"),
  notes: text("notes"),
  competitiveAnalysis: text("competitive_analysis"),
  dellOpportunity: text("dell_opportunity"),
  digitalTwinStrategy: text("digital_twin_strategy"),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department"),
  joinedAt: timestamp("joined_at").default(sql`now()`),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  lastUpdated: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const digitalTwinStatuses = [
  "not_started",
  "researching", 
  "implementing",
  "completed"
] as const;

export const industries = [
  "Manufacturing",
  "Automotive", 
  "Healthcare",
  "Energy",
  "Aerospace",
  "Chemicals",
  "Technology",
  "Financial Services",
  "Retail",
  "Other"
] as const;
