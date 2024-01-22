import RolloverTodosPlugin from 'main';
import { rollover } from './helpers/rollOverHelper';

export default class CommandPallet {
	plugin: RolloverTodosPlugin;

	constructor(plugin: RolloverTodosPlugin) {
		this.plugin = plugin;
	}

	addRolloverNowCommand() {
		this.plugin.addCommand({
			id: 'obsidian-rollover-daily-todos-rollover',
			name: 'Rollover Todos Now',
			hotkeys: [{ modifiers: ['Ctrl'], key: 'l' }],
			callback: () => {
				rollover(this.plugin);
			}
		});
	}
}
