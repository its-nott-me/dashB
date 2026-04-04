import { describe, it, expect, beforeAll } from "@jest/globals";
import { app, request, loginAs } from "./setup.js";

describe("Dashboard Module", () => {
    let adminToken;

    beforeAll(async () => {
        const admin = await loginAs("admin@dashB.com");
        adminToken = admin.accessToken;
    });

    it("should return summary with correct fields", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/summary")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty("totalIncome");
        expect(res.body.data).toHaveProperty("totalExpense");
        expect(res.body.data).toHaveProperty("netBalance");
        expect(res.body.data).toHaveProperty("recordCount");
        expect(res.body.data.netBalance).toBe(
            res.body.data.totalIncome - res.body.data.totalExpense
        );
    });

    it("should return category breakdown", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/category-breakdown")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);

        if (res.body.data.length > 0) {
            expect(res.body.data[0]).toHaveProperty("category");
            expect(res.body.data[0]).toHaveProperty("total");
            expect(res.body.data[0]).toHaveProperty("percentage");
        }
    });

    it("should return trends", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/trends?months=6")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);

        if (res.body.data.length > 0) {
            expect(res.body.data[0]).toHaveProperty("month");
            expect(res.body.data[0]).toHaveProperty("income");
            expect(res.body.data[0]).toHaveProperty("expense");
            expect(res.body.data[0]).toHaveProperty("net");
        }
    });

    it("should return recent records", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/recent?limit=5")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should filter summary by date range", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/summary?startDate=2026-01-01&endDate=2026-03-31")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.totalIncome).toBeDefined();
    });
});
