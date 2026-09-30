import type { IConfig } from "./types.js";

export const BASE_DEFAULT_MAKE_URL_CONFIG: Readonly<IConfig> = Object.freeze({
	forceProtocol: "auto",
	trailingSlash: "remove",
	strict: false,
	allowEmptyPathSegments: false,
	arraySerializer: "repeat",
});

let currentDefaultConfig: IConfig = { ...BASE_DEFAULT_MAKE_URL_CONFIG };

/**
 * Merges a partial config into a complete one. Keys set to `undefined` are ignored, so `{ forceProtocol: process.env.X }` keeps the default when the variable is not set.
 *
 * @param base - The complete config.
 * @param override - The partial config with the values to change.
 * @returns A new complete config.
 */
export function mergeConfig(
	base: Readonly<IConfig>,
	override: Partial<IConfig> | undefined,
): IConfig {
	const definedEntries = Object.entries(override ?? {}).filter(
		([, value]) => value !== undefined,
	);
	return { ...base, ...Object.fromEntries(definedEntries) };
}

/**
 * Returns the default configuration for the `makeURL` function.
 * @returns A copy of the default configuration object.
 */
export function getMakeURLDefaultConfig(): IConfig {
	return { ...currentDefaultConfig };
}

/**
 * Sets the makeURL default config params. This function is used to set the default config params for the makeURL function so you don't have to pass them every time you use it.
 * Each call starts from the base defaults: settings that are not passed go back to their base default value.
 *
 * @param config - The partial IConfig object containing the default config parameters to be set.
 * @example
 * setMakeURLDefaultConfig({
 *   forceProtocol: "http",
 *   trailingSlash: "add",
 *   strict: false
 * })
 */
export function setMakeURLDefaultConfig(config: Partial<IConfig>): void {
	currentDefaultConfig = mergeConfig(BASE_DEFAULT_MAKE_URL_CONFIG, config);
}
