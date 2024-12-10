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
exports.rejectRequest = exports.approveRequest = exports.createRequest = exports.getAllRequests = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const notificationController_1 = require("../notification/notificationController");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
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
        const personData = req.body;
        let imageUrl = null;
        // Handle image upload
        if (req.file) {
            try {
                // Upload to Cloudinary
                const result = yield cloudinary_1.default.uploader.upload(req.file.path, {
                    folder: 'requests',
                    resource_type: 'image'
                });
                imageUrl = result.secure_url;
                // Clean up local file
                fs_1.default.unlink(req.file.path, (err) => {
                    if (err)
                        console.error('Error deleting local file:', err);
                });
            }
            catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return next((0, http_errors_1.default)(500, "Error uploading image"));
            }
        }
        // Create request with image data
        const request = yield prisma_1.prisma.requests.create({
            data: {
                requestedBy: user.id,
                status: 'pending',
                personData: JSON.stringify(Object.assign(Object.assign({}, personData), { personImageUrl: imageUrl // Store image URL in personData
                 })),
                imageData: imageUrl // Store Cloudinary URL directly in imageData
            }
        });
        res.status(201).json({
            message: "Request created successfully",
            data: request
        });
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
        // Parse image data if exists
        let imageData;
        if (request.imageData) {
            try {
                imageData = JSON.parse(request.imageData);
                personData.personImageUrl = imageData.path;
            }
            catch (parseError) {
                console.error('Error parsing image data:', parseError);
            }
        }
        // Parse missing person data if exists
        let missingPersonData;
        if (personData.missingPerson) {
            try {
                missingPersonData = JSON.parse(personData.missingPerson);
            }
            catch (parseError) {
                console.error('Error parsing missing person data:', parseError);
                return next((0, http_errors_1.default)(400, "Invalid missing person data format"));
            }
        }
        // Create the person with image URL
        const person = yield prisma_1.prisma.person.create({
            data: Object.assign({ firstName: personData.firstName, lastName: personData.lastName, age: parseInt(personData.age), dateOfBirth: new Date(personData.dateOfBirth), address: personData.address, type: personData.type, gender: personData.gender, email: personData.email, phone: personData.phone, nationalId: personData.nationalId, nationality: personData.nationality, personImageUrl: personData.personImageUrl }, (personData.type === 'missing-person' && missingPersonData ? {
                missingPerson: {
                    create: {
                        lastSeenDate: new Date(missingPersonData.lastSeenDate),
                        lastSeenLocation: missingPersonData.lastSeenLocation,
                        missingSince: new Date(missingPersonData.lastSeenDate),
                        foundStatus: false,
                        reportBy: missingPersonData.reportBy
                    }
                }
            } : personData.type === 'suspect' ? {
                suspect: {
                    create: {
                        riskLevel: personData.riskLevel || 'low',
                        foundStatus: false
                    }
                }
            } : {}))
        });
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
    const { rejectedBy } = req.body;
    try {
        const request = yield prisma_1.prisma.requests.findUnique({
            where: { id }
        });
        if (!request) {
            return next((0, http_errors_1.default)(404, "Request not found"));
        }
        yield prisma_1.prisma.requests.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedBy,
                rejectedAt: new Date()
            }
        });
        // Create notification
        yield (0, notificationController_1.createNotification)(`Person request rejected by admin`, 'request_rejected');
        res.json({ message: "Request rejected successfully" });
    }
    catch (error) {
        console.error('Error in rejectRequest:', error);
        next((0, http_errors_1.default)(500, "Error rejecting request: " + error));
    }
});
exports.rejectRequest = rejectRequest;
