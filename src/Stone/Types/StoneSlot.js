import './StoneDirectiveType'

export class StoneSlot extends StoneDirectiveType {

	static directive = 'slot'

	static parse(parser, node, args) {
		args = parser._flattenArgs(args)

		if(args.length === 0) {
			parser.raise(parser.start, '`@slot` must contain at least 1 argument')
		}

		node.id = args.shift()

		if(args.length > 1) {
			parser.raise(parser.start, '`@slot` cannot contain more than 2 arguments')
		} else if(args.length === 1) {
			node.output = args.pop()
			node.inline = true
			parser.next()
		} else {
			(parser._currentSlot = (parser._currentSlot || [ ])).push(node)

			const output = parser.startNode()
			output.params = args
			output.body = parser.parseUntilEndDirective('endslot')
			node.output = parser.finishNode(output, 'StoneOutputBlock')
		}

		return parser.finishNode(node, 'StoneSlot')
	}

	/**
	 * Ends the current slot and returns output
	 * @return {string} Output from the slot
	 */
	static parseEnd(parser, node) {
		if(!parser._currentSlot || parser._currentSlot.length === 0) {
			parser.raise(parser.start, '`@endslot` outside of `@slot`')
		}

		parser._currentSlot.pop()

		return parser.finishNode(node, 'Directive')
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
