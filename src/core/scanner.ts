import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

export interface ScanLocation {
    range: vscode.Range;
    method: string;
    isActive: boolean;
}

export interface ScanResult {
    locations: ScanLocation[];
    count: number;
    activeCount: number;
}

/**
 * Core scanning logic to find console logs in a document
 */
export function scanDocument(document: vscode.TextDocument): ScanResult {
    const config = getConfiguration();

    if (!config.enabled) {
        return { locations: [], count: 0, activeCount: 0 };
    }

    const methodsRegex = config.methods.join('|');
    // Match console logs (including commented out ones)
    const regex = new RegExp(`\\bconsole\\.(${methodsRegex})\\(`, 'g');

    const locations: ScanLocation[] = [];
    const text = document.getText();
    let match;

    while ((match = regex.exec(text)) !== null) {
        const method = match[1];
        const startPos = document.positionAt(match.index);
        const line = document.lineAt(startPos.line);

        // Very simple check: if // or /* appears before console. on this line, it's commented
        const lineTextBeforeLog = line.text.substring(0, startPos.character);
        const isActive = !lineTextBeforeLog.includes('//') && !lineTextBeforeLog.includes('/*');

        locations.push({
            range: new vscode.Range(startPos, line.range.end),
            method,
            isActive
        });
    }

    return {
        locations,
        count: locations.length,
        activeCount: locations.filter(l => l.isActive).length
    };
}
