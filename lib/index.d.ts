import { Awaitable, Dispatcher, ErrorHandler } from "@airent/api";
import { Request as ExpressRequest, RequestHandler as ExpressRequestHandler } from "express";
type Authenticator<CONTEXT> = (request: ExpressRequest) => Awaitable<CONTEXT>;
type RequestParser<DATA> = (request: ExpressRequest) => Awaitable<DATA>;
type HandlerConfig<CONTEXT, DATA, PARSED, RESULT, ERROR> = {
    authenticator: Authenticator<CONTEXT>;
    requestParser: RequestParser<DATA>;
    errorHandler?: ErrorHandler<CONTEXT, DATA, PARSED, RESULT, ERROR>;
};
declare const bodyRequestParser: <DATA>(request: ExpressRequest) => DATA;
declare function handleWith<CONTEXT, DATA, PARSED, RESULT, ERROR>(dispatcher: Dispatcher<CONTEXT, DATA, RESULT, ERROR>, config: HandlerConfig<CONTEXT, DATA, PARSED, RESULT, ERROR>): ExpressRequestHandler;
export { Authenticator, bodyRequestParser, HandlerConfig, handleWith, RequestParser, };
