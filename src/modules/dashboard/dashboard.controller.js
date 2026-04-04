import ApiResponse from "../../utils/ApiResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import * as dashboardService from "./dashboard.service.js";

export const getSummary = catchAsync(async (req, res) => {
    const summary = await dashboardService.getSummary(req.validated.query);
    res.status(200).json(new ApiResponse(200, "Summary fetched", summary));
});

export const getCategoryBreakdown = catchAsync(async (req, res) => {
    const data = await dashboardService.getCategoryBreakdown(req.validated.query);
    res.status(200).json(new ApiResponse(200, "Category breakdown fetched", data));
})

export const getTrends = catchAsync(async (req, res) => {
    const trends = await dashboardService.getTrends(req.validated.query);
    res.status(200).json(new ApiResponse(200, "Trends fetched", trends));
})

export const getRecent = catchAsync(async(req, res) => {
    const recent = await dashboardService.getRecent(req.validated.query);
    res.status(200).json(new ApiResponse(200, "Recent records fetched", recent));
})