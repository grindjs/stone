import './StoneType'

import { StoneOutput as StoneOutputToken } from '../Tokens/StoneOutput'
import { StoneDirective as StoneDirectiveToken } from '../Tokens/StoneDirective'
const { tokTypes: tt } = require('acorn')

export class StoneOutput extends StoneType {

	static registerParse(parser) {
		parser.parseStoneOutput = this._bind('parse')
	}

	static parse(parser) {
		if(parser.type !== StoneOutputToken.type) {
			parser.unexpected()
		}

		const node = parser.startNode()

		parser.inOutput = true
		node.output = this.read(parser)
		parser.inOutput = false

		if(this.isEmpty(node)) {
			// Only add the output if the string isn’t
			// blank to avoid unnecessary whitespace before
			// a directive
			return parser.finishNode(node, 'StoneEmptyExpression')
		}

		return parser.finishNode(node, 'StoneOutput')
	}

	/**
	 * Parses chunks of output between braces and directives
	 *
	 * @return {object} Template element node
	 */
	static parseOutputElement(parser, first = false) {
		const elem = parser.startNode()
		let output = parser.value || ''

		if(first && output[0] === '\n') {
			// Ignore the first newline after a directive
			output = output.substring(1)
		}

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

		let curElt = this.parseOutputElement(parser, true)
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

			node.quasis.push(curElt = this.parseOutputElement(parser, false))
		}

		parser.next()
		return parser.finishNode(node, 'TemplateLiteral')
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

	static isEmpty(node) {
		return node.output.type === 'TemplateLiteral'
			&& node.output.expressions.length === 0
			&& node.output.quasis.length === 1
			&& node.output.quasis[0].value.cooked.trim().length === 0
	}

}
