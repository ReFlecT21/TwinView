import { prisma } from '../server/prisma';
import { CompanyType } from '@prisma/client';

const techMahindraData = {
  // Basic Company Information
  name: "Tech Mahindra",
  type: CompanyType.MNC,
  industry: "Information Technology - IT Services",
  country: "India",
  employees: 150000,
  revenue: "$6.5 Billion",
  headquarters: "Pune, India",
  ceo: "Mohit Joshi",
  founded: 1986,
  website: "https://www.techmahindra.com",
  businessAreas: ["IT Services", "Digital Solutions", "Consulting", "Cloud Services", "AI/ML"],

  // Digital Twin Status
  digitalTwinStatus: "implementing",
  digitalTwinMaturity: 4,
  opportunityScore: 83, // 4.15/5 = 83%
  estimatedDealValue: "$5M - $10M",

  // Scoring Data
  scores: {
    // Main Scores
    dataReliability: 4,
    dataReliabilityEvidence: [
      "90% of criteria met using independent/verifiable sources",
      "LinkedIn announcements, Integration Annual records",
      "Techmahindra.com (2025) - Tech Mahindra Solidifies its Position Among the Top 10 Global IT Services Brands https://www.techmahindra.com/insights/press-releases/tech-mahindra-solidifies-its-position-among-top-10-global-it-services/",
      "Techmahindra.com (2025) - About Us https://www.techmahindra.com/about-us/",
      "Profit from India news websites, FortuneIndia news, other company/government websites",
      "Additional context and validation through details about projects"
    ],

    existingRelations: 5,
    existingRelationsEvidence: [
      "Existing close partner with Nvidia for GenAI",
      "telecom.com (2024) - Partnership announcement",
      "White Alliance progress alignment (Nvidia close outlook of new CTO for Dell partnership)",
      "Pre mentioned Digital Twin in GTM joint Dell strategy presentation alignment"
    ],

    industry: 4,
    industryEvidence: [
      "Strong manufacturing focus in Case Studies along general telco/communication focus",
      "Techmahindra.com (2025) - About Us https://www.techmahindra.com/about-us/",
      "Everest Group (2023) - Digital Twin Services PEAK Matrix® Assessment https://www.deloitte.com/global/en/about/recognition/analyst-relations/everest-group-data-and-analytics-services-peak-matrix-2023.html",
      "Enterprise Transformation Partner ratings: A Horizon Power project in Australia",
      "Dell Technologies – Gupta, P. K. (2025) - Internal Communication",
      "Healthcare - in strategy included but no named tech projects",
      "Strong alignment in 5 priority verticals: Manufacturing + Smart Cities"
    ],

    revenuePotential: 4,
    revenuePotentialEvidence: [
      "Partner leader (HY 51%), Revenue FY2024 = $6.5 billion USD",
      "FY 2023-2024 Integrated Annual Report (2024)",
      "Tech Mahindra has a significantly lower revenue compared to its peers",
      "Strong ties to Mahindra Group – controlled, Average peer: India/Asia Scale vs. M&M $29B, Mahindra Auto $14.9B",
      "akila3d.com (2024) - Akila and Deloitte form strategic alliance https://www.akila3d.com/blog/akila-and-deloitte-form-strategic-alliance-to-offer-sustainable-digital-twin-software-solutions-for-building-management/",
      "Investment Readiness: 5/5 (100): ESR + 5.4%, Free Cash Flow = 667 million USD"
    ],

    // Revenue Potential Sub-scores
    projects: 5,
    projectsEvidence: [
      "Combined named Digital Twin projects, namely Horizon Power and Sydney railway system",
      "Dell Technologies – Gupta, P. K. (2025) - Internal Communication",
      "Altavec.com (2024) - Unlocking the Future of Railways https://www.altavec.com/case-study-1/",
      "Multiple un-named projects globally for telecommunications and leading manufacturing companies",
      "APJ pipeline: Projects house major manufacturer in Japan as well public Infrastructure projects in Australia",
      "A viable named projects to grow local alongside new opportunities Pacific nations (telecom/communication)"
    ],

    partnerMarketAccess: 4,
    partnerMarketAccessEvidence: [
      "Repeatedly Fortune 500 claim or other large-scale/revenue heavy companies",
      "Techmahindra.com (2024) - Tech Mahindra Announces AI Center of Excellence https://www.techmahindra.com/insights/press-releases/tech-mahindra-announces-ai-center-excellence-powered-nvidia-ai-enterprise-and-omniverse/",
      "Techmahindra (2025) - Why an AI Center of Excellence Is Key https://www.techmahindra.com/insights/views/why-ai-center-excellence-key-enterprise-transformation/",
      "Mahindra Group affiliates and related projects (Mahindra, Maruti, Digital India, Adani specific LLMs)"
    ],

    solutionMaturity: 5,
    solutionMaturityEvidence: [
      "Verified deployment of projects around the global, including the APJ region -> 5/5",
      "Products/skills mature to entry given advanced maturity stage",
      "Techmahindra.com (2025) - TechM Orion Next-Gen AI Platform https://www.techmahindra.com/insights/press-releases/tech-mahindra-unveils-techm-orion/",
      "Techmahindra.com (2025) - The Indus Project https://www.techmahindra.com/makers-lab/indus-project/"
    ],

    partnerScale: 4,
    partnerScaleEvidence: [
      "150K+ employees",
      "$6.5B revenue",
      "Global presence",
      "FY 2023-2024 Integrated Annual Report (2024)"
    ],

    growthMomentum: 4,
    growthMomentumEvidence: [
      "Part of $5B Prime Cash Flow",
      "Fortune 500 entry",
      "667 million USD investment",
      "FY 2023-2024 Integrated Annual Report (2024)"
    ],

    investmentReadiness: 4,
    investmentReadinessEvidence: [
      "Joint AI lab for telco",
      "Dell as further SLM/GenAI",
      "Techmahindra.com (2025) - Garuda LLM for Bahasa Indonesia https://www.techmahindra.com/insights/press-releases/indosat-ooredoo-hutchison-and-tech-mahindra-unite-build-garuda-llm-bahasa-indonesia-and-its/",
      "techmahindra.com (2025) - Digital Twins Powering Industrial Growth https://www.techmahindra.com/insights/views/digital-twins-powering-next-generation-industrial-growth/"
    ],

    // Calculated scores
    totalScore: 4.15,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System Import"
  },

  // Strategic Information
  notes: "Global System Integrator (GSI) operating in IT services consulting and digital solutions. Part of the Mahindra Group providing real-time monitoring, predictive maintenance, and performance optimization. Classified as Digital transformer in Everest Digital Twin Services PEAK Matrix Assessment.",

  competitiveAnalysis: "Competes with other major GSIs like TCS, Infosys, Wipro. Strong presence in manufacturing and telecom sectors. Everest Group (2023) recognition in Digital Twin Services PEAK Matrix.",

  dellOpportunity: "Strong existing partnership with Nvidia for GenAI. Mentioned Digital Twin in GTM joint Dell strategy presentation. Opportunity to expand Dell hardware integration in their digital twin solutions. AI Center of Excellence powered by NVIDIA platforms presents collaboration opportunities.",

  digitalTwinStrategy: "Focus on manufacturing, smart cities, and telecom sectors for digital twin deployment. Published POV: Digital Transformation = Digital Twin x Digital Thread (Tech Mahindra 2020). Leveraging AI/ML capabilities for predictive maintenance and optimization.",

  // Key Personnel
  personnel: [
    {
      name: "Mohit Joshi",
      title: "CEO",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "CEO and Managing Director"
    },
    {
      name: "Aleem Mawani",
      title: "President, Business Process Services",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "Key contact for digital transformation"
    },
    {
      name: "Abhishek Khetan",
      title: "Group Practice Head - SCM Manufacturing",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "Key contact for manufacturing digital twins"
    }
  ]
};

async function seedCompanies() {
  console.log('🌱 Starting company seeding...');

  try {
    // Check if Tech Mahindra already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name: "Tech Mahindra" }
    });

    if (existingCompany) {
      console.log('⚠️ Tech Mahindra already exists, updating...');
      const updated = await prisma.company.update({
        where: { id: existingCompany.id },
        data: techMahindraData
      });
      console.log('✅ Updated Tech Mahindra:', updated.id);
    } else {
      const created = await prisma.company.create({
        data: techMahindraData
      });
      console.log('✅ Created Tech Mahindra:', created.id);
    }

    console.log('🎉 Company seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedCompanies()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedCompanies, techMahindraData };