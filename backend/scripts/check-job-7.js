import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkJob() {
  const job = await prisma.aI3DJob.findUnique({
    where: { id: 7 }
  });
  console.log(JSON.stringify(job, null, 2));
  await prisma.$disconnect();
}

checkJob();
