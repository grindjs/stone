import './Parsers'
import './Tokens/StoneOutput'
import './Tokens/StoneDirective'

const acorn = require('acorn')

const tt = acorn.tokTypes

const directiveCodes = new Set(
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('').map(c => c.charCodeAt(0))
)

export class Parser {

	parse() {
		const node = this.startNode()
		this.nextToken()

		const output = this._createDeclaration('output', this._createLiteral('\'\''), 'let')
		const result = this.parseTopLevel(node)

		const template = new acorn.Node(this)
		template.type = 'FunctionDeclaration'
		template.id = this._createIdentifier('template')
		template.params = [ this._createIdentifier('_') ]
		template.body = this._createBlockStatement([
			output,
			...result.body,
			this._createReturn('output')
		])

		result.body = [ template ]

		return result
	}

	skipSpace(next, ...args) {
		return next.call(this, ...args)
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
			return this._createBlockStatement([ ])
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

		let args = null
		const parse = `parse${directive[0].toUpperCase()}${directive.substring(1)}Directive`
		const node = this.startNode()
		node.directive = directive

		if(this.input.charCodeAt(this.pos) === 40) {
			this.inDirective = true
			this.next()
			this.context.push(new acorn.TokContext)

			const parseArgs = `${parse}Args`

			if(typeof this[parseArgs] === 'function') {
				args = this[parseArgs](node)
			} else {
				args = this.parseParenExpression()
			}

			this.context.pop()
			this.inDirective = false
			this.pos = this.start // Fixes an issue where output after the directive is cutoff, but feels wrong.
		} else {
			this.next()
		}

		if(typeof this[parse] !== 'function') {
			this.raise(this.start, `Unknown directive: ${directive}`)
		}

		return this[parse](node, args)
	}

	parseUntilEndDirective(directives) {
		if(Array.isArray(directives)) {
			directives = new Set(directives)
		} else {
			directives = new Set([ directives ])
		}

		const statements = [ ]

		contents: for(;;) {
			switch(this.type) {
				case StoneDirective.type: {
					const node = this.parseDirective()

					if(node.directive && directives.has(node.directive)) {
						if(node.type !== 'Directive') {
							this.next()
						}

						break contents
					} else if(node.type !== 'BlankExpression') {
						statements.push(node)
					}

					this.next()
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

		return this._createBlockStatement(statements)
	}

	_isCharCode(code, delta = 0) {
		return this.input.charCodeAt(this.pos + delta) === code
	}

	_createIdentifier(identifier) {
		const node = new acorn.Node(this)
		node.type = 'Identifier'
		node.name = identifier
		return node
	}

	_maybeCreateIdentifier(name) {
		if(typeof name !== 'string') {
			return name
		}

		return this._createIdentifier(name)
	}

	_createBlockStatement(statements) {
		const node = new acorn.Node(this)
		node.type = 'BlockStatement'
		node.body = statements
		return node
	}

	_createEmptyNode() {
		const node = new acorn.Node(this)
		node.type = 'BlankExpression'
		return node
	}

	_createAssignment(left, right, operator = '=') {
		const node = this.startNodeAt(this.start, this.startLoc)
		node.operator = operator
		node.left = this._maybeCreateIdentifier(left)
		node.right = right

		return this.finishNode(node, 'AssignmentExpression')
	}

	_createDeclaration(lhs, rhs, kind = 'const') {
		const declarator = this.startNode()
		declarator.id = this._maybeCreateIdentifier(lhs)
		declarator.init = rhs
		this.finishNode(declarator, 'VariableDeclarator')

		const declaration = this.startNode()
		declaration.declarations = [ declarator ]
		declaration.kind = kind
		return this.finishNode(declaration, 'VariableDeclaration')
	}

	_createLiteral(value) {
		const node = this.startNode()
		node.value = value
		node.raw = value
		return this.finishNode(node, 'Literal')
	}

	_createReturn(value) {
		const declarator = this.startNode()

		if(value) {
			declarator.argument = this._maybeCreateIdentifier(value)
		}

		return this.finishNode(declarator, 'ReturnStatement')
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
