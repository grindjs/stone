export function parseMacroDirective(node, args) {
	(this._currentMacro = (this._currentMacro || [ ])).push(node)
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@macro` must contain at least 1 argument')
	}

	node.id = args.shift()

	const output = this.startNode()
	output.rescopeContext = true
	output.params = args
	output.body = this.parseUntilEndDirective('endmacro')

	node.output = this.finishNode(output, 'StoneOutputBlock')
	return this.finishNode(node, 'StoneMacro')
}

export function parseEndmacroDirective(node) {
	if(!this._currentMacro || this._currentMacro.length === 0) {
		this.raise(this.start, '`@endmacro` outside of `@macro`')
	}

	this._currentMacro.pop()

	return this.finishNode(node, 'Directive')
}
