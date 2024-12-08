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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/proxy-image', authMiddleware_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }
        const response = yield axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        res.send(response.data);
    }
    catch (error) {
        console.error('Error proxying image:', error);
        res.status(500).json({ message: 'Error fetching image' });
    }
}));
exports.default = router;
