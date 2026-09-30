// A UTF-16 surrogate without its pair: encodeURIComponent throws on it
const LONE_SURROGATE_REGEX =
	/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

// A percent-escape that encodeURIComponent encoded again ("%20" -> "%2520")
const DOUBLE_ENCODED_ESCAPE_REGEX = /%25([0-9A-Fa-f]{2})/g;

// The characters of an ASCII host: a domain, an IPv4 or [IPv6] address and a port
const ASCII_HOST_REGEX = /^[A-Za-z0-9.\-:[\]]*$/;

/**
 * Replaces lone UTF-16 surrogates with U+FFFD, like `String.prototype.toWellFormed`, so the string can be encoded.
 */
export function toWellFormed(value: string): string {
	return value.replace(LONE_SURROGATE_REGEX, "�");
}

/**
 * Encodes a value (a URL param value or the hash option): every reserved character is encoded.
 */
export function encodeValue(value: string): string {
	return encodeURIComponent(toWellFormed(value));
}

/**
 * Encodes a literal path segment written in a fragment. ":" is kept (it is valid in a path) and existing percent-escapes (like "%20") are not encoded again.
 */
export function encodePathSegment(segment: string): string {
	return encodeValue(segment)
		.replace(/%3A/g, ":")
		.replace(DOUBLE_ENCODED_ESCAPE_REGEX, "%$1");
}

/**
 * Encodes a fragment of a URL with an opaque protocol (like "mailto:me@example.com"): reserved characters like ":" and "@" are kept, "?" and "#" are encoded (the query and the hash are handled separately) and existing percent-escapes are not encoded again.
 */
export function encodeOpaque(fragment: string): string {
	return encodeURI(toWellFormed(fragment))
		.replace(DOUBLE_ENCODED_ESCAPE_REGEX, "%$1")
		.replace(/\?/g, "%3F")
		.replace(/#/g, "%23");
}

/**
 * Encodes the query written in a fragment ("a=1&b=2"): it is kept as written, only characters that are not valid in a query are encoded (existing percent-escapes are kept).
 */
export function encodeInlineQuery(query: string): string {
	return encodeURI(toWellFormed(query))
		.replace(DOUBLE_ENCODED_ESCAPE_REGEX, "%$1")
		.replace(/#/g, "%23");
}

/**
 * Encodes a URL hash. "/", "?", ":" and "@" are kept since they are valid in a hash (and used by client-side routers, like "#/users/1?tab"). Other reserved characters like "=" and "&" are encoded.
 *
 * @param hash - The hash, without the leading "#".
 * @param keepEscapes - Whether existing percent-escapes are kept (for a hash written in a fragment).
 */
export function encodeHash(hash: string, keepEscapes: boolean): string {
	const encoded = encodeValue(hash)
		.replace(/%2F/g, "/")
		.replace(/%3F/g, "?")
		.replace(/%3A/g, ":")
		.replace(/%40/g, "@");
	return keepEscapes
		? encoded.replace(DOUBLE_ENCODED_ESCAPE_REGEX, "%$1")
		: encoded;
}

/**
 * Encodes a domain (with an optional port) for a URL: international domains are converted to punycode (ASCII), since percent-encoding is not valid in a host.
 *
 * @param domain - The domain, with an optional port.
 * @returns The encoded domain, or null if it is not a valid domain.
 * @example
 * encodeDomain("münchen.de:8080");
 * // => "xn--mnchen-3ya.de:8080"
 */
export function encodeDomain(domain: string): string | null {
	// Credentials ("user:password@") are percent-encoded (existing escapes are kept)
	const atIndex = domain.lastIndexOf("@");
	const credentials =
		atIndex === -1
			? ""
			: `${domain.slice(0, atIndex).split(":").map(encodePathSegment).join(":")}@`;
	const host = domain.slice(atIndex + 1);

	// ASCII hosts are kept as they are (including their case), international ones are converted to punycode
	if (ASCII_HOST_REGEX.test(host)) return `${credentials}${host}`;

	try {
		return `${credentials}${new URL(`https://${toWellFormed(host)}`).host}`;
	} catch {
		return null;
	}
}
