import catchAsync from "../../utils/catchAsync.js";
import ApiError from "../../utils/ApiError.js";
import * as authService from "./auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { env } from "../../config/loadenv.js";

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);
    const { user, refreshToken, accessToken } = result;

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: 'Strict',
        path: '/refresh',
        maxAge: 1 * 60 * 60 * 1000
    });
    res.status(200).json(new ApiResponse(200, "login successfull", { user, accessToken, refreshToken }));
});

export const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json(new ApiResponse(200, "token refreshed", result));
});