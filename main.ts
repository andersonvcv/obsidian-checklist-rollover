import { Plugin } from 'obsidian';
import SettingTab from './src/settingTab';
import { RolloverSettings } from 'src/models/settings';
import CommandPallet from 'src/commandPallet';

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;

	async onload() {
		const settingsTab = new SettingTab(this);
		await settingsTab.loadSettings();
		this.addSettingTab(settingsTab);

		const commandPallet = new CommandPallet(this);
		commandPallet.addRolloverNowCommand();
	}
}
