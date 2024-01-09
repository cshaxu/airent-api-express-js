import {
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { IncomingHttpHeaders } from "http";

function execute(apiHandler: (request: Request) => Promise<Response>) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse,
    _next: ExpressNextFunction
  ) => {
    const request = buildPostRequest(req);
    const response = await apiHandler(request);
    const json = await response.json();
    res.status(response.status).json(json).end();
  };
}

function buildPostRequest(req: ExpressRequest): Request {
  const url = new URL(req.originalUrl, `${req.protocol}://${req.hostname}`);
  const init: RequestInit = {
    method: "POST",
    headers: buildHeaders(req.headers),
    body: JSON.stringify(req.body), // this needs to be transformed depending on the body type
    mode: "cors" as RequestMode, // or other relevant mode
    credentials: "include" as RequestCredentials, // or 'omit', based on requirements
  };

  return new Request(url, init);
}

function buildHeaders(expressHeaders: IncomingHttpHeaders): Headers {
  let fetchHeaders = new Headers();
  Object.entries(expressHeaders).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => fetchHeaders.append(key, v));
    } else if (typeof value === "string") {
      fetchHeaders.append(key, value);
    }
  });
  return fetchHeaders;
}

export { execute };
