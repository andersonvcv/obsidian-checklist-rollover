import { Plugin } from 'obsidian';
import RolloverSettingTab from './src/RollOverSettingTab';
import { RolloverSettings } from 'src/Settings';
import { addRolloverNowCommand, addUndoRolloverCommand } from 'src/helpers/commandPalletHelper';

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: any[] = [];
	undoHistoryTime: Date = new Date();

	async onload() {
		// Settings
		const settingsTab = new RolloverSettingTab(this);
		await settingsTab.loadSettings();
		this.addSettingTab(settingsTab);

		// Command pallet actions
		addRolloverNowCommand(this);
		addUndoRolloverCommand(this);
	}
}
