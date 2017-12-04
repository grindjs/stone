import './StoneDirectiveType'

// Block directives are directives that have @directive … @enddirective

export class StoneDirectiveBlockType extends StoneDirectiveType {

	static get startDirective() { return this.directive }
	static get endDirective() { return `end${this.directive}` }
	static get stackKey() { return `_${this.directive}Stack` }

	static registerParse(parser) {
		super.registerParse(parser)

		parser[`parseEnd${this.directive}Directive`] = this._bind('parseEnd')
	}

	static pushStack(parser, node) {
		(parser[this.stackKey] = parser[this.stackKey] || [ ]).push(node)
	}

	static parseUntilEndDirective(parser, node, directive = null) {
		this.pushStack(parser, node)
		return parser.parseUntilEndDirective(directive || this.endDirective)
	}

	static parseEnd(parser, node) {
		const stack = parser[this.stackKey]

		if(!Array.isArray(stack) || stack.length === 0) {
			parser.raise(parser.start, `\`@${node.directive}\` outside of \`@${this.startDirective}\``)
		}

		stack.pop()

		return parser.finishNode(node, 'Directive')
	}

}
