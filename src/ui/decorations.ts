import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

let decorationType: vscode.TextEditorDecorationType | undefined;

/**
 * Updates the decoration style based on user settings
 */
export function updateDecorationType() {
    if (decorationType) {
        decorationType.dispose();
    }

    const config = getConfiguration();
    const color = config.highlightColor;

    decorationType = vscode.window.createTextEditorDecorationType({
        borderColor: color,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '2px',
        overviewRulerColor: color,
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });

    return decorationType;
}

/**
 * Applies decorations to the active editor
 */
export function applyDecorations(editor: vscode.TextEditor, locations: vscode.Range[]) {
    if (decorationType) {
        editor.setDecorations(decorationType, locations);
    }
}

export function disposeDecorations() {
    if (decorationType) {
        decorationType.dispose();
    }
}
