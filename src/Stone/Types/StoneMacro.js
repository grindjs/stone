import './StoneDirectiveType'

export class StoneMacro extends StoneDirectiveType {

	static directive = 'macro'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)
		this.assertArgs(parser, args, 1)

		node.id = args.shift()

		parser._currentMacro = parser._currentMacro || [ ]
		parser._currentMacro.push(node)

		const output = parser.startNode()
		output.rescopeContext = true
		output.params = args
		output.body = parser.parseUntilEndDirective('endmacro')

		node.output = parser.finishNode(output, 'StoneOutputBlock')
		return parser.finishNode(node, 'StoneMacro')
	}

	static parseEnd(parser, node) {
		if(!parser._currentMacro || parser._currentMacro.length === 0) {
			parser.raise(parser.start, '`@endmacro` outside of `@macro`')
		}

		parser._currentMacro.pop()

		return parser.finishNode(node, 'Directive')
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
