import { describe, it, expect, beforeAll } from "@jest/globals";
import { app, request, loginAs } from "./setup.js";

describe("Records Module", () => {
    let adminToken;
    let createdRecordId;

    beforeAll(async () => {
        const admin = await loginAs("admin@dashB.com");
        adminToken = admin.accessToken;
    });

    it("should create a record", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                amount: 5000000,
                type: "EXPENSE",
                category: "Salaries",
                date: "2026-03-15",
                description: "March payroll",
            });

        expect(res.status).toBe(201);
        expect(res.body.data.amount).toBe(5000000);
        expect(res.body.data.creator).toBeDefined();
        createdRecordId = res.body.data.id;
    });

    it("should reject record with negative amount", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ amount: -100, type: "INCOME", category: "Test", date: "2026-01-01" });

        expect(res.status).toBe(400);
    });

    it("should reject record with future date", async () => {
        const res = await request(app)
            .post("/api/v1/records")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ amount: 1000, type: "INCOME", category: "Test", date: "2099-01-01" });

        expect(res.status).toBe(400);
    });

    it("should filter records by type", async () => {
        const res = await request(app)
            .get("/api/v1/records?type=EXPENSE")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        res.body.data.forEach((r) => expect(r.type).toBe("EXPENSE"));
    });

    it("should paginate records", async () => {
        const res = await request(app)
            .get("/api/v1/records?page=1&limit=5")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
        expect(res.body.meta).toBeDefined();
        expect(res.body.meta.page).toBe(1);
    });

    it("should soft-delete a record", async () => {
        const res = await request(app)
            .delete(`/api/v1/records/${createdRecordId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        // Should not appear in listings anymore
        const list = await request(app)
            .get("/api/v1/records")
            .set("Authorization", `Bearer ${adminToken}`);

        const found = list.body.data.find((r) => r.id === createdRecordId);
        expect(found).toBeUndefined();
    });
});
