const expect = require("unexpected");
const invariant = require("../lib/invariant");

describe("invariant", () => {
  it("should be a function", () => {
    expect(invariant, "to be a function");
  });
});
