import '../TokenType'

export class Chunk extends TokenType {

	constructor() {
		super('stoneOutputChunk')

		this.context.isExpr = true
		this.context.preserveSpace = true
		this.context.override = p => p.readOutputToken()
	}

	update(parser) {
		const curContext = parser.curContext()

		if(curContext === this.context) {
			parser.context.pop()
		} else {
			parser.context.push(this.context)
		}
	}

}
