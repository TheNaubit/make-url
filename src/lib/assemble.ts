import { detectDomainInString } from "./host.js";

export interface IAssembledURL {
	// "https://", "//" (relative protocol) or "" (no protocol)
	protocol: string;
	// The raw host, with its credentials and port, or "" when the URL has no host
	host: string;
	// The raw path fragments (a fragment can contain several "/"-separated segments)
	path: Array<string>;
}

// A protocol followed by "//" ("https://", "wss://", "myapp://") or a relative protocol ("//")
const PROTOCOL_REGEX = /^(?:([a-z][a-z0-9+.-]*):)?\/\//i;

// Only these protocols can be split across fragments ("https:" + "//example.com"): any other protocol must be written in a single fragment, so "redirect" + "https://other.com" is not the protocol "redirecthttps"
const SPLITTABLE_PROTOCOL_REGEX = /^(?:https?|wss?|ftp)$/i;

// A fragment that continues an incomplete host: top-level domain labels (".com", ".co.uk") and/or a port (":8080")
const HOST_CONTINUATION_REGEX =
	/^(?:(?:\.(?:[a-z]{2,63}|xn--[a-z0-9-]+))+(?::\d+)?|:\d+)(?=$|[/?#])/i;

/**
 * Splits the first `length` characters of the joined fragments from the rest.
 *
 * @returns The rest of the fragments (the remainder of a partially consumed fragment first) and how many non-empty fragments were consumed.
 */
function consume(
	fragments: Array<string>,
	length: number,
): { rest: Array<string>; consumed: number } {
	let remaining = length;
	let index = 0;
	let consumed = 0;

	while (remaining > 0 && index < fragments.length) {
		const fragment = fragments[index] as string;
		if (fragment.length > remaining) {
			return {
				rest: [fragment.slice(remaining), ...fragments.slice(index + 1)],
				consumed: consumed + 1,
			};
		}
		remaining -= fragment.length;
		consumed += fragment.length > 0 ? 1 : 0;
		index += 1;
	}

	return { rest: fragments.slice(index), consumed };
}

function takeProtocol(fragments: Array<string>): {
	protocol: string;
	rest: Array<string>;
} {
	const match = PROTOCOL_REGEX.exec(fragments.join(""));
	if (!match) return { protocol: "", rest: fragments };

	const { rest, consumed } = consume(fragments, match[0].length);
	const scheme = match[1];

	// A relative protocol ("//") can not be split either: "/" + "/evil.com" is a path, not a link to evil.com
	if (consumed > 1 && !(scheme && SPLITTABLE_PROTOCOL_REGEX.test(scheme))) {
		return { protocol: "", rest: fragments };
	}

	return { protocol: match[0], rest };
}

function isValidHost(host: string): boolean {
	return host !== "" && detectDomainInString(`https://${host}`).hasDomain;
}

/**
 * Finds the protocol, the host and the path of the URL described by the fragments. The protocol and the host can be split across fragments ("htt", "ps://example", ".com").
 *
 * @param fragments - The fragments, after removing the empty ones if needed.
 * @returns The raw protocol, host and path fragments.
 * @example
 * assembleURL(["https:", "//example", ".com", "blog"]);
 * // => { protocol: "https://", host: "example.com", path: ["blog"] }
 * assembleURL(["/blog", "post"]);
 * // => { protocol: "", host: "", path: ["/blog", "post"] }
 */
export function assembleURL(fragments: Array<string>): IAssembledURL {
	const { protocol, rest } = takeProtocol(fragments);
	const first = rest[0] ?? "";

	// Empty fragments before a host are ignored ("" + "example.com" with allowEmptyPathSegments)
	const firstNonEmpty = rest.findIndex((fragment) => fragment !== "");
	if (protocol === "" && firstNonEmpty > 0) {
		const withoutLeadingEmpty = assembleURL(rest.slice(firstNonEmpty));
		if (withoutLeadingEmpty.host !== "") return withoutLeadingEmpty;
	}

	// "file:///path" has an empty host
	if (/^file:\/\/$/i.test(protocol)) {
		return { protocol, host: "", path: rest };
	}

	// Without a protocol, a path ("/blog", "./blog", "../blog") never starts with a host
	const noHost: IAssembledURL =
		protocol === "//"
			? // A relative protocol without a host is a path
				{ protocol: "", host: "", path: fragments }
			: { protocol, host: "", path: rest };
	if (protocol === "" && /^[./]/.test(first)) return noHost;

	// After a protocol, extra slashes are ignored ("https:///example.com")
	const source = protocol === "" ? first : first.replace(/^\/+/, "");
	const hostEnd = source.search(/[/?#]/);
	// Whitespace is never part of a host
	let host = (hostEnd === -1 ? source : source.slice(0, hostEnd)).trim();
	let tail = hostEnd === -1 ? "" : source.slice(hostEnd);
	let nextIndex = 1;

	// Glue the fragments that continue the host (".com", ":8080"), skipping the empty fragments between them
	while (tail === "") {
		let candidate = nextIndex;
		while (rest[candidate] === "") candidate += 1;
		const continuation = HOST_CONTINUATION_REGEX.exec(rest[candidate] ?? "");
		if (!continuation) break;

		// A complete host only takes a port (and only if it stays valid): ".env" or ".well-known" after "example.com" are paths
		if (
			isValidHost(host) &&
			!(continuation[0].startsWith(":") && isValidHost(host + continuation[0]))
		) {
			break;
		}

		host += continuation[0];
		tail = (rest[candidate] as string).slice(continuation[0].length);
		nextIndex = candidate + 1;
	}

	if (!isValidHost(host)) return noHost;

	return {
		protocol,
		host,
		path: [...(tail === "" ? [] : [tail]), ...rest.slice(nextIndex)],
	};
}
