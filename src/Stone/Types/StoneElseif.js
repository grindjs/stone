import './StoneDirectiveType'
import './StoneIf'

export class StoneElseif extends StoneDirectiveType {

	static directive = 'elseif'

	static parse(parser, node, condition) {
		if(!parser._ifStack || parser._ifStack.length === 0) {
			parser.raise(parser.start, '`@elseif` outside of `@if`')
		}

		const level = parser._ifStack.length - 1

		if(parser._ifStack[level].alternate) {
			parser.raise(parser.start, '`@elseif` after `@else`')
		}

		parser._ifStack[level].alternate = node
		parser._ifStack[level] = node
		node.test = condition
		node.consequent = parser.parseUntilEndDirective(StoneIf.endDirectives)

		return parser.finishNode(node, this.name)
	}

	static generate(generator, node, state) {
		generator.IfStatement(node, state)
	}

	static walk(walker, node, st, c) {
		walker.IfStatement(node, st, c)
	}

	static scope(scoper, node, scope) {
		scoper.IfStatement(node, scope)
	}

}
