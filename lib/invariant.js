const InvariantViolation = require("./InvariantViolation");

module.exports = function invariant(cond, msg) {
  if (!cond) {
    throw new InvariantViolation(msg, invariant);
  }
};
