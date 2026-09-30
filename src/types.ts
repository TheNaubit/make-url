export type TForceProtocol =
	| "http"
	| "https"
	| "none"
	| "auto"
	| "auto-insecure";

export type TTrailingSlash = "add" | "remove";

export type TArraySerializer = "stringify" | "repeat" | "comma";

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
export interface IDomainData {
	hasDomain: boolean;
	domain: string;
}

/** A partial config: keys set to `undefined` keep their default value. */
export type TMakeURLConfig = { [K in keyof IConfig]?: IConfig[K] | undefined };
