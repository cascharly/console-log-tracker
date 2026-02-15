import * as vscode from 'vscode';
import { getCapabilities } from '../utils/capabilities';

/**
 * Shows the Quick Pick menu with progressive icon support
 */
export async function showQuickPickMenu(): Promise<void> {
    const config = vscode.workspace.getConfiguration('consoleLogTracker');
    const isHighlightPermanent = config.get<boolean>('keepHighlights', false);
    const capabilities = getCapabilities();

    // Use icons only if supported (VS Code 1.44.0+)
    const icon = (name: string) => capabilities.hasQuickPickIcons ? `$(${name}) ` : '';

    const items: (vscode.QuickPickItem & { id: string })[] = [
        { label: `${icon('search')}Locate All`, detail: 'Jump to the first log found', id: 'locate' },
        {
            label: `${icon(isHighlightPermanent ? 'eye-closed' : 'eye')}${isHighlightPermanent ? 'Clear Highlights' : 'Keep Highlights'}`,
            detail: isHighlightPermanent ? 'Disable permanent highlighting' : 'Enable permanent highlighting',
            id: 'toggleHighlights'
        },
        { label: `${icon('arrow-down')}Next Log`, detail: 'Jump to the next occurrence', id: 'next' },
        { label: `${icon('comment')}Comment All`, detail: 'Prefix all logs with //', id: 'comment' },
        { label: `${icon('comment-discussion')}Uncomment All`, detail: 'Restore all commented logs', id: 'uncomment' },
        { label: `${icon('trash')}Delete All`, detail: 'Remove all logs from file', id: 'delete' },
        { label: `${icon('settings-gear')}Settings`, detail: 'Open extension settings', id: 'settings' }
    ];

    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Console Log Tracker Actions'
    });

    if (!selection) {
        return;
    }

    switch (selection.id) {
        case 'toggleHighlights':
            await config.update('keepHighlights', !isHighlightPermanent, vscode.ConfigurationTarget.Global);
            break;
        case 'locate':
            // Navigate first, then highlight to ensure temporary highlights stay visible
            await vscode.commands.executeCommand('extension.nextLog');
            await vscode.commands.executeCommand('extension.highlightLogs');
            break;
        case 'next':
            await vscode.commands.executeCommand('extension.nextLog');
            break;
        case 'comment':
            await vscode.commands.executeCommand('extension.commentAllLogs');
            break;
        case 'uncomment':
            await vscode.commands.executeCommand('extension.uncommentAllLogs');
            break;
        case 'delete':
            await vscode.commands.executeCommand('extension.deleteAllLogs');
            break;
        case 'settings':
            await vscode.commands.executeCommand('workbench.action.openSettings', 'consoleLogTracker');
            break;
    }
}
