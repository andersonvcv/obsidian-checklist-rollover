export default class TodoParser {
	private bulletSymbols = ['-', '*', '+'];
	private contentSplittedByLines: string[];
	private rolloverChildren: boolean;

	constructor(content: string, rolloverChildren: boolean) {
		this.contentSplittedByLines = content.split(/\r?\n|\r|\n/g);
		this.rolloverChildren = rolloverChildren;
	}

	private isTodo(line: string) {
		const regex = new RegExp(`\\s*[${this.bulletSymbols.join('')}] \\[ \\].*`, 'g');
		return regex.test(line);
	}

	private hasChildren(lineNumber: number) {
		if (lineNumber + 1 >= this.contentSplittedByLines.length) {
			return false;
		}

		const currentLineIdentationNumber = this.getIndentation(lineNumber);
		const nextLineIdentationNumber = this.getIndentation(lineNumber + 1);
		if (nextLineIdentationNumber > currentLineIdentationNumber) {
			return true;
		}

		return false;
	}

	private getChildren(parentLine: number) {
		const children = [];
		let inspectedLine = parentLine + 1;
		while (this.isChildOf(parentLine, inspectedLine)) {
			children.push(this.contentSplittedByLines[inspectedLine]);
			inspectedLine++;
		}
		return children;
	}

	private isChildOf(parentLine: number, line: number) {
		if (parentLine >= this.contentSplittedByLines.length || line >= this.contentSplittedByLines.length) {
			return false;
		}
		return this.getIndentation(line) > this.getIndentation(parentLine);
	}

	private getIndentation(lineNumber: number) {
		return this.contentSplittedByLines[lineNumber].search(/\S/);
	}

	getTodos() {
		const todos: string[] = [];
		this.contentSplittedByLines.forEach((line, inspectedLine) => {
			if (!this.isTodo(line)) {
				return;
			}

			todos.push(line);
			if (this.rolloverChildren && this.hasChildren(inspectedLine)) {
				const childrenLines = this.getChildren(inspectedLine);
				todos.push(...childrenLines);
				inspectedLine += childrenLines.length;
			}
		});

		return todos;
	}
}
