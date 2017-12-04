export const directive = 'extends'

export function parse(node, args) {
	if(this._stoneTemplate.isNil) {
		this.unexpected()
	}

	if(this._stoneTemplate.isLayout === true) {
		this.raise(this.start, '`@extends` may only be called once per view.')
	} else {
		this._stoneTemplate.isLayout = true
	}

	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@extends` must contain at least 1 argument')
	}

	node.view = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@extends` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.context = args.shift()
		this._stoneTemplate.hasLayoutContext = true
	}

	this.next()
	return this.finishNode(node, 'StoneExtends')
}

export function generate(node, state) {
	state.write('__extendsLayout = ')
	this[node.view.type](node.view, state)
	state.write(';')

	if(node.context.isNil) {
		return
	}

	state.write(state.lineEnd)
	state.write(state.indent)
	state.write('__extendsContext = ')
	this[node.context.type](node.context, state)
	state.write(';')
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
