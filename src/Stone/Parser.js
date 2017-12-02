import './Parsers'

import './Contexts/DirectiveArgs'
import './Contexts/PreserveSpace'

import './Support/MakeNode'

import './Tokens/StoneOutput'
import './Tokens/StoneDirective'

const acorn = require('acorn')
const tt = acorn.tokTypes

const directiveCodes = new Set(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('').map(c => c.charCodeAt(0))
)

export class Parser {

	parse() {
		const template = new acorn.Node(this)
		template.type = 'StoneTemplate'
		template.pathname = this._stoneTemplatePathname
		this._stoneTemplate = template
		this.make = new MakeNode(this)

		const node = this.startNode()
		this.nextToken()

		const result = this.parseTopLevel(node)

		template.output = new acorn.Node(this)
		template.output.type = 'StoneOutputBlock'
		template.output.body = this.make.block(result.body)

		result.body = [ template ]

		return result
	}

	expect(next, type) {
		if(type === tt.parenR && (this.curContext() instanceof DirectiveArgs)) {
			// Awkward workaround so acorn doesn’t
			// advance beyond the close parenthesis
			// otherwise it tries to eat spaces
			// and in some cases the first word
			this.context.push(new PreserveSpace(true, true))
			const value = next.call(this, type)
			this.context.pop()
			return value
		}

		return next.call(this, type)
	}

	readToken(next, code) {
		if(code === 64 && !this._isCharCode(123, 1)) {
			this.pos++
			code = this.fullCharCodeAtPos()
			return this.finishToken(StoneDirective.type)
		} else if(!this.inDirective && !this.inOutput) {
			return this.finishToken(StoneOutput.type)
		}

		return next.call(this, code)
	}

	parseTopLevel(next, node) {
		const exports = { }

		if(!node.body) {
			node.body = [ ]
		}

		while(this.type !== tt.eof) {
			node.body.push(this.parseStatement(true, true, exports))
		}

		this.next()

		if(this.options.ecmaVersion >= 6) {
			node.sourceType = this.options.sourceType
		}

		return this.finishNode(node, 'Program')
	}

	parseStatement(next, declaration, topLevel, exports) {
		if(this.inDirective) {
			// When parsing directives, by avoiding this call
			// we can leverage the built in acorn functionality
			// for parsing things like for loops without it
			// trying to parse the block
			return this.make.block([ ])
		}

		switch(this.type) {
			case StoneDirective.type:
				return this.parseDirective()
			case StoneOutput.type:
				return this.parseStoneOutput()
			default:
				return next.call(this, declaration, topLevel, exports)
		}
	}

	parseDirective() {
		let directive = ''

		while(this.pos < this.input.length) {
			if(!directiveCodes.has(this.input.charCodeAt(this.pos))) {
				break
			}

			directive += this.input[this.pos]
			++this.pos
		}

		if(directive.length === 0) {
			this.unexpected()
		}

		let args = null
		const parse = `parse${directive[0].toUpperCase()}${directive.substring(1).toLowerCase()}Directive`
		const node = this.startNode()
		node.directive = directive

		if(this._isCharCode(40)) {
			const start = this.pos
			this.pos++
			this.skipSpace()
			if(this._isCharCode(41)) {
				this.pos++
				this.next()
			} else {
				this.pos = start
				this.inDirective = true
				this.next()
				this.context.push(new DirectiveArgs)

				const parseArgs = `${parse}Args`

				if(typeof this[parseArgs] === 'function') {
					args = this[parseArgs](node)
				} else {
					args = this.parseDirectiveArgs()
				}

				this.context.pop()
				this.inDirective = false
			}
		} else {
			this.next()
		}

		if(typeof this[parse] !== 'function') {
			this.raise(this.start, `Unknown directive: ${directive}`)
		}

		return this[parse](node, args)
	}

	parseDirectiveArgs() {
		this.expect(tt.parenL)
		const val = this.parseExpression()

		// Awkward workaround so acorn doesn’t
		// advance beyond the close parenthesis
		// otherwise it tries to eat spaces
		// and in some cases the first word
		this.context.push(new PreserveSpace(true, true))
		this.expect(tt.parenR)
		this.context.pop()

		return val
	}

	reset() {
		this.context.push(new PreserveSpace(true, true))
		this.next()
		this.context.pop()
	}

	parseUntilEndDirective(directives) {
		if(Array.isArray(directives)) {
			directives = new Set(directives)
		} else {
			directives = new Set([ directives ])
		}

		const node = this.startNode()
		const statements = [ ]

		contents: for(;;) {
			switch(this.type) {
				case StoneDirective.type: {
					const node = this.parseDirective()

					if(node.directive && directives.has(node.directive)) {
						if(node.type !== 'Directive') {
							this.reset()
						}

						break contents
					} else if(node.type !== 'BlankExpression') {
						statements.push(node)
					}

					this.reset()
					break
				}

				case StoneOutput.type:
					statements.push(this.parseStoneOutput())
					break

				case tt.eof: {
					const array = Array.from(directives)
					let expecting = null

					if(array.length > 1) {
						const last = array.length - 1
						expecting = array.slice(0, last).join('`, `@')
						expecting += `\` or \`@${array[last]}`
					} else {
						expecting = array[0]
					}

					this.raise(this.start, `Unexpected end of file, expected \`@${expecting}\``)
					break
				}

				default:
					this.finishToken(StoneOutput.type)
					break
			}
		}

		node.body = statements
		return this.finishNode(node, 'BlockStatement')
	}

	_isCharCode(code, delta = 0) {
		return this.input.charCodeAt(this.pos + delta) === code
	}

	_flattenArgs(args) {
		if(args.isNil) {
			return [ ]
		} else if(args.type === 'SequenceExpression') {
			return args.expressions.map(expression => {
				if(expression.type === 'AssignmentExpression') {
					expression.type = 'AssignmentPattern'
				}

				return expression
			})
		}

		return [ args ]
	}

	_debug(message = 'DEBUG', peek = false) {
		let debug = {
			start: this.start,
			pos: this.pos,
			end: this.end,
			code: this.input.charCodeAt(this.pos),
			char: this.input.substring(this.pos, this.pos + 1),
			type: this.type,
			context: this.curContext()
		}

		if(peek) {
			debug.peek = {
				pos: this.input.substring(this.pos, this.pos + 5),
				start: this.input.substring(this.start, this.start + 5)
			}
		}

		debug = require('cardinal').highlight(JSON.stringify(debug, null, 2))

		console.log(require('chalk').cyan(message), debug)
	}

}

// Inject the parsers
for(const [ name, func ] of Object.entries(Parsers)) {
	Parser.prototype[name] = func
}
