export interface IConfig {
  forceProtocol: "http" | "https" | "none" | "auto" | "auto-insecure";
  trailingSlash: "add" | "remove";
  strict: boolean;
  allowEmptyPathSegments: boolean;
  arraySerializer: "stringify" | "repeat" | "comma";
}

export interface IParams<T> {
  queryParams: Record<string, unknown>;
  hashParam: string;
  config: T;
}
