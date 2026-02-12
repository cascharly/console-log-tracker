import * as vscode from 'vscode';

/**
 * Handles navigation between logs
 */
export function navigateLogs(logLocations: vscode.Range[], direction: number) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || logLocations.length === 0) {
        return;
    }

    const currentPos = editor.selection.active;
    let targetIndex = 0;

    if (direction === 0) {
        targetIndex = 0;
    } else {
        // Find the next/previous log relative to cursor
        if (direction > 0) {
            targetIndex = logLocations.findIndex(r => r.start.isAfter(currentPos));
            if (targetIndex === -1) {
                targetIndex = 0;
            }
        } else {
            targetIndex = logLocations.slice().reverse().findIndex(r => r.start.isBefore(currentPos));
            if (targetIndex === -1) {
                targetIndex = logLocations.length - 1;
            } else {
                targetIndex = logLocations.length - 1 - targetIndex;
            }
        }
    }

    const targetRange = logLocations[targetIndex];
    editor.selection = new vscode.Selection(targetRange.start, targetRange.start);
    editor.revealRange(targetRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}
