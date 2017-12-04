import './StoneDirectiveType'

export class StoneSection extends StoneDirectiveType {

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
			(parser._currentSection = (parser._currentSection || [ ])).push(node)

			const output = parser.startNode()
			output.params = args
			output.body = parser.parseUntilEndDirective([ 'show', 'endsection' ])
			node.output = parser.finishNode(output, 'StoneOutputBlock')
		}

		return parser.finishNode(node, 'StoneSection')
	}

	/**
	 * Ends the current section and returns output
	 * @return {string} Output from the section
	 */
	static parseEnd(parser, node) {
		if(!parser._currentSection || parser._currentSection.length === 0) {
			parser.raise(parser.start, '`@endsection` outside of `@section`')
		}

		parser._currentSection.pop()

		return parser.finishNode(node, 'Directive')
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
