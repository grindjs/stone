import './StoneDirectiveBlockType'

export class StoneSpaceless extends StoneDirectiveBlockType {

	static directive = 'spaceless'

	static parse(parser, node) {
		Object.assign(node, this.parseUntilEndDirective(parser, node))
		return parser.finishNode(node, this.name)
	}

	static pushStack(parser) {
		parser._spaceless = (parser._spaceless || 0) + 1
	}

	static popStack(parser) {
		parser._spaceless--
	}

	static hasStack(parser) {
		return parser._spaceless > 0
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
