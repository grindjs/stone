import './StoneDirectiveType'
import { endDirectives } from '../Parsers/Conditionals'

export class StoneElseif extends StoneDirectiveType {

	static directive = 'elseif'

	static parse(parser, node, condition) {
		if(!parser._currentIf || parser._currentIf.length === 0) {
			parser.raise(parser.start, '`@elseif` outside of `@if`')
		}

		const level = parser._currentIf.length - 1

		if(parser._currentIf[level].alternate) {
			parser.raise(parser.start, '`@elseif` after `@else`')
		}

		parser._currentIf[level].alternate = node
		parser._currentIf[level] = node
		node.test = condition
		node.consequent = parser.parseUntilEndDirective(endDirectives)

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
