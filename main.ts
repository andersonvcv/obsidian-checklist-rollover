import { Plugin } from 'obsidian';
import RolloverSettingTab from './src/RollOverSettingTab';
import { RolloverSettings } from 'src/models/Settings';
import { addRolloverNowCommand, addUndoRolloverCommand } from 'src/helpers/commandPalletHelper';
import { UndoHistory } from 'src/models/UndoHistory';

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: UndoHistory[] = [];
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
