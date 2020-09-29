const expect = require("unexpected");
const invariant = require("../lib/invariant");

describe("invariant", () => {
  it("should be a function", () => {
    expect(invariant, "to be a function");
  });

  it("should throw an error if the condition is not true", () => {
    expect(() => invariant(false, "Not true"), "to throw", "Not true");
  });

  it("should not when the condition is true", () => {
    invariant(true, "Should not have thrown.");
  });

  it("should not when the condition is true-ish", () => {
    invariant("true", "Should not have thrown.");
  });

  it("should not include the invariant function itself in the stacktrace", function wellKnownTestCaseName() {
    let stack = null;
    try {
      invariant(false, "My invariant message.");
    } catch (e) {
      stack = e.stack;
    }

    // We assert that the name of the function containing this assertion is the
    // first line of the stack.
    expect(
      stack,
      "to start with",
      "InvariantViolation: My invariant message.\n" +
        "    at Context.wellKnownTestCaseName ("
    );
  });

  it("should trim internal modules", () => {
    function parseStack(stack) {
      const firstLineBreak = stack.indexOf("\n");

      return stack
        .substr(firstLineBreak + 1)
        .split("\n")
        .map((frame) => {
          let m = frame.match(/^ {4}at ([^ ]+)? ?\((.+):(\d+):(\d+)\)$/);
          if (m) {
            return { name: m[1], path: m[2], frame: m[3], column: m[4] };
          }
          m = frame.match(/^ {4}at ([^:]+):(\d+):(\d+)$/);
          if (!m) throw new Error(`Unparsable stacktrace: ${frame}`);
          return { name: null, path: m[1], line: m[2], column: m[3] };
        });
    }

    const unmodifiedStack = new Error().stack;
    let invariantStack = null;
    try {
      invariant(false, "My invariant message.");
    } catch (e) {
      invariantStack = e.stack;
    }

    const getInternalStackFrames = (stack) =>
      parseStack(stack).filter((frame) => /^internal/.test(frame.path));

    // Verify that a normal error would have an internal module in the stack
    // frame, otherwise, this test is not really worth anything.
    expect(getInternalStackFrames(unmodifiedStack), "to satisfy", [
      { path: "internal/timers.js" },
    ]);

    expect(getInternalStackFrames(invariantStack), "to equal", []);
  });
});
