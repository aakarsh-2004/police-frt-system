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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const authenticateAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User should already be attached by authMiddleware
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }
        if (req.user.role !== 'admin') {
            console.log('User is not admin:', req.user.role);
            return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }
        next();
    }
    catch (error) {
        console.error('Error in authenticateAdmin:', error);
        next((0, http_errors_1.default)(401, "Unauthorized"));
    }
});
exports.authenticateAdmin = authenticateAdmin;
