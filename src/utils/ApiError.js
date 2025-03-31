class ApiError extends Error {
  //error class is already defined by node as a class package
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [], //error always have as array because it have more types
    stack = "" //this trace tell from where the error is coming from
  ) {
    super(message),
      (this.statusCode = statusCode),
      (this.data = null),
      (this.message = message),
      (this.success = false);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
