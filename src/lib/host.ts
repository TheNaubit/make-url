import type { IDomainData } from "../types.js";

// Common file extensions that are not top-level domains: "index.html" or "data.json" are paths, not domains
const FILE_EXTENSION_REGEX =
	/^(?:aspx?|[cm]?js|jsx|tsx?|css|scss|csv|gif|html?|ico|jpe?g|json|jsp|map|mp[34]|pdf|php|png|svg|txt|wasm|webp|woff2?|xml|ya?ml)$/;

/**
 * Whether a hostname (as normalized by the URL API) is a real host: a domain with a top-level domain, an IP address or localhost.
 */
function isHost(hostname: string): boolean {
	// IPv6 addresses are enclosed in brackets
	if (hostname.startsWith("[") || hostname === "localhost") return true;

	const labels = hostname.split(".");
	// A domain has at least two labels, and none of them is empty ("./page" or "../page" are relative paths)
	return (
		labels.length > 1 &&
		!labels.includes("") &&
		!FILE_EXTENSION_REGEX.test(labels[labels.length - 1] as string)
	);
}

/**
 * Detects the domain in a given string.
 *
 * @param str - The string to detect the domain from. It must contain a non-relative protocol (like http:// or https://).
 * @returns An object containing information about the domain.
 * @example
 * detectDomainInString("https://example.com/blog");
 * // => { hasDomain: true, domain: "example.com" }
 * detectDomainInString("http://example/blog");
 * // => { hasDomain: false, domain: "" }
 * detectDomainInString("http://localhost:3000/api");
 * // => { hasDomain: true, domain: "localhost:3000" }
 */
export function detectDomainInString(str: string): IDomainData {
	// "new URL(...)" throws if the string is not a valid URL
	// Not throwing does not mean it has a valid domain ("https://example/blog" does not throw), so the hostname is checked too
	try {
		const { hostname, host } = new URL(str);
		return isHost(hostname)
			? { hasDomain: true, domain: host }
			: { hasDomain: false, domain: "" };
	} catch {
		return { hasDomain: false, domain: "" };
	}
}
