export interface IConfig {
  forceProtocol: "http" | "https" | "none" | "auto" | "auto-insecure";
  trailingSlash: "add" | "remove";
  strict: boolean;
  allowEmptyPathSegments: boolean;
}

export interface IParams<T> {
  queryParams: Record<string, unknown>;
  hashParams: Record<string, string>;
  config: T;
}
