const endDirectives = [ 'endif', 'elseif', 'else' ]

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

export function parseElseDirective(node) {
	if(!this._currentIf || this._currentIf.length === 0) {
		this.raise(this.start, '`@else` outside of `@if`')
	}

	const level = this._currentIf.length - 1

	if(this._currentIf[level].alternate) {
		this.raise(this.start, '`@else` after `@else`')
	}

	this._currentIf[level].alternate = true
	this._currentIf[level].alternate = this.parseUntilEndDirective(endDirectives)
	return this.finishNode(node, 'BlockStatement')
}

export function parseEndifDirective(node) {
	if(!this._currentIf || this._currentIf.length === 0) {
		this.raise(this.start, '`@endif` outside of `@if`')
	}

	this._currentIf.pop()

	return this.finishNode(node, 'Directive')
}

export function parseUnlessDirective(node, args) {
	(this._currentUnless = (this._currentUneless || [ ])).push(node)

	const unary = this.startNode()
	unary.operator = '!'
	unary.prefix = true
	unary.argument = args
	this.finishNode(unary, 'UnaryExpression')

	node.test = unary
	node.consequent = this.parseUntilEndDirective('endunless')
	return this.finishNode(node, 'IfStatement')
}

export function parseEndunlessDirective(node) {
	if(!this._currentUnless || this._currentUnless.length === 0) {
		this.raise(this.start, '`@endunless` outside of `@unless`')
	}

	this._currentUnless.pop()

	return this.finishNode(node, 'Directive')
}
