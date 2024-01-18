import { rollover } from './rollOverHelper';
import RolloverTodosPlugin from 'main';

export const addRolloverOnDailyNoteCreationEvent = (plugin: RolloverTodosPlugin) => {
	plugin.registerEvent(
		plugin.app.vault.on('create', async file => {
			if (!plugin.settings.rolloverOnFileCreate) {
				return;
			}

			rollover(plugin);
		})
	);
};
