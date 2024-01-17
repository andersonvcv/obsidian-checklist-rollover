import { App } from 'obsidian';
import { getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { formatWithTrailingSlash } from './stringHelper';

export const isDailyNotesEnabled = (app: App): boolean => {
	const dailyNotesPlugin = app.internalPlugins.plugins['daily-notes'];
	return dailyNotesPlugin?.enabled;
};

export const getLastDailyNote = (app: App) => {
	const { moment } = window;
	const dailyNoteSettings = getDailyNoteSettings();
	const format = dailyNoteSettings.format;
	let folder = dailyNoteSettings.folder;
	console.log(`folder: ${folder}`);

	folder = formatWithTrailingSlash(folder);
	console.log(`folder: ${folder}`);

	const dailyNoteRegexMatch = new RegExp('^' + folder + '(.*).md$');
	const todayMoment = moment();

	// get all notes in directory that aren't null
	const dailyNoteFiles = app.vault
		.getMarkdownFiles()
		.filter(file => file.path.startsWith(folder))
		.filter(file => moment(file.path.replace(dailyNoteRegexMatch, '$1'), format, true).isValid())
		.filter(file => file.basename)
		.filter(file => getFileMoment(file, folder, format).isSameOrBefore(todayMoment, 'day'));

	// sort by date
	const sorted = dailyNoteFiles.sort(
		(a, b) => getFileMoment(b, folder, format).valueOf() - getFileMoment(a, folder, format).valueOf()
	);
	return sorted[1];
};

const getFileMoment = (file, folder, format) => {
	let path = file.path;

	if (path.startsWith(folder)) {
		// Remove length of folder from start of path
		path = path.substring(folder.length);
	}

	if (path.endsWith(`.${file.extension}`)) {
		// Remove length of file extension from end of path
		path = path.substring(0, path.length - file.extension.length - 1);
	}

	return moment(path, format);
};
