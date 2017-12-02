export function parseComponentDirective(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@component` must contain at least 1 argument')
	}

	node.view = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@component` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.context = args.pop()
	}

	(this._currentComponent = (this._currentComponent || [ ])).push(node)

	const output = this.startNode()
	output.params = args
	output.body = this.parseUntilEndDirective('endcomponent')
	node.output = this.finishNode(output, 'StoneOutputBlock')

	return this.finishNode(node, 'StoneComponent')
}

/**
 * Ends the current component and returns output
 * @return {string} Output from the component
 */
export function parseEndcomponentDirective(node) {
	if(!this._currentComponent || this._currentComponent.length === 0) {
		this.raise(this.start, '`@endcomponent` outside of `@component`')
	}

	this._currentComponent.pop()

	return this.finishNode(node, 'Directive')
}

export function parseSlotDirective(node, args) {
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
export function parseEndslotDirective(node) {
	if(!this._currentSlot || this._currentSlot.length === 0) {
		this.raise(this.start, '`@endslot` outside of `@slot`')
	}

	this._currentSlot.pop()

	return this.finishNode(node, 'Directive')
}
