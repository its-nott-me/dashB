import { describe, it, expect } from "@jest/globals";
import { app, request } from "./setup.js";

describe("Auth Module", () => {
    describe("POST /api/v1/auth/login", () => {
        it("should login with valid credentials", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "admin@dashB.com", password: "Admin@123" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
            expect(res.body.data.user.email).toBe("admin@dashB.com");
            // password should never be returned
            expect(res.body.data.user.passwordHash).toBeUndefined();
        });

        it("should reject invalid password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "admin@dashB.com", password: "wrongpassword" });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should reject non-existent email", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "nobody@dashB.com", password: "Admin@123" });

            expect(res.status).toBe(401);
        });

        it("should reject invalid input (missing password)", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "admin@dashB.com" });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });

    describe("POST /api/v1/auth/refresh", () => {
        it("should return a new access token", async () => {
            // Login first to get refresh token
            const login = await request(app)
                .post("/api/v1/auth/login")
                .send({ email: "admin@dashB.com", password: "Admin@123" });

            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({ refreshToken: login.body.data.refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.data.accessToken).toBeDefined();
        });

        it("should reject invalid refresh token", async () => {
            const res = await request(app)
                .post("/api/v1/auth/refresh")
                .send({ refreshToken: "invalid-token-here" });

            expect(res.status).toBe(401);
        });
    });
});
