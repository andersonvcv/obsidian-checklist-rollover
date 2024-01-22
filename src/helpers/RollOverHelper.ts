import RolloverTodosPlugin from 'main';
import Note from 'src/note';
import TodoParser from 'src/parsers/todoParser';
import { getPreviousDailyNote, getTodaysNote } from './dailyNotesHelper';
import { TFile } from 'obsidian';

export const rollover = async (plugin: RolloverTodosPlugin) => {
	const todoParser = new TodoParser();
	const todayDailyNote = getTodaysNote();
	const lastNote = await createNote(plugin, todoParser, getPreviousDailyNote(plugin.app));
	const todayNote = await createNote(plugin, todoParser, todayDailyNote);

	if (plugin.settings.templateHeading === 'none') {
		todayNote.rollOver(lastNote);
	} else {
		todayNote.rollOverToSingleHeader(lastNote, plugin.settings.templateHeading);
	}

	await plugin.app.vault.modify(todayDailyNote, todayNote.content);
};

const createNote = async (plugin: RolloverTodosPlugin, todoParser: TodoParser, noteFile: TFile) => {
	const lastDailyNoteContent = await plugin.app.vault.read(noteFile);
	return new Note(todoParser, lastDailyNoteContent);
};
