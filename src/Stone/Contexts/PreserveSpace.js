const { TokContext } = require('acorn')

export class PreserveSpace extends TokContext {

	breakOnSpace = false
	breakOnRead = false

	constructor(breakOnSpace = false, breakOnRead = false) {
		super('preserveSpace')

		this.preserveSpace = true
		this.breakOnSpace = breakOnSpace
		this.breakOnRead = breakOnRead
	}

	override = p => {
		const code = this.breakOnRead ? 32 : (!this.breakOnSpace ? -1 : p.fullCharCodeAtPos())

		switch(code) {
			case 9:  // \t
			case 10: // \n
			case 13: // \r
			case 32: // space
				return
			default:
				return p.readToken(p.fullCharCodeAtPos())
		}
	}

}
