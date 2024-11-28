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
        const cameras = [
            {
                id: '1',
                location: 'Front Door Camera',
                cameraUrl: '/videos/1.mp4'
            },
            {
                id: '2',
                location: 'Back Door Camera',
                cameraUrl: '/videos/2.mp4'
            },
            {
                id: '3',
                location: 'Garage Camera',
                cameraUrl: '/videos/3.mp4'
            },
            {
                id: '4',
                location: 'Side Entrance',
                cameraUrl: '/videos/4.mp4'
            },
            {
                id: '5',
                location: 'Parking Area',
                cameraUrl: '/videos/5.mp4'
            },
            {
                id: '6',
                location: 'Main Gate',
                cameraUrl: '/videos/6.mp4'
            }
        ];
        for (const camera of cameras) {
            yield prisma.camera.upsert({
                where: { id: camera.id },
                update: {},
                create: camera
            });
        }
        console.log('Cameras seeded');
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield seedCameras();
        const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
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
                designation: 'System Administrator'
            },
        });
        console.log('Seed completed');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
