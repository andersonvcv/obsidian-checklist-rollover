export const trimSlashes = (folder: string | undefined) => {
	if (folder?.startsWith('/')) {
		folder = folder.substring(1);
	}

	if (folder?.endsWith('/')) {
		folder = folder.substring(0, folder.length - 1);
	}

	return folder;
};

export const formatWithTrailingSlash = (folder: string | undefined) => {
	folder = trimSlashes(folder);
	if (folder?.length === 0) {
		return folder;
	}
	return `${folder}/`;
};

export const isEmpty = (str: string): boolean => {
	return str.trim().length === 0;
};

export const getIndentation = (line: string) => {
	return line.search(/\S/);
};
