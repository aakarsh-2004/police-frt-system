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
const node_path_1 = __importDefault(require("node:path"));
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
    const files = req.files;
    const { role } = req.user;
    try {
        if (role === 'admin') {
            const { firstName, lastName, age, dateOfBirth, gender, email, phone, address, type, nationalId, nationality, 
            // Files for missing or suspect
            riskLevel, lastSeenDate, lastSeenLocation, missingSince, status, reportBy } = req.body;
            if (!firstName || !lastName || !age || !gender || !email || !phone || !address || !type || !nationality) {
                res.status(400).json({
                    message: 'Missing required fields'
                });
                return;
            }
            if (!req.files || !('personImageUrl' in req.files)) {
                res.status(400).json({
                    message: 'User image is required'
                });
                return;
            }
            const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
            const fileName = files.personImageUrl[0].filename;
            const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
            const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                const imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'person-images',
                    format: personImageMimeType
                });
                const person = yield prisma.person.create({
                    data: {
                        firstName,
                        lastName,
                        age: parseInt(age),
                        dateOfBirth: new Date(dateOfBirth),
                        gender,
                        email,
                        phone,
                        address,
                        personImageUrl: imageUrl.secure_url,
                        type,
                        nationalId,
                        nationality
                    }
                });
                if (type === 'suspect') {
                    const fullName = `${firstName} ${lastName}`;
                    const crimeRecord = yield prisma.crimeRecord.findFirst({
                        where: {
                            personName: {
                                equals: fullName
                            }
                        }
                    });
                    yield prisma.suspect.create({
                        data: {
                            personId: person.id,
                            riskLevel: riskLevel || 'low',
                            foundStatus: false,
                            criminalId: (crimeRecord === null || crimeRecord === void 0 ? void 0 : crimeRecord.id) || null
                        }
                    });
                }
                else if (type === 'missing-person') {
                    yield prisma.missingPerson.create({
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
                return person;
            }));
            res.status(201).json({
                message: `${type} created successfully`,
                person: result
            });
        }
        else {
            const requestData = {
                requestedBy: req.user.id,
                status: 'pending',
                personData: JSON.stringify(Object.assign(Object.assign({}, req.body), { personImageUrl: null }))
            };
            if (files === null || files === void 0 ? void 0 : files.personImageUrl) {
                const fileName = files.personImageUrl[0].filename;
                const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
                const imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'temp-requests'
                });
                requestData.personData = JSON.stringify(Object.assign(Object.assign({}, JSON.parse(requestData.personData)), { personImageUrl: imageUrl.secure_url }));
                node_fs_1.default.unlinkSync(filePath);
            }
            const request = yield prisma_1.prisma.requests.create({
                data: requestData,
                include: {
                    user: true
                }
            });
            res.status(201).json({
                message: "Request created successfully. Waiting for admin approval.",
                data: request
            });
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while creating person/request " + error));
    }
});
exports.createPerson = createPerson;
const updatePerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { firstName, lastName, age, dateOfBirth, gender, email, phone, address, type, nationalId, nationality, 
    // Files for missing or suspect
    riskLevel, foundStatus, lastSeenDate, lastSeenLocation, missingSince, status, reportBy } = req.body;
    const files = req.files;
    const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.personImageUrl[0].filename;
    const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const person = yield prisma.person.findUnique({
                where: {
                    id: id
                }
            });
            if (!person) {
                next((0, http_errors_1.default)(404, "Person not found"));
                return;
            }
            let imageUrl;
            if (files.personImageUrl && person && person.personImageUrl) {
                try {
                    const personSplit = person.personImageUrl.split('/');
                    const lastTwo = personSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const personImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(personImageSplit);
                    }
                }
                catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting target picture ' + error
                    });
                }
                imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'person-images',
                    format: personImageMimeType
                });
            }
            const updatedPerson = yield prisma.person.update({
                where: { id },
                data: {
                    firstName,
                    lastName,
                    age: parseInt(age),
                    dateOfBirth: new Date(dateOfBirth),
                    gender,
                    email,
                    phone,
                    address,
                    personImageUrl: (imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.secure_url) || person.personImageUrl,
                    nationality,
                    nationalId
                }
            });
            if (type === 'suspect') {
                yield prisma.suspect.update({
                    where: { personId: updatedPerson.id },
                    data: {
                        riskLevel: riskLevel || 'low',
                        foundStatus: (parseInt(foundStatus) === 1 ? true : false) || false
                    }
                });
            }
            else if (type === 'missing-person') {
                yield prisma.missingPerson.update({
                    where: { personId: updatedPerson.id },
                    data: {
                        lastSeenDate: new Date(lastSeenDate),
                        lastSeenLocation,
                        missingSince: new Date(missingSince),
                        foundStatus: (parseInt(status) === 1 ? true : false) || false,
                        reportBy
                    }
                });
            }
            return updatedPerson;
        }));
        res.status(200).json({
            message: `${type} updated successfully`,
            person: result
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while updating person " + error));
    }
    finally {
        try {
            node_fs_1.default.unlinkSync(filePath);
            console.log('File deleted successfully');
        }
        catch (error) {
            next((0, http_errors_1.default)(500, "Error while deleting file " + error));
        }
    }
});
exports.updatePerson = updatePerson;
const deletePerson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const person = yield prisma.person.findUnique({
                where: { id }
            });
            if (!person) {
                next((0, http_errors_1.default)(404, "Person not found"));
                return;
            }
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
                    return res.status(500).json({
                        message: 'Error deleting image ' + error
                    });
                }
            }
            if (person.type === 'suspect') {
                yield prisma.suspect.delete({
                    where: { personId: id }
                });
            }
            else if (person.type === 'missing-person') {
                yield prisma.missingPerson.delete({
                    where: { personId: id }
                });
            }
            yield prisma.person.delete({
                where: { id }
            });
            return person;
        }));
        res.status(200).json({
            message: "Person deleted successfully",
            person: result
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while deleting person " + error));
    }
});
exports.deletePerson = deletePerson;
const searchPersons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        console.log('Search query:', query);
        if (!query || typeof query !== 'string' || query.trim() === '') {
            const persons = yield prisma_1.prisma.person.findMany({
                include: {
                    suspect: true,
                    missingPerson: true
                },
                orderBy: {
                    firstName: 'asc'
                }
            });
            return res.status(200).json({
                message: "All persons fetched successfully",
                data: persons
            });
        }
        const searchQuery = query.trim().toLowerCase();
        console.log('Processing search query:', searchQuery);
        const persons = yield prisma_1.prisma.person.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } }
                ]
            },
            include: {
                suspect: true,
                missingPerson: true
            },
            orderBy: {
                firstName: 'asc'
            }
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
