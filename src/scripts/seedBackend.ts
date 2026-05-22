import { spawn } from 'child_process';
import path from 'path';
import Logging from '../library/Logging';

function runSeedScript(scriptFileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, scriptFileName);
        const child = spawn(process.execPath, [scriptPath], {
            stdio: 'inherit'
        });

        child.on('error', (error) => {
            reject(new Error(`Could not run ${scriptFileName}: ${String(error)}`));
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${scriptFileName} finished with exit code ${String(code)}`));
        });
    });
}

async function seedBackend() {
    try {
        await runSeedScript('seedUsers.js');
        await runSeedScript('seedRoutes.js');
        await runSeedScript('seedPoints.js');
        process.exit(0);
    } catch (error) {
        Logging.error(`Error while running seedBackend: ${String(error)}`);
        process.exit(1);
    }
}

seedBackend();
