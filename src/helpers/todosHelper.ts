import RolloverTodosPlugin from 'main';
import { TFile } from 'obsidian';
import TodoParser from 'src/TodoParser';

export const getAllUnfinishedTodos = async (plugin: RolloverTodosPlugin, note: TFile) => {
	const content = await plugin.app.vault.read(note);
	const contentLines = content.split(/\r?\n|\r|\n/g);

	const todoParser = new TodoParser(contentLines, plugin.settings.rolloverChildren);
	return todoParser.getTodos();
};
