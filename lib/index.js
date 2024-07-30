"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWith = exports.bodyRequestParser = void 0;
const api_1 = require("@airent/api");
const bodyRequestParser = (request) => request.body;
exports.bodyRequestParser = bodyRequestParser;
function handleWith(dispatcher, config) {
    var _a;
    const { authenticator, requestParser } = config;
    const errorHandler = (_a = config.errorHandler) !== null && _a !== void 0 ? _a : ((error) => {
        throw error;
    });
    return (req, res, _next) => __awaiter(this, void 0, void 0, function* () {
        const dispatcherContext = {};
        try {
            dispatcherContext.context = yield authenticator(req);
            dispatcherContext.data = yield requestParser(req);
            const commonResponse = yield dispatcher(dispatcherContext.data, dispatcherContext.context);
            respond(res, commonResponse);
            res.status(commonResponse.code).json(commonResponse.result).end();
        }
        catch (error) {
            const commonResponse = yield errorHandler(error, dispatcherContext);
            res.status(commonResponse.code).json(commonResponse.result).end();
        }
    });
}
exports.handleWith = handleWith;
function respond(res, commonResponse) {
    const { code, result, error } = commonResponse;
    const json = (0, api_1.isNil)(error) ? result !== null && result !== void 0 ? result : null : { error };
    res.status(code).json(json).end();
}
//# sourceMappingURL=index.js.map