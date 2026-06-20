import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/Route';
import Logging from '../library/Logging';
import { config } from '../config/config';

dotenv.config();

type SeedRoute = {
    _id: string;
    name?: string;
    description: string;
    cover_image: string;
    city: string;
    country: string;
    distance?: number;
    duration?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags?: string[];
    userId: string;
};

const SEED_ROUTES: SeedRoute[] = [
    {
        _id: '66f000000000000000000001',
        name: 'Family route through Galicia',
        description: 'Family route through Galicia. A calm and enjoyable itinerary to discover charming spots, local culture, and memorable moments together.',
        userId: '65f000000000000000000078',
        difficulty: 'medium',
        city: 'Galicia',
        country: 'Spain',
        cover_image: 'https://www.pabloalma.es/wp-content/uploads/fotos_de_familia_en_exteriores_pablo_alma_sevilla-100.webp',
        distance: 12,
        duration: 95,
        tags: []
    },
    {
        _id: '66f000000000000000000002',
        name: 'Unplug and relax route through Galicia',
        description: 'Unplug and relax route through Galicia. A peaceful escape designed to slow down, enjoy the scenery and reconnect with nature and yourself.',
        userId: '65f00000000000000000007a',
        difficulty: 'medium',
        city: 'Galicia',
        country: 'Spain',
        cover_image: 'https://thumbs.dreamstime.com/b/rel%C3%A1jese-escrito-en-una-playa-4323256.jpg',
        distance: 8,
        duration: 70,
        tags: []
    },
    {
        _id: '66f000000000000000000003',
        name: 'Friends route through Galicia',
        description: 'Friends route through Galicia. A fun plan to share good food, great views, and unforgettable moments with your group.',
        userId: '65f00000000000000000007b',
        difficulty: 'medium',
        city: 'Galicia',
        country: 'Spain',
        cover_image: 'https://ageingnomics.fundacionmapfre.org/media/2022/06/familia-amigos-motor-1200x600-1.jpg',
        distance: 15,
        duration: 120,
        tags: []
    },
    {
        _id: '66f000000000000000000004',
        name: 'Rediscover the beauty of Valencia',
        description: 'Rediscover the beauty of Valencia. A route created to admire its character, vibrant streets, and the charm that makes the city special.',
        userId: '65f0000000000000000000c8',
        difficulty: 'medium',
        city: 'Valencia',
        country: 'Spain',
        cover_image: 'https://img.nh-hotels.net/8yYbq/aGoV8/original/Valencia_CAC.jpg?output-quality=70&resize=*:*&background-color=white',
        distance: 9,
        duration: 80,
        tags: []
    },
    {
        _id: '66f000000000000000000005',
        name: 'Bachelor party in Valencia',
        description: 'Bachelor party in Valencia. An energetic route with lively places, great atmosphere, and plans made for celebrating in style.',
        userId: '65f0000000000000000000c8',
        difficulty: 'medium',
        city: 'Valencia',
        country: 'Spain',
        cover_image: 'https://images.squarespace-cdn.com/content/v1/5f7b618b9a735b31389fb9d9/3b6cb3f6-512d-41e3-9d5a-d5d2710eb326/Neverland_by-Unievento+%285%29.jpg',
        distance: 11,
        duration: 100,
        tags: []
    },
    {
        _id: '66f000000000000000000006',
        name: 'Visit Valencia with kids',
        description: 'Visit Valencia with kids. A family-friendly route with entertaining stops, open spaces, and activities everyone can enjoy.',
        userId: '65f0000000000000000000aa',
        difficulty: 'medium',
        city: 'Valencia',
        country: 'Spain',
        cover_image: 'https://parcdelturia.es/wp-content/uploads/2019/07/El-gulliver.jpg',
        distance: 6,
        duration: 65,
        tags: []
    },
    {
        _id: '66f000000000000000000007',
        userId: '65f0000000000000000000a0',
        difficulty: 'medium',
        city: 'Sevilla',
        country: 'Spain',
        name: 'Charming Seville',
        description: 'Charming Seville. A route to experience its warm atmosphere, beautiful corners, and the essence that makes the city unforgettable.',
        cover_image: 'https://conocersevilla.com/wp/wp-content/uploads/2020/11/plaza-de-Espana-.jpg',
        distance: 10,
        duration: 90,
        tags: []
    },
    {
        _id: '66f000000000000000000008',
        name: 'Monuments of Seville',
        description: "Monuments of Seville. An ideal itinerary to explore historic landmarks, impressive architecture, and the city's rich heritage.",
        userId: '65f0000000000000000000a0',
        difficulty: 'medium',
        city: 'Sevilla',
        country: 'Spain',
        cover_image: 'https://cometeelmundo.net/sites/default/files/styles/max_1300x1300/public/media/blog/monumentos-de-sevilla-setas.jpg?itok=vyTavTWa',
        distance: 7,
        duration: 75,
        tags: []
    },
    {
        _id: '66f000000000000000000009',
        name: 'Party route through Seville',
        description: 'Party route through Seville. A vibrant route packed with nightlife, music, and places perfect for an exciting evening out.',
        userId: '65f0000000000000000000a3',
        difficulty: 'medium',
        city: 'Sevilla',
        country: 'Spain',
        cover_image: 'https://www.barcelo.com/guia-turismo/wp-content/uploads/2019/04/fiesta-en-sevilla.jpg',
        distance: 13,
        duration: 115,
        tags: []
    },
    {
        _id: '66f00000000000000000000a',
        name: 'Madrid in black and white',
        description: 'Madrid in black and white. A route with a classic feel, perfect for discovering timeless streets, culture, and elegant city views.',
        userId: '65f000000000000000000098',
        difficulty: 'easy',
        city: 'Madrid',
        country: 'Spain',
        cover_image: 'https://ogotours.es/wp-content/uploads/2016/02/Fotos-antiguas-de-Madrid-blanco-y-negro-1966-768x565.jpg',
        distance: 5,
        duration: 55,
        tags: []
    },
    {
        _id: '66f00000000000000000000b',
        name: 'Modernist Madrid',
        description: 'Modernist Madrid. A route focused on contemporary style, creative spaces, and the most modern side of the capital.',
        userId: '65f00000000000000000009d',
        difficulty: 'easy',
        city: 'Madrid',
        country: 'Spain',
        cover_image: 'https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2023/11/10/16996169796001.jpg',
        distance: 14,
        duration: 110,
        tags: []
    },
    {
        _id: '66f00000000000000000000c',
        userId: '65f000000000000000000098',
        difficulty: 'hard',
        city: 'Madrid',
        country: 'Spain',
        name: 'Madrid in color',
        description: 'Madrid in color. A lively itinerary full of energy, diverse neighborhoods, and vibrant places that showcase the city personality.',
        cover_image: 'https://www.civitatis.com/f/espana/madrid/guia/el-retiro.jpg',
        distance: 16,
        duration: 130,
        tags: []
    },
    {
        _id: '66f00000000000000000000d',
        name: 'Gaudi for a day',
        description: 'Gaudi for a day. A route to immerse yourself in iconic architecture, artistic details, and the unique spirit of Barcelona.',
        userId: '65f000000000000000000099',
        difficulty: 'easy',
        city: 'Barcelona',
        country: 'Spain',
        cover_image: 'https://content-viajes.nationalgeographic.com.es/medio/2025/10/14/adobestock-217054941_db458e5c_251014124339_1280x853.webp',
        distance: 4,
        duration: 50,
        tags: []
    },
    {
        _id: '66f00000000000000000000e',
        name: 'Sunset in Montjuic',
        description: 'Sunset in Montjuic. A scenic route designed to enjoy panoramic views, relaxing walks, and a memorable end of day.',
        userId: '65f0000000000000000000a8',
        difficulty: 'easy',
        city: 'Barcelona',
        country: 'Spain',
        cover_image: 'https://www.laramblabarcelona.com/wp-content/uploads/2018/02/atardecer-en-barcelona-montjuic.jpg',
        distance: 6,
        duration: 60,
        tags: []
    },
    {
        _id: '66f00000000000000000000f',
        name: 'The charms of Pedralbes',
        description: "The charms of Pedralbes. A route through one of Barcelona's most elegant areas, with peaceful surroundings and refined spots to discover.",
        userId: '65f00000000000000000009d',
        difficulty: 'easy',
        city: 'Barcelona',
        country: 'Spain',
        cover_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKvZCNTkm1UXRk3-wSdarS5a9P8ZOyYDUVkg&s',
        distance: 9,
        duration: 85,
        tags: []
    }
];

const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function validateSeedRoutes(routes: SeedRoute[]) {
    routes.forEach((route, index) => {
        if (!ALLOWED_DIFFICULTIES.has(route.difficulty)) {
            throw new Error('Invalid route at index ' + index);
        }

        if (!OBJECT_ID_REGEX.test(route.userId)) {
            throw new Error('Invalid userId at index ' + index);
        }

        if (!OBJECT_ID_REGEX.test(route._id)) {
            throw new Error('Invalid _id at index ' + index);
        }

        if (!route.cover_image || !isValidUrl(route.cover_image)) {
            throw new Error('Invalid cover_image at index ' + index);
        }
    });
}

function mapToInsertableRoute(route: SeedRoute) {
    return {
        _id: route._id,
        name: route.name && route.name.trim().length > 0 ? route.name : ' ',
        description: route.description && route.description.trim().length > 0 ? route.description : ' ',
        cover_image: route.cover_image,
        city: route.city && route.city.trim().length > 0 ? route.city : ' ',
        country: route.country && route.country.trim().length > 0 ? route.country : ' ',
        distance: typeof route.distance === 'number' ? route.distance : 0,
        duration: typeof route.duration === 'number' ? route.duration : 0,
        difficulty: route.difficulty,
        tags: route.tags || [],
        userId: route.userId
    };
}

async function seedRoutes() {
    try {
        const MONGO_URL = config.mongo.url;

        await mongoose.connect(MONGO_URL, { retryWrites: true, w: 'majority' });
        Logging.info('MongoDB connection established');

        await Route.deleteMany({});
        Logging.info('Routes collection cleared');

        validateSeedRoutes(SEED_ROUTES);

        if (!SEED_ROUTES.length) {
            Logging.info('No routes defined in SEED_ROUTES');
            process.exit(0);
        }

        const routesToInsert = SEED_ROUTES.map(mapToInsertableRoute);
        const result = await Route.insertMany(routesToInsert);
        Logging.info('' + result.length + ' routes created successfully');

        process.exit(0);
    } catch (error) {
        Logging.error(`Error creating routes: ${error}`);
        process.exit(1);
    }
}

seedRoutes();
