import { Plugin } from 'obsidian';
import UndoModal from './src/UndoModal';
import RolloverSettingTab from './src/RollOverSettingTab';
import { getTodos } from './src/get-todos';
import { RolloverSettings } from 'src/Settings';
import { addRolloverNowCommand } from 'src/obsidianHelper';
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

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async getAllUnfinishedTodos(file) {
		const dn = await this.app.vault.read(file);
		const dnLines = dn.split(/\r?\n|\r|\n/g);

		return getTodos({
			lines: dnLines,
			withChildren: this.settings.rolloverChildren
		});
	}

	async sortHeadersIntoHierarchy(file) {
		///console.log('testing')
		const templateContents = await this.app.vault.read(file);
		const allHeadings = Array.from(templateContents.matchAll(/#{1,} .*/g)).map(([heading]) => heading);

		if (allHeadings.length > 0) {
			console.log(createRepresentationFromHeadings(allHeadings));
		}
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
				rollover(this.app, this, file);
			})
		);
		addRolloverNowCommand(this);

		this.addCommand({
			id: 'obsidian-rollover-daily-todos-undo',
			name: 'Undo last rollover',
			checkCallback: checking => {
				// no history, don't allow undo
				if (this.undoHistory.length > 0) {
					const now = window.moment();
					const lastUse = window.moment(this.undoHistoryTime);
					const diff = now.diff(lastUse, 'seconds');
					// 2+ mins since use: don't allow undo
					if (diff > 2 * 60) {
						return false;
					}
					if (!checking) {
						new UndoModal(this).open();
					}
					return true;
				}
				return false;
			}
		});
	}
}
