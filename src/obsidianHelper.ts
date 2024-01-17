import { Plugin } from 'obsidian';
import { rollover } from './RollOverHelper';
import UndoModal from './UndoModal';
import RolloverTodosPlugin from 'main';

export const addRolloverNowCommand = (plugin: Plugin) => {
	plugin.addCommand({
		id: 'obsidian-rollover-daily-todos-rollover',
		name: 'Rollover Todos Now',
		callback: () => {
			rollover(plugin.app, plugin);
		}
	});
};

export const addUndoRolloverCommand = (plugin: RolloverTodosPlugin) => {
	plugin.addCommand({
		id: 'obsidian-rollover-daily-todos-undo',
		name: 'Undo last rollover',
		checkCallback: checking => {
			// no history, don't allow undo
			if (plugin.undoHistory.length > 0) {
				const now = window.moment();
				const lastUse = window.moment(plugin.undoHistoryTime);
				const diff = now.diff(lastUse, 'seconds');
				// 2+ mins since use: don't allow undo
				if (diff > 2 * 60) {
					return false;
				}
				if (!checking) {
					new UndoModal(plugin).open();
				}
				return true;
			}
			return false;
		}
	});
};
