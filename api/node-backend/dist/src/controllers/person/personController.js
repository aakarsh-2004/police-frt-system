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
exports.searchPersons = exports.deletePerson = exports.updatePerson = exports.createPerson = exports.getPersonById = exports.getAllPersons = exports.getPersonStats = exports.resolvePerson = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const node_fs_1 = __importDefault(require("node:fs"));
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
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });
        if (!person) {
            return next((0, http_errors_1.default)(404, "Person not found"));
        }
        res.status(200).json({
            message: "Person fetched successfully",
            data: person
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching person by id " + error));
    }
});
exports.getPersonById = getPersonById;
const createPerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = req.body;
        const file = req.file || ((_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.personImageUrl) === null || _b === void 0 ? void 0 : _b[0]);
        console.log('Received data:', data);
        console.log('Received files:', file);
        // Validate required fields
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
        // Parse the nested objects if they were stringified
        const suspectData = data.suspect ? JSON.parse(data.suspect) : null;
        const missingPersonData = data.missingPerson ? JSON.parse(data.missingPerson) : null;
        const person = yield prisma_1.prisma.person.create({
            data: Object.assign(Object.assign({ firstName: data.firstName, lastName: data.lastName, age: parseInt(data.age), dateOfBirth: new Date(data.dateOfBirth), gender: data.gender, email: data.email || null, phone: data.phone || null, address: data.address, type: data.type, nationality: data.nationality || null, nationalId: data.nationalId || null, personImageUrl: imageUrl }, (data.type === 'suspect' && {
                suspect: {
                    create: {
                        riskLevel: data.riskLevel || 'low',
                        foundStatus: false
                    }
                }
            })), (data.type === 'missing-person' && {
                missingPerson: {
                    create: {
                        lastSeenDate: new Date(data.lastSeenDate),
                        lastSeenLocation: data.lastSeenLocation,
                        missingSince: new Date(data.missingSince || data.lastSeenDate),
                        foundStatus: false,
                        reportBy: data.reportBy
                    }
                }
            })),
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        res.status(201).json({
            message: "Person created successfully",
            data: person
        });
    }
    catch (error) {
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
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            if (person.type === 'suspect' && person.suspect) {
                yield tx.suspect.delete({
                    where: { personId: id }
                });
            }
            else if (person.type === 'missing-person' && person.missingPerson) {
                yield tx.missingPerson.delete({
                    where: { personId: id }
                });
            }
            // 2. Delete all recognitions for this person
            yield tx.recognizedPerson.deleteMany({
                where: { personId: id }
            });
            // 3. Delete the person record
            yield tx.person.delete({
                where: { id }
            });
        }));
        res.json({
            message: "Person deleted successfully",
            data: person
        });
    }
    catch (error) {
        console.error('Delete error:', error);
        next((0, http_errors_1.default)(500, "Error deleting person: " + error));
    }
});
exports.deletePerson = deletePerson;
const searchPersons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q: query } = req.query;
        console.log('Search query:', query);
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(200).json({
                message: "No search query provided",
                data: []
            });
        }
        const searchQuery = query.trim().toLowerCase();
        console.log('Processing search query:', searchQuery);
        const persons = yield prisma_1.prisma.person.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } },
                    { address: { contains: searchQuery, mode: 'insensitive' } },
                    { nationalId: { contains: searchQuery, mode: 'insensitive' } }
                ]
            },
            include: {
                suspect: true,
                missingPerson: true
            },
            take: 10 // Limit results to 10 for better performance
        });
        console.log(`Found ${persons.length} matches`);
        res.status(200).json({
            message: "Search results fetched successfully",
            data: persons
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
