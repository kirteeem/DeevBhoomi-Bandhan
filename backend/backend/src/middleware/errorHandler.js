export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Something went wrong on our end. Please try again in a moment.";

  // Zod schema validation thrown directly (e.g. schema.parse(...) inside a
  // controller, rather than via the validate() middleware) — same friendly
  // "field: reason" shape as validate() produces, instead of a raw stack.
  if (err.name === "ZodError" && Array.isArray(err.issues)) {
    statusCode = 400;
    message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  }

  // Malformed ObjectId passed to a mongoose query (e.g. bad :id in URL)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Mongoose schema validation failures
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }

  // Duplicate key (unique index) violations
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `An account with this ${field} already exists` : "Duplicate value";
  }

  // Malformed JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, token invalid or expired";
  }

  if (statusCode >= 500) {
    // Server-side errors are logged with full detail; never sent to the client.
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
