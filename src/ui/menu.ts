import * as vscode from 'vscode';

export async function showQuickPickMenu() {
    const items: (vscode.QuickPickItem & { id: string })[] = [
        { label: '$(check) HighLight', detail: 'Highlight all console logs (manual)', id: 'highlight' },
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
        case 'highlight':
            vscode.commands.executeCommand('extension.highlightLogs');
            break;
        case 'locate':
            vscode.commands.executeCommand('extension.nextLog'); // Currently triggers navigation starting at index 0 or similar
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
