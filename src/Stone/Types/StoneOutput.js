import './StoneType'

export class StoneOutput extends StoneType {

	static generate(generator, { output }, state) {
		state.write('output += ')
		generator[output.type](output, state)
		state.write(';')
	}

	static walk(walker, { output }, st, c) {
		c(output, st, 'Expression')
	}

	static scope(scoper, { output }, scope) {
		return scoper._scope(output, scope)
	}

}
