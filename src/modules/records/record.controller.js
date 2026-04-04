import catchAsync from "../../utils/catchAsync.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as recordServices from "./record.service.js";

export const create = catchAsync(async (req, res) => {
    const record = await recordServices.createRecord(req.body, req.user.userId);
    res.status(201).json(new ApiResponse(200, "Record created", record));
});

export const list = catchAsync(async (req, res) => {
    const result = await recordServices.listRecords(req.validated.query, req.user.role);
    res.status(200).json({
        ...(new ApiResponse(200, "Records fetched", result.records)),
        meta: result.meta       // meta data of pages
    });
});

export const getById = catchAsync(async (req, res) => {
    const record = await recordServices.getRecordById(req.params.id, req.user.role);
    res.status(200).json(new ApiResponse(200, "Record fetched", record));
});

export const update = catchAsync(async (req, res) => {
    const updatedRecord = await recordServices.updateRecord(req.params.id, req.body, req.user.role);
    res.status(200).json(new ApiResponse(200, "Record updated", updatedRecord));
});

export const remove = catchAsync(async (req, res) => {
    const result = await recordServices.deleteRecord(req.params.id, req.user.role);
    res.status(200).json(new ApiResponse(200, "Record deleted", result.message));
});

