import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // We grant 50 credits to store ID 1 (and 2 just in case they registered twice)
  const storeIds = [1, 2];
  const credits = 50;

  for (const storeId of storeIds) {
    try {
      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) {
        console.log(`Store ID ${storeId} not found, skipping.`);
        continue;
      }
      console.log(`Granting ${credits} credits to store ID ${storeId} (${store.name})...`);
      const updated = await prisma.store.update({
        where: { id: storeId },
        data: { ai3dCredits: credits },
      });
      console.log('Success! Updated store credits:', updated.ai3dCredits);
    } catch (err) {
      console.warn(`Could not update store ID ${storeId}:`, err.message);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error granting credits:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
