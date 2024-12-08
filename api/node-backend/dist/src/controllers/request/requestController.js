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
const notificationController_1 = require("../notification/notificationController");
const getAllRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prisma_1.prisma.requests.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                approvedUser: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.status(200).json({
            message: "Requests fetched successfully",
            data: requests
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching requests: " + error));
    }
});
exports.getAllRequests = getAllRequests;
const createRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return next((0, http_errors_1.default)(401, "Unauthorized"));
        }
        // Convert the request body to a string
        const personData = JSON.stringify(req.body);
        const imageData = req.file ? JSON.stringify(req.file) : null;
        console.log('Creating request with data:', {
            personData,
            imageData,
            userId: user.id
        });
        const request = yield prisma_1.prisma.requests.create({
            data: {
                requestedBy: user.id,
                status: 'pending',
                personData,
                imageData
            },
            include: {
                user: true
            }
        });
        // Create notification for admins
        yield (0, notificationController_1.createNotification)(`New person request from ${user.firstName} ${user.lastName}`, 'request');
        res.status(201).json({
            message: "Request submitted successfully",
            data: request
        });
    }
    catch (error) {
        console.error('Error in createRequest:', error);
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
        // Parse the person data
        let personData;
        try {
            personData = JSON.parse(request.personData);
            console.log('Parsed person data:', personData);
        }
        catch (parseError) {
            console.error('Error parsing person data:', parseError);
            return next((0, http_errors_1.default)(400, "Invalid person data format"));
        }
        // Extract fields specific to different models
        const { riskLevel, lastSeenDate, lastSeenLocation, missingSince, reportBy } = personData, basicPersonData = __rest(personData, ["riskLevel", "lastSeenDate", "lastSeenLocation", "missingSince", "reportBy"]);
        // Create the person first
        const person = yield prisma_1.prisma.person.create({
            data: Object.assign(Object.assign({}, basicPersonData), { age: parseInt(basicPersonData.age), dateOfBirth: new Date(basicPersonData.dateOfBirth), personImageUrl: request.imageData ? JSON.parse(request.imageData).path : null })
        });
        // Create related records based on person type
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
                    lastSeenLocation: lastSeenLocation,
                    missingSince: new Date(missingSince || lastSeenDate),
                    foundStatus: false,
                    reportBy: reportBy
                }
            });
        }
        // Update request status
        yield prisma_1.prisma.requests.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy,
                approvedAt: new Date()
            }
        });
        // Create notification
        yield (0, notificationController_1.createNotification)(`Person request approved by admin`, 'request_approved');
        res.json({
            message: "Request approved successfully",
            data: person
        });
    }
    catch (error) {
        console.error('Error in approveRequest:', error);
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
