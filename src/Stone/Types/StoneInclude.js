export const directive = 'include'

/**
 * Renders content from a subview
 *
 * @param  {object} node Blank node
 * @param  {mixed}  args View name and optional context
 * @return {object}      Finished node
 */
export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@include` must contain at least 1 argument')
	}

	node.view = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@include` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.context = args.shift()
	}

	this.next()
	return this.finishNode(node, 'StoneInclude')
}

export function generate(node, state) {
	state.write('output += _.$stone.include(_, _sections, _templatePathname, ')
	this[node.view.type](node.view, state)

	if(!node.context.isNil) {
		state.write(', ')
		this[node.context.type](node.context, state)
	}

	state.write(');')
}

export function walk(node, st, c) {
	c(node.view, st, 'Pattern')

	if(node.context.isNil) {
		return
	}

	c(node.context, st, 'Expression')
}

export function scope(node, scope) {
	if(node.context.isNil) {
		return
	}

	this._scope(node.context, scope)
}
