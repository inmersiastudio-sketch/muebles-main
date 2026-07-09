import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.$queryRaw`SELECT * FROM products LIMIT 1`;
        console.log("RAW PRODUCTS DB: ", products);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
