import { Plugin } from 'obsidian';
import RolloverSettingTab from './src/RollOverSettingTab';
import { RolloverSettings } from 'src/Settings';
import {
	addRolloverNowCommand,
	addRolloverOnDailyAutomaticNoteCreation,
	addUndoRolloverCommand
} from 'src/helpers/obsidianHelper';

const DEFAULT_SETTINGS: RolloverSettings = {
	templateHeading: 'none',
	deleteOnComplete: false,
	removeEmptyTodos: false,
	rolloverChildren: false,
	rolloverOnFileCreate: true
};

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: any[] = [];
	undoHistoryTime: Date = new Date();

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RolloverSettingTab(this));

		addRolloverOnDailyAutomaticNoteCreation(this);

		addRolloverNowCommand(this);
		addUndoRolloverCommand(this);
	}
}
