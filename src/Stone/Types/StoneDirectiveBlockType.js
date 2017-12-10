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

	static popStack(parser) {
		parser[this.stackKey].pop()
	}

	static hasStack(parser) {
		const stack = parser[this.stackKey]

		return Array.isArray(stack) && stack.length > 0
	}

	static parseUntilEndDirective(parser, node, directive = null) {
		this.pushStack(parser, node)
		return parser.parseUntilEndDirective(directive || this.endDirective)
	}

	static parseEnd(parser, node) {
		if(!this.hasStack(parser, node)) {
			parser.raise(parser.start, `\`@${node.directive}\` outside of \`@${this.startDirective}\``)
		}

		this.popStack(parser, node)

		return parser.finishNode(node, 'Directive')
	}

}
