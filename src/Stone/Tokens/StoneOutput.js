import './TokenType'

import './StoneDirective'
import './StoneOutput/Chunk'
import './StoneOutput/OpenSafe'
import './StoneOutput/OpenUnsafe'

const { TokenType: AcornTokenType, tokTypes: tt } = require('acorn')

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
		this.context.override = p => this.constructor.readOutputToken(p)
	}

	static readOutputToken(parser) {
		let chunkStart = parser.pos
		let out = ''

		const pushChunk = () => {
			out += parser.input.slice(chunkStart, parser.pos)
			chunkStart = parser.pos
		}

		const finishChunk = () => {
			pushChunk()
			return parser.finishToken(this.output, out)
		}

		for(;;) {
			if(parser.pos >= parser.input.length) {
				if(parser.pos === parser.start) {
					return parser.finishToken(tt.eof)
				}

				return finishChunk()
			}

			const ch = parser.input.charCodeAt(parser.pos)

			if(ch === 64 && parser._isCharCode(123, 1)) {
				if(parser._isCharCode(123, 2)) {
					pushChunk()
					chunkStart = parser.pos + 1
				}
			} else if(
				ch === 64
				|| (ch === 123 && parser._isCharCode(123, 1) && !parser._isCharCode(64, -1))
				|| (ch === 123 && parser._isCharCode(33, 1) && parser._isCharCode(33, 2))
			) {
				if(ch === 123 && parser._isCharCode(45, 2) && parser._isCharCode(45, 3)) {
					pushChunk()
					parser.skipStoneComment()
					chunkStart = parser.pos
					continue
				} else if(parser.pos === parser.start && parser.type === this.output) {
					if(ch !== 123) {
						return parser.finishToken(StoneDirective.type)
					} else if(parser._isCharCode(33, 1)) {
						parser.pos += 3
						return parser.finishToken(this.openUnsafe)
					}

					parser.pos += 2
					return parser.finishToken(this.openSafe)
				}

				return finishChunk()
			}

			++parser.pos
		}
	}

}
