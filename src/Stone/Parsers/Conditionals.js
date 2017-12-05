export const endDirectives = [ 'endif', 'elseif', 'else' ]

export function parseIfDirective(node, args) {
	(this._currentIf = (this._currentIf || [ ])).push(node)
	node.test = args
	node.consequent = this.parseUntilEndDirective(endDirectives)
	return this.finishNode(node, 'IfStatement')
}

export function parseEndifDirective(node) {
	if(!this._currentIf || this._currentIf.length === 0) {
		this.raise(this.start, '`@endif` outside of `@if`')
	}

	this._currentIf.pop()

	return this.finishNode(node, 'Directive')
}
