import { describe, it, expect, beforeAll } from "@jest/globals";
import { app, request, loginAs } from "./setup.js";

describe("RBAC (Role-Based Access Control)", () => {
    let adminToken, analystToken, viewerToken;

    beforeAll(async () => {
        const admin = await loginAs("admin@dashB.com");
        const analyst = await loginAs("analyst@dashB.com");
        const viewer = await loginAs("viewer@dashB.com");
        adminToken = admin.accessToken;
        analystToken = analyst.accessToken;
        viewerToken = viewer.accessToken;
    });

    // --- Records: Viewer can read, cannot create ---
    it("Viewer can GET /records", async () => {
        const res = await request(app)
            .get("/api/v1/records")
            .set("Authorization", `Bearer ${viewerToken}`);
        expect(res.status).toBe(200);
    });

    it("Viewer cannot POST /records", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${viewerToken}`)
            .send({ amount: 1000, type: "INCOME", category: "Test", date: "2026-01-01" });
        expect(res.status).toBe(403);
    });

    // --- Users: Viewer cannot list all users ---
    it("Viewer cannot GET /users", async () => {
        const res = await request(app)
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${viewerToken}`);
        expect(res.status).toBe(403);
    });

    // --- Dashboard: Viewer can see summary, not trends ---
    it("Viewer can GET /dashboard/summary", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/summary")
            .set("Authorization", `Bearer ${viewerToken}`);
        expect(res.status).toBe(200);
    });

    it("Viewer cannot GET /dashboard/trends", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/trends")
            .set("Authorization", `Bearer ${viewerToken}`);
        expect(res.status).toBe(403);
    });

    // --- Analyst can see trends, cannot create records ---
    it("Analyst can GET /dashboard/trends", async () => {
        const res = await request(app)
            .get("/api/v1/dashboard/trends")
            .set("Authorization", `Bearer ${analystToken}`);
        expect(res.status).toBe(200);
    });

    it("Analyst cannot POST /records", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${analystToken}`)
            .send({ amount: 1000, type: "INCOME", category: "Test", date: "2026-01-01" });
        expect(res.status).toBe(403);
    });

    // --- No token at all ---
    it("Unauthenticated request gets 401", async () => {
        const res = await request(app).get("/api/v1/records");
        expect(res.status).toBe(401);
    });

    // --- Admin can do everything ---
    it("Admin can POST /records", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ amount: 500000, type: "EXPENSE", category: "Testing", date: "2026-01-15" });
        expect(res.status).toBe(201);
    });
});
