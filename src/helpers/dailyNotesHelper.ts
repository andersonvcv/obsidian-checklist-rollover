import { App, TFile } from 'obsidian';
import { getAllDailyNotes, getDailyNote, getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { formatWithTrailingSlash } from './stringHelper';

export const getPreviousDailyNote = (app: App) => {
	const { moment } = window;

	const dailyNoteSettings = getDailyNoteSettings();
	const format = dailyNoteSettings.format;
	let dailyNotesFolder = dailyNoteSettings.folder;

	dailyNotesFolder = formatWithTrailingSlash(dailyNotesFolder);

	const allNotesInDailyNotesFolder = new RegExp('^' + dailyNotesFolder + '(.*).md$');
	const dailyNoteFiles = app.vault
		.getMarkdownFiles()
		.filter(file => file.path.startsWith(dailyNotesFolder))
		.filter(file => moment(file.path.replace(allNotesInDailyNotesFolder, '$1'), format, true).isValid())
		.filter(file => file.basename)
		.filter(file => getFileMoment(file, dailyNotesFolder, format).isSameOrBefore(moment(), 'day'));

	// sort by date
	const sorted = dailyNoteFiles.sort(
		(a, b) => getFileMoment(b, dailyNotesFolder, format).valueOf() - getFileMoment(a, dailyNotesFolder, format).valueOf()
	);
	return sorted[1];
};

const getFileMoment = (file: TFile, folder: string, format: string | undefined) => {
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
