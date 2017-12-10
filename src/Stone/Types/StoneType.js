import { make } from '../Support/MakeNode'

export class StoneType {

	static make = make

	static registerParse(/* parser */) {
		// Default: noop
	}

	static registerGenerate(generator) {
		generator[this.name] = this._bind('generate')
	}

	static registerWalk(walker) {
		walker[this.name] = this._bind('walk')
	}

	static registerScope(scoper) {
		if(typeof this.scope !== 'function') {
			return
		}

		scoper[this.name] = this._bind('scope')
	}

	static _bind(func) {
		const bound = this[func].bind(this)
		return function(...args) { return bound(this, ...args) }
	}

	// Abstract methods

	static generate(/* generator, node, state */) {
		throw new Error('Subclasses must implement')
	}

	static walk(/* walker, node, st, c */) {
		throw new Error('Subclasses must implement')
	}

}
