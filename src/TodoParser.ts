export default class TodoParser {
	private bulletSymbols = ['-', '*', '+'];
	private contentSplittedByLines: string[];
	private rolloverChildren: boolean;

	constructor(content: string[], withChildren: boolean) {
		this.contentSplittedByLines = content;
		this.rolloverChildren = withChildren;
	}

	private isTodo(line: string) {
		const regex = new RegExp(`\\s*[${this.bulletSymbols.join('')}] \\[ \\].*`, 'g');
		return regex.test(line);
	}

	private hasChildren(lineNumber: number) {
		if (lineNumber + 1 >= this.contentSplittedByLines.length) {
			return false;
		}

		const indCurr = this.getIndentation(lineNumber);
		console.log(`indCurr: ${indCurr}`);
		const indNext = this.getIndentation(lineNumber + 1);
		console.log(`indNext: ${indNext}`);
		if (indNext > indCurr) {
			return true;
		}
		return false;
	}

	// Returns a list of strings that are the nested items after line `parentLinum`
	private getChildren(parentLinum) {
		const children = [];
		let nextLinum = parentLinum + 1;
		while (this.isChildOf(parentLinum, nextLinum)) {
			children.push(this.contentSplittedByLines[nextLinum]);
			nextLinum++;
		}
		return children;
	}

	// Returns true if line `linum` has more indentation than line `parentLinum`
	private isChildOf(parentLinum, linum) {
		if (parentLinum >= this.contentSplittedByLines.length || linum >= this.contentSplittedByLines.length) {
			return false;
		}
		return this.getIndentation(linum) > this.getIndentation(parentLinum);
	}

	private getIndentation(lineNumber: number) {
		return this.contentSplittedByLines[lineNumber].search(/\S/);
	}

	getTodos() {
		let todos = [];
		for (let l = 0; l < this.contentSplittedByLines.length; l++) {
			const line = this.contentSplittedByLines[l];
			if (this.isTodo(line)) {
				todos.push(line);
				if (this.rolloverChildren && this.hasChildren(l)) {
					const cs = this.getChildren(l);
					todos = [...todos, ...cs];
					l += cs.length;
				}
			}
		}

		let inspectedLine = 0;
		for (const line of this.contentSplittedByLines) {
			if (!this.isTodo(line)) {
				continue;
			}

			todos.push(line);
			if (this.rolloverChildren && this.hasChildren(inspectedLine)) {
				const cs = this.getChildren(inspectedLine);
				todos = [...todos, ...cs];
				inspectedLine += cs.length;
			}
		}

		return todos;
	}
}
