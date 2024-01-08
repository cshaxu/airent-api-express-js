import { NextFunction as ExpressNextFunction, Request as ExpressRequest, Response as ExpressResponse } from "express";
declare function execute(apiHandler: (request: Request) => Promise<Response>): (req: ExpressRequest, res: ExpressResponse, _next: ExpressNextFunction) => Promise<void>;
export { execute };
