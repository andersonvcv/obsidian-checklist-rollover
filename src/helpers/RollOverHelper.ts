import { App, Notice, Plugin } from 'obsidian';
import { getPreviousDailyNote, getTodaysNote } from 'src/helpers/dailyNotesHelper';
import { isDailyNotesEnabled } from 'src/helpers/dailyNotesHelper';
import { isPeriodicNotesEnabled } from './periodicNotesHelper';
import { getTodos } from '../get-todos';
import RolloverTodosPlugin from 'main';

export const rollover = async (plugin: RolloverTodosPlugin) => {
	const todayNote = getTodaysNote();
	if (!todayNote) {
		new Notice("Rollover Todo's can only roll over to today's note.");
		return;
	}

	/*** Next, if it is a valid daily note, but we don't have daily notes enabled, we must alert the user ***/
	if (!isDailyNotesEnabledd(plugin.app)) {
		new Notice(
			'RolloverTodosPlugin unable to rollover unfinished todos: Please enable Daily Notes, or Periodic Notes (with daily notes enabled).',
			10000
		);
	} else {
		const { templateHeading, deleteOnComplete, removeEmptyTodos } = plugin.settings;

		// check if there is a daily note from yesterday
		const lastDailyNote = getPreviousDailyNote(plugin.app);
		if (!lastDailyNote) return;

		// get unfinished todos from yesterday, if exist
		let todos_yesterday = await getAllUnfinishedTodos(plugin.app, plugin, lastDailyNote);

		console.log(`rollover-daily-todos: ${todos_yesterday.length} todos found in ${lastDailyNote.basename}.md`);

		if (todos_yesterday.length == 0) {
			return;
		}

		// setup undo history
		let undoHistoryInstance = {
			previousDay: {
				file: undefined,
				oldContent: ''
			},
			today: {
				file: undefined,
				oldContent: ''
			}
		};

		// Potentially filter todos from yesterday for today
		let todosAdded = 0;
		let emptiesToNotAddToTomorrow = 0;
		let todos_today = !removeEmptyTodos ? todos_yesterday : [];
		if (removeEmptyTodos) {
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

		// get today's content and modify it
		let templateHeadingNotFoundMessage = '';
		const templateHeadingSelected = templateHeading !== 'none';

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
					templateHeading,
					`${templateHeading}${todos_todayString}`
				);
				if (contentAddedToHeading == dailyNoteContent) {
					templateHeadingNotFoundMessage = `Rollover couldn't find '${templateHeading}' in today's daily not. Rolling todos to end of file.`;
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

		// if deleteOnComplete, get yesterday's content and modify it
		if (deleteOnComplete) {
			let lastDailyNoteContent = await plugin.app.vault.read(lastDailyNote);
			undoHistoryInstance.previousDay = {
				file: lastDailyNote,
				oldContent: `${lastDailyNoteContent}`
			};
			let lines = lastDailyNoteContent.split('\n');

			for (let i = lines.length; i >= 0; i--) {
				if (todos_yesterday.includes(lines[i])) {
					lines.splice(i, 1);
				}
			}

			const modifiedContent = lines.join('\n');
			await plugin.app.vault.modify(lastDailyNote, modifiedContent);
		}

		// Let user know rollover has been successful with X todos
		const todosAddedString = todosAdded == 0 ? '' : `- ${todosAdded} todo${todosAdded > 1 ? 's' : ''} rolled over.`;
		const emptiesToNotAddToTomorrowString =
			emptiesToNotAddToTomorrow == 0
				? ''
				: deleteOnComplete
				? `- ${emptiesToNotAddToTomorrow} empty todo${emptiesToNotAddToTomorrow > 1 ? 's' : ''} removed.`
				: '';
		const part1 = templateHeadingNotFoundMessage.length > 0 ? `${templateHeadingNotFoundMessage}` : '';
		const part2 = `${todosAddedString}${todosAddedString.length > 0 ? ' ' : ''}`;
		const part3 = `${emptiesToNotAddToTomorrowString}${emptiesToNotAddToTomorrowString.length > 0 ? ' ' : ''}`;

		let allParts = [part1, part2, part3];
		let nonBlankLines = [];
		allParts.forEach(part => {
			if (part.length > 0) {
				nonBlankLines.push(part);
			}
		});

		const message = nonBlankLines.join('\n');
		if (message.length > 0) {
			new Notice(message, 4000 + message.length * 3);
		}
		plugin.undoHistoryTime = new Date();
		plugin.undoHistory = [undoHistoryInstance];
	}
};

const isDailyNotesEnabledd = (app: App) => {
	return isDailyNotesEnabled(app) || isPeriodicNotesEnabled(app);
};

const getAllUnfinishedTodos = async (app: App, plugin: Plugin, file) => {
	const dn = await app.vault.read(file);
	const dnLines = dn.split(/\r?\n|\r|\n/g);

	return getTodos({
		lines: dnLines,
		withChildren: plugin.settings.rolloverChildren
	});
};
