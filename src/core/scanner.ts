import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

export interface ScanResult {
    locations: vscode.Range[];
    count: number;
}

/**
 * Core scanning logic to find console logs in a document
 */
export function scanDocument(document: vscode.TextDocument): ScanResult {
    const config = getConfiguration();

    if (!config.enabled) {
        return { locations: [], count: 0 };
    }

    const methodsRegex = config.methods.join('|');
    // Avoid matching commented out logs (// console.log or /* console.log */)
    const regex = new RegExp(`(?<!\\/\\/.*|\\/\\*.*)console\\.(${methodsRegex})\\(`, 'g');

    const locations: vscode.Range[] = [];
    const text = document.getText();
    let match;

    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index);
        const line = document.lineAt(startPos.line);
        const endPos = line.range.end;
        locations.push(new vscode.Range(startPos, endPos));
    }

    return {
        locations,
        count: locations.length
    };
}
