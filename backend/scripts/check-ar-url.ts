import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: { arUrl: { not: null } },
        select: { id: true, name: true, arUrl: true }
    });

    writeFileSync("result-utf8.json", JSON.stringify(products, null, 2), "utf8");
}

main().catch(console.error).finally(() => prisma.$disconnect());
