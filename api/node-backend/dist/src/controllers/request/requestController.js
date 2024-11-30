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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectRequest = exports.approveRequest = exports.createRequest = exports.getAllRequests = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const getAllRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prisma_1.prisma.requests.findMany({
            include: {
                user: true,
                approvedUser: true
            }
        });
        res.json(requests);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching requests: " + error));
    }
});
exports.getAllRequests = getAllRequests;
const createRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestedBy, personData } = req.body;
    const files = req.files;
    try {
        const request = yield prisma_1.prisma.requests.create({
            data: {
                requestedBy,
                status: 'pending',
                personData: JSON.stringify(personData),
                imageData: files ? JSON.stringify(files) : null
            },
            include: {
                user: true
            }
        });
        res.status(201).json(request);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error creating request: " + error));
    }
});
exports.createRequest = createRequest;
const approveRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { approvedBy } = req.body;
    try {
        const request = yield prisma_1.prisma.requests.findUnique({
            where: { id }
        });
        if (!request) {
            return next((0, http_errors_1.default)(404, "Request not found"));
        }
        const personData = JSON.parse(request.personData);
        const imageData = request.imageData ? JSON.parse(request.imageData) : null;
        // Extract fields specific to person
        const { riskLevel, lastSeenDate, lastSeenLocation, missingSince, status, reportBy } = personData, personFields = __rest(personData, ["riskLevel", "lastSeenDate", "lastSeenLocation", "missingSince", "status", "reportBy"]);
        const person = yield prisma_1.prisma.person.create({
            data: Object.assign(Object.assign({}, personFields), { age: parseInt(personFields.age), dateOfBirth: new Date(personFields.dateOfBirth) })
        });
        if (personData.type === 'suspect') {
            yield prisma_1.prisma.suspect.create({
                data: {
                    personId: person.id,
                    riskLevel: riskLevel || 'low',
                    foundStatus: false
                }
            });
        }
        else if (personData.type === 'missing-person') {
            yield prisma_1.prisma.missingPerson.create({
                data: {
                    personId: person.id,
                    lastSeenDate: new Date(lastSeenDate),
                    lastSeenLocation,
                    missingSince: new Date(missingSince),
                    foundStatus: false,
                    reportBy
                }
            });
        }
        yield prisma_1.prisma.requests.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy,
                approvedAt: new Date()
            }
        });
        res.json({ message: "Request approved successfully", person });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error approving request: " + error));
    }
});
exports.approveRequest = approveRequest;
const rejectRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.prisma.requests.update({
            where: { id },
            data: {
                status: 'rejected'
            }
        });
        res.json({ message: "Request rejected successfully" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error rejecting request: " + error));
    }
});
exports.rejectRequest = rejectRequest;
