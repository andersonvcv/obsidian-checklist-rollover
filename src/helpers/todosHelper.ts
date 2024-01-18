import RolloverTodosPlugin from 'main';
import { App, TFile } from 'obsidian';
import { getTodos } from 'src/get-todos';

export const getAllUnfinishedTodos = async (app: App, plugin: RolloverTodosPlugin, file: TFile) => {
	const dn = await app.vault.read(file);
	const dnLines = dn.split(/\r?\n|\r|\n/g);

	return getTodos({
		lines: dnLines,
		withChildren: plugin.settings.rolloverChildren
	});
};
