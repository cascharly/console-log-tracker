import * as vscode from 'vscode';
import { z } from 'zod';

export const consoleMethodsSchema = z.enum([
    'log',
    'warn',
    'error',
    'info',
    'debug',
    'table',
    'trace',
    'dir',
    'group'
]);

export const configSchema = z.object({
    enabled: z.boolean().default(true),
    methods: z.array(consoleMethodsSchema).default(['log', 'warn', 'error', 'info']),
    highlightColor: z.string().default('#FFB471'),
    debounceTimeout: z.number().min(0).default(1000),
    autoCleanupOnSave: z.boolean().default(false),
});

export type Config = z.infer<typeof configSchema>;

export function getConfiguration(): Config {
    const config = vscode.workspace.getConfiguration('consoleLogTracker');

    // Create an object with the same keys as our schema
    const rawConfig = {
        enabled: config.get('enabled'),
        methods: config.get('methods'),
        highlightColor: config.get('highlightColor'),
        debounceTimeout: config.get('debounceTimeout'),
        autoCleanupOnSave: config.get('autoCleanupOnSave'),
    };

    return configSchema.parse(rawConfig);
}
