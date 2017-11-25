const { TokenType: BaseTokenType, TokContext } = require('acorn')

export class TokenType extends BaseTokenType {

	constructor(name, ...args) {
		super(name, ...args)

		const token = this
		this.updateContext = function(...args) { return token.update(this, ...args) }

		if(!this.constructor.context) {
			this.constructor.context = new TokContext(name, false)
		}
	}

	update(parser) {
		parser.context.push(this.context)
		parser.exprAllowed = parser.type.beforeExpr
	}

	get context() {
		return this.constructor.context
	}

}
