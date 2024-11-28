import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedCameras() {
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
        await prisma.camera.upsert({
            where: { id: camera.id },
            update: {},
            create: camera
        });
    }

    console.log('Cameras seeded');
}

async function main() {
    await seedCameras();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.upsert({
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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 