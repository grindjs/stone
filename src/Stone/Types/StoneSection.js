export const directive = 'section'
export const hasEndDirective = true
export const parsers = { parseShowDirective }

export function parse(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@section` must contain at least 1 argument')
	}

	node.id = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@section` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.output = args.pop()
		node.inline = true
		this.next()
	} else {
		(this._currentSection = (this._currentSection || [ ])).push(node)

		const output = this.startNode()
		output.params = args
		output.body = this.parseUntilEndDirective([ 'show', 'endsection' ])
		node.output = this.finishNode(output, 'StoneOutputBlock')
	}

	return this.finishNode(node, 'StoneSection')
}

/**
 * Ends the current section and returns output
 * @return {string} Output from the section
 */
export function parseEnd(node) {
	if(!this._currentSection || this._currentSection.length === 0) {
		this.raise(this.start, '`@endsection` outside of `@section`')
	}

	this._currentSection.pop()

	return this.finishNode(node, 'Directive')
}

/**
 * Ends the current section and yields it for display
 * @return {string} Output from the section
 */
export function parseShowDirective(node) {
	if(!this._currentSection || this._currentSection.length === 0) {
		this.raise(this.start, '`@show` outside of `@section`')
	}

	this._currentSection.pop().yield = true

	return this.finishNode(node, 'Directive')
}

export function generate(node, state) {
	state.write('_sections.push(')
	this[node.id.type](node.id, state)
	state.write(', ')

	if(node.inline) {
		state.write('() => ')
		this.StoneOutputExpression({ safe: true, value: node.output }, state)
	} else {
		this[node.output.type](node.output, state)
	}

	state.write(');')

	if(!node.yield) {
		return
	}

	state.write(state.lineEnd)
	state.write(state.indent)
	this.StoneYield({ section: node.id }, state)
}

export function walk(node, st, c) {
	c(node.id, st, 'Pattern')

	if(node.inline) {
		return
	}

	c(node.output, st, 'Expression')
}

export function scope(node, scope) {
	this._scope(node.output, scope)
}
