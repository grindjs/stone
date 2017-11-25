import './TokenType'

export class StoneDirective extends TokenType {

	static type = new StoneDirective

	constructor() {
		super('stoneDirective')

		this.context.preserveSpace = true
	}

}

