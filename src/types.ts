export type TForceProtocol =
	| "http"
	| "https"
	| "none"
	| "auto"
	| "auto-insecure";

export type TTrailingSlash = "add" | "remove";

export type TArraySerializer = "stringify" | "repeat" | "comma";

// "relative" is "//example.com", "none" is no protocol, any other value is the protocol name (like "https" or "wss")
export type TProtocol = "http" | "https" | "relative" | "none" | (string & {});

export interface IConfig {
	forceProtocol: TForceProtocol;
	trailingSlash: TTrailingSlash;
	strict: boolean;
	allowEmptyPathSegments: boolean;
	arraySerializer: TArraySerializer;
}

export interface IParams<T> {
	params: Record<string, unknown>;
	hash: string;
	config: T;
}
export interface IProtocolData {
	hasProtocol: boolean;
	protocol: TProtocol;
}

export interface IDomainData {
	hasDomain: boolean;
	domain: string;
}

export interface IURLArrayData extends IProtocolData {
	array: Array<string>;
	// Whether the array contains a domain: it is then the first fragment after the protocol (if any)
	hasDomain: boolean;
}
