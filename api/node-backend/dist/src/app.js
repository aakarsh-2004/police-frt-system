"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const cors_1 = __importDefault(require("cors"));
const personRoutes_1 = __importDefault(require("./routes/person/personRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/stats/statsRoutes"));
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/user/userRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/request/requestRoutes"));
const recognitionRoutes_1 = __importDefault(require("./routes/recognition/recognitionRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://frt-system-client.vercel.app"],
    credentials: true
}));
app.get('/api', (req, res, next) => {
    const error = (0, http_errors_1.default)(400, "Something went wrong");
    throw error;
});
app.use('/api/persons', personRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/requests', requestRoutes_1.default);
app.use('/api/recognitions', recognitionRoutes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
