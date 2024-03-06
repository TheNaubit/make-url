export interface IConfig {
  forceProtocol: "http" | "https" | "none" | "auto" | "auto-insecure";
  trailingSlash: "add" | "remove";
  strict: boolean;
  allowEmptyPathSegments: boolean;
  arraySerializer: "stringify" | "repeat" | "comma";
}

export interface IParams<T> {
  params: Record<string, unknown>;
  hash: string;
  config: T;
}
