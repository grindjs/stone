import './StoneDirectiveType'
import './StoneIf'

export class StoneElse extends StoneDirectiveType {

	static directive = 'else'

	static parse(parser, node) {
		if(!parser._ifStack || parser._ifStack.length === 0) {
			parser.raise(parser.start, '`@else` outside of `@if`')
		}

		const level = parser._ifStack.length - 1

		if(parser._ifStack[level].alternate) {
			parser.raise(parser.start, '`@else` after `@else`')
		}

		parser._ifStack[level].alternate = true
		parser._ifStack[level].alternate = Object.assign(
			node,
			parser.parseUntilEndDirective(StoneIf.endDirectives)
		)

		return parser.finishNode(node, this.name)
	}

	static generate(generator, node, state) {
		generator.BlockStatement(node, state)
	}

	static walk(walker, node, st, c) {
		walker.BlockStatement(node, st, c)
	}

	static scope(scoper, node, scope) {
		scoper.BlockStatement(node, scope)
	}

}
