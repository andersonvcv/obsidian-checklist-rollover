import RolloverTodosPlugin from 'main';
import { Setting, PluginSettingTab } from 'obsidian';
import { RolloverSettings } from './models/settings';
import { getDailyNoteTemplateHeadings } from './helpers/dailyNotesHelper';

const DEFAULT_SETTINGS: RolloverSettings = {
	templateHeading: 'none',
	deleteAfterRolledOver: false,
	rolloverOnFileCreate: true
};

export default class SettingTab extends PluginSettingTab {
	plugin: RolloverTodosPlugin;

	constructor(plugin: RolloverTodosPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	async display() {
		this.cleanSettingsDialog();

		await this.addTemplateHeadingSelection();
		this.addDeleteAfterMoving();
		this.addAutomaticallyRolloverOnDailyNoteCreation();
	}

	async addTemplateHeadingSelection() {
		const todosHeaders = await getDailyNoteTemplateHeadings(this.app);

		new Setting(this.containerEl)
			.setName('Template heading')
			.setDesc(
				'Rollover all todos under this single heading. If none is selected, all todos will be rolled over under each individual heading.'
			)
			.addDropdown(dropdown =>
				dropdown
					.addOptions({
						...todosHeaders.reduce((acc: { [key: string]: string }, heading) => {
							const trimmedHeading = heading.replace(/^#+\s/, '');
							acc[trimmedHeading] = trimmedHeading;
							return acc;
						}, {}),
						none: 'None'
					})
					.setValue(this.plugin?.settings.templateHeading)
					.onChange(value => {
						this.plugin.settings.templateHeading = value;
						this.saveSettings();
					})
			);
	}

	addDeleteAfterMoving() {
		new Setting(this.containerEl)
			.setName('Delete todos from previous day')
			.setDesc(`Delete Todo's after rolled over. There is no undo action for this.`)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.deleteAfterRolledOver).onChange(value => {
					this.plugin.settings.deleteAfterRolledOver = value;
					this.saveSettings();
				})
			);
	}

	addAutomaticallyRolloverOnDailyNoteCreation() {
		new Setting(this.containerEl)
			.setName('Automatic roll over on daily note open')
			.setDesc(`Automatically roll over Todo's when you open a daily note.`)
			.addToggle(toggle =>
				toggle
					.setValue(
						this.plugin.settings.rolloverOnFileCreate === undefined ||
							this.plugin.settings.rolloverOnFileCreate === null
							? true
							: this.plugin.settings.rolloverOnFileCreate
					)
					.onChange(value => {
						this.plugin.settings.rolloverOnFileCreate = value;
						this.saveSettings();
						this.plugin.loadData().then(value => console.log(value));
					})
			);
	}

	async loadSettings() {
		this.plugin.settings = { ...DEFAULT_SETTINGS, ...(await this.plugin.loadData()) };
	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.settings);
	}

	cleanSettingsDialog() {
		this.containerEl.empty();
	}
}
