import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { env } from "../src/config/loadenv.js";

const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const hashedPwd = await bcrypt.hash("Admin@123", 10);      // same password for convenience

    // seed users
    const admin = await prisma.user.upsert({
        where: { email: "admin@dashB.com" },
        update: {},
        create: {
            name: "sys admin",
            email: "admin@dashB.com",
            passwordHash: hashedPwd,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });

    const analyst = await prisma.user.upsert({
        where: { email: "analyst@dashB.com" },
        update: {},
        create: {
            name: "Data analyst",
            email: "analyst@dashB.com",
            passwordHash: hashedPwd,
            role: "ANALYST",
            status: "ACTIVE",
        },
    });

    const viewer = await prisma.user.upsert({
        where: { email: "viewer@dashB.com" },
        update: {},
        create: {
            name: "Viewer",
            email: "viewer@dashB.com",
            passwordHash: hashedPwd,
            role: "VIEWER",
            status: "ACTIVE",
        },
    });

    console.log("Comepleted seeding users");


    // --------------sample records---------------
    const categories = [
        "Salaries",
        "Rent",
        "Groceries",
        "Utilities",
        "Entertainment",
        "Travel",
        "Healthcare",
    ];

    const types = ["INCOME", "EXPENSE"];

    const records = [];

    for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const category =
            type === "INCOME"
                ? ["Subscriptions", "Licensing", "API usage fee"][Math.floor(Math.random() * 3)]
                : categories[Math.floor(Math.random() * categories.length)];

        const amount =
            type === "INCOME"
                ? Math.floor(Math.random() * 5000000) + 500000      // ₹5k–₹50k
                : Math.floor(Math.random() * 2000000) + 10000;      // ₹100–₹20k

        const randomDate = new Date();
        randomDate.setMonth(randomDate.getMonth() - Math.floor(Math.random() * 6));

        const isDeleted = Math.random() < 0.3;                  // soft-deletes records ~30% of the time

        records.push({
            amount,
            type,
            category,
            date: randomDate,
            description: `${category} ${type.toLowerCase()}`,
            isDeleted,
            createdBy: admin.id,
        });
    }

    // clear older records before seeding
    await prisma.financialRecord.deleteMany();

    // seed new records
    await prisma.financialRecord.createMany({
        data: records,
    });

    console.log("Completed seeding records")
}

main()
    .catch((e) => {
        console.error("Seeding failed", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });