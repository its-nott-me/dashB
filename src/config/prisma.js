import { PrismaClient } from "@prisma/client";
import { env } from "./loadenv.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter });       // singleton prisma client

export default prisma;