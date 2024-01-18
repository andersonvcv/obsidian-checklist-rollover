import { TFile } from 'obsidian';

export interface UndoHistory {
	previousDay: UndoHistoryDay;
	today: UndoHistoryDay;
}

export interface UndoHistoryDay {
	file: TFile | undefined;
	oldContent: string;
}
