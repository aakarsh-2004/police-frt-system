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
exports.searchPersons = exports.deletePerson = exports.updatePerson = exports.createPerson = exports.getPersonById = exports.getAllPersons = exports.getPersonCameraLocations = exports.getPersonLocationStats = exports.getPersonStats = exports.resolvePerson = void 0;
exports.getPersonMovementFlow = getPersonMovementFlow;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const node_fs_1 = __importDefault(require("node:fs"));
const notificationController_1 = require("../notification/notificationController");
const getAllPersons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const persons = yield prisma_1.prisma.person.findMany({
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        res.status(200).json({
            message: "All persons fetched successfully",
            data: persons
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching all persons " + error));
    }
});
exports.getAllPersons = getAllPersons;
const getPersonById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const person = yield prisma_1.prisma.person.findUnique({
            where: { id },
            include: {
                suspect: {
                    include: {
                        criminalRecord: true
                    }
                },
                missingPerson: true,
                recognizedPerson: {
                    include: {
                        camera: true,
                        person: {
                            select: {
                                firstName: true,
                                lastName: true,
                                personImageUrl: true
                            }
                        }
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });
        if (!person) {
            return next((0, http_errors_1.default)(404, "Person not found"));
        }
        res.json({
            message: "Person details fetched successfully",
            data: person
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching person details: " + error));
    }
});
exports.getPersonById = getPersonById;
const createPerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = req.user;
        if (!user) {
            return next((0, http_errors_1.default)(401, "Unauthorized"));
        }
        // If user is not admin, create a request instead
        if (user.role !== 'admin') {
            const requestData = {
                requestedBy: user.id,
                status: 'pending',
                personData: JSON.stringify(req.body),
                imageData: req.file ? JSON.stringify(req.file) : null
            };
            const request = yield prisma_1.prisma.requests.create({
                data: requestData,
                include: {
                    user: true
                }
            });
            yield (0, notificationController_1.createNotification)(`New person request from ${user.firstName} ${user.lastName}`, 'request');
            return res.status(201).json({
                message: "Request submitted successfully",
                data: request
            });
        }
        // If user is admin, proceed with direct creation
        const data = req.body;
        const file = req.file || ((_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.personImageUrl) === null || _b === void 0 ? void 0 : _b[0]);
        console.log('Received data:', data);
        console.log('Received files:', file);
        if (!data.firstName || !data.lastName || !data.age || !data.dateOfBirth || !data.type) {
            throw (0, http_errors_1.default)(400, "Missing required fields");
        }
        let imageUrl = null;
        if (file) {
            const result = yield cloudinary_1.default.uploader.upload(file.path, {
                folder: 'person-images'
            });
            imageUrl = result.secure_url;
            node_fs_1.default.unlinkSync(file.path);
        }
        const suspectData = data.suspect ? JSON.parse(data.suspect) : null;
        const missingPersonData = data.missingPerson ? JSON.parse(data.missingPerson) : null;
        const personData = {
            firstName: data.firstName,
            lastName: data.lastName,
            age: parseInt(data.age),
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address,
            type: data.type,
            nationality: data.nationality || null,
            nationalId: data.nationalId || null,
            personImageUrl: imageUrl
        };
        if (data.type === 'suspect' && suspectData) {
            personData.suspect = {
                create: {
                    riskLevel: suspectData.riskLevel || 'low',
                    foundStatus: false
                }
            };
        }
        else if (data.type === 'missing-person' && missingPersonData) {
            const lastSeenDate = new Date(missingPersonData.lastSeenDate);
            if (isNaN(lastSeenDate.getTime())) {
                throw (0, http_errors_1.default)(400, "Invalid lastSeenDate");
            }
            personData.missingPerson = {
                create: {
                    lastSeenDate: lastSeenDate,
                    lastSeenLocation: missingPersonData.lastSeenLocation,
                    missingSince: lastSeenDate,
                    foundStatus: false,
                    reportBy: missingPersonData.reportBy
                }
            };
        }
        const person = yield prisma_1.prisma.person.create({
            data: personData,
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        yield (0, notificationController_1.createNotification)(`New ${data.type} added: ${data.firstName} ${data.lastName}`, 'PERSON_ADDED');
        res.status(201).json({
            message: "Person created successfully",
            data: person
        });
    }
    catch (error) {
        console.error('Error creating person:', error);
        next((0, http_errors_1.default)(500, "Error creating person: " + error));
    }
});
exports.createPerson = createPerson;
const updatePerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const files = req.files;
    const updates = req.body;
    try {
        const person = yield prisma_1.prisma.person.findUnique({
            where: { id },
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        if (!person) {
            throw (0, http_errors_1.default)(404, "Person not found");
        }
        let imageUrl = person.personImageUrl;
        console.log(files);
        if (files && files.personImageUrl && files.personImageUrl[0]) {
            console.log('Updating person image');
            if (person.personImageUrl) {
                try {
                    const personSplit = person.personImageUrl.split('/');
                    const lastTwo = personSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const personImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(personImageSplit);
                    }
                }
                catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
            const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
            const result = yield cloudinary_1.default.uploader.upload(files.personImageUrl[0].path, {
                folder: 'persons',
                format: personImageMimeType
            });
            imageUrl = result.secure_url;
            node_fs_1.default.unlinkSync(files.personImageUrl[0].path);
        }
        const dateOfBirth = new Date(updates.dateOfBirth).toISOString();
        const updateData = Object.assign({ firstName: updates.firstName, lastName: updates.lastName, age: parseInt(updates.age), dateOfBirth, address: updates.address }, (imageUrl && { personImageUrl: imageUrl }));
        const updatedPerson = yield prisma_1.prisma.person.update({
            where: { id },
            data: Object.assign(Object.assign({}, updateData), (person.type === 'suspect' && updates.riskLevel && {
                suspect: {
                    update: {
                        where: { personId: id },
                        data: {
                            riskLevel: updates.riskLevel
                        }
                    }
                }
            })),
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        res.json({
            message: "Person updated successfully",
            data: updatedPerson
        });
    }
    catch (error) {
        if ((_b = (_a = files === null || files === void 0 ? void 0 : files.personImageUrl) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) {
            node_fs_1.default.unlinkSync(files.personImageUrl[0].path);
        }
        next((0, http_errors_1.default)(500, "Error updating person: " + error));
    }
});
exports.updatePerson = updatePerson;
const deletePerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedBy = req.user;
    try {
        // Use transaction to ensure all related records are deleted
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const person = yield tx.person.findUnique({
                where: { id },
                include: {
                    suspect: true,
                    missingPerson: true,
                    recognizedPerson: true
                }
            });
            if (!person) {
                throw (0, http_errors_1.default)(404, "Person not found");
            }
            // Delete related records first
            if (person.recognizedPerson.length > 0) {
                yield tx.recognizedPerson.deleteMany({
                    where: { personId: id }
                });
            }
            if (person.suspect) {
                yield tx.suspect.delete({
                    where: { personId: id }
                });
            }
            if (person.missingPerson) {
                yield tx.missingPerson.delete({
                    where: { personId: id }
                });
            }
            // Finally delete the person
            yield tx.person.delete({
                where: { id }
            });
            // Create notification for person deletion
            yield (0, notificationController_1.createNotification)(`${person.type === 'suspect' ? 'Suspect' : 'Missing Person'} ${person.firstName} ${person.lastName} was deleted by ${deletedBy === null || deletedBy === void 0 ? void 0 : deletedBy.firstName} ${deletedBy === null || deletedBy === void 0 ? void 0 : deletedBy.lastName}`, 'person_deleted');
        }));
        res.json({ message: "Person deleted successfully" });
    }
    catch (error) {
        console.error('Error in deletePerson:', error);
        next((0, http_errors_1.default)(500, "Error deleting person: " + error));
    }
});
exports.deletePerson = deletePerson;
const searchPersons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = req.query.q || '';
        const locations = req.query.locations ? req.query.locations.split(',') : [];
        const minConfidence = parseFloat(req.query.minConfidence) || 0;
        // Base query conditions
        const baseConditions = searchQuery ? {
            OR: [
                { firstName: { contains: searchQuery, mode: 'insensitive' } },
                { lastName: { contains: searchQuery, mode: 'insensitive' } },
                { address: { contains: searchQuery, mode: 'insensitive' } },
                { nationalId: { contains: searchQuery, mode: 'insensitive' } }
            ]
        } : {};
        // Location filter conditions
        const locationConditions = locations.length > 0 ? {
            recognizedPerson: {
                some: {
                    camera: {
                        location: {
                            in: locations
                        }
                    }
                }
            }
        } : {};
        // Confidence filter conditions
        const confidenceConditions = minConfidence > 0 ? {
            recognizedPerson: {
                some: {
                    confidenceScore: {
                        gte: minConfidence.toString()
                    }
                }
            }
        } : {};
        // Combine all conditions
        const whereClause = {
            AND: [
                baseConditions,
                ...(locations.length > 0 ? [locationConditions] : []),
                ...(minConfidence > 0 ? [confidenceConditions] : [])
            ]
        };
        const persons = yield prisma_1.prisma.person.findMany({
            where: whereClause,
            include: {
                suspect: true,
                missingPerson: true,
                recognizedPerson: {
                    include: {
                        camera: true
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });
        console.log(`Found ${persons.length} matches`);
        // Post-process results to ensure they match all criteria
        const filteredPersons = persons.filter(person => {
            // If no filters are applied, include all persons
            if (locations.length === 0 && minConfidence === 0) {
                return true;
            }
            // Check if person has any recognitions
            if (person.recognizedPerson.length === 0) {
                return false;
            }
            // Check location filter
            if (locations.length > 0) {
                const hasMatchingLocation = person.recognizedPerson.some(rec => locations.includes(rec.camera.location));
                if (!hasMatchingLocation) {
                    return false;
                }
            }
            // Check confidence filter
            if (minConfidence > 0) {
                const hasMatchingConfidence = person.recognizedPerson.some(rec => parseFloat(rec.confidenceScore) >= minConfidence);
                if (!hasMatchingConfidence) {
                    return false;
                }
            }
            return true;
        });
        // Add a count of matching detections for each person
        const personsWithMatchCounts = filteredPersons.map(person => (Object.assign(Object.assign({}, person), { matchCount: person.recognizedPerson.length })));
        res.status(200).json({
            message: "Search results fetched successfully",
            data: personsWithMatchCounts,
            totalMatches: personsWithMatchCounts.reduce((acc, p) => acc + p.matchCount, 0)
        });
    }
    catch (error) {
        console.error("Search error:", error);
        next((0, http_errors_1.default)(500, "Error while searching persons " + error));
    }
});
exports.searchPersons = searchPersons;
const resolvePerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { type } = req.body;
    try {
        if (type === 'suspect') {
            yield prisma_1.prisma.suspect.update({
                where: { personId: id },
                data: { foundStatus: true }
            });
        }
        else if (type === 'missing-person') {
            yield prisma_1.prisma.missingPerson.update({
                where: { personId: id },
                data: { foundStatus: true }
            });
        }
        res.json({
            message: "Person status updated successfully"
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error updating person status: " + error));
    }
});
exports.resolvePerson = resolvePerson;
const getPersonStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const total = yield prisma_1.prisma.person.count();
        res.status(200).json({
            message: "Person stats retrieved successfully",
            data: {
                total
            }
        });
    }
    catch (error) {
        console.error('Error getting person stats:', error);
        next((0, http_errors_1.default)(500, "Error getting person stats: " + error));
    }
});
exports.getPersonStats = getPersonStats;
const getPersonLocationStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get all recognitions for this person with camera details
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            where: {
                personId: id
            },
            select: {
                capturedDateTime: true,
                camera: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });
        // Create a Map to store unique locations and their details
        const locationMap = new Map();
        // Process recognitions to get unique locations and counts
        recognitions.forEach(recognition => {
            const location = recognition.camera.location;
            const current = locationMap.get(location);
            if (current) {
                // Update existing location
                current.detectionCount += 1;
                if (new Date(recognition.capturedDateTime) > current.lastDetected) {
                    current.lastDetected = new Date(recognition.capturedDateTime);
                }
            }
            else {
                // Add new location
                locationMap.set(location, {
                    location,
                    detectionCount: 1,
                    lastDetected: new Date(recognition.capturedDateTime)
                });
            }
        });
        // Convert Map to array and format the response
        const locationStats = {
            totalLocations: locationMap.size,
            locations: Array.from(locationMap.values()).map(stat => ({
                location: stat.location,
                detectionCount: stat.detectionCount,
                lastDetected: stat.lastDetected.toISOString()
            })).sort((a, b) => b.detectionCount - a.detectionCount) // Sort by detection count
        };
        res.json({
            message: "Person location statistics fetched successfully",
            data: locationStats
        });
    }
    catch (error) {
        console.error('Error in getPersonLocationStats:', error);
        next((0, http_errors_1.default)(500, "Error fetching person location stats"));
    }
});
exports.getPersonLocationStats = getPersonLocationStats;
const getPersonCameraLocations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { personId } = req.params;
        const detections = yield prisma_1.prisma.recognizedPerson.findMany({
            where: {
                personId
            },
            select: {
                camera: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        latitude: true,
                        longitude: true,
                        status: true,
                        streamUrl: true,
                        nearestPoliceStation: true
                    }
                }
            },
            distinct: ['cameraId']
        });
        // Extract unique cameras and remove duplicates
        const uniqueCameras = Array.from(new Map(detections.map(d => [d.camera.id, d.camera])).values());
        console.log("unique cameras", uniqueCameras);
        res.json({
            message: "Person's camera locations fetched successfully",
            data: uniqueCameras
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching person's camera locations"));
    }
});
exports.getPersonCameraLocations = getPersonCameraLocations;
function getPersonMovementFlow(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { personId } = req.params;
        try {
            // Get all detections for this person, ordered by timestamp
            const detections = yield prisma_1.prisma.recognizedPerson.findMany({
                where: {
                    personId
                },
                select: {
                    id: true,
                    capturedDateTime: true,
                    camera: {
                        select: {
                            name: true,
                            location: true,
                            latitude: true,
                            longitude: true
                        }
                    }
                },
                orderBy: {
                    capturedDateTime: 'asc'
                }
            });
            // Process detections to create movement flow
            const movementFlow = detections.reduce((flow, detection, index) => {
                if (index === 0) {
                    // First detection
                    flow.push({
                        location: detection.camera.location,
                        timestamp: detection.capturedDateTime,
                        latitude: detection.camera.latitude,
                        longitude: detection.camera.longitude,
                        isRepeated: false
                    });
                    return flow;
                }
                const lastLocation = flow[flow.length - 1].location;
                const currentLocation = detection.camera.location;
                const timeDiff = new Date(detection.capturedDateTime).getTime() -
                    new Date(flow[flow.length - 1].timestamp).getTime();
                // Only add if location is different or if same location appears after significant time (e.g., 30 minutes)
                if (currentLocation !== lastLocation || timeDiff > 60 * 60 * 1000) {
                    flow.push({
                        location: currentLocation,
                        timestamp: detection.capturedDateTime,
                        latitude: detection.camera.latitude,
                        longitude: detection.camera.longitude,
                        isRepeated: flow.some(f => f.location === currentLocation)
                    });
                }
                return flow;
            }, []);
            res.json({
                success: true,
                data: movementFlow
            });
        }
        catch (error) {
            console.error('Error fetching person movement flow:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch movement flow'
            });
        }
    });
}
