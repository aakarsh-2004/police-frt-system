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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function seedCameras() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting camera seeding...');
        const cameras = [
            {
                id: '1',
                location: 'MP Nagar',
                streamUrl: 'test.com',
                latitude: '23.2315',
                longitude: '77.4353',
                name: 'MP Nagar',
                status: 'active',
            },
            {
                id: '2',
                location: 'DB Mall',
                streamUrl: 'test.com',
                latitude: '23.2332',
                longitude: '77.4173',
                name: 'Lalghati',
                status: 'active',
            },
            {
                id: '3',
                location: 'Bittan Market',
                streamUrl: 'test.com',
                latitude: '23.23964593588707',
                longitude: '77.35441786813742',
                name: 'Bittan Market',
                status: 'active',
            },
            {
                id: '4',
                location: 'Habibganj railway station',
                streamUrl: 'test.com',
                latitude: '23.2337',
                longitude: '77.4349',
                name: 'Habibganj railway station',
                status: 'active',
            },
            {
                id: '5',
                location: 'BHEL',
                streamUrl: 'test.com',
                latitude: '23.264464270235067',
                longitude: '77.50793403018244',
                name: 'BHEL',
                status: 'active',
            },
            {
                id: '6',
                location: 'New Market',
                streamUrl: 'test.com',
                latitude: '23.233',
                longitude: '77.4006',
                name: 'New Market',
                status: 'active',
            },
            {
                id: '7',
                location: 'Maharana Pratap Nagar',
                streamUrl: 'test.com',
                latitude: '23.2329',
                longitude: '77.4343',
                name: 'Maharana Pratap Nagar',
                status: 'active',
            },
            {
                id: '8',
                location: 'Van Vihar National Park',
                streamUrl: 'test.com',
                latitude: '23.2334',
                longitude: '77.3650',
                name: 'Van Vihar',
                status: 'active',
            },
            {
                id: '9',
                location: 'Bhopal Junction Railway Station',
                streamUrl: 'test.com',
                latitude: '23.2687',
                longitude: '77.4259',
                name: 'Bhopal Junction',
                status: 'active',
            },
            {
                id: '10',
                location: '10 Number Market',
                streamUrl: 'test.com',
                latitude: '23.2516',
                longitude: '77.4324',
                name: '10 Number Market',
                status: 'active',
            },
            {
                id: '11',
                location: 'Kamla Park',
                streamUrl: 'test.com',
                latitude: '23.2612',
                longitude: '77.4051',
                name: 'Kamla Park',
                status: 'active',
            }
        ];
        console.log('Creating cameras...');
        for (const camera of cameras) {
            yield prisma.camera.upsert({
                where: { id: camera.id },
                update: {},
                create: camera
            });
        }
        console.log('Cameras created successfully');
        console.log('Creating detections...');
        for (const camera of cameras) {
            const numDetections = Math.floor(Math.random() * 20) + 5;
            console.log(`Creating ${numDetections} detections for camera ${camera.name}...`);
            const detections = Array.from({ length: numDetections }, () => ({
                cameraId: camera.id,
                personId: "1",
                capturedDateTime: new Date(),
                capturedImageUrl: "https://static.vecteezy.com/system/resources/previews/001/131/187/large_2x/serious-man-portrait-real-people-high-definition-grey-background-photo.jpg",
                confidenceScore: (Math.random() * 100).toString()
            }));
            yield prisma.recognizedPerson.createMany({
                data: detections
            });
        }
        console.log('All cameras and detections seeded successfully');
    });
}
function seedPersons() {
    return __awaiter(this, void 0, void 0, function* () {
        const suspects = [
            {
                id: "1",
                firstName: "Aakarsh",
                lastName: "Beohar",
                age: 20,
                dateOfBirth: new Date("1994-05-15"),
                gender: "male",
                email: "aakarsh@beohar.com",
                phone: "+919876543210",
                address: "123 MP Nagar, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787365/person-images/zvzzcsqsxxccfbf7xzag.jpg",
                type: "suspect",
                nationalId: "ABCD1234",
                nationality: "Indian",
                suspect: {
                    create: {
                        riskLevel: "high",
                        foundStatus: false
                    }
                }
            },
            {
                id: "2",
                firstName: "Vansh",
                lastName: "Rathi",
                age: 21,
                dateOfBirth: new Date("1996-03-20"),
                gender: "male",
                email: "vansh@rathi.com",
                phone: "+919876543211",
                address: "456 Arera Colony, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787475/person-images/ic87h0dvt2gqg0v0paos.jpg",
                type: "suspect",
                nationalId: "EFGH5678",
                nationality: "Indian",
                suspect: {
                    create: {
                        riskLevel: "medium",
                        foundStatus: false
                    }
                }
            },
            {
                id: "3",
                firstName: "Amrita",
                lastName: "Maravi",
                age: 22,
                dateOfBirth: new Date("1989-08-10"),
                gender: "female",
                email: "amrita@maravi.com",
                phone: "+919876543212",
                address: "789 New Market, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732963597/person-images/ere9sjba5bbyue0kueps.jpg",
                type: "suspect",
                nationalId: "IJKL9012",
                nationality: "Indian",
                suspect: {
                    create: {
                        riskLevel: "low",
                        foundStatus: false
                    }
                }
            }
        ];
        const missingPersons = [
            {
                id: "4",
                firstName: "Gaurav",
                lastName: "Diwan",
                age: 21,
                dateOfBirth: new Date("1999-02-12"),
                gender: "male",
                email: "amrita@maravi.com",
                phone: "+919876543213",
                address: "321 Shahpura, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732963442/person-images/m9p55itpabngxs8ncsre.jpg",
                type: "missing-person",
                nationalId: "MNOP3456",
                nationality: "Indian",
                missingPerson: {
                    create: {
                        lastSeenDate: new Date("2024-03-01"),
                        lastSeenLocation: "Shahpura Lake",
                        missingSince: new Date("2024-03-01"),
                        foundStatus: false,
                        reportBy: "Family Member"
                    }
                }
            },
            {
                id: "5",
                firstName: "Aayush",
                lastName: "Chouksey",
                age: 22,
                dateOfBirth: new Date("2005-06-25"),
                gender: "male",
                email: "aayush@chouksey.com",
                phone: "+919876543214",
                address: "654 Kolar Road, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787752/person-images/cxxhghtshsvmlxcjmubf.jpg",
                type: "missing-person",
                nationalId: "QRST7890",
                nationality: "Indian",
                missingPerson: {
                    create: {
                        lastSeenDate: new Date("2024-02-15"),
                        lastSeenLocation: "DB Mall",
                        missingSince: new Date("2024-02-15"),
                        foundStatus: false,
                        reportBy: "College Authority"
                    }
                }
            },
            {
                id: "6",
                firstName: "Hamza",
                lastName: "Sanwala",
                age: 22,
                dateOfBirth: new Date("2002-11-30"),
                gender: "male",
                email: "hamza@sanwala.com",
                phone: "+919876543215",
                address: "987 BHEL, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732898032/person-images/dsezyr7ciqottvt24vmv.jpg",
                type: "missing-person",
                nationalId: "UVWX1234",
                nationality: "Indian",
                missingPerson: {
                    create: {
                        lastSeenDate: new Date("2024-03-10"),
                        lastSeenLocation: "MP Nagar",
                        missingSince: new Date("2024-03-10"),
                        foundStatus: false,
                        reportBy: "Friend"
                    }
                }
            }
        ];
        for (const suspect of suspects) {
            yield prisma.person.upsert({
                where: { id: suspect.id },
                update: {},
                create: suspect
            });
        }
        for (const missingPerson of missingPersons) {
            yield prisma.person.upsert({
                where: { id: missingPerson.id },
                update: {},
                create: missingPerson
            });
        }
        console.log('Persons seeded');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield seedCameras();
        yield seedPersons();
        const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
        const hashedUserPassword = yield bcrypt_1.default.hash('user123', 10);
        yield prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                designation: 'System Administrator',
                userImageUrl: 'https://media.licdn.com/dms/image/v2/D4D03AQGpRSx3IqQ8BQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1718230591723?e=1738800000&v=beta&t=rf6jxx2MwCgtJgGKgqROKGkgxBBBcPpAm2Z4GbnODkc'
            },
        });
        yield prisma.user.upsert({
            where: { username: 'user' },
            update: {},
            create: {
                username: 'user',
                password: hashedUserPassword,
                email: 'user@example.com',
                firstName: 'User',
                lastName: 'User',
                role: 'non-admin',
                designation: 'System Tester'
            }
        });
        console.log('Seed completed');
    });
}
main()
    .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
})
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
