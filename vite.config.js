import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import os from 'os';

function getLocalIp() {
    // Allow overriding/disabling LAN auto-detection explicitly, e.g. for
    // sandboxed/CI environments where the detected IP isn't reachable.
    if (process.env.VITE_HMR_HOST) {
        return process.env.VITE_HMR_HOST;
    }

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const localIp = getLocalIp();

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        hmr: {
            host: localIp,
        },
    },
});

