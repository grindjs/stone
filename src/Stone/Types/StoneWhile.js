import './StoneDirectiveBlockType'

export class StoneWhile extends StoneDirectiveBlockType {

	static directive = 'while'

	static parseArgs(parser, node) {
		parser.pos--
		parser.parseWhileStatement(node)

		return null
	}

	static parse(parser, node) {
		node.body = this.parseUntilEndDirective(parser, node)
		return parser.finishNode(node, 'StoneWhile')
	}

	static generate(generator, node, state) {
		generator.WhileStatement(node, state)
	}

	static walk(walker, node, st, c) {
		walker.WhileStatement(node, st, c)
	}

	static scope(scoper, node, scope) {
		scoper.WhileStatement(node, scope)
	}

}
