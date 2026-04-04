import prisma from "../../config/prisma.js"
import ApiError from "../../utils/ApiError.js"
import bcrypt from "bcryptjs";

// select fields to return except hashedPassword
const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};

// strip away sensitive info before returning user
const sanitizeUser = (user) => {
    const { passwordHash, ...safe } = user;
    return safe;
}

export const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
}

export const createUser = async (user) => {
    // check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    // store hashed passwords always
    const hashedPwd = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            passwordHash: hashedPwd,
            role: user.role || "VIEWER",
        }
    });

    return sanitizeUser(newUser);
}

export const listUsers = async (query) => {
    const { page, limit, role, status } = query;

    // dynamically build where
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: userSelect,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" }      // latest first
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        meta: {         // metadata of page
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
}

export const updateUser = async (targetId, adminId, data) => {
    console.log(targetId)
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });

    if (!targetUser) {
        throw new ApiError(404, "user not found");
    }

    // admins cannot deactivate their own account
    // prevents locking out from system
    if (data.status === "INACTIVE" && targetId === adminId) {
        throw new ApiError(400, "Cannot deactivate your own account");
    }

    // admins cannot change their own role
    // prevents locking out from system
    if (data.role && targetId === adminId) {
        throw new ApiError(400, "Cannot change your own role");
    }

    const updateedUser = await prisma.user.update({
        where: { id: targetId },
        data,
        select: userSelect
    })

    return updateedUser;
}