import * as vscode from 'vscode';
import { getConfiguration } from '../configuration';

/**
 * Comments out console logs in the given document, optionally limited to a range
 */
export async function commentAllConsoleLogs(document: vscode.TextDocument, range?: vscode.Range): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^(\\s*)(console\\.(${methods})\\(.*\\);?)`, 'gm');

    const text = range ? document.getText(range) : document.getText();
    const offset = range ? document.offsetAt(range.start) : 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(offset + match.index);
        const endPos = document.positionAt(offset + match.index + match[0].length);
        edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}// ${match[2]}`);
    }
    await vscode.workspace.applyEdit(edit);
}

/**
 * Uncomments console logs in the given document, optionally limited to a range
 */
export async function uncommentAllConsoleLogs(document: vscode.TextDocument, range?: vscode.Range): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^(\\s*)\\/\\/\\s*(console\\.(${methods})\\(.*\\);?)`, 'gm');

    const text = range ? document.getText(range) : document.getText();
    const offset = range ? document.offsetAt(range.start) : 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(offset + match.index);
        const endPos = document.positionAt(offset + match.index + match[0].length);
        edit.replace(document.uri, new vscode.Range(startPos, endPos), `${match[1]}${match[2]}`);
    }
    await vscode.workspace.applyEdit(edit);
}

/**
 * Deletes console logs from the given document, optionally limited to a range
 */
export async function deleteAllConsoleLogs(document: vscode.TextDocument, range?: vscode.Range): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    const config = getConfiguration();
    const methods = config.methods.join('|');
    const regex = new RegExp(`^.*console\\.(${methods})\\(.*\\);?\\r?\\n?`, 'gm');

    const text = range ? document.getText(range) : document.getText();
    const offset = range ? document.offsetAt(range.start) : 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(offset + match.index);
        const endPos = document.positionAt(offset + match.index + match[0].length);
        edit.delete(document.uri, new vscode.Range(startPos, endPos));
    }
    await vscode.workspace.applyEdit(edit);
}
