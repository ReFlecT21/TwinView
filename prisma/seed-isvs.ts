import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedISVs() {
  console.log('🌱 Seeding ISV/Startups...');

  const isvs = [
    {
      name: 'Biofourmis',
      vertical: 'healthcare' as const,
      headquarters: 'Singapore',
      presence: ['Singapore', 'USA', 'India'],
      regions: ['APAC' as const],
      coordinates: {
        lat: 1.3521,
        lng: 103.8198
      },
      size: 'medium' as const,
      maturityStage: 'Growth' as const,
      employees: 300,
      revenue: '$300M',
      hasOpenAPIs: true,
      dellValidated: false,
      interestLevel: 'high' as const,
      interestReasons: ['Remote patient monitoring', 'Digital therapeutics'],
      integrations: ['Biovitals'],
      notes: 'Growth-Stage ISV has raised over $300M, partnerships with top hospitals. Platform ("Biovitals"), seems open. For remote patient monitoring and digital therapeutics.',
      strategicValue: 'Strong potential for remote patient monitoring and digital therapeutics solutions in healthcare vertical',
    },
    {
      name: 'Qure.ai',
      vertical: 'healthcare' as const,
      headquarters: 'Mumbai',
      presence: ['India', 'USA', 'UK'],
      regions: ['APAC' as const, 'EMEA' as const],
      coordinates: {
        lat: 19.0760,
        lng: 72.8777
      },
      size: 'medium' as const,
      maturityStage: 'Growth' as const,
      employees: 80,
      revenue: '',
      hasOpenAPIs: false,
      dellValidated: true,
      interestLevel: 'high' as const,
      interestReasons: ['AI imaging', 'Strong Indian footprint', 'Global recognition'],
      integrations: [],
      consortiumMemberships: [],
      certifications: ['PACS/RIS compatible'],
      notes: 'Scale-up stage; founded 2016, Series C funding, preparing IPO (2025). Used in 80+ countries. AI models are PACS/RIS compatible; cloud-based, likely server-agnostic. Seems to fits Dell hardware. Strong Indian footprint, global recognition in AI imaging—good for TCS',
      strategicValue: 'AI-powered medical imaging solutions with strong compatibility with Dell hardware infrastructure',
    }
  ];

  for (const isv of isvs) {
    try {
      const existing = await prisma.iSVStartup.findFirst({
        where: { name: isv.name }
      });

      if (existing) {
        console.log(`✅ ISV "${isv.name}" already exists, skipping...`);
        continue;
      }

      const created = await prisma.iSVStartup.create({
        data: isv
      });

      console.log(`✅ Created ISV: ${created.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ISV ${isv.name}:`, error);
    }
  }

  console.log('✅ ISV seeding completed!');
}

async function main() {
  try {
    await seedISVs();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();