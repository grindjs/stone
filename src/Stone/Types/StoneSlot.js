import './StoneDirectiveBlockType'

export class StoneSlot extends StoneDirectiveBlockType {

	static directive = 'slot'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)
		this.assertArgs(parser, args, 1, 2)

		node.id = args.shift()

		if(args.length > 0) {
			node.output = args.pop()
			node.inline = true
			parser.next()
		} else {
			const output = parser.startNode()
			output.params = args
			output.body = this.parseUntilEndDirective(parser, node)
			node.output = parser.finishNode(output, 'StoneOutputBlock')
		}

		return parser.finishNode(node, 'StoneSlot')
	}

	static generate(generator, node, state) {
		state.write('__componentContext[')
		generator[node.id.type](node.id, state)
		state.write('] = ')

		if(node.inline) {
			generator.StoneOutputExpression({ safe: true, value: node.output }, state)
		} else {
			state.write('(')
			generator[node.output.type](node.output, state)
			state.write(')()')
		}

		state.write(';')
	}

	static walk(walker, node, st, c) {
		c(node.id, st, 'Pattern')

		if(node.inline) {
			return
		}

		c(node.output, st, 'Expression')
	}

	static scope(scoper, node, scope) {
		scoper._scope(node.output, scope)
	}

}
