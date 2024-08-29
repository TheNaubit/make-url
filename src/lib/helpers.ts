import type {
	IConfig,
	IDomainData,
	IProtocolData,
	IURLArrayData,
} from "../types";

/**
 * Detects the domain in a given string.
 *
 * @param str - The string to detect the domain from. Important: To detect a valid domain, the URL must contain a non-relative protocol (http:// or https://).
 * @returns An object containing information about the domain.
 * @example
 * detectDomainInString("https://example.com/blog");
 * // => { hasDomain: true, domain: "example.com" }
 * detectDomainInString("http://example/blog");
 * // => { hasDomain: false, domain: "" }
 */
export function detectDomainInString(str: string): IDomainData {
	// We will use "new URL(...)" to detect it
	// If it throws an error, it means the string is not a valid URL, so probably it doesn't have a domain
	try {
		const url = new URL(str);

		// But not throwing in the constructor does not mean it has a valid domain. For example: "https://example/blog" does not throw

		// So we will check if the hostname has at least one dot and then we have greater confidence that it is a domain
		if (url.hostname.split(".").length < 2) {
			throw null; // We throw an error to be catched in the catch block
		}

		const hasPort = url.port.trim() !== "";

		return {
			hasDomain: true,
			domain: hasPort ? `${url.hostname}:${url.port}` : url.hostname,
		};
	} catch {
		return {
			hasDomain: false,
			domain: "",
		};
	}
}

/**
 * Detects the protocol in a given string.
 * @param str - The string to detect the protocol from.
 * @returns An object containing information about the protocol detection.
 * @example
 * detectProtocolInString("https://example.com/blog");
 * // => { hasProtocol: true, protocol: "https" }
 * detectProtocolInString("example.com/blog");
 * // => { hasProtocol: false, protocol: "none" }
 * detectProtocolInString("//example.com/blog");
 * // => { hasProtocol: true, protocol: "relative" }
 * detectProtocolInString("//example/blog");
 * // => { hasProtocol: false, protocol: "relative" }
 */
export function detectProtocolInString(str: string): IProtocolData {
	const cleanedStr = str.trim().toLowerCase();

	if (cleanedStr.startsWith("//")) {
		const urlToCheck = `https:${cleanedStr}`; // Since the domain detector function only works with URLs with a protocol, we add a fake non-relative protocol to the string
		const detectDomainData = detectDomainInString(urlToCheck);
		return {
			hasProtocol: detectDomainData.hasDomain, // Even if it contains a valid relative protocol string, we can not count it as valid since it does not contain a valid domain
			protocol: "relative", // It contains a valid protocol
		};
	}

	// Regex that checks if the str starts with http or https
	const hasProtocol = /^(http|https):\/\//.test(cleanedStr);
	return {
		hasProtocol,
		protocol: hasProtocol
			? (cleanedStr.split("://")[0] as "http" | "https")
			: "none",
	};
}

/**
 * Generates a temporary URL string by merging an array of fragments.
 * This generated URL is not safe and should only be used for detecting the domain.
 * Important: This should only be used when we need to detect stuff in the URL like in the `detectDomainInString` function. It should NEVER be used to generate a valid URL. For that you should use the `safeStringArrayToURLString` function.
 *
 * @param array - An array of string fragments to be merged.
 * @param hasProtocol - A boolean indicating whether the array has a protocol.
 * @returns The merged URL string.
 * @example
 * getUnsafeMergedURLString(["https://", "example.com", "blog"], true);
 * // => "https://example.com/blog"
 */
function getUnsafeMergedURLString(
	array: Array<string>,
	hasProtocol: boolean,
): string {
	// We need to generate a temporary URL to detect the domain
	// This generated URL is not really safe, meaning it could contain
	// unescaped character, wrong protocols, etc. But we don't care about that, since we only need it to detect the domain
	// Just, don't use it for anything else
	return (
		array
			// If the array has a protocol, we skip the first fragment
			.slice(hasProtocol ? 1 : 0)
			// We filter out empty fragments, keep in mind this is only for detecting the domain, so we don't care about empty fragments
			.filter((v) => v.trim() !== "")
			// We could join using the `.join`method, but we need more control
			// over how to join, so we use the `.map` method
			.map((v, index) => {
				// If it is the first item or if it contains a dot (potentially a part of the domain), we don't join with "/"
				// We also make sure to support the : character, since it could be part of the domain (the port)
				// TODO: Support fragmented strings with the port splitted like:
				/*
				const url = makeURL(
					"https://example.com:",
					"12345",
					"path",
					"to",
					"resource",
				);
				*/
				// Right now it supports ports like:
				/*
				const url = makeURL(
					"https://example.com",
					":12345",
					"path",
					"to",
					"resource",
				);
				*/
				// and
				/*
				const url = makeURL("https://example.com:12345", "path", "to", "resource");
				*/
				if (index === 0 || v.startsWith(".") || v.includes(":")) return v;
				// Anything else is joined with "/"
				// biome-ignore lint/style/noUselessElse: We need the else statement to return the value
				else return `/${v}`;
			})
			// Previously I said "join", but it was more like modifying the fragment so we could just concatenate the array without any separator
			.join("")
	);
}

/**
 * Extracts the protocol from an array of fragments based on the given protocol index.
 *
 * @param array - The array of fragments.
 * @param protocolIndex - The index at which the protocol ends.
 * @returns An array of fragments containing the extracted protocol.
 * @example
 * extractProtocolFromArray(["https://", "example", "", ".com", "blog"], 8);
 * // => ["https://", "example.com", "blog"]
 */
function extractProtocolFromArray(
	array: Array<string>,
	protocolIndex: number,
): Array<string> {
	let currentLength = 0;
	let protocolFragment = "";
	const returnedFragments: Array<string> = [];

	for (const fragment of array) {
		// If the fragment is empty and there are already fragments in the returned fragments, we add the fragment to the returned fragments
		// If there are no fragments in the returned fragments, we skip it
		// since it could break our logic to handle the protocol and in any case it would be an empty fragment
		if (fragment === "" && returnedFragments.length > 0) {
			returnedFragments.push(fragment);
			continue;
		}
		// If the current length plus the length of the fragment is less than the protocol index, we add the fragment to the protocol fragment
		if (currentLength + fragment.length <= protocolIndex) {
			protocolFragment += fragment;
			currentLength += fragment.length;
			// If the current length is greater than the protocol index, we add the fragment to the returned fragments
		} else if (currentLength < protocolIndex) {
			const sliceIndex = protocolIndex - currentLength;
			protocolFragment += fragment.slice(0, sliceIndex);

			if (sliceIndex < fragment.length) {
				returnedFragments.push(protocolFragment);
				protocolFragment = "";
				returnedFragments.push(fragment.slice(sliceIndex));
			}

			currentLength += sliceIndex;
			// If the current length is equal to the protocol index, we add the fragment to the returned fragments
		} else {
			if (protocolFragment !== "") {
				returnedFragments.push(protocolFragment);
				protocolFragment = "";
			}
			returnedFragments.push(fragment);
		}
	}

	if (protocolFragment !== "") {
		returnedFragments.push(protocolFragment);
		protocolFragment = "";
	}

	return returnedFragments;
}

/**
 * Extracts the domain from an array of URL fragments.
 * Important: The array entered must come from the extractProtocolFromArray function or the safeStringArrayAssembler function.
 *
 * @param array - The array of URL fragments.
 * @param hasProtocolExtracted - A boolean indicating whether the protocol has been extracted from the URL.
 * @returns An array of URL fragments with the domain extracted.
 * @example
 * extractDomainFromArray(["https://", "example", "", ".com", "blog"], true);
 * // => ["https://", "example.com", "blog"]
 * extractDomainFromArray(["example", "", ".com", "blog"], true);
 * // => ["example.com", "blog"]
 */
function extractDomainFromArray(
	array: Array<string>,
	hasProtocolExtracted: boolean,
): Array<string> {
	// We need to generate a temporary URL to detect the domain
	// This generated URL is not really safe, meaning it could contain
	// unescaped character, wrong protocols, etc. But we don't care about that, since we only need it to detect the domain
	// Just, don't use it for anything else
	const tempURL = getUnsafeMergedURLString(array, hasProtocolExtracted);

	// Resulting URL has no protocol (we removed it if it was there to remove the case of relative protocols, incompatible with the `detectDomainInString` function)
	// But the `detectDomainInString` function needs an input URL with a protocol, so we add a fake one
	const domainData = detectDomainInString(`https://${tempURL}`);
	console.log({ domainData });

	// If the URL does not contain a domain, there is nothing to "extract"/"sort", so we return the array as is
	if (!domainData.hasDomain) return array;

	// if it contains a domain, we find the index position of the last character of the domain
	const domainIndex =
		tempURL.indexOf(domainData.domain) + domainData.domain.length;

	// We need to create an array with the domain fragments but without the protocol (if it has one)
	const safeArray = array.slice(hasProtocolExtracted ? 1 : 0);

	let domainFragment = "";
	let currentLength = 0;

	// This will be the array of fragments we will return
	let returnedFragments: Array<string> = [];

	for (const fragment of safeArray) {
		// We will filter out empty strings
		if (fragment === "") {
			// We need to check first if the current length is greater or equal than the domain index, because that means we already found the full domain in the array
			if (currentLength >= domainIndex) {
				// If the returnedFragments has some item, that means we already found the domain and we already saved it, so we can just push the empty fragment into the array
				if (returnedFragments.length > 0) {
					returnedFragments.push(fragment);
				} else {
					// If the returnedFragments is empty, that means we haven't saved the domain yet into the array
					// But since we already found it, we can just push it to the array
					returnedFragments.push(domainFragment);
					domainFragment = "";
					// And then we can push the empty fragment into the array
					returnedFragments.push(fragment);
				}
			}
			continue;
		}

		// If the current length plus the length of the fragment is less than the domain index, we add the fragment to the domain fragment
		if (currentLength + fragment.length <= domainIndex) {
			domainFragment += fragment;
			currentLength += fragment.length;
		} else if (currentLength < domainIndex) {
			const sliceIndex = domainIndex - currentLength;
			domainFragment += fragment.slice(0, sliceIndex);

			// If the sliceIndex is less than the length of the fragment, we push the domain fragment into the array and then we push the rest of the fragment
			if (sliceIndex < fragment.length) {
				returnedFragments.push(domainFragment);
				domainFragment = "";
				returnedFragments.push(fragment.slice(sliceIndex));
			}

			currentLength += sliceIndex;
			// If the current length is equal to the domain index, we add the fragment to the returned fragments
		} else {
			// If the domain fragment is not empty, we push it to the array
			if (domainFragment !== "") {
				returnedFragments.push(domainFragment);
				domainFragment = "";
			}

			// Then we push the fragment to the array
			returnedFragments.push(fragment);
		}
	}

	// If the domain fragment is not empty, we push it to the array
	if (domainFragment !== "") {
		returnedFragments.push(domainFragment);
		domainFragment = "";
	}

	// If the array had a protocol we have to add it back at the beginning
	// of the array before returning it
	if (hasProtocolExtracted && array[0]) {
		returnedFragments = [array[0], ...returnedFragments];
	}

	return returnedFragments;
}

/**
 * Assembles a safe string array by filtering out empty strings and detecting protocols.
 * @param fragments - An array of strings representing URL fragments.
 * @param config - The configuration object.
 * @returns An object containing the assembled URL fragments, information about the presence of a protocol, and the detected protocol.
 * @example
 * safeStringArrayAssembler(["https://", "example.com", "blog"]);
 * // => { array: ["https://", "example.com", "blog"], hasProtocol: true, protocol: "https" }
 * safeStringArrayAssembler(["example.com", "blog"]);
 * // => { array: ["example.com", "blog"], hasProtocol: false, protocol: "none" }
 * safeStringArrayAssembler(["//", "example.com", "blog"]);
 * // => { array: ["//", "example.com", "blog"], hasProtocol: true, protocol: "relative" }
 * safeStringArrayAssembler(["https://example.com", "blog", ""]);
 * // => { array: ["https://", "example.com", "blog"], hasProtocol: true, protocol: "https" }
 */
export function safeStringArrayAssembler(
	fragments: Array<string>,
	config: IConfig,
): IURLArrayData {
	// We will filter out empty strings
	let filteredFragments = [...fragments];

	// If "allowEmptyPathSegments" is false, we can clean empty path segments
	// but if it is true, we can not because those empty fragments will be joined later with slashes, so technically the final URL wouldn't be what we expect.
	// For example, if we have ["example.com", "", "blog"], the final URL should be "example.com//blog" instead of "example.com/blog" if "allowEmptyPathSegments" is true
	if (!config.allowEmptyPathSegments) {
		filteredFragments = filteredFragments.filter(
			(fragment) => fragment.trim() !== "",
		);
	}

	// Now we need to detect if it contains a protocol
	const potentiallyWrongJoinedURL = filteredFragments.join(""); // We don't use here the getUnsafeMergedURLString function because it would fail, since it requires to have already detected the protocol
	const { hasProtocol, protocol } = detectProtocolInString(
		potentiallyWrongJoinedURL,
	);

	// We need to join all the fragments until the end of the protocol (if it has one)
	let returnedFragments: Array<string> = filteredFragments;

	if (hasProtocol) {
		// If it has a protocol, we need to find the index of the end of the protocol
		const protocolIndex =
			potentiallyWrongJoinedURL.indexOf(
				protocol === "relative" ? "//" : "://",
			) + (protocol === "relative" ? 2 : 3);

		// And then sort and merge items in the array so the first item is the whole protocol
		returnedFragments = extractProtocolFromArray(
			filteredFragments,
			protocolIndex,
		);

		// We now know that the first fragment is the protocol (if there are any fragments)
		// We need to check if there is a second fragment and if there is one, we need to remove any leading slashes it might contain
		// That way we can be sure the final URL won't contain things like "https:///example.com/blog"
		if (returnedFragments.length > 1) {
			returnedFragments[1] = (returnedFragments[1] ?? "").replace(/^\/*/, "");
		}
	}

	// No matter if there is protocol or not, we need to check if there is a domain, and if there is one, we need to sort and merge items in the array so the domain is a single fragment in the first position (if there is no protocol) or in the second position (if there is a protocol)
	returnedFragments = extractDomainFromArray(returnedFragments, hasProtocol);

	return {
		array: returnedFragments,
		hasProtocol,
		protocol,
	};
}

/**
 * Converts a safe string array to a URL string.
 * IMPORTANT: This function assumes the array is safe, meaning it has been processed by the safeStringArrayAssembler function.
 * The generated string is a potential valid URL but is not guaranteed to be valid.
 * @param urlArrayData - The data containing the array and whether it has a protocol.
 * @returns The URL string.
 * @example
 * safeStringArrayToURLString({ array: ["https://", "example.com", "blog"], hasProtocol: true, protocol: "https" });
 * // => "https://example.com/blog"
 * safeStringArrayToURLString({ array: ["example.com", "blog"], hasProtocol: false, protocol: "none" });
 * // => "example.com/blog"
 */
export function safeStringArrayToURLString(
	urlArrayData: IURLArrayData,
): string {
	const { array, hasProtocol } = urlArrayData;

	if (hasProtocol) {
		// If it has a protocol, we know the first fragment is the protocol, so we skip it
		const slicedArray = array.length > 1 ? array.slice(1) : [];
		return `${array.length > 0 ? array[0] : ""}${slicedArray.join("/")}`;
	}

	return array.join("/");
}
