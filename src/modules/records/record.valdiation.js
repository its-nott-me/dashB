import Joi from "joi";

export const createRecordSchema = Joi.object({
    amount: Joi.number()
        .integer()
        .positive()
        .max(99999999999)
        .required()
        .messages({
            "number.positive": "Amount should be positive integer"
        }),
    type: Joi.string().valid("INCOME", "EXPENSE").required(),
    category: Joi.string().min(1).max(50).trim().required(),
    date: Joi.date()
        .iso()
        .max("now")
        .required()
        .messages({
            "data.now": "Date cannot be in future",
        }),
    description: Joi.string().max(500).trim().allow("", null),
});

export const updateRecordSchema = Joi.object({
    amount: Joi.number().integer().positive().max(99999999999),
    type: Joi.string().valid("INCOME", "EXPENSE"),
    category: Joi.string().min(1).max(50).trim(),
    date: Joi.date().iso().max("now").messages({ "date.max": "Date cannot be in the future" }),
    description: Joi.string().max(500).trim().allow("", null),
    isDeleted: Joi.boolean()
})
    .min(1)
    .messages({
        "object.min": "Atleast one object must be provided to update"
    });

export const queryRecordsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(500).default(20),
    type: Joi.string().valid("INCOME", "EXPENSE"),
    category: Joi.string().trim(),
    startDate: Joi.date()
        .iso()
        .messages({
            "date.base": "startDate must be a valid Date",
            "date.format": "startDate must be in ISO 8601 format",
            "date.iso": "startDate must be in ISO 8601 format"
        }),
    endDate: Joi.date()
        .iso()
        .when("startDate", {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref("startDate"))
        })
        .messages({
            "date.base": "endDate must be a valid date",
            "date.format": "endDate must be in ISO 8601 format",
            "date.iso": "endDate must be in ISO 8601 format",
            "date.min": "endDate must be after startDate "
        }),
    status: Joi.string().valid("active", "deleted", "all").default("active"),
    sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
    order: Joi.string().valid("asc", "desc").default("desc")
});

