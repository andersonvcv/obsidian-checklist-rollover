import { Notice, Plugin, TFile } from 'obsidian';
import { getPreviousDailyNote, getTodaysNote } from 'src/helpers/dailyNotesHelper';
import { isDailyNotesEnabled } from 'src/helpers/dailyNotesHelper';
import RolloverTodosPlugin from 'main';
import { getAllUnfinishedTodos } from './todosHelper';
import { UndoHistory } from 'src/models/UndoHistory';

export const rollover = async (plugin: RolloverTodosPlugin) => {
	const todayNote = getTodaysNote();
	if (!todayNote) {
		new Notice("Rollover Todo's can only roll over to today's note.", 1000);
		return;
	}

	if (!isDailyNotesEnabled(plugin.app)) {
		new Notice("Please enable Daily Notes to Rollover Todo's work properly.", 10000);
		return;
	}

	const lastDailyNote = getPreviousDailyNote(plugin.app);
	if (!lastDailyNote) {
		new Notice('You can rollover notes when you have at least two notes.', 10000);
		return;
	}

	const todos_yesterday = await getAllUnfinishedTodos(plugin.app, plugin, lastDailyNote);
	console.log(`rollover-daily-todos: ${todos_yesterday.length} todos found in ${lastDailyNote.basename}.md`);

	if (todos_yesterday.length == 0) {
		new Notice('Nothing to be rolled over.', 10000);
		return;
	}

	// setup undo history
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

	const [todosAdded, emptiesToNotAddToTomorrow, todos_today] = filterYesterdaysTodos(plugin, todos_yesterday);

	const templateHeadingNotFoundMessage = await rollOverTodaysContent(
		plugin,
		todos_today,
		undoHistoryInstance,
		todayNote
	);
	await deleteOnComplete(plugin, lastDailyNote, undoHistoryInstance, todos_yesterday);

	notifyUser(plugin, todosAdded, emptiesToNotAddToTomorrow, templateHeadingNotFoundMessage);

	plugin.undoHistoryTime = new Date();
	plugin.undoHistory = [undoHistoryInstance];
};

const filterYesterdaysTodos = (plugin: Plugin, todos_yesterday: any[]): [number, number, any[]] => {
	let todosAdded = 0;
	let emptiesToNotAddToTomorrow = 0;
	const todos_today = !plugin.settings.removeEmptyTodos ? todos_yesterday : [];
	if (plugin.settings.removeEmptyTodos) {
		todos_yesterday.forEach((line, i) => {
			const trimmedLine = (line || '').trim();
			if (trimmedLine != '- [ ]' && trimmedLine != '- [  ]') {
				todos_today.push(line);
				todosAdded++;
			} else {
				emptiesToNotAddToTomorrow++;
			}
		});
	} else {
		todosAdded = todos_yesterday.length;
	}
	return [todosAdded, emptiesToNotAddToTomorrow, todos_today];
};

const rollOverTodaysContent = async (
	plugin: Plugin,
	todos_today: any[],
	undoHistoryInstance: UndoHistory,
	todayNote: TFile
): Promise<string> => {
	let templateHeadingNotFoundMessage = '';
	const templateHeadingSelected = plugin.settings.templateHeading !== 'none';

	if (todos_today.length > 0) {
		let dailyNoteContent = await plugin.app.vault.read(todayNote);
		undoHistoryInstance.today = {
			file: todayNote,
			oldContent: `${dailyNoteContent}`
		};
		const todos_todayString = `\n${todos_today.join('\n')}`;

		// If template heading is selected, try to rollover to template heading
		if (templateHeadingSelected) {
			const contentAddedToHeading = dailyNoteContent.replace(
				plugin.settings.templateHeading,
				`${plugin.settings.templateHeading}${todos_todayString}`
			);
			if (contentAddedToHeading == dailyNoteContent) {
				templateHeadingNotFoundMessage = `Rollover couldn't find '${plugin.settings.templateHeading}' in today's daily not. Rolling todos to end of file.`;
			} else {
				dailyNoteContent = contentAddedToHeading;
			}
		}

		// Rollover to bottom of file if no heading found in file, or no heading selected
		if (!templateHeadingSelected || templateHeadingNotFoundMessage.length > 0) {
			dailyNoteContent += todos_todayString;
		}

		await plugin.app.vault.modify(todayNote, dailyNoteContent);
	}
	return templateHeadingNotFoundMessage;
};

const deleteOnComplete = async (
	plugin: Plugin,
	lastDailyNote: TFile,
	undoHistoryInstance: UndoHistory,
	todos_yesterday: any[]
) => {
	if (plugin.settings.deleteOnComplete) {
		const lastDailyNoteContent = await plugin.app.vault.read(lastDailyNote);
		undoHistoryInstance.previousDay = {
			file: lastDailyNote,
			oldContent: `${lastDailyNoteContent}`
		};
		const lines = lastDailyNoteContent.split('\n');

		for (let i = lines.length; i >= 0; i--) {
			if (todos_yesterday.includes(lines[i])) {
				lines.splice(i, 1);
			}
		}

		const modifiedContent = lines.join('\n');
		await plugin.app.vault.modify(lastDailyNote, modifiedContent);
	}
};

const notifyUser = (
	plugin: Plugin,
	todosAdded: number,
	emptiesToNotAddToTomorrow: number,
	templateHeadingNotFoundMessage: string
) => {
	const todosAddedString = todosAdded == 0 ? '' : `- ${todosAdded} todo${todosAdded > 1 ? 's' : ''} rolled over.`;
	const emptiesToNotAddToTomorrowString =
		emptiesToNotAddToTomorrow == 0
			? ''
			: plugin.settings.deleteOnComplete
			? `- ${emptiesToNotAddToTomorrow} empty todo${emptiesToNotAddToTomorrow > 1 ? 's' : ''} removed.`
			: '';
	const part1 = templateHeadingNotFoundMessage.length > 0 ? `${templateHeadingNotFoundMessage}` : '';
	const part2 = `${todosAddedString}${todosAddedString.length > 0 ? ' ' : ''}`;
	const part3 = `${emptiesToNotAddToTomorrowString}${emptiesToNotAddToTomorrowString.length > 0 ? ' ' : ''}`;

	const allParts = [part1, part2, part3];
	const nonBlankLines: any[] = [];
	allParts.forEach(part => {
		if (part.length > 0) {
			nonBlankLines.push(part);
		}
	});

	const message = nonBlankLines.join('\n');
	if (message.length > 0) {
		new Notice(message, 4000 + message.length * 3);
	}
};
