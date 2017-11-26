export function parseForDirectiveArgs(node) {
	this.pos--
	this.parseForStatement(node)

	return null
}

export function parseForDirective(node, args, until = 'endfor') {
	const loop = node

	if(node.type === 'ForOfStatement' || node.type === 'ForInStatement') {
		node = this.startNode()
		node.type = 'StoneLoop'
		node.loop = loop
	}

	(this._currentFor = (this._currentFor || [ ])).push(node)
	loop.body = this.parseUntilEndDirective(until)
	return this.finishNode(node, node.type)
}

export function parseEndforDirective(node) {
	if(!this._currentFor || this._currentFor.length === 0) {
		if(node.directive === 'endforeach') {
			this.raise(this.start, '`@endforeach` outside of `@foreach`')
		} else {
			this.raise(this.start, '`@endfor` outside of `@for`')
		}
	}

	const open = this._currentFor.pop()

	if(open.directive === 'for' && node.directive === 'endforeach') {
		this.raise(this.start, '`@endfor` must be used with `@for`')
	} else if(open.directive === 'foreach' && node.directive === 'endfor') {
		this.raise(this.start, '`@endforeach` must be used with `@foreach`')
	}

	return this.finishNode(node, 'Directive')
}

export function parseForeachDirective(node, args) {
	// No difference between for and foreach
	// Included for consistency with Blade
	return this.parseForDirective(node, args, 'endforeach')
}

export const parseForeachDirectiveArgs = parseForDirectiveArgs
export const parseEndforeachDirective = parseEndforDirective

/**
 * Generate continue node that optionally has a condition
 * associated with it.
 *
 * @param  {object} node      Blank node
 * @param  {mixed}  condition Optional condition to continue on
 * @return {object}           Finished node
 */
export function parseContinueDirective(node, condition) {
	if(
		(!this._currentWhile || this._currentWhile.length === 0)
		&& (!this._currentFor || this._currentFor.length === 0)
	) {
		this.raise(this.start, '`@continue` outside of `@for` or `@while`')
	}

	if(condition.isNil) {
		return this.finishNode(node, 'ContinueStatement')
	}

	const block = this.startNode()
	block.body = [ this.finishNode(this.startNode(), 'ContinueStatement') ]

	node.test = condition
	node.consequent = this.finishNode(block, 'ContinueStatement')
	return this.finishNode(node, 'IfStatement')
}

/**
 * Generate break node that optionally has a condition
 * associated with it.
 *
 * @param  {object} node      Blank node
 * @param  {mixed}  condition Optional condition to break on
 * @return {object}           Finished node
 */
export function parseBreakDirective(node, condition) {
	if(
		(!this._currentWhile || this._currentWhile.length === 0)
		&& (!this._currentFor || this._currentFor.length === 0)
	) {
		this.raise(this.start, '`@break` outside of `@for` or `@while`')
	}

	if(condition.isNil) {
		return this.finishNode(node, 'BreakStatement')
	}

	const block = this.startNode()
	block.body = [ this.finishNode(this.startNode(), 'BreakStatement') ]

	node.test = condition
	node.consequent = this.finishNode(block, 'BlockStatement')
	return this.finishNode(node, 'IfStatement')
}

export function parseWhileDirectiveArgs(node) {
	this.pos--
	this.parseWhileStatement(node)

	return null
}

export function parseWhileDirective(node) {
	(this._currentWhile = (this._currentWhile || [ ])).push(node)
	node.body = this.parseUntilEndDirective('endwhile')
	return this.finishNode(node, node.type)
}

export function parseEndwhileDirective(node) {
	if(!this._currentWhile || this._currentWhile.length === 0) {
		this.raise(this.start, '`@endwhile` outside of `@while`')
	}

	this._currentWhile.pop()

	return this.finishNode(node, 'Directive')
}
