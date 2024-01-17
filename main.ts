import { Plugin } from 'obsidian';
import RolloverSettingTab from './src/RollOverSettingTab';
import { RolloverSettings } from 'src/Settings';
import { addRolloverNowCommand, addUndoRolloverCommand } from 'src/obsidianHelper';
import { rollover } from 'src/RollOverHelper';

const DEFAULT_SETTINGS: RolloverSettings = {
	templateHeading: 'none',
	deleteOnComplete: false,
	removeEmptyTodos: false,
	rolloverChildren: false,
	rolloverOnFileCreate: true
};

export default class RolloverTodosPlugin extends Plugin {
	settings: RolloverSettings;
	undoHistory: any[];
	undoHistoryTime: Date;

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();
		this.undoHistory = [];
		this.undoHistoryTime = new Date();
		this.addSettingTab(new RolloverSettingTab(this.app, this));

		this.registerEvent(
			this.app.vault.on('create', async file => {
				// Check if automatic daily note creation is enabled
				console.log(`setting create: ${this.settings.rolloverOnFileCreate}`);
				if (!this.settings.rolloverOnFileCreate) return;
				rollover(this, file);
			})
		);
		addRolloverNowCommand(this);
		addUndoRolloverCommand(this);
	}
}
