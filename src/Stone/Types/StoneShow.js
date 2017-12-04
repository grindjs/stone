import './StoneDirectiveType'

export class StoneShow extends StoneDirectiveType {

	static directive = 'show'

	/**
	 * Ends the current section and yields it for display
	 * @return {string} Output from the section
	 */
	static parse(parser, node) {
		const stack = parser._sectionStack

		if(!Array.isArray(stack) || stack.length === 0) {
			parser.raise(parser.start, '`@show` outside of `@section`')
		}

		stack.pop().yield = true

		return parser.finishNode(node, 'Directive')
	}

	static generate() {
		throw new Error('This should not be called')
	}

	static walk() {
		throw new Error('This should not be called')
	}

}
