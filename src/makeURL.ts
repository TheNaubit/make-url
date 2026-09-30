import {
	BASE_DEFAULT_MAKE_URL_CONFIG,
	getMakeURLDefaultConfig,
	mergeConfig,
	setMakeURLDefaultConfig,
} from "./config.js";
import { assembleURL } from "./lib/assemble.js";
import { encodeDomain, encodeHash, encodeOpaque } from "./lib/encode.js";
import { detectDomainInString } from "./lib/host.js";
import {
	buildPathParamsRegex,
	encodePathSegmentWithParams,
} from "./lib/path-params.js";
import { buildQuery, serializeValue } from "./lib/query.js";
import type { IConfig, TMakeURLConfig } from "./types.js";

export {
	BASE_DEFAULT_MAKE_URL_CONFIG,
	getMakeURLDefaultConfig,
	setMakeURLDefaultConfig,
};

/** The optional last argument of `makeURL`. */
export interface MakeURLOptions {
	// Replaced in the path as `:<key>`, or added to the query
	params?: Record<string, unknown> | undefined;
	hash?: string | undefined;
	config?: TMakeURLConfig | undefined;
}

/** The arguments of `makeURL`: string fragments (at least one, checked at runtime), optionally followed by the options object. */
export type MakeURLArgs =
	| Array<string>
	| [...Array<string>, MakeURLOptions | undefined];

// Protocols without "//" (the rest of the URL is kept as it is)
const OPAQUE_PROTOCOL_REGEX = /^(?:mailto|tel|sms|urn|data):/i;

// Two or more slashes, except the ones after a ":" (like a URL inside the path: "redirect/https://example.com")
const EMPTY_PATH_SEGMENTS_REGEX = /(?<!:)\/{2,}/g;

interface IParsedArgs {
	fragments: Array<string>;
	options: MakeURLOptions;
}

interface IInlineParts {
	fragments: Array<string>;
	query: string;
	hash: string;
}

function parseArgs(args: ReadonlyArray<unknown>): IParsedArgs {
	if (args.length === 0 || typeof args[0] !== "string") {
		throw new Error("makeURL must receive at least one string item");
	}

	const lastArg = args[args.length - 1];
	const hasOptions = typeof lastArg !== "string";
	const fragmentArgs = hasOptions ? args.slice(0, -1) : args;

	if (fragmentArgs.some((arg) => typeof arg !== "string")) {
		throw new Error("Params config object argument must be the last argument");
	}

	const fragments = (fragmentArgs as Array<string>).map((fragment, index) => {
		// Whitespace around the whole URL is never wanted
		const trimmedStart = index === 0 ? fragment.trimStart() : fragment;
		return index === fragmentArgs.length - 1
			? trimmedStart.trimEnd()
			: trimmedStart;
	});

	return {
		fragments,
		options: hasOptions && lastArg ? (lastArg as MakeURLOptions) : {},
	};
}

// A query ("?a=1") or a hash ("#top") can only be written in the last non-empty fragment
function splitInlineQueryAndHash(fragments: Array<string>): IInlineParts {
	const lastIndex = fragments.findLastIndex(
		(fragment) => fragment.trim() !== "",
	);
	if (lastIndex === -1) return { fragments, query: "", hash: "" };

	const last = fragments[lastIndex] as string;
	const hashIndex = last.indexOf("#");
	const beforeHash = hashIndex === -1 ? last : last.slice(0, hashIndex);
	const queryIndex = beforeHash.indexOf("?");

	return {
		fragments: [
			...fragments.slice(0, lastIndex),
			queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex),
			...fragments.slice(lastIndex + 1),
		],
		query: queryIndex === -1 ? "" : beforeHash.slice(queryIndex + 1),
		hash: hashIndex === -1 ? "" : last.slice(hashIndex + 1),
	};
}

function resolveProtocol(
	detectedProtocol: string,
	hasDomain: boolean,
	forceProtocol: IConfig["forceProtocol"],
): string {
	if (detectedProtocol !== "") return detectedProtocol;

	switch (forceProtocol) {
		case "none":
			return "";
		case "auto":
			return hasDomain ? "https://" : "";
		case "auto-insecure":
			return hasDomain ? "http://" : "";
		default:
			return `${forceProtocol}://`;
	}
}

function applyTrailingSlash(
	url: string,
	trailingSlash: IConfig["trailingSlash"],
): string {
	if (trailingSlash === "add") {
		return url.endsWith("/") ? url : `${url}/`;
	}
	// The root path ("/") and a protocol alone ("https://") keep their slashes
	if (url.endsWith("/") && url !== "/" && !url.endsWith("://")) {
		return url.slice(0, -1);
	}
	return url;
}

function buildHash(optionHash: unknown, inlineHash: string): string {
	// A leading "#" is ignored, since it is added anyway
	const hash = String(optionHash ?? "")
		.trim()
		.replace(/^#/, "");

	if (hash !== "") return `#${encodeHash(hash, false)}`;
	return inlineHash !== "" ? `#${encodeHash(inlineHash, true)}` : "";
}

// A URL with an opaque protocol ("mailto:", "tel:") without query and hash
function buildOpaqueURL(
	fragments: Array<string>,
	config: IConfig,
	encodeFragment: (fragment: string) => string,
): string {
	const joined = fragments.map(encodeFragment).join("/");
	return config.allowEmptyPathSegments
		? joined
		: joined.replace(EMPTY_PATH_SEGMENTS_REGEX, "/");
}

// The URL without query and hash: protocol, host and path
function buildBaseURL(
	fragments: Array<string>,
	config: IConfig,
	encodeFragment: (fragment: string) => string,
): string {
	const assembled = assembleURL(
		config.allowEmptyPathSegments
			? fragments
			: fragments.filter((fragment) => fragment.trim() !== ""),
	);
	const hasHost = assembled.host !== "";

	// The slash right after the host is the separator: "https://example.com/" and "test" give "https://example.com/test"
	const [firstPathFragment = "", ...otherPathFragments] = assembled.path;
	const pathFragments =
		hasHost && firstPathFragment.startsWith("/")
			? [firstPathFragment.slice(1), ...otherPathFragments].filter(
					(fragment, index) => index > 0 || fragment !== "",
				)
			: assembled.path;

	const protocol = resolveProtocol(
		assembled.protocol,
		hasHost,
		config.forceProtocol,
	);
	const host = hasHost
		? (encodeDomain(assembled.host) ?? encodeFragment(assembled.host))
		: "";

	const joinedPath = pathFragments.map(encodeFragment).join("/");
	const collapsedPath = joinedPath.replace(EMPTY_PATH_SEGMENTS_REGEX, "/");
	// Without empty path segments, the slashes between the host and the path are collapsed too
	const path = config.allowEmptyPathSegments
		? joinedPath
		: hasHost
			? collapsedPath.replace(/^\/+/, "")
			: collapsedPath;

	// Without a host, a protocol is followed by the path directly (a forced protocol on "/blog" gives "http://blog")
	const joined = hasHost
		? `${protocol}${host}${path === "" ? "" : `/${path}`}`
		: `${protocol}${protocol === "" ? path : path.replace(/^\/+/, protocol.toLowerCase() === "file://" ? "/" : "")}`;

	return applyTrailingSlash(joined, config.trailingSlash);
}

/**
 * Generates a URL based on the provided fragments and options.
 *
 * @param args - Any number of string fragments, optionally followed by an options object (`params`, `hash` and `config`).
 * @returns The generated URL.
 * @throws If the first argument is not a string or if the options object is not the last argument.
 * @throws If the generated URL is not a valid complete URL (meaning it contains a domain, something like https://example.com/path) and the strict mode is enabled.
 * @example
 * makeURL("example.com", "path", "to", "file") // "https://example.com/path/to/file"
 * makeURL("example.com", "users/:id", { params: { id: 1, tab: "posts" } }) // "https://example.com/users/1?tab=posts"
 * makeURL("https://example.com", "docs", { hash: "install" }) // "https://example.com/docs#install"
 */
export default function makeURL(...args: MakeURLArgs): string {
	const { fragments, options } = parseArgs(args);
	const config = mergeConfig(getMakeURLDefaultConfig(), options.config);
	const inline = splitInlineQueryAndHash(fragments);

	const params = Object.entries(
		typeof options.params === "object" && options.params !== null
			? options.params
			: {},
	);

	// Only scalar values can be used in the path (arrays always go to the query)
	const pathParamValues = new Map(
		params.flatMap(([key, value]): Array<[string, string]> => {
			const serialized = Array.isArray(value) ? null : serializeValue(value);
			return serialized === null ? [] : [[key, serialized]];
		}),
	);
	const pathParamsRegex = buildPathParamsRegex([...pathParamValues.keys()]);
	const replacedKeys = new Set<string>();

	const encodeFragment = (fragment: string): string =>
		fragment
			.split("/")
			.map((segment) =>
				encodePathSegmentWithParams(
					segment,
					pathParamValues,
					pathParamsRegex,
					(key) => replacedKeys.add(key),
				),
			)
			.join("/");

	const url = OPAQUE_PROTOCOL_REGEX.test(inline.fragments[0] ?? "")
		? // Like "mailto:me@example.com": no host and no protocol to add
			buildOpaqueURL(inline.fragments, config, (fragment) =>
				encodePathSegmentWithParams(
					fragment,
					pathParamValues,
					pathParamsRegex,
					(key) => replacedKeys.add(key),
					encodeOpaque,
				),
			)
		: buildBaseURL(inline.fragments, config, encodeFragment);

	const query = buildQuery(
		inline.query,
		params.filter(([key]) => !replacedKeys.has(key)),
		config.arraySerializer,
	);
	const fullURL = `${url}${query === "" ? "" : `?${query}`}${buildHash(options.hash, inline.hash)}`;

	// In strict mode the URL must be a complete URL with a valid domain
	if (config.strict && !detectDomainInString(fullURL).hasDomain) {
		throw new Error(`The generated URL is not valid: ${fullURL}`);
	}

	return fullURL;
}
