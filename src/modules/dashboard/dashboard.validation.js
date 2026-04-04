import Joi from "joi";

export const summaryQuerySchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .messages({
            "date.base": "startDate must be a valid date",
            "date.format": "startDate must be in ISO 8601 format",
            "date.iso": "startDate must be in ISO 8601 format"
        }),
    endDate: Joi.date()
        .iso()
        .when("startDate", {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref("startDate"))      // endDate date should be greater than or equal to startDate
        })
        .messages({
            "date.base": "endDate must be a valid date",
            "date.format": "endDate must be in ISO 8601 format",
            "date.iso": "endDate must be in iso 8601 format",
            "date.min": "endDate must be after startDate"
        })
})

export const trendsQuerySchema = Joi.object({
    months: Joi.number().integer().min(1).max(24).default(6)
})

export const recentQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10)
})

export const categoryBreakdownSchema = Joi.object({
    type: Joi.string().valid("INCOME", "EXPENSE"),
    startDate: Joi.date()
        .iso()
        .messages({
            "date.base": "startDate must be a valid date",
            "date.format": "startDate must be in ISo 8601 format",
            "date.iso": "startDate must be in ISO 8601 format"
        }),
    endDate: Joi.date()
        .iso()
        .when("startDate", {
            is: Joi.exist(),
            then: Joi.date().min(Joi.ref("startDate")),     // endDate date should be greater than or equal to startDate
        })
        .messages({
            "date.base": "endDate must be a validDate",
            "date.format": "endDate must be in ISO 8601 format",
            "date.iso": "endDate must be in ISO 8601 format",
            "date.min": "enddate must be after startDate"
        })
})