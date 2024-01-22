import { isEmpty } from 'src/helpers/stringHelper';
import Todo from 'src/models/todo';

export default class TodoParser {
	parse(noteContentLines: string[]): Record<string, Todo[]> {
		let lastMarkdownLine = '0';
		const todoMap: Record<string, Todo[]> = {};
		let previousTodo: Todo | null = null;
		for (let lineNum = 0; lineNum < noteContentLines.length; lineNum++) {
			const line = noteContentLines[lineNum];
			if (!Todo.isTodoLine(line)) {
				if (isEmpty(line)) {
					continue;
				}

				lastMarkdownLine = line;
				continue;
			}

			const todo: Todo = new Todo(line, lineNum, lastMarkdownLine);
			if (todo.isRoot()) {
				todoMap[lastMarkdownLine] = todoMap[lastMarkdownLine] ? [...todoMap[lastMarkdownLine], todo] : [todo];
			} else {
				if (previousTodo) {
					let possibleParent = previousTodo;
					while (!todo.isChildOf(possibleParent)) {
						possibleParent = possibleParent.parent;
					}
					todo.parent = possibleParent;
					possibleParent.hasChildren = true;
					possibleParent.children.push(todo);
				}
			}

			previousTodo = todo;
		}
		return todoMap;
	}
}
