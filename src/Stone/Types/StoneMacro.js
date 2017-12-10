import './StoneDirectiveBlockType'

export class StoneMacro extends StoneDirectiveBlockType {

	static directive = 'macro'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)
		this.assertArgs(parser, args, 1)

		node.id = args.shift()

		const output = parser.startNode()
		output.rescopeContext = true
		output.params = args
		output.body = this.parseUntilEndDirective(parser, node)

		node.output = parser.finishNode(output, 'StoneOutputBlock')
		return parser.finishNode(node, 'StoneMacro')
	}

	static generate(generator, node, state) {
		state.write('_[')
		generator[node.id.type](node.id, state)
		state.write('] = ')
		return generator[node.output.type](node.output, state)
	}

	static walk(walker, node, st, c) {
		c(node.id, st, 'Pattern')
		c(node.output, st, 'Expression')
	}

	static scope(scoper, { output }, scope) {
		scoper._scope(output, scope)
	}

}
