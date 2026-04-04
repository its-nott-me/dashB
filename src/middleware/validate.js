import ApiError from "../utils/ApiError.js";

/*
    validates against a provided schema
    params: schema
    returns: void
    throws: ApiError
*/
const validate = (schema, source = "body") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });     // wait for all validation errors

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
        }));
        throw new ApiError(400, "Validation failed", errors)
    }

    // store validated values in req.validated
    req.validated = req.validated || [];
    req.validated[source] = value;

    next();
}

export default validate;