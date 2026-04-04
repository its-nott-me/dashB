import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

export const createRecord = async (data, userId) => {
    const record = await prisma.financialRecord.create({
        data: {
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: new Date(data.date),
            description: data.description || null,
            createdBy: userId
        },
        include: {
            creator: {
                select: { id: true, name: true }        // include ref to record creator
            }
        }
    });

    return record;
}

export const listRecords = async (query, role) => {
    const { page, limit, type, category, sortBy, order, endDate, startDate, status } = query;

    // allow only admins to view soft-deleted records
    if (status == "deleted" && role !== "ADMIN") {
        throw new ApiError(403, "You are not allowed to view deleted records");
    }

    // dynamically build where 
    const where = {};

    if (status == "active") {
        where.isDeleted = false;
    } else if (status == "deleted") {
        where.isDeleted = true;
    }

    if (type) where.type = type;
    if (category) where.category = { contains: category, mode: "insensitive" };

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([        // fetch data parallelly
        prisma.financialRecord.findMany({
            where,
            include: {
                creator: {
                    select: { id: true, name: true }    // include ref to record creator
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [sortBy]: order },
        }),
        prisma.financialRecord.count({ where })
    ]);

    return {
        records,
        meta: {         // meta data of pages
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export const getRecordById = async (id, role) => {
    const record = await prisma.financialRecord.findUnique({
        where: { id },
        include: {
            creator: {
                select: { id: true, name: true }        // include ref to record creator
            }
        }
    });

    // only admins can view soft-deleted records
    if (!record || (record.isDeleted && role !== "ADMIN")) {
        throw new ApiError(404, "Record not found")
    }

    return record;
}

export const updateRecord = async (id, data, role) => {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });

    if (!existing || (
        role !== "ADMIN" &&         // only admin can access and update soft-deleted records
        (existing.isDeleted || data.isDeleted !== null))
    ) {
        throw new ApiError(404, "Record not found");
    }

    if (data.date) {
        data.date = new Date(data.date);
    }

    const updated = await prisma.financialRecord.update({
        where: { id },
        data,
        include: {
            creator: {
                select: { id: true, name: true }        // include ref to record creator
            }
        }
    });

    return updated;
}

export const deleteRecord = async (id, role) => {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });

    // allow only admins to delete records
    if (!existing || (role !== "ADMIN" && existing.isDeleted)) {
        throw new ApiError(404, "Record not found");
    }

    await prisma.financialRecord.update({
        where: { id },
        data: { isDeleted: true }       // only soft-delete
    });

    return { message: "Record deleted successfully" };
}

