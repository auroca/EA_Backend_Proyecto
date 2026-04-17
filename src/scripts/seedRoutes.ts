import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/Route';
import Logging from '../library/Logging';

dotenv.config();

type SeedRoute = {
    _id: string;
    name?: string;
    description: string;
    city: string;
    country: string;
    distance?: number;
    duration?: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags?: string[];
    images?: string[];
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
        distance: 12,
        duration: 95,
        images: [
            'https://www.portugalgreenwalks.com/wordpress/wp-content/uploads/2025/09/Geres-Xures_Cross-Border_Cycling_Holiday-15.jpg',
            '',
            '',
            ''
        ],
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
        distance: 8,
        duration: 70,
        images: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO6jsvNlx8W-nZnAWQ40KctvwxJT5iHp9tew&s',
            '',
            '',
            ''
        ],
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
        distance: 15,
        duration: 120,
        images: [
            'https://content-viajes.nationalgeographic.com.es/medio/2025/05/22/porto-do-barqueiro_eaeee80c_1173938656_250522151316_1280x658.webp',
            '',
            '',
            ''
        ],
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
        distance: 9,
        duration: 80,
        images: [
            'https://pohcdn.com/sites/default/files/styles/paragraph__live_banner__lb_image__1880bp/public/live_banner/Valencia-1.jpg',
            '',
            '',
            ''
        ],
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
        distance: 11,
        duration: 100,
        images: [
            'https://s3-eu-west-1.amazonaws.com/cv-developments/production%2Fimages%2Fe585121c-423b-cddc-d371-47d433a9bff1%2FEnterrement-de-vie-de-garcon---Budapest---Crazy-Night---Entree-club-Peach.jpg',
            '',
            '',
            ''
        ],
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
        distance: 6,
        duration: 65,
        images: [
            'https://www.gancarczyk.com/wp-content/uploads/2025/03/valencia-01.jpg',
            '',
            '',
            ''
        ],
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
        distance: 10,
        duration: 90,
        images: [
            'https://www.elcaminoconcorreos.com/admin/files/articulos/67/que-ver-en-sevilla.jpg',
            '',
            '',
            ''
        ],
        tags: []
    },
    {
        _id: '66f000000000000000000008',
        name: 'Monuments of Seville',
        description: 'Monuments of Seville. An ideal itinerary to explore historic landmarks, impressive architecture, and the city\'s rich heritage.',
        userId: '65f0000000000000000000a0',
        difficulty: 'medium',
        city: 'Sevilla',
        country: 'Spain',
        distance: 7,
        duration: 75,
        images: [
            'https://cometeelmundo.net/sites/default/files/styles/max_1300x1300/public/media/blog/monumentos-de-sevilla-setas.jpg?itok=vyTavTWa',
            '',
            '',
            ''
        ],
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
        distance: 13,
        duration: 115,
        images: [
            'https://img.freepik.com/foto-gratis/amigos-tintinean-vasos-bebida-bar-moderno_1150-18971.jpg?semt=ais_hybrid&w=740&q=80',
            '',
            '',
            ''
        ],
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
        distance: 5,
        duration: 55,
        images: [
            'https://www.texfoto.com/3192/cuadro-de-la-calle-gran-via-de-dia-de-madrid-n01-bn.jpg',
            '',
            '',
            ''
        ],
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
        distance: 14,
        duration: 110,
        images: [
            'https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2023/11/10/16996169796001.jpg',
            '',
            '',
            ''
        ],
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
        distance: 16,
        duration: 130,
        images: [
            'https://cdn.sanity.io/images/nxpteyfv/goguides/4a55354748d15def52cef940c60b860eb64ef1c9-1600x1066.jpg',
            '',
            '',
            ''
        ],
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
        distance: 4,
        duration: 50,
        images: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbQUhwt4ZDRPkB4WCb_Lup1ILRuz1-vT0Yvg&s',
            '',
            '',
            ''
        ],
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
        distance: 6,
        duration: 60,
        images: [
            'https://www.iconobarcelonatours.com/wp-content/uploads/2025/08/aerial-view-of-typical-buildings-of-barcelona-city-2025-01-08-03-52-02-utc-min-scaled.webp',
            '',
            '',
            ''
        ],
        tags: []
    },
    {
        _id: '66f00000000000000000000f',
        name: 'The charms of Pedralbes',
        description: 'The charms of Pedralbes. A route through one of Barcelona\'s most elegant areas, with peaceful surroundings and refined spots to discover.',
        userId: '65f00000000000000000009d',
        difficulty: 'easy',
        city: 'Barcelona',
        country: 'Spain',
        distance: 9,
        duration: 85,
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/67/02/25/reial-monestir-de-santa.jpg?w=900&h=500&s=1',
            '',
            '',
            ''
        ],
        tags: []
    }
];

const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

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
    });
}

function isCompleteRoute(route: SeedRoute): boolean {
    const hasRequiredStrings =
        !!route.name &&
        !!route.description &&
        !!route.city &&
        !!route.country &&
        !!route.userId;

    const hasRequiredNumbers =
        typeof route.distance === 'number' &&
        typeof route.duration === 'number';

    return hasRequiredStrings && hasRequiredNumbers;
}

function mapToInsertableRoute(route: SeedRoute) {
    return {
        _id: route._id,
        name: route.name && route.name.trim().length > 0 ? route.name : ' ',
        description: route.description && route.description.trim().length > 0 ? route.description : ' ',
        city: route.city && route.city.trim().length > 0 ? route.city : ' ',
        country: route.country && route.country.trim().length > 0 ? route.country : ' ',
        distance: typeof route.distance === 'number' ? route.distance : 0,
        duration: typeof route.duration === 'number' ? route.duration : 0,
        difficulty: route.difficulty,
        tags: route.tags || [],
        images: route.images || [],
        userId: route.userId
    };
}

async function seedRoutes() {
    try {
        const MONGO_URL = process.env.MONGO_URI || '';
        if (!MONGO_URL) {
            throw new Error('MONGO_URI is not configured in .env');
        }

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