import RolloverTodosPlugin from 'main';
import { Setting, PluginSettingTab, TFile } from 'obsidian';
import { getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { RolloverSettings } from './Settings';

const DEFAULT_SETTINGS: RolloverSettings = {
	templateHeading: 'none',
	deleteOnComplete: false,
	removeEmptyTodos: false,
	rolloverChildren: false,
	rolloverOnFileCreate: true
};

export default class RolloverSettingTab extends PluginSettingTab {
	plugin: RolloverTodosPlugin;

	constructor(plugin: RolloverTodosPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	async display() {
		const templateHeadings = await this.getTemplateHeadings();

		this.containerEl.empty();
		this.addTemplateHeadingSelectionOption();
		new Setting(this.containerEl)
			.setName('Template heading')
			.setDesc('Which heading from your template should the todos go under')
			.addDropdown(dropdown =>
				dropdown
					.addOptions({
						...templateHeadings.reduce((acc: { [key: string]: string }, heading) => {
							const trimmedHeading = heading.replace(/^#+\s/, '');
							acc[trimmedHeading] = trimmedHeading;
							console.log(`acc: ${JSON.stringify(acc)}`);
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

		new Setting(this.containerEl)
			.setName('Delete todos from previous day')
			.setDesc(
				`Once todos are found, they are added to Today's Daily Note. If successful, they are deleted from Yesterday's Daily note. Enabling this is destructive and may result in lost data. Keeping this disabled will simply duplicate them from yesterday's note and place them in the appropriate section. Note that currently, duplicate todos will be deleted regardless of what heading they are in, and which heading you choose from above.`
			)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.deleteOnComplete || false).onChange(value => {
					this.plugin.settings.deleteOnComplete = value;
					this.saveSettings();
				})
			);

		new Setting(this.containerEl)
			.setName('Remove empty todos in rollover')
			.setDesc(`If you have empty todos, they will not be rolled over to the next day.`)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.removeEmptyTodos || false).onChange(value => {
					this.plugin.settings.removeEmptyTodos = value;
					this.saveSettings();
				})
			);

		new Setting(this.containerEl)
			.setName('Roll over children of todos')
			.setDesc(
				`By default, only the actual todos are rolled over. If you add nested Markdown-elements beneath your todos, these are not rolled over but stay in place, possibly altering the logic of your previous note. This setting allows for also migrating the nested elements.`
			)
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.rolloverChildren || false).onChange(value => {
					this.plugin.settings.rolloverChildren = value;
					this.saveSettings();
				})
			);

		new Setting(this.containerEl)
			.setName('Automatic rollover on daily note open')
			.setDesc(`If enabled, the plugin will automatically rollover todos when you open a daily note.`)
			.addToggle(toggle =>
				toggle
					// Default to true if the setting is not set
					.setValue(
						this.plugin.settings.rolloverOnFileCreate === undefined ||
							this.plugin.settings.rolloverOnFileCreate === null
							? true
							: this.plugin.settings.rolloverOnFileCreate
					)
					.onChange(value => {
						console.log(value);
						this.plugin.settings.rolloverOnFileCreate = value;
						this.saveSettings();
						this.plugin.loadData().then(value => console.log(value));
					})
			);
	}

	addTemplateHeadingSelectionOption() {}

	async loadSettings() {
		this.plugin.settings = { ...DEFAULT_SETTINGS, ...(await this.plugin.loadData()) };
	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.settings);
	}

	async getTemplateHeadings() {
		const { template } = getDailyNoteSettings();
		if (!template) {
			return [];
		}

		const templateFile = this.app.vault.getAbstractFileByPath(template + '.md');
		const templateContent = await this.app.vault.read(templateFile as TFile);
		const templateHeadings = Array.from(templateContent.matchAll(/#{1,} .*/g)).map(([heading]) => heading);
		return templateHeadings;
	}
}
