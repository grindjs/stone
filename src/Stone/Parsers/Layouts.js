import { endDirectives } from './Conditionals'

export function parseExtendsDirective(node, args) {
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

export function parseSectionDirective(node, args) {
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
export function parseEndsectionDirective(node) {
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

/**
 * Compiles the yield directive to output a section
 *
 * @param  {object} context Context for the compilation
 * @param  {string} section Name of the section to yield
 * @return {string}         Code to render the section
 */
export function parseYieldDirective(node, args) {
	args = this._flattenArgs(args)

	if(args.length === 0) {
		this.raise(this.start, '`@yield` must contain at least 1 argument')
	}

	node.section = args.shift()

	if(args.length > 1) {
		this.raise(this.start, '`@yield` cannot contain more than 2 arguments')
	} else if(args.length === 1) {
		node.output = args.pop()
	}

	this.next()
	return this.finishNode(node, 'StoneYield')
}

/**
 * Renders content from the section section
 * @return {string} Code to render the super section
 */
export function parseSuperDirective(node) {
	if(!this._currentSection || this._currentSection.length === 0) {
		this.raise(this.start, `\`@${node.directive}\` outside of \`@section\``)
	}

	node.section = { ...this._currentSection[this._currentSection.length - 1].id }
	return this.finishNode(node, 'StoneSuper')
}

/**
 * Alias of compileSuper for compatibility with Blade
 * @return {string} Code to render the super section
 */
export function parseParentDirective(node) {
	return this.parseSuperDirective(node)
}

/**
 * Convenience directive to determine if a section has content
 * @return {string} If statement that determines if a section has content
 */
export function parseHassectionDirective(node, args) {
	args = this._flattenArgs(args)

	if(args.length !== 1) {
		this.raise(this.start, '`@hassection` must contain exactly 1 argument')
	}

	(this._currentIf = (this._currentIf || [ ])).push(node)

	node.section = args.pop()
	node.consequent = this.parseUntilEndDirective(endDirectives)
	return this.finishNode(node, 'StoneHasSection')
}
