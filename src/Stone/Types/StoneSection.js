import './StoneDirectiveBlockType'

export class StoneSection extends StoneDirectiveBlockType {

	static directive = 'section'

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
			output.body = this.parseUntilEndDirective(parser, node, [ 'show', 'endsection' ])
			output.returnRaw = true
			node.output = parser.finishNode(output, 'StoneOutputBlock')
		}

		return parser.finishNode(node, 'StoneSection')
	}

	static generate(generator, node, state) {
		state.write('_sections.push(')
		generator[node.id.type](node.id, state)
		state.write(', ')

		if(node.inline) {
			state.write('() => ')
			generator.StoneOutputExpression({ safe: true, value: node.output }, state)
		} else {
			generator[node.output.type](node.output, state)
		}

		state.write(');')

		if(!node.yield) {
			return
		}

		state.write(state.lineEnd)
		state.write(state.indent)
		generator.StoneYield({ section: node.id }, state)
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
