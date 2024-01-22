import { getIndentation } from 'src/helpers/fileHelper';
import { allTodoFilter, checkedTodoFilter, uncheckedTodoFilter } from 'src/utils/contants';

export default class Todo {
	isChecked: boolean;
	content: string;
	lineNumber: number;
	parentMarkdownLine: string;
	identationLevel: number;
	hasChildren: boolean;
	children: Todo[];
	parent: Todo;

	constructor(line: string, lineNum: number, lastMarkdownLine: string) {
		this.isChecked = this.isCheckedTodoLine(line);
		this.content = line;
		this.lineNumber = lineNum;
		this.parentMarkdownLine = lastMarkdownLine;
		this.identationLevel = getIndentation(line);
		this.hasChildren = false;
		this.children = [];
	}

	static isTodoLine(line: string) {
		const regex = new RegExp(`[ \\t]*[-*+] \\[(${allTodoFilter})\\].*`, 'g');
		return regex.test(line);
	}

	isCheckedTodoLine(line: string) {
		return this.isTodo(line, checkedTodoFilter);
	}

	isUnCheckedTodoLine = (line: string) => {
		return this.isTodo(line, uncheckedTodoFilter);
	};

	findParent(previousTodo: Todo | null) {}

	isChildOf(parent: Todo): boolean {
		if (this.identationLevel > parent.identationLevel) {
			return true;
		}
		return false;
	}

	isRoot(): boolean {
		return this.identationLevel === 0;
	}

	toString(): string {
		if (this.hasChildren) {
			const childrenString = this.children.reduce((acc, curr) => {
				acc += curr.toString();
				return acc;
			}, '');

			return `${this.content}\n${childrenString}`;
		}
		return `${this.content}\n`;
	}

	hasUncheckedChildren(): boolean {
		let hasUncheckedChildren = false;
		if (this.hasChildren) {
			hasUncheckedChildren = this.children.reduce((acc, curr) => {
				acc = curr.hasUncheckedChildren();
				return acc;
			}, false);
		}

		if (!this.isChecked) {
			return true;
		}

		return hasUncheckedChildren;
	}

	private isTodo(line: string, todoFiller: string) {
		const regex = new RegExp(`[ \\t]*[-*+] \\[(${todoFiller})\\].*`, 'g');
		return regex.test(line);
	}
}
