import app from "../src/app.js";
import request from "supertest";
import prisma from "../src/config/prisma.js";

// Helper: login and get tokens
export const loginAs = async (email, password = "Admin@123") => {
    const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password });
    if (!res.body.success) {
        console.error(`Login failed for ${email}:`, res.body.message);
    }
    return res.body.data;
};

export { app, request, prisma };
