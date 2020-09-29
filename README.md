# Invariant module for node.js

All other invariant-style modules I have found are optimized for the browser and
will typically use `process.env.NODE_ENV === 'production'` as a hook to get
their minifiers to remove the expensive debug code. This makes sense for
frontend code where you don't need the explanations in the messages, but it is
really annoying for server code where you don't need to optimize that much for
size - it just makes debugging harder.

The only one I found which didn't have this problem gave polluted stack traces,
so I just quickly wrangled this together.

## Why not just assert?

The core assert module almost works just as well, but it generates too noisy
errors and have a lot of extra complexity going on.

The reason you would use a module like this is not for errors facing the caller
of your web application or REST API, it's for other developers, or poor
OPS-people trying to get your application to run.

If you have required secrets that must be passed in as environemnt variables,
you could use this module:

```js
// filename: config.js

const invariant = require('@gustavnikolaj/node-invariant');

invariant(
    typeof process.env.DB_PASS === 'string' && process.env.DB_PASS.length,
    'Missing environment variable DB_PASS'
);

module.exports = {
  database: {
    // ...
    password: process.env.DATABASE_PASSWORD
  }
};
```

If the person trying to start your application forgot passing in the `DB_PASS`
variable, they will now get a nice error:

```
InvariantViolation: Missing environment variable DB_PASS
    at Object.<anonymous> (~/Projects/my-app/start-server.js:1:14)
```

The same error but with assert would look like this:

```
AssertionError [ERR_ASSERTION]: Missing environment variable DB_PASS
    at Object.<anonymous> (/Users/John/Projects/my-app/start-server.js:1:14)
    at Module._compile (internal/modules/cjs/loader.js:1137:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)
    at Module.load (internal/modules/cjs/loader.js:985:32)
    at Function.Module._load (internal/modules/cjs/loader.js:878:14)
    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: false,
  expected: true,
  operator: '=='
}
```

