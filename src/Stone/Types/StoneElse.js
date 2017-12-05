import './StoneDirectiveType'
import { endDirectives } from '../Parsers/Conditionals'

export class StoneElse extends StoneDirectiveType {

	static directive = 'else'

	static parse(parser, node) {
		if(!parser._currentIf || parser._currentIf.length === 0) {
			parser.raise(parser.start, '`@else` outside of `@if`')
		}

		const level = parser._currentIf.length - 1

		if(parser._currentIf[level].alternate) {
			parser.raise(parser.start, '`@else` after `@else`')
		}

		parser._currentIf[level].alternate = true
		parser._currentIf[level].alternate = Object.assign(node, parser.parseUntilEndDirective(endDirectives))

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
