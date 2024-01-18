import RolloverTodosPlugin from 'main';
import { rollover } from './helpers/rollOverHelper';
import UndoModal from './undoModal';

export default class CommandPallet {
	plugin: RolloverTodosPlugin;

	constructor(plugin: RolloverTodosPlugin) {
		this.plugin = plugin;
	}

	addRolloverNowCommand() {
		this.plugin.addCommand({
			id: 'obsidian-rollover-daily-todos-rollover',
			name: 'Rollover Todos Now',
			callback: () => {
				rollover(this.plugin);
			}
		});
	}

	addUndoRolloverCommand() {
		this.plugin.addCommand({
			id: 'obsidian-rollover-daily-todos-undo',
			name: 'Undo last rollover',
			checkCallback: checking => {
				if (checking) {
					if (this.plugin.undoHistory.length == 0) {
						return false;
					}

					if (!this.allowUndoAction(this.plugin.undoHistoryTime)) {
						return false;
					}

					return true;
				}

				new UndoModal(this.plugin).open();
			}
		});
	}

	private allowUndoAction(time: Date): boolean {
		const now = window.moment();
		const lastUse = window.moment(time);
		const diff = now.diff(lastUse, 'seconds');
		return diff <= 2 * 60;
	}
}
