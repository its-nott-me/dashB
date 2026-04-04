import Joi from "joi";

export const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("ADMIN", "ANALYST", "VIEWER"),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    role: Joi.string().valid("ADMIN", "VIEWER", "ANALYST"),
    status: Joi.string().valid("ACTIVE", "INACTIVE")
})
    .min(1)     // at least one field must be provided in the patch
    .messages({
        "object.min": "At least one field (name, role or status) must be provided."
    });

export const queryUsersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    role: Joi.string().valid("ADMIN", "ANALYST", "VIEWER"),
    status: Joi.string().valid("ACTIVE", "INACTIVE")
});
