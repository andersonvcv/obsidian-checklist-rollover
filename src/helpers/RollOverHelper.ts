import RolloverTodosPlugin from 'main';
import Note from 'src/note';
import TodoParser from 'src/parsers/todoParser';
import { getPreviousDailyNote, getTodaysNote } from './dailyNotesHelper';

export const rollover = async (plugin: RolloverTodosPlugin) => {
	const lastDailyNote = getPreviousDailyNote(plugin.app);
	const lastDailyNoteContent = await plugin.app.vault.read(lastDailyNote);

	const todoParser = new TodoParser();
	const lastNote = new Note(todoParser, lastDailyNoteContent);
	lastNote.parse();

	const todayDailyNote = getTodaysNote();
	const todayDailyNoteContent = await plugin.app.vault.read(todayDailyNote);
	const todayNote = new Note(todoParser, todayDailyNoteContent);

	if (plugin.settings.templateHeading === 'none') {
		todayNote.rollOver(lastNote);
	} else {
		todayNote.rollOverToSingleheader(lastNote, plugin.settings.templateHeading);
	}

	await plugin.app.vault.modify(todayDailyNote, todayNote.content);
};
