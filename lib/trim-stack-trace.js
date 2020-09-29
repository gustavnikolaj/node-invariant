const HOMEDIR = require("os").homedir();
const homeDirRegexp = new RegExp(`^${HOMEDIR}`);

function replaceHomeDirWithTilde(str) {
  return str.replace(homeDirRegexp, "~");
}

/**
 * Remove references to internal modules, and make the paths shorter.
 */
module.exports = function trimStackTrace(stack) {
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
};
