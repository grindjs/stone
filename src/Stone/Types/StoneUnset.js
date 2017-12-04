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
