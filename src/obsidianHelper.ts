import { Plugin } from 'obsidian';
import { rollover } from './RollOverHelper';

export const addRolloverNowCommand = (plugin: Plugin) => {
	plugin.addCommand({
		id: 'obsidian-rollover-daily-todos-rollover',
		name: 'Rollover Todos Now',
		callback: () => {
			rollover(plugin.app, plugin);
		}
	});
};
