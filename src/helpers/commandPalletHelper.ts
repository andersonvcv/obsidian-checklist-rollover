import { rollover } from './rollOverHelper';
import UndoModal from '../UndoModal';
import RolloverTodosPlugin from 'main';

export const addRolloverNowCommand = (plugin: RolloverTodosPlugin) => {
	plugin.addCommand({
		id: 'obsidian-rollover-daily-todos-rollover',
		name: 'Rollover Todos Now',
		callback: () => {
			rollover(plugin);
		}
	});
};

export const addUndoRolloverCommand = (plugin: RolloverTodosPlugin) => {
	plugin.addCommand({
		id: 'obsidian-rollover-daily-todos-undo',
		name: 'Undo last rollover',
		checkCallback: checking => {
			if (checking) {
				if (plugin.undoHistory.length == 0) {
					return false;
				}

				if (!allowUndoAction(plugin.undoHistoryTime)) {
					return false;
				}

				return true;
			}

			new UndoModal(plugin).open();
		}
	});
};

const allowUndoAction = (time: Date): boolean => {
	const now = window.moment();
	const lastUse = window.moment(time);
	const diff = now.diff(lastUse, 'seconds');
	return diff <= 2 * 60;
};
