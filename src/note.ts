import Todo from './models/todo';
import TodoParser from './parsers/todoParser';

export default class Note {
	content: string;
	private todoParser: TodoParser;
	private noteContentLines: string[];
	private todoMap: Record<string, Todo[]>;

	constructor(todoParser: TodoParser, noteContent: string) {
		this.content = noteContent;
		this.todoParser = todoParser;
		this.noteContentLines = noteContent.split(/\r?\n|\r|\n/g);
	}

	parse() {
		this.todoMap = this.todoParser.parse(this.noteContentLines);
		console.log(this.todoMap);
	}

	rollOver(lastNote: Note) {
		Object.keys(lastNote.todoMap).forEach(key => {
			const keyTodos = lastNote.todoMap[key];
			const todosPrint = keyTodos.reduce((acc, curr) => {
				acc += curr.toString();
				return acc;
			}, '');

			this.content = this.content.replace(key, `${key}\n${todosPrint}`);
		});
		console.log(this.content);
	}
}
