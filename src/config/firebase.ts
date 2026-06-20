import { applicationDefault, cert, getApps, initializeApp, type AppOptions } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

const resolveGoogleApplicationCredentials = () => {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!credentialsPath || fs.existsSync(credentialsPath)) {
        return;
    }

    if (credentialsPath === '/run/secrets/firebase-service-account.json') {
        const localCredentialsPath = path.resolve(process.cwd(), '../../DockerProject/EA_DockerCompose/secrets/firebase-service-account.json');

        if (fs.existsSync(localCredentialsPath)) {
            process.env.GOOGLE_APPLICATION_CREDENTIALS = localCredentialsPath;
        }
    }
};

const getFirebaseAppOptions = (): AppOptions => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccountJson) {
        return {
            credential: cert(JSON.parse(serviceAccountJson)),
            projectId
        };
    }

    if (serviceAccountBase64) {
        return {
            credential: cert(JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'))),
            projectId
        };
    }

    return {
        credential: applicationDefault(),
        projectId
    };
};

if (!getApps().length) {
    resolveGoogleApplicationCredentials();
    initializeApp(getFirebaseAppOptions());
}

export const fcm = getMessaging();
