const trimStackTrace = require("./trim-stack-trace");

module.exports = class InvariantViolation extends Error {
  constructor(message, stackStartFn) {
    super(message);

    // If we don't explicitly set the name, we get the default name of
    // `${this.constructor.name} [Error]` which shows in error output as:
    //
    // ```
    // InvariantViolation [Error]: My invariant message.
    // ```
    //
    // When explicitly setting the name, it removes the suffix yielding this
    // output instead:
    //
    // ```
    // InvariantViolation: My invariant message.
    // ```
    this.name = this.constructor.name;

    Error.captureStackTrace(this, stackStartFn);
    this.stack = trimStackTrace(this.stack);
  }
};
