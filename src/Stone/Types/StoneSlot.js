export const directive = 'slot'
export const hasEndDirective = true

export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@slot` must contain at least 1 argument')
	}

	node.id = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@slot` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.output = args.pop()
		node.inline = true
		this.next()
	} else {
		(this._currentSlot = (this._currentSlot || [ ])).push(node)

		const output = this.startNode()
		output.params = args
		output.body = this.parseUntilEndDirective('endslot')
		node.output = this.finishNode(output, 'StoneOutputBlock')
	}

	return this.finishNode(node, 'StoneSlot')
}

/**
 * Ends the current slot and returns output
 * @return {string} Output from the slot
 */
export function parseEnd(node) {
	if(!this._currentSlot || this._currentSlot.length === 0) {
		this.raise(this.start, '`@endslot` outside of `@slot`')
	}

	this._currentSlot.pop()

	return this.finishNode(node, 'Directive')
}

export function generate(node, state) {
	state.write('__componentContext[')
	this[node.id.type](node.id, state)
	state.write('] = ')

	if(node.inline) {
		this.StoneOutputExpression({ safe: true, value: node.output }, state)
	} else {
		state.write('(')
		this[node.output.type](node.output, state)
		state.write(')()')
	}

	state.write(';')
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')

	if(node.inline) {
		return
	}

	c(node.output, st, 'Expression')
}

export function scope(node, scope) {
	this._scope(node.output, scope)
}
