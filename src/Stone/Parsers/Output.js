import '../Tokens/StoneOutput'
import '../Tokens/StoneDirective'

const { tokTypes: tt } = require('acorn')

/**
 * Increases the spaceless level
 *
 * @param  {object} node  Blank node
 * @return {object}       Finished node
 */
export function parseSpacelessDirective(node) {
	this._spaceless = (this._spaceless || 0) + 1
	Object.assign(node, this.parseUntilEndDirective('endspaceless'))
	return this.finishNode(node, 'BlockStatement')
}

/**
 * Decreases the spaceless level
 *
 * @param  {object} node  Blank node
 * @return {object}       Finished node
 */
export function parseEndspacelessDirective(node) {
	if(!this._spaceless || this._spaceless === 0) {
		this.raise(this.start, '`@endspaceless` outside of `@spaceless`')
	}

	this._spaceless--

	return this.finishNode(node, 'Directive')
}

/**
 * Parses output in Stone files
 *
 * @return {object} Finished node
 */
export function parseStoneOutput() {
	if(this.type !== StoneOutput.type) {
		this.unexpected()
	}

	const node = this.startNode()

	this.inOutput = true
	node.output = this.readStoneOutput()
	this.inOutput = false

	return this.finishNode(node, 'StoneOutput')
}

/**
 * Reads the output in Stone files
 *
 * @return {object} Template literal node
 */
export function readStoneOutput() {
	const node = this.startNode()
	node.expressions = [ ]
	this.next()

	let curElt = this.parseStoneOutputElement()
	node.quasis = [ curElt ]

	while(!curElt.tail) {
		const isUnsafe = this.type === StoneOutput.openUnsafe

		if(isUnsafe) {
			this.expect(StoneOutput.openUnsafe)
		} else {
			this.expect(StoneOutput.openSafe)
		}

		const expression = this.startNode()
		expression.safe = !isUnsafe
		expression.value = this.parseExpression()
		node.expressions.push(this.finishNode(expression, 'StoneOutputExpression'))

		this.skipSpace()
		this.pos++

		if(isUnsafe) {
			if(this.type !== tt.prefix) {
				this.unexpected()
			} else {
				this.type = tt.braceR
				this.context.pop()
			}

			this.pos++
		}

		this.next()

		node.quasis.push(curElt = this.parseStoneOutputElement())
	}

	this.next()
	return this.finishNode(node, 'TemplateLiteral')
}

/**
 * Parses chunks of output between braces and directives
 *
 * @return {object} Template element node
 */
export function parseStoneOutputElement() {
	const elem = this.startNode()
	let output = this.value

	// Strip space between tags if spaceless
	if(this._spaceless > 0) {
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
		cooked: this.value
	}

	this.next()

	elem.tail = this.type === StoneDirective.type || this.type === tt.eof
	return this.finishNode(elem, 'TemplateElement')
}

/**
 * Controls the output flow
 */
export function readOutputToken() {
	let chunkStart = this.pos
	let out = ''

	const pushChunk = () => {
		out += this.input.slice(chunkStart, this.pos)
		chunkStart = this.pos
	}

	const finishChunk = () => {
		pushChunk()
		return this.finishToken(StoneOutput.output, out)
	}

	for(;;) {
		if(this.pos >= this.input.length) {
			if(this.pos === this.start) {
				return this.finishToken(tt.eof)
			}

			return finishChunk()
		}

		const ch = this.input.charCodeAt(this.pos)

		if(ch === 64 && this._isCharCode(123, 1)) {
			if(this._isCharCode(123, 2)) {
				pushChunk()
				chunkStart = this.pos + 1
			}

			this.pos++
		} else if(
			ch === 64
			|| (ch === 123 && this._isCharCode(123, 1) && !this._isCharCode(64, -1))
			|| (ch === 123 && this._isCharCode(33, 1) && this._isCharCode(33, 2))
		) {
			if(ch === 123 && this._isCharCode(45, 2) && this._isCharCode(45, 3)) {
				pushChunk()
				this.skipStoneComment()
				chunkStart = this.pos
				continue
			} else if(this.pos === this.start && this.type === StoneOutput.output) {
				if(ch === 123) {
					if(this._isCharCode(33, 1)) {
						this.pos += 3
						return this.finishToken(StoneOutput.openUnsafe)
					} else {
						this.pos += 2
						return this.finishToken(StoneOutput.openSafe)
					}
				}

				return this.finishToken(StoneDirective.type)
			}

			return finishChunk()
		} else {
			++this.pos
		}
	}
}

/**
 * Skips past the current Stone comment
 */
export function skipStoneComment() {
	const end = this.input.indexOf('--}}', this.pos += 4)

	if(end === -1) {
		this.raise(this.pos - 4, 'Unterminated comment')
	}

	this.pos = end + 4
}
