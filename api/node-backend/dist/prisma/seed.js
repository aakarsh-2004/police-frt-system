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
const cameras = [
    {
        id: '1',
        location: 'MP Nagar',
        streamUrl: 'ws://localhost:8083/stream/a8d21378-0eac-4db4-a9ff-d73d19054d5e/channel/0/mse?uuid=a8d21378-0eac-4db4-a9ff-d73d19054d5e&channel=0',
        latitude: '23.2315',
        longitude: '77.4353',
        name: 'MP Nagar',
        status: 'active',
    },
    {
        id: '2',
        location: 'DB Mall',
        streamUrl: 'ws://localhost:8083/stream/f4604be9-bea2-44e1-af7c-609ae9a2f7c1/channel/0/mse?uuid=f4604be9-bea2-44e1-af7c-609ae9a2f7c1&channel=0',
        latitude: '23.2332',
        longitude: '77.4173',
        name: 'Lalghati',
        status: 'active',
    },
    {
        id: '3',
        location: 'Bittan Market',
        streamUrl: 'ws://localhost:8083/stream/60d0b153-545b-43c1-97ec-797161af2038/channel/0/mse?uuid=60d0b153-545b-43c1-97ec-797161af2038&channel=0',
        latitude: '23.23964593588707',
        longitude: '77.35441786813742',
        name: 'Bittan Market',
        status: 'active',
    },
    {
        id: '4',
        location: 'Habibganj railway station',
        streamUrl: 'ws://localhost:8083/stream/94019b3f-4541-4100-ae81-bd7bc319e3c8/channel/0/mse?uuid=94019b3f-4541-4100-ae81-bd7bc319e3c8&channel=0',
        latitude: '23.2337',
        longitude: '77.4349',
        name: 'Habibganj railway station',
        status: 'active',
    },
    {
        id: '5',
        location: 'BHEL',
        streamUrl: 'ws://localhost:8083/stream/a52feeeb-8cc7-418b-ad88-ae757d5a6433/channel/0/mse?uuid=a52feeeb-8cc7-418b-ad88-ae757d5a6433&channel=0',
        latitude: '23.264464270235067',
        longitude: '77.50793403018244',
        name: 'BHEL',
        status: 'active',
    },
    {
        id: '6',
        location: 'New Market',
        streamUrl: 'ws://localhost:8083/stream/c0220694-546b-49dd-8c77-93203ab904d5/channel/0/mse?uuid=c0220694-546b-49dd-8c77-93203ab904d5&channel=0',
        latitude: '23.233',
        longitude: '77.4006',
        name: 'New Market',
        status: 'active',
    }
];
function seedCameras() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Creating cameras...');
        for (const camera of cameras) {
            yield prisma.camera.upsert({
                where: { id: camera.id },
                update: {},
                create: camera
            });
        }
        console.log('Cameras created successfully');
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
                type: "suspect",
                email: "aakarsh@beohar.com",
                phone: "+919876543210",
                address: "123 MP Nagar, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787365/person-images/zvzzcsqsxxccfbf7xzag.jpg",
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
                type: "suspect",
                email: "vansh@rathi.com",
                phone: "+919876543211",
                address: "456 Arera Colony, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787475/person-images/ic87h0dvt2gqg0v0paos.jpg",
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
                type: "suspect",
                email: "amrita@maravi.com",
                phone: "+919876543212",
                address: "789 New Market, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732963597/person-images/ere9sjba5bbyue0kueps.jpg",
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
                type: "missing-person",
                address: "321 Shahpura, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732963442/person-images/m9p55itpabngxs8ncsre.jpg",
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
                type: "missing-person",
                gender: "male",
                email: "aayush@chouksey.com",
                phone: "+919876543214",
                address: "654 Kolar Road, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732787752/person-images/cxxhghtshsvmlxcjmubf.jpg",
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
                type: "missing-person",
                phone: "+919876543215",
                address: "987 BHEL, Bhopal",
                personImageUrl: "https://res.cloudinary.com/dwbr9hz8y/image/upload/v1732898032/person-images/dsezyr7ciqottvt24vmv.jpg",
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
        console.log('Creating suspects...');
        for (const suspect of suspects) {
            yield prisma.person.upsert({
                where: { id: suspect.id },
                update: {},
                create: suspect
            });
        }
        console.log('Creating missing persons...');
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
function seedDetections() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Creating detections...');
        yield new Promise(resolve => setTimeout(resolve, 1000));
        for (const camera of cameras) {
            const numDetections = Math.floor(Math.random() * 20) + 5;
            console.log(`Creating ${numDetections} detections for camera ${camera.name}...`);
            for (let i = 0; i < numDetections; i++) {
                try {
                    yield prisma.recognizedPerson.create({
                        data: {
                            cameraId: camera.id,
                            personId: "1",
                            capturedDateTime: new Date(),
                            capturedImageUrl: "https://static.vecteezy.com/system/resources/previews/001/131/187/large_2x/serious-man-portrait-real-people-high-definition-grey-background-photo.jpg",
                            confidenceScore: (Math.random() * 100).toString()
                        }
                    });
                }
                catch (error) {
                    console.error(`Error creating detection: ${error}`);
                }
            }
        }
        console.log('All detections created successfully');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting seed...');
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
            yield seedCameras();
            yield seedPersons();
            yield seedDetections();
            console.log('Seed completed successfully');
        }
        catch (error) {
            console.error('Error during seeding:', error);
            throw error;
        }
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
