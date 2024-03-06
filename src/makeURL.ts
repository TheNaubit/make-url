import {
  detectDomainInString,
  safeStringArrayAssembler,
  safeStringArrayToURLString
} from "./lib/helpers";
import type { IParams, IConfig } from "./types";

export const BASE_DEFAULT_MAKE_URL_CONFIG: IConfig = {
  forceProtocol: "auto",
  trailingSlash: "add",
  strict: false,
  allowEmptyPathSegments: false,
  arraySerializer: "repeat"
};

const DEFAULT_PARAMS: IParams<IConfig> = {
  params: {},
  hash: "",
  config: BASE_DEFAULT_MAKE_URL_CONFIG
};

let SET_CONFIG: IConfig = {
  ...DEFAULT_PARAMS.config
};

/**
 * Returns the default configuration for the `makeURL` function.
 * @returns The default configuration object.
 */
export function getMakeURLDefaultConfig(): IConfig {
  return SET_CONFIG;
}

/**
 * Sets the makeURL default config params. This function is used to set the default config params for the makeURL function so you don't have to pass them every time you use it.
 *
 * @param config - The partial IConfig object containing the default config parameters to be set.
 * @example
 * setMakeURLParams({
 *   forceProtocol: "http",
 *   trailingSlash: "add",
 *   strict: false
 * })
 */
export function setMakeURLDefaultConfig(config: Partial<IConfig>) {
  SET_CONFIG = {
    ...DEFAULT_PARAMS.config,
    ...config
  };
}

/**
 * Generates a URL based on the provided parameters and fragments.
 *
 * @param firstArg - The first argument can be a partial IParams object or a string. If it's a string, it will be used as the first fragment.
 * @param fragments - The rest of the fragments to be used in the URL.
 * @returns The generated URL.
 * @throws If the first argument is not a string or if the params object is not the last argument.
 * @throws If the generated URL is not a valid complete URL (meaning it contains a domain, something like https://example.com/ajajaja) and the strict mode is enabled.
 * @example
 * makeURL("example.com", "path", "to", "file") // "https://example.com/path/to/file"
 * makeURL({
 * queryParams: {
 *    key: "value"
 * }
 * }, "example.com", "path", "to", "file") // "https://example.com/path/to/file?key=value"
 * makeURL({
 * queryParams: {
 *    key: "value",
 *    otherKey: 123
 * }
 * }, "example.com", "path", "to/file/:otherKey") // "https://example.com/path/to/file/123?key=value"
 */
export default function makeURL(
  ...args: Array<string | Partial<IParams<Partial<IConfig>>>>
): string {
  // We must make sure the function received at least one string item
  if (args.length === 0 || (args.length > 0 && typeof args[0] !== "string")) {
    throw new Error("makeURL must receive at least one string item");
  }

  // The args array can contain any number of strings but only the last item can be a partial IParams object
  let optionalObjectConfig:
    | Partial<IParams<Partial<IConfig>>>
    | { config: Record<string, never> } = { config: {} };

  const stringFragments: string[] = [];

  args.forEach((arg, index) => {
    if (typeof arg === "string") {
      stringFragments.push(arg);
    } else {
      if (index !== args.length - 1) {
        throw new Error(
          "Params config object argument must be the last argument"
        );
      }
      optionalObjectConfig = arg;
    }
  });
  // Now we have a save loaded args, we can load the config merging the config objects and clean the string fragments
  const safeParams: IParams<IConfig> = {
    ...DEFAULT_PARAMS,
    ...optionalObjectConfig,
    config: {
      ...SET_CONFIG,
      ...optionalObjectConfig?.config
    }
  };

  const safeStringArrayAssemblerData = safeStringArrayAssembler(
    stringFragments,
    safeParams.config
  );

  // First, clean the fragments by removing leading and trailing slashes, replacing spaces with dashes and encoding invalid characters
  safeStringArrayAssemblerData.array = safeStringArrayAssemblerData.array.map(
    (fragment, index) => {
      // Since we used the safeStringArrayAssembler function, we know that the first fragment is the protocol (if there is any)
      if (index === 0 && safeStringArrayAssemblerData.hasProtocol) {
        // Since it is a protocol, we can just return it as is
        return fragment;
      }

      // Since it does not contain a protocol, we need to clean it
      return fragment
        .split("/")
        .map(f => encodeURIComponent(f).replace(/%3A/g, ":"))
        .join("/");
    }
  );

  // Check if the first fragment includes a protocol and if it doesnt, add the forceProtocol protocol (only if it's not set to "none")
  if (
    !safeStringArrayAssemblerData.hasProtocol &&
    safeParams.config.forceProtocol !== "none"
  ) {
    // If the forceProtocol is set to "auto" or "auto-insecure", we need to check if the URL starts with a domain. If it does, we add the forceProtocol, if it doesn't, we don't add it
    if (
      safeParams.config.forceProtocol === "auto" ||
      safeParams.config.forceProtocol === "auto-insecure"
    ) {
      // If `forceProtocol`is `auto-insecure`, we use `http` instead of `https` (if the URL starts with a domain)
      const shouldUseHttps = safeParams.config.forceProtocol === "auto";

      const temporalDomainInfo = detectDomainInString(
        `https://${safeStringArrayToURLString(safeStringArrayAssemblerData)}`
      ); // Add some protocol to the URL to make sure the `detectDomainInString` function works as expected, since we now know that the temporalJoinedURL has no protocol

      if (temporalDomainInfo.hasDomain) {
        // Insert a new item at the beginning of the safeStringArrayAssemblerData array
        safeStringArrayAssemblerData.array = [
          `${shouldUseHttps ? "https" : "http"}://`,
          ...safeStringArrayAssemblerData.array
        ];
        safeStringArrayAssemblerData.hasProtocol = true;
        safeStringArrayAssemblerData.protocol = shouldUseHttps
          ? "https"
          : "http";
      }
    } else {
      // Insert a new item at the beginning of the safeStringArrayAssemblerData array
      safeStringArrayAssemblerData.array = [
        `${safeParams.config.forceProtocol}://`,
        ...safeStringArrayAssemblerData.array
      ];
      safeStringArrayAssemblerData.hasProtocol = true;
      safeStringArrayAssemblerData.protocol = safeParams.config.forceProtocol;
    }
  }

  // Generate the URL by joining the fragments
  let url = safeStringArrayToURLString(safeStringArrayAssemblerData);

  // If the trailingSlash is set to "add" and the URL does not end with a slash, add it
  if (safeParams.config.trailingSlash === "add" && !url.endsWith("/")) {
    url += "/";
  }

  // You might think this is not needed since we clean this in the fragments, but we need to check because if the user added two or more slashes in a row, those wouldn't be removed by the cleaning regex
  // If the trailingSlash is set to "remove" and the URL ends with a slash, remove it
  // Keep in mind this won't work in every case (for example, if the user added three or more slashes in a row, only the last one will be removed), but it's enough for our use case. If you need it to be even more strict, enable the strict mode in the config
  if (safeParams.config.trailingSlash === "remove" && url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  // RFC 3986 allows empty path segments, but some servers don't accept them, so we need to remove them if the `allowEmptyPathSegments` is set to false (https://tools.ietf.org/html/rfc3986)
  if (!safeParams.config.allowEmptyPathSegments) {
    // We need to make sure there are no double (or more) slashes in the URL, so we replace them with a single slash
    // Since the protocol has two slashes, we need to make sure we don't remove them, so we use a regex with a negative lookbehind
    // Keep in mind that this still works if there is no protocol in the URL, so it's safe to use it in any case

    // We need to support relative protocol so before doing the replacement, check if the url starts with `//` and if it does, extract it and add it back after the replacement
    let relativeProtocol = "";

    // If the protocol is detected as relative, there are two options
    if (safeStringArrayAssemblerData.protocol === "relative") {
      // One, the URL contains the relative protocol and also contains a
      // valid domain (or subdomain)
      if (safeStringArrayAssemblerData.hasProtocol) {
        // Then we treat it as a URl with a valid relative protocol
        relativeProtocol = "//";
        // Or two, the URL contains the relative protocol but it does not contain
        // a valid domain (or subdomain)
      } else {
        // Then we treat it as an absolute URL instead
        relativeProtocol = "/";
      }

      // In any case, we remove the relative protocol from the URL
      url = url.slice(2);
    }

    url = `${relativeProtocol}${url.replace(/(?<!:)\/{2,}/g, "/")}`;
  }

  // We accept any value as the value in the queryParams object, but the queryParams in the URL must be a string, so we need to cast it
  const safeQueryParams: Record<
    string,
    {
      value: string | Array<string>;
      isArray: boolean;
    }
  > = {};

  Object.entries(safeParams.params).forEach(([key, value]) => {
    // We need to safe cast the value to a string, it could be anything: a string, a number, an object, etc... so sometimes the .toString() method will not work as expected
    let safeValue: string | Array<string> = "";
    let isValueArray = false;

    if (typeof value === "string") {
      safeValue = value;
    } else if (typeof value === "number") {
      safeValue = value.toString();
    } else if (Array.isArray(value)) {
      isValueArray = true;
      if (safeParams.config.arraySerializer === "stringify") {
        safeValue = JSON.stringify(value);
      } else if (safeParams.config.arraySerializer === "repeat") {
        // If the arraySerializer is set to "repeat", we need to repeat the key for each value in the array
        safeValue = value;
      } else {
        // If the arraySerializer is set to "comma", we need to join the array with a comma
        safeValue = value.join(",");
      }
    } else if (typeof value === "object") {
      safeValue = JSON.stringify(value);
    } else {
      safeValue = `${value}`;
    }

    safeQueryParams[key] = {
      value: safeValue,
      isArray: isValueArray
    };
  });

  const queryParamsToAdd = new URLSearchParams();

  // We support URLs with replaceable fields, so if one of the keys in queryParams is found in the URL in the format `:<key>`, it will be replaced with the value of the key in queryParams and removed from the queryParams object
  // If the key is not replaced, it is meant to be added as a query key, so we add it to the queryParamsToAdd object
  Object.entries(safeQueryParams).forEach(([key, item]) => {
    // If the value is an array we can not replace it in the URL, so we skip the URL replacement and add the query param to the queryParamsToAdd object
    if (item.isArray) {
      // If the array is an array of objects, we are in the "repeat" mode, so we need to add each object as a query param
      if (Array.isArray(item.value)) {
        item.value.forEach(value => {
          queryParamsToAdd.append(key, value);
        });
      } else {
        // If it is not an array of objects, we can add the array as a single query param
        queryParamsToAdd.append(key, item.value);
      }
      return;
    }

    let foundAnyMatch = false;
    // We need to replace it in all the cases it appears in the URL, so we use a regex with the global flag
    // If we found any match, we set the foundAnyMatch variable to true
    // If we didn't find any match, we don't do anything
    const regex = new RegExp(`:${key}`, "g");
    const encodedValue = encodeURIComponent(item.value as string); // We know that is .isArray is false (which we already checked), the value type is always a string

    url = url.replace(regex, () => {
      foundAnyMatch = true;
      return encodedValue;
    });

    if (foundAnyMatch) {
      // We remove the key from the queryParams object
      delete safeQueryParams[key];
    } else {
      // If we didn't find any match, we add the key to the queryParamsToAdd object
      queryParamsToAdd.append(key, item.value as string); // Note that we dont call encodeURIComponent here because the URLSearchParams object does it for us and if we did it twice, the resulting string would be double encoded, causing issues
    }
  });

  // Now we have to add the remaining query params to the URL
  const queryParamsToAddString = queryParamsToAdd.toString();

  // Add the query params to the URL if there are any
  if (queryParamsToAddString) {
    url += `?${queryParamsToAddString}`;
  }

  // Now we have to add the hash params to the URL
  // Add the hash params to the URL if there are any
  const safeHashParamValue: string = safeParams.hash.trim();
  if (safeHashParamValue !== "") {
    url += `#${encodeURIComponent(safeHashParamValue)}`;
  }

  // Finally, validate if the URL is valid (only if the strict mode is enabled)
  // Important: If we are using a relative URL or an absolute URL without host, this will throw an error, so we should not use the `strict` mode in those cases
  if (safeParams.config.strict) {
    try {
      // This function checks if it is a valid URL and also if it contains a valid
      // domain (or subdomain, etc...), so we can be sure that it is a valid URL
      const testResultData = detectDomainInString(url);

      if (!testResultData.hasDomain) {
        throw null;
      }
    } catch {
      throw new Error(`The generated URL is not valid: ${url}`);
    }
  }

  // And return the URL
  return url;
}
