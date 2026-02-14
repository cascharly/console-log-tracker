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
    colors: z.record(z.string(), z.string()).default({
        log: '#FFB471',
        warn: '#FFD700',
        error: '#FF4D4D',
        info: '#4DA6FF'
    }),
    autoCleanupOnSave: z.boolean().default(false),
    keepHighlights: z.boolean().default(false),
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
        colors: config.get('colors'),
        autoCleanupOnSave: config.get('autoCleanupOnSave'),
        keepHighlights: config.get('keepHighlights'),
    };

    return configSchema.parse(rawConfig);
}
