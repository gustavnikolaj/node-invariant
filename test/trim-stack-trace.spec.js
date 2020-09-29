const expect = require("unexpected");
const trimStackTrace = require("../lib/trim-stack-trace");

describe("trim-stack-trace", () => {
  it("should be a function", () => {
    expect(trimStackTrace, "to be a function");
  });

  it("should remove all internal module references from a stacktrace", () => {
    const stack = [
      "Error: foo",
      "    at Object.<anonymous> (/.../invariant/test.js:3:7)",
      "    at Module._compile (internal/modules/cjs/loader.js:1137:30)",
      "    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)",
      "    at Module.load (internal/modules/cjs/loader.js:985:32)",
      "    at Function.Module._load (internal/modules/cjs/loader.js:878:14)",
      "    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)",
      "    at internal/main/run_main_module.js:17:47",
    ].join("\n");

    expect(trimStackTrace(stack), "not to match", /internal/);
  });


  it("should not remove things seemling like internal module references from the message", () => {
    const stack =
      "Error: foo at internal/foo\n    at Object.<anonymous> (/.../invariant/test.js:3:7)";

    expect(
      trimStackTrace(stack),
      "to equal",
      "Error: foo at internal/foo\n    at Object.<anonymous> (/.../invariant/test.js:3:7)"
    );
  });

  it("should use ~ in paths under $HOMEDIR", () => {
    const HOMEDIR = require("os").homedir();
    const stack = [
      "Error: foo",
      `    at foo (${HOMEDIR}/foo.js:1:1)`,
      "    at Module._compile (internal/modules/cjs/loader.js:1137:30)",
      "    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)",
      "    at Module.load (internal/modules/cjs/loader.js:985:32)",
      "    at Function.Module._load (internal/modules/cjs/loader.js:878:14)",
      "    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)",
      "    at internal/main/run_main_module.js:17:47",
    ].join("\n");

    expect(
      trimStackTrace(stack),
      "to equal",
      "Error: foo\n    at foo (~/foo.js:1:1)"
    );
  });

  it("should use ~ in paths under $HOMEDIR, but not if it's in the message", () => {
    const HOMEDIR = require("os").homedir();

    expect(
      trimStackTrace(
        `Error: foo (${HOMEDIR}/foo.js)\n    at foo (${HOMEDIR}/foo.js:1:1)`
      ),
      "to equal",
      `Error: foo (${HOMEDIR}/foo.js)\n    at foo (~/foo.js:1:1)`
    );
  });
});
