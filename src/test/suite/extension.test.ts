import assert from 'assert';
import * as vscode from 'vscode';

suite('Console Log Tracker Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('CarlosSpagnoletti.console-log-tracker'));
	});

	test('Should comment out console.log statements', async () => {
		const document = await vscode.workspace.openTextDocument({
			content: 'console.log("test");\nconsole.warn("warning");',
			language: 'typescript'
		});
		await vscode.window.showTextDocument(document);

		// Wait a bit for the extension to activate and scan
		await new Promise(resolve => setTimeout(resolve, 2000));

		await vscode.commands.executeCommand('extension.commentAllLogs');

		const text = document.getText();
		assert.ok(text.includes('// console.log("test");'));
		assert.ok(text.includes('// console.warn("warning");'));
	});

	test('Should uncomment console.log statements', async () => {
		const document = await vscode.workspace.openTextDocument({
			content: '// console.log("test");\n// console.warn("warning");',
			language: 'typescript'
		});
		await vscode.window.showTextDocument(document);

		await new Promise(resolve => setTimeout(resolve, 1000));

		await vscode.commands.executeCommand('extension.uncommentAllLogs');

		const text = document.getText();
		assert.ok(text.includes('console.log("test");'));
		assert.ok(text.includes('console.warn("warning");'));
		assert.ok(!text.includes('// console.log'));
	});

	test('Should delete console.log statements', async () => {
		const document = await vscode.workspace.openTextDocument({
			content: 'const x = 10;\nconsole.log(x);\nconst y = 20;',
			language: 'typescript'
		});
		await vscode.window.showTextDocument(document);

		await new Promise(resolve => setTimeout(resolve, 1000));

		await vscode.commands.executeCommand('extension.deleteAllLogs');

		const text = document.getText();
		assert.ok(text.includes('const x = 10;'));
		assert.ok(text.includes('const y = 20;'));
		assert.ok(!text.includes('console.log'));
	});

	test('Should respect configuration settings (methods)', async () => {
		const config = vscode.workspace.getConfiguration('consoleLogTracker');

		await config.update('methods', ['error'], vscode.ConfigurationTarget.Global);

		await new Promise(resolve => setTimeout(resolve, 1000));

		const document = await vscode.workspace.openTextDocument({
			content: 'console.log("keep me");\nconsole.error("comment me");',
			language: 'typescript'
		});
		await vscode.window.showTextDocument(document);

		await new Promise(resolve => setTimeout(resolve, 1500));
		await vscode.commands.executeCommand('extension.commentAllLogs');

		const text = document.getText();
		assert.ok(text.includes('console.log("keep me");'), 'Log should not be commented when tracking only error');
		assert.ok(text.includes('// console.error("comment me");'), 'Error should be commented');

		// Reset configuration
		await config.update('methods', ['log', 'warn', 'error', 'info'], vscode.ConfigurationTarget.Global);
	});
});
