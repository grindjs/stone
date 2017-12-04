export function parseSetDirectiveArgs() {
	this.skipSpace()

	let kind = null

	if(this.input.substring(this.pos, this.pos + 6).toLowerCase() === 'const ') {
		kind = 'const'
	} else if(this.input.substring(this.pos, this.pos + 4).toLowerCase() === 'let ') {
		kind = 'let'
	} else if(this.input.substring(this.pos, this.pos + 4).toLowerCase() === 'var ') {
		this.raise(this.start, '`@set` does not support `var`')
	} else {
		return this.parseDirectiveArgs()
	}

	this.pos += kind.length

	const node = this.parseDirectiveArgs()
	node.kind = kind
	return node
}

/**
 * Sets a context variable
 *
 * @param  {object} context Context for the compilation
 * @param  {string} args    Arguments to set
 * @return {string} Code to set the context variable
 */
export function parseSetDirective(node, args) {
	const kind = args.kind || null
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@set` must contain at least 1 argument')
	} else if(args.length > 2) {
		this.raise(this.start, '`@set` cannot contain more than 2 arguments')
	}

	if(args.length === 1 && args[0].type === 'AssignmentExpression') {
		Object.assign(node, args[0])
	} else {
		node.operator = '='
		node.left = args[0]
		node.right = args[1]
	}

	node.kind = kind
	expressionToPattern(node.left)

	this.next()
	return this.finishNode(node, 'StoneSet')
}

/**
 * Unsets a context variable
 *
 * @param  {object} context Context for the compilation
 * @param  {string} args    Arguments to unset
 * @return {string} Code to set the context variable
 */
export function parseUnsetDirective(node, args) {
	node.properties = this._flattenArgs(args)
	this.next()
	return this.finishNode(node, 'StoneUnset')
}

/**
 * `parseSetDirectiveArgs` gets parsed into SequenceExpression
 * which parses destructuring into Array/Object expressions
 * instead of patterns
 */
function expressionToPattern(node) {
	if(node.isNil) {
		return
	}

	if(node.type === 'ArrayExpression') {
		node.type = 'ArrayPattern'
		node.elements.forEach(expressionToPattern)
	} else if(node.type === 'ObjectExpression') {
		node.type = 'ObjectPattern'

		for(const property of node.properties) {
			expressionToPattern(property.value)
		}
	}
}
