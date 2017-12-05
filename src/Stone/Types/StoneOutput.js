import './StoneType'

import { StoneOutput as StoneOutputToken } from '../Tokens/StoneOutput'
import { StoneDirective as StoneDirectiveToken } from '../Tokens/StoneDirective'
const { tokTypes: tt } = require('acorn')

export class StoneOutput extends StoneType {

	static registerParse(parser) {
		parser.parseStoneOutput = this._bind('parse')
		parser.readOutputToken = this._bind('readOutputToken')
	}

	static parse(parser) {
		if(parser.type !== StoneOutputToken.type) {
			parser.unexpected()
		}

		const node = parser.startNode()

		parser.inOutput = true
		node.output = this.read(parser)
		parser.inOutput = false

		return parser.finishNode(node, 'StoneOutput')
	}

	/**
	 * Parses chunks of output between braces and directives
	 *
	 * @return {object} Template element node
	 */
	static parseOutputElement(parser) {
		const elem = parser.startNode()
		let output = parser.value

		// Strip space between tags if spaceless
		if(parser._spaceless > 0) {
			output = output.replace(/>\s+</g, '><').trim()
		}

		// Escape escape characters
		output = output.replace(/\\/g, '\\\\')

		// Escape backticks
		output = output.replace(/`/g, '\\`')

		// Escape whitespace characters
		output = output.replace(/[\n]/g, '\\n')
		output = output.replace(/[\r]/g, '\\r')
		output = output.replace(/[\t]/g, '\\t')

		elem.value = {
			raw: output,
			cooked: parser.value
		}

		parser.next()

		elem.tail = parser.type === StoneDirectiveToken.type || parser.type === tt.eof
		return parser.finishNode(elem, 'TemplateElement')
	}

	static read(parser) {
		const node = parser.startNode()
		node.expressions = [ ]
		parser.next()

		let curElt = this.parseOutputElement(parser)
		node.quasis = [ curElt ]

		while(!curElt.tail) {
			const isUnsafe = parser.type === StoneOutputToken.openUnsafe

			if(isUnsafe) {
				parser.expect(StoneOutputToken.openUnsafe)
			} else {
				parser.expect(StoneOutputToken.openSafe)
			}

			const expression = parser.startNode()
			expression.safe = !isUnsafe
			expression.value = parser.parseExpression()
			node.expressions.push(parser.finishNode(expression, 'StoneOutputExpression'))

			parser.skipSpace()
			parser.pos++

			if(isUnsafe) {
				if(parser.type !== tt.prefix) {
					parser.unexpected()
				} else {
					parser.type = tt.braceR
					parser.context.pop()
				}

				parser.pos++
			}

			parser.next()

			node.quasis.push(curElt = this.parseOutputElement(parser))
		}

		parser.next()
		return parser.finishNode(node, 'TemplateLiteral')
	}

	/**
	 * Controls the output flow
	 */
	static readOutputToken(parser) {
		let chunkStart = parser.pos
		let out = ''

		const pushChunk = () => {
			out += parser.input.slice(chunkStart, parser.pos)
			chunkStart = parser.pos
		}

		const finishChunk = () => {
			pushChunk()
			return parser.finishToken(StoneOutputToken.output, out)
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

				parser.pos++
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
				} else if(parser.pos === parser.start && parser.type === StoneOutputToken.output) {
					if(ch === 123) {
						if(parser._isCharCode(33, 1)) {
							parser.pos += 3
							return parser.finishToken(StoneOutputToken.openUnsafe)
						} else {
							parser.pos += 2
							return parser.finishToken(StoneOutputToken.openSafe)
						}
					}

					return parser.finishToken(StoneDirectiveToken.type)
				}

				return finishChunk()
			} else {
				++parser.pos
			}
		}
	}

	static generate(generator, { output }, state) {
		state.write('output += ')
		generator[output.type](output, state)
		state.write(';')
	}

	static walk(walker, { output }, st, c) {
		c(output, st, 'Expression')
	}

	static scope(scoper, { output }, scope) {
		return scoper._scope(output, scope)
	}

}
