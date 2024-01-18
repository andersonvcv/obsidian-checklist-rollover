import RolloverTodosPlugin from 'main';
import { Setting, PluginSettingTab } from 'obsidian';
import { RolloverSettings } from './models/Settings';
import { getDailyNoteTemplateHeadings } from './helpers/fileHelper';

const DEFAULT_SETTINGS: RolloverSettings = {
	templateHeading: 'none',
	deleteOnComplete: false,
	removeEmptyTodos: false,
	rolloverChildren: true,
	rolloverOnFileCreate: true
};

export default class RolloverSettingTab extends PluginSettingTab {
	plugin: RolloverTodosPlugin;

	constructor(plugin: RolloverTodosPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	async display() {
		this.cleanSettingsDialog();

		await this.addTemplateHeadingSelection();
		this.addDeleteAfterMoving();
		this.addMoveEmptyTodos();
		this.addRolloverChildren();
		this.addAutomaticallyRolloverOnDailyNoteCreation();
	}

	async addTemplateHeadingSelection() {
		const templateHeadings = await getDailyNoteTemplateHeadings(this.app);

		new Setting(this.containerEl)
			.setName('Template heading')
			.setDesc("Which template heading should the moved Todo's go under?")
			.addDropdown(dropdown =>
				dropdown
					.addOptions({
						...templateHeadings.reduce((acc: { [key: string]: string }, heading) => {
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
			.setDesc(
				`Delete Todo's from previous Daily Note after moving to today's Daily Note. Enabling this is destructive and may result in lost data.`
			)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.deleteOnComplete).onChange(value => {
					this.plugin.settings.deleteOnComplete = value;
					this.saveSettings();
				})
			);
	}

	addMoveEmptyTodos() {
		new Setting(this.containerEl)
			.setName('Remove empty todos in rollover')
			.setDesc(`Do not roll over empty Todo's to the next day.`)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.removeEmptyTodos).onChange(value => {
					this.plugin.settings.removeEmptyTodos = value;
					this.saveSettings();
				})
			);
	}

	addRolloverChildren() {
		new Setting(this.containerEl)
			.setName('Roll over children of todos')
			.setDesc(`Roll over nested Markdown elements beneath your todos.`)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.rolloverChildren || false).onChange(value => {
					this.plugin.settings.rolloverChildren = value;
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
