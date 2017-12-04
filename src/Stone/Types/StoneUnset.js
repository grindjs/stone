export const directive = 'unset'

/**
 * Unsets a context variable
 *
 * @param  {object} context Context for the compilation
 * @param  {string} args    Arguments to unset
 * @return {string} Code to set the context variable
 */
export function parse(node, args) {
	node.properties = this._flattenArgs(args)
	this.next()
	return this.finishNode(node, 'StoneUnset')
}

export function generate({ properties }, state) {
	let first = true
	for(const property of properties) {
		if(first) {
			first = false
		} else {
			state.write(state.lineEnd)
			state.write(state.indent)
		}

		state.write('delete ')
		this[property.type](property, state)
		state.write(';')
	}
}

export function walk() {
	// Do nothing
}
