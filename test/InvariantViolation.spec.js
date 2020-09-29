const expect = require("unexpected");
const InvariantViolation = require("../lib/InvariantViolation");

describe("InvariantViolation", () => {
  it("it should be an error", () => {
    expect(new InvariantViolation(), "to be an", Error);
  });

  it("should serialize without [Error] annotation", () => {
    expect(
      new InvariantViolation("foo").stack,
      "to match",
      /^InvariantViolation: foo\n/
    );
  });
});
