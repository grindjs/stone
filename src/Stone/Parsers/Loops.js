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
