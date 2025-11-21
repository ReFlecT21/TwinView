import { prisma } from '../server/prisma';

async function checkScores() {
  const company = await prisma.company.findFirst({
    where: { name: "Tech Mahindra" }
  });

  if (company) {
    console.log('Company found:', company.name);
    console.log('Scores field:', JSON.stringify(company.scores, null, 2));
  } else {
    console.log('Company not found');
  }

  await prisma.$disconnect();
}

checkScores();