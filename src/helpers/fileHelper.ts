import { App, TFile } from 'obsidian';
import { getDailyNoteSettings } from 'obsidian-daily-notes-interface';

export const getDailyNoteTemplateHeadings = async (app: App) => {
	const { template } = getDailyNoteSettings();
	if (!template) {
		return [];
	}

	const templateFile = app.vault.getAbstractFileByPath(template + '.md');
	const templateContent = await app.vault.read(templateFile as TFile);
	const templateHeadings = Array.from(templateContent.matchAll(/#{1,} .*/g)).map(([heading]) => heading);
	return templateHeadings;
};
