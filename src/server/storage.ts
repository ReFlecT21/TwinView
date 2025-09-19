import { type Company, type InsertCompany, type ActivityLog, type InsertActivityLog, type TeamMember, type InsertTeamMember } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<boolean>;
  searchCompanies(query: string): Promise<Company[]>;
  filterCompanies(filters: {
    industry?: string;
    digitalTwinStatus?: string;
    opportunityScore?: string;
    country?: string;
  }): Promise<Company[]>;

  // Activity Logs
  getActivityLogs(companyId?: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;

  // Analytics
  getAnalytics(): Promise<{
    totalPartners: number;
    activeProjects: number;
    highOpportunityCount: number;
    pipelineValue: string;
    statusDistribution: Record<string, number>;
    industryDistribution: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private companies: Map<string, Company>;
  private activityLogs: Map<string, ActivityLog>;
  private teamMembers: Map<string, TeamMember>;

  constructor() {
    this.companies = new Map();
    this.activityLogs = new Map();
    this.teamMembers = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some team members
    const teamMemberData = [
      { name: "Sarah Chen", email: "sarah.chen@dell.com", role: "Senior Sales Engineer", department: "Pre-Sales" },
      { name: "Michael Rodriguez", email: "michael.rodriguez@dell.com", role: "Solutions Architect", department: "Technical Sales" },
      { name: "Lisa Wang", email: "lisa.wang@dell.com", role: "Business Development Manager", department: "Strategic Partnerships" },
      { name: "David Kumar", email: "david.kumar@dell.com", role: "Digital Twin Specialist", department: "Technology Solutions" }
    ];

    teamMemberData.forEach(member => {
      const id = randomUUID();
      this.teamMembers.set(id, {
        id,
        ...member,
        joinedAt: new Date()
      });
    });

    // Initialize with sample companies
    const companyData = [
      {
        name: "Siemens AG",
        industry: "Manufacturing",
        country: "Germany",
        employees: 385000,
        revenue: "€62.3B",
        headquarters: "Munich, Germany",
        ceo: "Roland Busch",
        founded: 1847,
        website: "siemens.com",
        businessAreas: ["Digital Industries", "Smart Infrastructure", "Mobility", "Siemens Healthineers", "Siemens Energy"],
        digitalTwinStatus: "implementing",
        digitalTwinMaturity: 75,
        opportunityScore: 82,
        estimatedDealValue: "$850K",
        nextFollowUp: new Date("2024-12-15"),
        notes: "CEO mentioned significant investments in IoT and edge computing infrastructure during Q3 earnings call.",
        digitalTwinStrategy: "Siemens is heavily investing in digital twin technology across manufacturing and infrastructure. They have developed their own MindSphere platform and are looking to expand their edge computing capabilities.",
        dellOpportunity: "High potential for Dell's edge computing infrastructure and storage solutions. Siemens needs robust data processing at manufacturing sites.",
        competitiveAnalysis: "Currently partnered with Microsoft Azure for cloud solutions. Dell could position edge computing and hybrid cloud solutions as complementary to their existing Azure partnership."
      },
      {
        name: "Boeing",
        industry: "Aerospace",
        country: "USA",
        employees: 142000,
        revenue: "$66.6B",
        headquarters: "Chicago, USA",
        ceo: "David Calhoun",
        founded: 1916,
        website: "boeing.com",
        businessAreas: ["Commercial Airplanes", "Defense Space & Security", "Global Services", "Boeing Capital"],
        digitalTwinStatus: "researching",
        digitalTwinMaturity: 45,
        opportunityScore: 91,
        estimatedDealValue: "$1.2M",
        nextFollowUp: new Date("2024-12-20"),
        notes: "Boeing is exploring digital twin applications for aircraft design and predictive maintenance.",
        digitalTwinStrategy: "Focused on aircraft lifecycle management and predictive maintenance. Looking at digital twins for both design optimization and operational efficiency.",
        dellOpportunity: "Excellent opportunity for high-performance computing solutions for simulation workloads and secure data storage for sensitive aerospace data.",
        competitiveAnalysis: "Boeing has partnerships with various cloud providers. Dell's strength in secure, on-premise solutions could be attractive for classified defense projects."
      },
      {
        name: "Ford Motor Company",
        industry: "Automotive", 
        country: "USA",
        employees: 190000,
        revenue: "$158B",
        headquarters: "Dearborn, USA",
        ceo: "Jim Farley",
        founded: 1903,
        website: "ford.com",
        businessAreas: ["Ford Blue", "Ford Model e", "Ford Pro", "Ford Credit"],
        digitalTwinStatus: "completed",
        digitalTwinMaturity: 90,
        opportunityScore: 68,
        estimatedDealValue: "$650K",
        nextFollowUp: new Date("2025-01-10"),
        notes: "Ford has successfully implemented digital twins in their manufacturing processes and is looking to expand to connected vehicle services.",
        digitalTwinStrategy: "Advanced digital twin implementation across manufacturing and vehicle development. Now focusing on connected vehicle data and smart mobility services.",
        dellOpportunity: "Potential for expanding existing relationship with connected vehicle data processing and edge computing for autonomous driving development.",
        competitiveAnalysis: "Ford has existing relationships with AWS and Microsoft. Dell could focus on edge computing for real-time vehicle data processing."
      }
    ];

    companyData.forEach(company => {
      const id = randomUUID();
      this.companies.set(id, {
        id,
        ...company,
        lastUpdated: new Date()
      });
    });
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values()).sort((a, b) => 
      new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime()
    );
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { 
      ...insertCompany, 
      id,
      lastUpdated: new Date()
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company> {
    const existingCompany = this.companies.get(id);
    if (!existingCompany) {
      throw new Error("Company not found");
    }
    
    const updatedCompany: Company = {
      ...existingCompany,
      ...updates,
      lastUpdated: new Date()
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companies.delete(id);
  }

  async searchCompanies(query: string): Promise<Company[]> {
    const companies = Array.from(this.companies.values());
    const lowerQuery = query.toLowerCase();
    
    return companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) ||
      company.industry.toLowerCase().includes(lowerQuery) ||
      company.country.toLowerCase().includes(lowerQuery)
    );
  }

  async filterCompanies(filters: {
    industry?: string;
    digitalTwinStatus?: string;
    opportunityScore?: string;
    country?: string;
  }): Promise<Company[]> {
    let companies = Array.from(this.companies.values());

    if (filters.industry && filters.industry !== "All Industries") {
      companies = companies.filter(c => c.industry === filters.industry);
    }

    if (filters.digitalTwinStatus && filters.digitalTwinStatus !== "All Statuses") {
      companies = companies.filter(c => c.digitalTwinStatus === filters.digitalTwinStatus);
    }

    if (filters.opportunityScore && filters.opportunityScore !== "All Opportunity Scores") {
      companies = companies.filter(c => {
        const score = c.opportunityScore;
        switch (filters.opportunityScore) {
          case "High (8-10)": return score >= 80;
          case "Medium (5-7)": return score >= 50 && score < 80;
          case "Low (1-4)": return score < 50;
          default: return true;
        }
      });
    }

    if (filters.country && filters.country !== "All Countries") {
      companies = companies.filter(c => c.country === filters.country);
    }

    return companies;
  }

  async getActivityLogs(companyId?: string): Promise<ActivityLog[]> {
    let logs = Array.from(this.activityLogs.values());
    
    if (companyId) {
      logs = logs.filter(log => log.companyId === companyId);
    }
    
    return logs.sort((a, b) => 
      new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
    );
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const member: TeamMember = {
      ...insertMember,
      id,
      joinedAt: new Date()
    };
    this.teamMembers.set(id, member);
    return member;
  }

  async getAnalytics(): Promise<{
    totalPartners: number;
    activeProjects: number;
    highOpportunityCount: number;
    pipelineValue: string;
    statusDistribution: Record<string, number>;
    industryDistribution: Record<string, number>;
  }> {
    const companies = Array.from(this.companies.values());
    
    const activeProjects = companies.filter(c => 
      c.digitalTwinStatus === "implementing" || c.digitalTwinStatus === "researching"
    ).length;
    
    const highOpportunityCount = companies.filter(c => c.opportunityScore >= 80).length;
    
    // Calculate pipeline value (simplified)
    const totalValue = companies.reduce((sum, company) => {
      const value = parseFloat(company.estimatedDealValue?.replace(/[$K,M]/g, '') || '0');
      const multiplier = company.estimatedDealValue?.includes('M') ? 1000 : 1;
      return sum + (value * multiplier);
    }, 0);
    
    const pipelineValue = totalValue > 1000 ? `$${(totalValue / 1000).toFixed(1)}M` : `$${totalValue}K`;
    
    const statusDistribution = companies.reduce((dist, company) => {
      dist[company.digitalTwinStatus] = (dist[company.digitalTwinStatus] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    const industryDistribution = companies.reduce((dist, company) => {
      dist[company.industry] = (dist[company.industry] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    return {
      totalPartners: companies.length,
      activeProjects,
      highOpportunityCount,
      pipelineValue,
      statusDistribution,
      industryDistribution
    };
  }
}

export const storage = new MemStorage();
