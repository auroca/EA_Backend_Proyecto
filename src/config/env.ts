import dotenv from 'dotenv';
import path from 'path';

let environmentLoaded = false;

export const loadEnvironment = () => {
    if (environmentLoaded) {
        return;
    }

    environmentLoaded = true;

    dotenv.config();
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    const dockerProfile = process.env.DOCKER_PROFILE || 'development';
    dotenv.config({
        path: path.resolve(process.cwd(), '../../DockerProject/EA_DockerCompose', `.env.${dockerProfile}`)
    });
};
