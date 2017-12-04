export const directive = 'macro'
export const hasEndDirective = true

export function parse(node, args) {
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

export function parseEnd(node) {
	if(!this._currentMacro || this._currentMacro.length === 0) {
		this.raise(this.start, '`@endmacro` outside of `@macro`')
	}

	this._currentMacro.pop()

	return this.finishNode(node, 'Directive')
}

export function generate(node, state) {
	state.write('_[')
	this[node.id.type](node.id, state)
	state.write('] = ')
	return this[node.output.type](node.output, state)
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')
	c(node.output, st, 'Expression')
}

export function scope({ output }, scope) {
	this._scope(output, scope)
}
