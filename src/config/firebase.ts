import { applicationDefault, cert, getApps, initializeApp, type AppOptions, type ServiceAccount } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import Logging from '../library/Logging';
import { loadEnvironment } from './env';

loadEnvironment();

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

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        Logging.warning('Firebase credentials file was not found', {
            credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
    }
};

const normalizePrivateKey = (privateKey: string) => privateKey.replace(/\\n/g, '\n');

const normalizeServiceAccount = (serviceAccount: ServiceAccount): ServiceAccount => ({
    ...serviceAccount,
    privateKey: serviceAccount.privateKey ? normalizePrivateKey(serviceAccount.privateKey) : serviceAccount.privateKey
});

const parseServiceAccount = (rawValue: string, source: string): ServiceAccount => {
    try {
        return normalizeServiceAccount(JSON.parse(rawValue) as ServiceAccount);
    } catch (error) {
        Logging.error(`Invalid Firebase service account in ${source}`, error);
        throw error;
    }
};

const getServiceAccountFromEnv = (): ServiceAccount | null => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;

    if (serviceAccountJson) {
        return parseServiceAccount(serviceAccountJson, 'FIREBASE_SERVICE_ACCOUNT_JSON');
    }

    if (serviceAccountBase64) {
        return parseServiceAccount(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'), 'FIREBASE_SERVICE_ACCOUNT_BASE64');
    }

    const resolvedPrivateKey = privateKeyBase64 ? Buffer.from(privateKeyBase64, 'base64').toString('utf8') : privateKey;

    if (projectId && clientEmail && resolvedPrivateKey) {
        return {
            projectId,
            clientEmail,
            privateKey: normalizePrivateKey(resolvedPrivateKey)
        };
    }

    return null;
};

const getFirebaseAppOptions = (): AppOptions => {
    const serviceAccount = getServiceAccountFromEnv();
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (serviceAccount) {
        return {
            credential: cert(serviceAccount),
            projectId
        };
    }

    resolveGoogleApplicationCredentials();

    return {
        credential: applicationDefault(),
        projectId
    };
};

if (!getApps().length) {
    initializeApp(getFirebaseAppOptions());
}

export const fcm = getMessaging();
