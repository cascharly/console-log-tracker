import * as vscode from 'vscode';
import type { Config } from '../configuration';
import { getConfiguration } from '../configuration';

/**
 * Represents a single console log location in the document
 */
export interface ScanLocation {
    readonly range: vscode.Range;
    readonly method: string;
    readonly isActive: boolean;
}

/**
 * Result of scanning a document for console logs
 */
export interface ScanResult {
    readonly locations: ReadonlyArray<ScanLocation>;
    readonly count: number;
    readonly activeCount: number;
}

/**
 * Empty scan result constant for early returns
 */
const EMPTY_SCAN_RESULT: ScanResult = Object.freeze({
    locations: [],
    count: 0,
    activeCount: 0
});

/**
 * Builds regex pattern for matching console methods
 */
function buildConsoleRegex(methods: ReadonlyArray<string>): RegExp {
    const methodsPattern = methods.join('|');
    return new RegExp(`\\bconsole\\.(${methodsPattern})\\(`, 'g');
}

/**
 * Checks if a console log is commented out
 */
function isCommented(lineText: string, startCharacter: number): boolean {
    const textBeforeLog = lineText.substring(0, startCharacter);
    return textBeforeLog.includes('//') || textBeforeLog.includes('/*');
}

/**
 * Core scanning logic to find console logs in a document
 */
export function scanDocument(document: vscode.TextDocument): ScanResult {
    const config: Config = getConfiguration();

    if (!config.enabled) {
        return EMPTY_SCAN_RESULT;
    }

    const regex = buildConsoleRegex(config.methods);
    const text = document.getText();
    const locations: ScanLocation[] = [];
    let activeCount = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        const method = match[1];
        if (!method) {
            continue; // Skip if method capture group is missing
        }

        const startPos = document.positionAt(match.index);
        const line = document.lineAt(startPos.line);
        const isActive = !isCommented(line.text, startPos.character);

        if (isActive) {
            activeCount++;
        }

        locations.push({
            range: new vscode.Range(startPos, line.range.end),
            method,
            isActive
        });
    }

    return {
        locations,
        count: locations.length,
        activeCount
    };
}
