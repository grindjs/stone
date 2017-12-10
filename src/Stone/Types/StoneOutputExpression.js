import './StoneType'

export class StoneOutputExpression extends StoneType {

	static generate(generator, { safe = true, value }, state) {
		if(safe) {
			state.write('_.escape(')
		}

		generator[value.type](value, state)

		if(safe) {
			state.write(')')
		}
	}

	static walk(walker, { value }, st, c) {
		c(value, st, 'Expression')
	}

	static scope(scoper, { value }, scope) {
		return scoper._scope(value, scope)
	}

}
