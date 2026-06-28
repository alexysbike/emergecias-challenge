import type { Request } from "express";
import type { HttpRequest } from "../../http-request";
import type { HttpMethod } from "../../http-method";

export function adaptRequest(req: Request): HttpRequest {
  const query: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (value === undefined) continue;
    query[key] = Array.isArray(value) ? value.map(String) : String(value);
  }

  return {
    method: req.method as HttpMethod,
    path: req.path,
    params: req.params as Record<string, string>,
    query,
    body: req.body,
  };
}
