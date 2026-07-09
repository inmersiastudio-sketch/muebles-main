import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function runAutoSeed() {
  try {
    console.log("[auto-seed] Checking if database needs seeding...");

    // Check if admin user already exists
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (adminExists) {
      console.log("[auto-seed] Admin user already exists. Skipping seed.");
      return;
    }

    console.log("[auto-seed] No admin user found. Creating default admin...");

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        name: "Admin User",
      },
    });

    console.log("[auto-seed] ✅ Admin user created successfully!");
    console.log("[auto-seed]    Email: admin@example.com");
    console.log("[auto-seed]    Password: admin123");
  } catch (error) {
    console.error("[auto-seed] ❌ Error during auto-seed:", error);
    // Don't throw - let the server start anyway
  } finally {
    await prisma.$disconnect();
  }
}
