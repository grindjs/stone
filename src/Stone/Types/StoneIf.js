import './StoneDirectiveBlockType'

import './StoneElse'
import './StoneElseif'

export class StoneIf extends StoneDirectiveBlockType {

	static directive = 'if'

	static get endDirectives() {
		return [ this.endDirective, StoneElse.directive, StoneElseif.directive ]
	}

	static parse(parser, node, condition) {
		node.test = condition
		node.consequent = this.parseUntilEndDirective(parser, node, this.endDirectives)
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
