import { Plugin } from 'obsidian';
import SettingTab from './src/settingTab';
import { RolloverSettings } from 'src/models/Settings';
import { UndoHistory } from 'src/models/UndoHistory';
import CommandPallet from 'src/commandPallet';

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: UndoHistory[] = [];
	undoHistoryTime: Date = new Date();

	async onload() {
		const settingsTab = new SettingTab(this);
		await settingsTab.loadSettings();
		this.addSettingTab(settingsTab);

		const commandPallet = new CommandPallet(this);
		commandPallet.addRolloverNowCommand();
		commandPallet.addUndoRolloverCommand();
	}
}
