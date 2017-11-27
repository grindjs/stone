/**
 * Renders content from a subview
 *
 * @param  {object} node Blank node
 * @param  {mixed}  args View name and optional context
 * @return {object}      Finished node
 */
export function parseIncludeDirective(node, args) {
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

/**
 * Compiles each directive to call the runtime and output
 * the result.
 *
 * @param  {object} node   Blank node
 * @param  {mixed}  params Arguments to pass through to runtime
 * @return {object}        Finished node
 */
export function parseEachDirective(node, params) {
	node.params = this._flattenArgs(params)

	if(node.params.length < 3) {
		this.raise(this.start, '`@each` must contain at least 3 arguments')
	} else if(node.params.length > 5) {
		this.raise(this.start, '`@each` cannot contain more than 5 arguments')
	}

	this.next()
	return this.finishNode(node, 'StoneEach')
}
