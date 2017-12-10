import './StoneDirectiveBlockType'

export class StoneUnless extends StoneDirectiveBlockType {

	static directive = 'unless'

	static parse(parser, node, condition) {
		node.test = condition
		node.consequent = this.parseUntilEndDirective(parser, node)
		return parser.finishNode(node, this.name)
	}

	static generate(generator, node, state) {
		generator.IfStatement({
			...node,
			test: {
				type: 'UnaryExpression',
				operator: '!',
				prefix: true,
				argument: node.test
			}
		}, state)
	}

	static walk(walker, node, st, c) {
		walker.IfStatement(node, st, c)
	}

	static scope(scoper, node, scope) {
		scoper.IfStatement(node, scope)
	}

}
