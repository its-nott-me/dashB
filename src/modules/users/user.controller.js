import catchAsync from "../../utils/catchAsync.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as userServices from "./user.service.js";

export const getMe = catchAsync(async (req, res) => {
    const user = await userServices.getMe(req.user.userId);
    res.status(200).json(new ApiResponse(200, "Profile fetched", user));
});


export const createUser = catchAsync(async (req, res) => {
    const user = await userServices.createUser(req.body);
    res.status(201).json(new ApiResponse(200, "User created successfully", user));
});

export const listUsers = catchAsync(async (req, res) => {
    const result = await userServices.listUsers(req.validated.query);
    res.status(200).json({
        ...(new ApiResponse(200, "Users fetched", result.users)),
        meta: result.meta,
    })
});

export const getUserById = catchAsync(async (req, res) => {
    const user = await userServices.getUserById(req.params.id);
    res.status(200).json(new ApiResponse(200, "User found", user));
});

export const updateUser = catchAsync(async (req, res) => {
    const updatedUser = await userServices.updateUser(
        req.params.id,
        req.user.userId,
        req.body
    );
    res.status(200).json(new ApiResponse(200, "Updated user", updatedUser));
});