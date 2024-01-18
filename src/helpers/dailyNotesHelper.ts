import { App } from 'obsidian';
import { getAllDailyNotes, getDailyNote, getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { formatWithTrailingSlash } from './stringHelper';

export const isDailyNotesEnabled = (app: App): boolean => {
	const dailyNotesPlugin = app.internalPlugins.plugins['daily-notes'];
	return dailyNotesPlugin?.enabled;
};

export const getPreviousDailyNote = (app: App) => {
	const { moment } = window;

	const dailyNoteSettings = getDailyNoteSettings();
	const format = dailyNoteSettings.format;
	let folder = dailyNoteSettings.folder;

	folder = formatWithTrailingSlash(folder);
	const allNotesInDailyNotesFolder = new RegExp('^' + folder + '(.*).md$');
	//TODO: use getAllDailyNotes() instead of this
	const dailyNoteFiles = app.vault
		.getMarkdownFiles()
		.filter(file => file.path.startsWith(folder))
		.filter(file => moment(file.path.replace(allNotesInDailyNotesFolder, '$1'), format, true).isValid())
		.filter(file => file.basename)
		.filter(file => getFileMoment(file, folder, format).isSameOrBefore(moment(), 'day'));

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

export const getTodaysNote = () => {
	return getDailyNote(window.moment(), getAllDailyNotes());
};
