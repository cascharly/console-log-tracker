import * as vscode from 'vscode';

/**
 * Supported console methods for tracking
 */
export const CONSOLE_METHODS = [
    'log',
    'warn',
    'error',
    'info',
    'debug',
    'table',
    'trace',
    'dir',
    'group'
] as const;

export type ConsoleMethod = typeof CONSOLE_METHODS[number];

/**
 * Extension configuration
 */
export interface Config {
    readonly enabled: boolean;
    readonly methods: ReadonlyArray<ConsoleMethod>;
    readonly highlightColor: string;
    readonly debounceTimeout: number;
    readonly colors: Record<string, string>;
    readonly keepHighlights: boolean;
}

const DEFAULT_CONFIG: Config = {
    enabled: true,
    methods: ['log', 'warn', 'error', 'info'],
    highlightColor: '#FFB471',
    debounceTimeout: 1000,
    colors: {
        log: '#FFB471',
        warn: '#FFD700',
        error: '#FF4D4D',
        info: '#4DA6FF',
    },
    keepHighlights: false,
};

function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && isFinite(value);
}

function isConsoleMethod(value: unknown): value is ConsoleMethod {
    return typeof value === 'string' && (CONSOLE_METHODS as ReadonlyArray<string>).includes(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    return Object.values(value).every(v => typeof v === 'string');
}

/**
 * Retrieves and validates the extension configuration.
 * Falls back to defaults for any invalid values.
 */
export function getConfiguration(): Config {
    const config = vscode.workspace.getConfiguration('consoleLogTracker');

    const rawEnabled = config.get('enabled');
    const rawMethods = config.get('methods');
    const rawHighlightColor = config.get('highlightColor');
    const rawDebounceTimeout = config.get('debounceTimeout');
    const rawColors = config.get('colors');
    const rawKeepHighlights = config.get('keepHighlights');

    const methods: ConsoleMethod[] = Array.isArray(rawMethods)
        ? rawMethods.filter(isConsoleMethod)
        : [...DEFAULT_CONFIG.methods];

    return {
        enabled: isBoolean(rawEnabled) ? rawEnabled : DEFAULT_CONFIG.enabled,
        methods: methods.length > 0 ? methods : [...DEFAULT_CONFIG.methods],
        highlightColor: isString(rawHighlightColor) && rawHighlightColor.length > 0
            ? rawHighlightColor
            : DEFAULT_CONFIG.highlightColor,
        debounceTimeout: isNumber(rawDebounceTimeout) && rawDebounceTimeout >= 0
            ? rawDebounceTimeout
            : DEFAULT_CONFIG.debounceTimeout,
        colors: isStringRecord(rawColors) ? rawColors : { ...DEFAULT_CONFIG.colors },
        keepHighlights: isBoolean(rawKeepHighlights) ? rawKeepHighlights : DEFAULT_CONFIG.keepHighlights,
    };
}
