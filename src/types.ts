export type TForceProtocol =
	| "http"
	| "https"
	| "none"
	| "auto"
	| "auto-insecure";

export type TTrailingSlash = "add" | "remove";

export type TArraySerializer = "stringify" | "repeat" | "comma";

export type TProtocol = "http" | "https" | "relative" | "none";

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
}
