/* Invariant module for node.js.
 *
 * All other invariant-style modules I have found are optimized for the browser
 * and will typically use `process.env.NODE_ENV === 'production'` as a hook to
 * get their minifiers to remove the expensive debug code. This makes sense for
 * frontend code where you don't need the explanations in the messages, but it
 * is really annoying for server code where you don't need to optimize that much
 * for size - it just makes debugging harder.
 *
 * The only one I found which didn't have this problem gave polluted stack
 * traces, so I just quickly wrangled this together.
 *
 * The core assert module almost works just as well, but it generates too noisy
 * errors and have a lot of extra complexity going on.
 */

const HOMEDIR = require("os").homedir();
const homeDirRegexp = new RegExp(`^${HOMEDIR}`);

function replaceHomeDirWithTilde(str) {
  return str.replace(homeDirRegexp, "~");
}

/**
 * Remove references to internal modules, and make the paths shorter.
 */
function trimStackTrace(stack) {
  // Find the first reference to an internal module in the stack trace.
  const indexOfInternal = stack.search(/\s+at( [^ ]+)? \(?internal\//);

  // The stack will not be printed with the error if there is modifications in the first line.
  const stackFirstLineBreak = stack.indexOf("\n");

  // If a reference to an internal module is found, cut the remainder of the
  // stack trace out.
  if (indexOfInternal > stackFirstLineBreak) {
    stack = stack.substr(0, indexOfInternal);
  }

  // Shorten paths in stack trace, by replacing the users homedir with ~
  stack = stack.replace(/\(([^)]+)\)/g, (match, matchedPath, offset) => {
    // If the match is in the first line of the stack, do not modify.
    if (offset < stackFirstLineBreak) {
      return match;
    }

    return `(${replaceHomeDirWithTilde(matchedPath)})`;
  });

  return stack;
}

class InvariantViolation extends Error {
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
}

module.exports = function invariant(cond, msg) {
  if (!cond) {
    throw new InvariantViolation(msg, invariant);
  }
};
