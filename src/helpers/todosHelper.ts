import RolloverTodosPlugin from 'main';
import { TFile } from 'obsidian';
import TodoParser from 'src/todoParser';

export const getLastDailyNoteUnfinishedTodos = async (plugin: RolloverTodosPlugin, note: TFile) => {
	const content = await plugin.app.vault.read(note);

	const todoParser = new TodoParser(content, plugin.settings.rolloverChildren);
	return todoParser.getTodos();
};
