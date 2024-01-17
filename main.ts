import { Plugin } from 'obsidian';
import RolloverSettingTab from './src/RollOverSettingTab';
import { RolloverSettings } from 'src/Settings';
import {
	addRolloverNowCommand,
	addRolloverOnDailyAutomaticNoteCreation,
	addUndoRolloverCommand
} from 'src/helpers/obsidianHelper';

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: any[] = [];
	undoHistoryTime: Date = new Date();

	async onload() {
		const settingsTab = new RolloverSettingTab(this);
		await settingsTab.loadSettings();
		this.addSettingTab(settingsTab);

		addRolloverOnDailyAutomaticNoteCreation(this);

		addRolloverNowCommand(this);
		addUndoRolloverCommand(this);
	}
}
