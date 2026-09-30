// Type-level checks (run by `npm run typecheck`)
import { type MakeURLOptions, makeURL } from "./index.js";

const parts: Array<string> = ["example.com", "users"];
const maybeOptions: MakeURLOptions | undefined = undefined;

// Spreading an array of fragments works
makeURL(...parts);
makeURL(...parts, { params: { id: 1 } });
// The options can be undefined
makeURL("example.com", maybeOptions);
// Options fields can be explicitly undefined
makeURL("example.com", {
	hash: undefined,
	params: undefined,
	config: { strict: undefined },
});

// @ts-expect-error: the options object must be the last argument
makeURL("example.com", { params: {} }, "users");
