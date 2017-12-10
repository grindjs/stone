import '../TokenType'
import '../StoneOutput'

export class Chunk extends TokenType {

	constructor() {
		super('stoneOutputChunk')

		this.context.isExpr = true
		this.context.preserveSpace = true
		this.context.override = p => StoneOutput.readOutputToken(p)
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
