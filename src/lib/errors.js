/**
 * Standard Application Error Classes and API Error Handler
 * Following SAYPAY Technical Specification
 */

/**
 * Strips sensitive credentials, auth tokens, and connection strings from error messages.
 * Prevents leaking MongoDB Atlas passwords or API secrets in logs and API responses.
 *
 * @param {string} message
 * @returns {string}
 */
export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== "string") {
    return "An unexpected error occurred";
  }

  // Scrub MongoDB connection strings with credentials (e.g. mongodb+srv://user:pass@host)
  let sanitized = message.replace(
    /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi,
    "mongodb$1://***:***@"
  );

  // Scrub standard URI query string credentials / auth tokens
  sanitized = sanitized.replace(/(password|secret|key|token)=[^&\s]+/gi, "$1=***");

  return sanitized;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {string} [code="APP_ERROR"] - Machine-readable error code
   * @param {number} [statusCode=500] - HTTP status code
   * @param {any} [details=null] - Additional contextual details
   */
  constructor(message, code = "APP_ERROR", statusCode = 500, details = null) {
    super(sanitizeErrorMessage(message));
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error (HTTP 400)
 */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", details = null) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * Resource Not Found Error (HTTP 404)
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details = null) {
    super(message, "NOT_FOUND", 404, details);
  }
}

/**
 * Database Operation Error (HTTP 500)
 */
export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details = null) {
    super(message, "DATABASE_ERROR", 500, details);
  }
}

/**
 * Resource Conflict / Duplicate Error (HTTP 409)
 */
export class ConflictError extends AppError {
  constructor(message = "Resource conflict or duplicate", details = null) {
    super(message, "CONFLICT_ERROR", 409, details);
  }
}

/**
 * Formats any error into a clean, structured payload and HTTP status code.
 *
 * @param {Error|AppError|any} error
 * @returns {{ status: number, body: { success: false, error: { message: string, code: string, details?: any } } }}
 */
export function formatApiError(error) {
  const isProd = process.env.NODE_ENV === "production";

  // Known AppError instances
  if (error instanceof AppError) {
    const body = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };

    if (error.details) {
      body.error.details = error.details;
    }

    return { status: error.statusCode, body };
  }

  // MongoDB duplicate key error (code 11000)
  if (error && (error.code === 11000 || error.codeName === "DuplicateKey")) {
    const keyPattern = error.keyPattern ? Object.keys(error.keyPattern).join(", ") : "field";
    return {
      status: 409,
      body: {
        success: false,
        error: {
          message: `A record with this ${keyPattern} already exists.`,
          code: "DUPLICATE_KEY",
        },
      },
    };
  }

  // Mongoose validation errors
  if (error && error.name === "ValidationError" && error.errors) {
    const fieldErrors = {};
    for (const [key, val] of Object.entries(error.errors)) {
      fieldErrors[key] = val.message;
    }
    return {
      status: 400,
      body: {
        success: false,
        error: {
          message: "Data validation failed",
          code: "VALIDATION_ERROR",
          details: fieldErrors,
        },
      },
    };
  }

  // Mongoose CastError (e.g. invalid ObjectId or type)
  if (error && error.name === "CastError") {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          message: `Invalid format for field "${error.path}".`,
          code: "INVALID_FIELD_FORMAT",
        },
      },
    };
  }

  // General database connection / network errors
  if (
    error &&
    (error.name === "MongoNetworkError" ||
      error.name === "MongoServerSelectionError" ||
      error.name === "MongooseServerSelectionError")
  ) {
    return {
      status: 503,
      body: {
        success: false,
        error: {
          message: isProd
            ? "Database service temporarily unavailable"
            : sanitizeErrorMessage(error.message),
          code: "DATABASE_UNAVAILABLE",
        },
      },
    };
  }

  // Generic / unexpected errors
  const safeMessage = isProd
    ? "An unexpected internal server error occurred."
    : sanitizeErrorMessage(error?.message || "Internal server error");

  return {
    status: 500,
    body: {
      success: false,
      error: {
        message: safeMessage,
        code: "INTERNAL_SERVER_ERROR",
      },
    },
  };
}

/**
 * Route handler helper for Next.js App Router.
 * Returns a standard JSON Response with proper HTTP status codes.
 *
 * @param {Error|any} error
 * @returns {Response}
 */
export function handleApiError(error) {
  const { status, body } = formatApiError(error);
  return Response.json(body, { status });
}
