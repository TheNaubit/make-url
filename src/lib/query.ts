import type { TArraySerializer } from "../types.js";

/**
 * Converts a param value to a string. `undefined` and `null` mean "no value" and return null.
 *
 * @example
 * serializeValue(new Date(0)); // => "1970-01-01T00:00:00.000Z"
 * serializeValue({ a: 1 }); // => '{"a":1}'
 */
export function serializeValue(value: unknown): string | null {
	if (value === undefined || value === null) return null;
	if (typeof value === "string") return value;
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? String(value) : value.toISOString();
	}
	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			// Circular structures can not be serialized as JSON
			return String(value);
		}
	}
	// Numbers, bigints, booleans, symbols and functions
	return String(value);
}

/**
 * Serializes an array param with the given serializer.
 *
 * @returns The values to add for the key: one per item for "repeat", a single value for "comma" and "stringify".
 */
export function serializeArray(
	array: ReadonlyArray<unknown>,
	serializer: TArraySerializer,
): Array<string> {
	if (serializer === "stringify") {
		return [serializeValue(array) ?? ""];
	}

	const items = array
		.map(serializeValue)
		.filter((item): item is string => item !== null);

	return serializer === "comma" ? [items.join(",")] : items;
}

/**
 * Builds the query string of the URL.
 *
 * @param inlineQuery - The query written in the fragments (like "?page=2"), without the "?". It comes first.
 * @param params - The params that were not replaced in the path.
 * @param serializer - How arrays are serialized.
 * @returns The query string, without the "?".
 */
export function buildQuery(
	inlineQuery: string,
	params: ReadonlyArray<[string, unknown]>,
	serializer: TArraySerializer,
): string {
	const searchParams = new URLSearchParams(inlineQuery);

	for (const [key, value] of params) {
		const values = Array.isArray(value)
			? serializeArray(value, serializer)
			: [serializeValue(value)].filter((item): item is string => item !== null);

		for (const item of values) {
			searchParams.append(key, item);
		}
	}

	return searchParams.toString();
}
