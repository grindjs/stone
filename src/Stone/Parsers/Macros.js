export function parseMacroDirective(node, args) {
	(this._currentMacro = (this._currentMacro || [ ])).push(node)

	if(args.type === 'SequenceExpression') {
		node.id = args.expressions.shift()
		node.params = args.expressions.map(expression => {
			if(expression.type === 'AssignmentExpression') {
				expression.type = 'AssignmentPattern'
			}

			return expression
		})
	} else {
		node.id = args
		node.params = [ ]
	}

	node.body = this.parseUntilEndDirective('endmacro')
	return this.finishNode(node, 'StoneMacro')
}

export function parseEndmacroDirective(node) {
	if(!this._currentMacro || this._currentMacro.length === 0) {
		this.raise(this.start, '`@endmacro` outside of `@macro`')
	}

	this._currentMacro.pop()

	return this.finishNode(node, 'Directive')
}
