import { App } from "obsidian";

export const isPeriodicNotesEnabled = (app: App): boolean => {
	const periodicNotesPlugin = app.plugins.getPlugin('periodic-notes');
		return periodicNotesPlugin?.settings?.daily?.enabled;
}
