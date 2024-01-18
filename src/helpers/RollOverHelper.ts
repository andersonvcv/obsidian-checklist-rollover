import { Notice, TFile } from 'obsidian';
import { getPreviousDailyNote, getTodaysNote } from 'src/helpers/dailyNotesHelper';
import { isDailyNotesEnabled } from 'src/helpers/dailyNotesHelper';
import RolloverTodosPlugin from 'main';
import { getLastDailyNoteUnfinishedTodos } from './todosHelper';
import { UndoHistory } from 'src/models/UndoHistory';

export const rollover = async (plugin: RolloverTodosPlugin) => {
	const todayNote = getTodaysNote();
	const lastDailyNote = getPreviousDailyNote(plugin.app);
	if (!canRollOver(plugin, todayNote, lastDailyNote)) {
		return;
	}

	const lastDailyNoteUnfinishedTodos = await getLastDailyNoteUnfinishedTodos(plugin, lastDailyNote);
	if (lastDailyNoteUnfinishedTodos.length == 0) {
		new Notice('Nothing to be rolled over.', 10000);
		return;
	}

	let lastDailyFilteredTodos: string[] = lastDailyNoteUnfinishedTodos;
	if (plugin.settings.removeEmptyTodos) {
		lastDailyFilteredTodos = filterYesterdaysTodos(lastDailyNoteUnfinishedTodos);
	}

	const undoHistoryInstance: UndoHistory = {
		previousDay: {
			file: undefined,
			oldContent: ''
		},
		today: {
			file: undefined,
			oldContent: ''
		}
	};

	await rollOverTodaysContent(plugin, lastDailyFilteredTodos, undoHistoryInstance, todayNote);

	if (plugin.settings.deleteOnComplete) {
		await deleteOnComplete(plugin, lastDailyNote, undoHistoryInstance, lastDailyNoteUnfinishedTodos);
	}

	plugin.undoHistoryTime = new Date();
	plugin.undoHistory = [undoHistoryInstance];
};

const canRollOver = (plugin: RolloverTodosPlugin, todayNote: TFile, lastDailyNote: TFile): boolean => {
	if (!todayNote) {
		new Notice("Rollover Todo's can only roll over to today's note.", 1000);
		return false;
	}

	if (!isDailyNotesEnabled(plugin.app)) {
		new Notice("Please enable Daily Notes to Rollover Todo's work properly.", 10000);
		return false;
	}

	if (!lastDailyNote) {
		new Notice('Rollover notes needs at least two notes.', 10000);
		return false;
	}

	return true;
};

const filterYesterdaysTodos = (lastDailyNoteUnfinishedTodos: string[]): string[] => {
	let todosAdded = 0;
	let emptiesToNotAddToTomorrow = 0;
	const filteredTodos: string[] = [];
	lastDailyNoteUnfinishedTodos.forEach((todo, i) => {
		const trimmedTodo = (todo || '').trim();
		if (trimmedTodo != '- [ ]' && trimmedTodo != '- [  ]') {
			filteredTodos.push(todo);
			todosAdded++;
		} else {
			emptiesToNotAddToTomorrow++;
		}
	});

	if (todosAdded > 0) {
		new Notice(`- ${todosAdded} todo${todosAdded > 1 ? 's' : ''} rolled over.`, 1000);
	}

	if (emptiesToNotAddToTomorrow > 0) {
		new Notice(`- ${emptiesToNotAddToTomorrow} empty todo${emptiesToNotAddToTomorrow > 1 ? 's' : ''} removed.`, 1000);
	}

	return filteredTodos;
};

const rollOverTodaysContent = async (
	plugin: RolloverTodosPlugin,
	lastDailyFilteredTodos: string[],
	undoHistoryInstance: UndoHistory,
	todayNote: TFile
) => {
	if (lastDailyFilteredTodos.length == 0) {
		new Notice('No todos to rollover.', 10000);
		return;
	}

	let todayNoteContent = await plugin.app.vault.read(todayNote);

	undoHistoryInstance.today = {
		file: todayNote,
		oldContent: todayNoteContent
	};

	const lastDailyFilteredTodosString = `\n${lastDailyFilteredTodos.join('\n')}`;
	if (isRollOverToHeading(plugin)) {
		const contentAddedToHeading = todayNoteContent.replace(
			plugin.settings.templateHeading,
			`${plugin.settings.templateHeading}${lastDailyFilteredTodosString}`
		);

		// Replace didn't found heading
		if (contentAddedToHeading == todayNoteContent) {
			todayNoteContent += lastDailyFilteredTodosString;
			new Notice(
				`Rollover couldn't find '${plugin.settings.templateHeading}' in today's daily not. Rolling todos to end of file.`,
				10000
			);
		} else {
			todayNoteContent = contentAddedToHeading;
		}
	} else {
		todayNoteContent += lastDailyFilteredTodosString;
	}

	await plugin.app.vault.modify(todayNote, todayNoteContent);
};

const deleteOnComplete = async (
	plugin: RolloverTodosPlugin,
	lastDailyNote: TFile,
	undoHistoryInstance: UndoHistory,
	lastDailyNoteUnfinishedTodos: string[]
) => {
	const lastDailyNoteContent = await plugin.app.vault.read(lastDailyNote);
	undoHistoryInstance.previousDay = {
		file: lastDailyNote,
		oldContent: `${lastDailyNoteContent}`
	};
	const lines = lastDailyNoteContent.split('\n');

	for (let i = lines.length; i >= 0; i--) {
		if (lastDailyNoteUnfinishedTodos.includes(lines[i])) {
			lines.splice(i, 1);
		}
	}

	const modifiedContent = lines.join('\n');
	await plugin.app.vault.modify(lastDailyNote, modifiedContent);
};

const isRollOverToHeading = (plugin: RolloverTodosPlugin): boolean => {
	return plugin.settings.templateHeading !== 'none';
};
