import '../TokenType'

export class OpenUnsafe extends TokenType {

	constructor() {
		super('{!!', { beforeExpr: true, startsExpr: true })

		this.context.preserveSpace = false
	}

	update(parser) {
		super.update(parser)

		parser.exprAllowed = true
	}

}
