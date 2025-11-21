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

// Capgemini data
const capgeminiData = {
  // Basic Company Information
  name: "Capgemini",
  type: CompanyType.MNC,
  industry: "Information Technology - IT Services",
  country: "France",
  employees: 350000, // Approximate from public info
  revenue: "$22.99 Billion",
  headquarters: "Paris, France",
  ceo: "Aiman Ezzat",
  founded: 1967,
  website: "https://www.capgemini.com",
  businessAreas: ["IT Services", "Digital Transformation", "Cloud Services", "Consulting", "AI"],

  // Digital Twin Status
  digitalTwinStatus: "implementing",
  digitalTwinMaturity: 4,
  opportunityScore: 81, // 4.05/5 = 81%
  estimatedDealValue: "$10M+",

  // Scoring Data
  scores: {
    // Main Scores
    dataReliability: 4,
    dataReliabilityEvidence: [
      ">95% of inputs from verified, third-party sources (Capgemini.com, annual reports, LinkedIn)",
      "SEC filings, major news websites (Reuters, other companies / government websites)",
      "Limited conflict in nature of work environments (e.g., Capgemini Delivery)",
      "Information current and consistent across channels",
      "Information not primarily added without basis"
    ],

    existingRelations: 4,
    existingRelationsEvidence: [
      "Long-standing Cisco partnership, since 2015 in EMEA",
      "weforum.org (2025) - Capgemini Invent About https://initiatives.weforum.org/technology-convergence-initiative/organization-details/capgemini-invent/0010X00004IbH1dQAF",
      "On recorded Digital Twin GTM yet, but strong executive alignment",
      "Strategic partner relationship, ensuring potential for joint value integration",
      "Tech Mahindra (2020) - Digital Transformation = Digital Twin x Digital Thread https://files.techmahindra.com/static/img/pdf/dtdt-pov.pdf"
    ],

    industry: 4,
    industryEvidence: [
      "Completed projects in Manufacturing and Public China projects",
      "Projects across the five sectors and particularly so for five flows",
      "Strong alignment in 2 priority verticals (Manufacturing + Smart Cities)"
    ],

    revenuePotential: 4.1,
    revenuePotentialEvidence: [
      "Revenue: FY2024 = $22.99 billion USD",
      "techmahindra.com (2025)f - Source reference",
      "Growth Momentum: 9% YoY increase shown (83.7% + 3% increase exchange rate)",
      "capgemini.com (2025) - Source reference",
      "Investment Readiness 5/5: Free Cash Flow = $2.98 billion USD"
    ],

    // Revenue Potential Sub-scores
    projects: 4,
    projectsEvidence: [
      "Multiple global projects across manufacturing and public sectors",
      "Digital twin initiatives in China",
      "Strong project pipeline across five key sectors"
    ],

    partnerMarketAccess: 4,
    partnerMarketAccessEvidence: [
      "Global presence with strong European base",
      "Access to Fortune 500 clients",
      "Strategic partnerships with major technology vendors"
    ],

    solutionMaturity: 5,
    solutionMaturityEvidence: [
      "Mature service offerings",
      "Established delivery capabilities",
      "Proven methodologies and frameworks",
      "Global delivery centers"
    ],

    partnerScale: 5,
    partnerScaleEvidence: [
      "350,000+ employees globally",
      "$22.99 billion revenue",
      "Presence in 50+ countries",
      "capgemini.com (2024) - Source reference"
    ],

    growthMomentum: 5,
    growthMomentumEvidence: [
      "9% YoY revenue growth",
      "Strong financial performance",
      "Continuous market share expansion"
    ],

    investmentReadiness: 5,
    investmentReadinessEvidence: [
      "$2.98 billion Free Cash Flow",
      "Strong balance sheet",
      "Regular technology investments",
      "R&D focus on emerging technologies"
    ],

    // Calculated scores
    totalScore: 4.05,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System Import"
  },

  // Strategic Information
  notes: "Capgemini is a Global System Outsourcer specializing in digital transformation, technology and engineering services. Part of CAC 40. Identity inefficiencies, test changes virtually and improve performance. Classified as a Digital twin nice performer in Everest Digital Twin Services PEAK Matrix Assessment.",

  competitiveAnalysis: "Competes with major GSIs like Accenture, TCS, Infosys, Wipro. Strong presence in Europe with growing North American and Asia Pacific footprint.",

  dellOpportunity: "Existing strategic partner of Dell. No current Digital Twin GTM yet but strong executive alignment. Opportunities to expand Dell hardware integration in their digital twin solutions across manufacturing and smart cities projects.",

  digitalTwinStrategy: "Focus on manufacturing and smart cities verticals. Leveraging AI/ML capabilities for predictive maintenance and optimization. Strong European base with expansion in APAC region.",

  // Key Personnel
  personnel: [
    {
      name: "Aiman Ezzat",
      title: "CEO",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "Chief Executive Officer"
    },
    {
      name: "Nive Bhagat",
      title: "Group Chief Financial Officer",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "CFO of Capgemini Group"
    },
    {
      name: "Aashish Vakil",
      title: "Head of Intelligent Industry",
      email: "",
      phone: "",
      linkedinUrl: "",
      notes: "Key contact for manufacturing digital twins"
    }
  ]
};

// Array to hold all companies data
const companiesData = [
  techMahindraData,
  capgeminiData,
  // Add more companies here as needed
];

async function seedCompany(companyData: any) {
  const existingCompany = await prisma.company.findFirst({
    where: { name: companyData.name }
  });

  if (existingCompany) {
    console.log(`⚠️  ${companyData.name} already exists, updating...`);
    const updated = await prisma.company.update({
      where: { id: existingCompany.id },
      data: companyData
    });
    console.log(`✅ Updated ${companyData.name}:`, updated.id);
    return updated;
  } else {
    const created = await prisma.company.create({
      data: companyData
    });
    console.log(`✅ Created ${companyData.name}:`, created.id);
    return created;
  }
}

async function seedCompanies() {
  console.log('🌱 Starting company seeding...');
  console.log(`📊 Found ${companiesData.length} companies to process\n`);

  try {
    for (const companyData of companiesData) {
      try {
        await seedCompany(companyData);
      } catch (error) {
        console.error(`❌ Error seeding ${companyData.name}:`, error);
      }
    }

    console.log('\n🎉 Company seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error in seeding process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedCompanies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Helper function to add a new company to the seed data
export function addCompanyData(companyData: any) {
  companiesData.push(companyData);
}

export { seedCompanies, techMahindraData, companiesData };