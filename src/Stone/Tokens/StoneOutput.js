import './TokenType'

import './StoneOutput/Chunk'
import './StoneOutput/OpenSafe'
import './StoneOutput/OpenUnsafe'

const { TokenType: AcornTokenType } = require('acorn')

export class StoneOutput extends TokenType {

	static type = new StoneOutput
	static output = new Chunk

	static openSafe = new OpenSafe
	static closeSafe = new AcornTokenType('}}')

	static openUnsafe = new OpenUnsafe
	static closeUnsafe = new AcornTokenType('!!}')

	constructor() {
		super('stoneOutput')

		this.context.isExpr = true
		this.context.preserveSpace = true
		this.context.override = p => p.readOutputToken()
	}

}
