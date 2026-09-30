import { encodePathSegment, encodeValue } from "./encode.js";

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds the regular expression that finds the `:<key>` URL params of a path.
 * Longer keys are tried first and a key must not be followed by a letter, a digit or "_", so ":id" does not match the start of ":identifier".
 *
 * @param keys - The keys of the params that can be replaced in the path.
 * @returns The regular expression, or null when there is no key.
 */
export function buildPathParamsRegex(keys: Array<string>): RegExp | null {
	const alternatives = keys
		.filter((key) => key !== "")
		.sort((a, b) => b.length - a.length)
		.map(escapeRegExp);

	if (alternatives.length === 0) return null;

	return new RegExp(`:(${alternatives.join("|")})(?![\\p{L}\\p{N}_])`, "gu");
}

/**
 * Encodes a path segment and replaces its `:<key>` URL params with their encoded values.
 * The literal parts are encoded as path segments, and the values are fully encoded (a "/" in a value is encoded as "%2F").
 *
 * @param segment - The raw path segment (without "/").
 * @param values - The values of the params that can be replaced.
 * @param regex - The regular expression built with `buildPathParamsRegex`.
 * @param onReplace - Called with the key of each replaced param.
 * @param encodeLiteral - How the literal parts are encoded.
 * @returns The encoded segment.
 */
export function encodePathSegmentWithParams(
	segment: string,
	values: ReadonlyMap<string, string>,
	regex: RegExp | null,
	onReplace: (key: string) => void,
	encodeLiteral: (text: string) => string = encodePathSegment,
): string {
	if (regex === null) return encodeLiteral(segment);

	let encoded = "";
	let lastIndex = 0;

	for (const match of segment.matchAll(regex)) {
		const key = match[1] as string;
		encoded += encodeLiteral(segment.slice(lastIndex, match.index));
		encoded += encodeValue(values.get(key) ?? "");
		lastIndex = match.index + match[0].length;
		onReplace(key);
	}

	return encoded + encodeLiteral(segment.slice(lastIndex));
}
