export const endDirectives = [ 'endif', 'elseif', 'else' ]

export function parseIfDirective(node, args) {
	(this._currentIf = (this._currentIf || [ ])).push(node)
	node.test = args
	node.consequent = this.parseUntilEndDirective(endDirectives)
	return this.finishNode(node, 'IfStatement')
}

export function parseElseifDirective(node, args) {
	if(!this._currentIf || this._currentIf.length === 0) {
		this.raise(this.start, '`@elseif` outside of `@if`')
	}

	const level = this._currentIf.length - 1

	if(this._currentIf[level].alternate) {
		this.raise(this.start, '`@elseif` after `@else`')
	}

	this._currentIf[level].alternate = node
	this._currentIf[level] = node
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
