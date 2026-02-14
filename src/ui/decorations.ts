import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';
import { getCapabilities } from '../utils/capabilities';

let decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

/**
 * Updates the decoration style based on user settings
 */
export function updateDecorationType(): void {
    // Clear existing decorations
    decorationTypes.forEach(d => d.dispose());
    decorationTypes.clear();

    const config = getConfiguration();
    const capabilities = getCapabilities();
    const defaultColor = config.highlightColor;
    const methodColors = config.colors || {};

    // Create a decoration type for each method defined in configuration
    // and a fallback for others.
    const allMethods = config.methods;

    allMethods.forEach(method => {
        const methodColor = methodColors[method];
        const color = typeof methodColor === 'string' ? methodColor : defaultColor;

        const decorationOptions: vscode.DecorationRenderOptions = {
            borderColor: color,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '2px'
        };

        // Only add overview ruler if supported
        if (capabilities.hasOverviewRuler) {
            decorationOptions.overviewRulerColor = color;
            decorationOptions.overviewRulerLane = vscode.OverviewRulerLane.Right;
        }

        const decoration = vscode.window.createTextEditorDecorationType(decorationOptions);
        decorationTypes.set(method, decoration);
    });

    // Default decoration for any method not specifically matched
    const defaultDecorationOptions: vscode.DecorationRenderOptions = {
        borderColor: defaultColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '2px'
    };

    if (capabilities.hasOverviewRuler) {
        defaultDecorationOptions.overviewRulerColor = defaultColor;
        defaultDecorationOptions.overviewRulerLane = vscode.OverviewRulerLane.Right;
    }

    const defaultDecoration = vscode.window.createTextEditorDecorationType(defaultDecorationOptions);
    decorationTypes.set('default', defaultDecoration);
}

/**
 * Applies decorations to the active editor
 */
export function applyDecorations(
    editor: vscode.TextEditor,
    locations: ReadonlyArray<{ readonly range: vscode.Range; readonly method: string }>
): void {
    // Group ranges by method
    const methodToRanges = new Map<string, vscode.Range[]>();

    locations.forEach(loc => {
        const ranges = methodToRanges.get(loc.method) || [];
        ranges.push(loc.range);
        methodToRanges.set(loc.method, ranges);
    });

    // Apply decorations for each method
    decorationTypes.forEach((decoration, method) => {
        const ranges = methodToRanges.get(method) || [];
        editor.setDecorations(decoration, ranges);
    });

    // Also handle 'default' if there are logs with unknown methods
    const defaultDecoration = decorationTypes.get('default');
    if (defaultDecoration) {
        const usedMethods = Array.from(decorationTypes.keys());
        const otherRanges = locations
            .filter(loc => !usedMethods.includes(loc.method))
            .map(loc => loc.range);
        editor.setDecorations(defaultDecoration, otherRanges);
    }
}

export function disposeDecorations() {
    decorationTypes.forEach(d => d.dispose());
    decorationTypes.clear();
}
