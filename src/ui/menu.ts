import * as vscode from 'vscode';

export async function showQuickPickMenu() {
    const config = vscode.workspace.getConfiguration('consoleLogTracker');
    const isHighlightPermanent = config.get<boolean>('keepHighlights', false);

    const items: (vscode.QuickPickItem & { id: string })[] = [
        {
            label: isHighlightPermanent ? '$(eye-closed) Clear Highlights' : '$(eye) Keep Highlights',
            detail: isHighlightPermanent ? 'Disable permanent highlighting' : 'Enable permanent highlighting',
            id: 'toggleHighlights'
        },
        { label: '$(search) Locate All', detail: 'Jump to the first log found', id: 'locate' },
        { label: '$(arrow-down) Next Log', detail: 'Jump to the next occurrence', id: 'next' },
        { label: '$(comment) Comment All', detail: 'Prefix all logs with //', id: 'comment' },
        { label: '$(comment-discussion) Uncomment All', detail: 'Restore all commented logs', id: 'uncomment' },
        { label: '$(trash) Delete All', detail: 'Remove all logs from file', id: 'delete' },
        { label: '$(settings-gear) Settings', detail: 'Open extension settings', id: 'settings' }
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
            vscode.commands.executeCommand('extension.nextLog');
            break;
        case 'comment':
            vscode.commands.executeCommand('extension.commentAllLogs');
            break;
        case 'uncomment':
            vscode.commands.executeCommand('extension.uncommentAllLogs');
            break;
        case 'delete':
            vscode.commands.executeCommand('extension.deleteAllLogs');
            break;
        case 'settings':
            vscode.commands.executeCommand('workbench.action.openSettings', 'consoleLogTracker');
            break;
    }
}
