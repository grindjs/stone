import '../TokenType'

export class OpenSafe extends TokenType {

	constructor() {
		super('{{', { beforeExpr: true, startsExpr: true })

		this.context.preserveSpace = false
	}

	update(parser) {
		super.update(parser)

		parser.exprAllowed = true
	}

}
