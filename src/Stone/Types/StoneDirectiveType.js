import './StoneType'

export class StoneDirectiveType extends StoneType {

	static directive = null

	static registerParse(parser) {
		if(this.directive.isNil) {
			throw new Error('Directive must be set')
		}

		const directive = this.directive[0].toUpperCase() + this.directive.substring(1)
		parser[`parse${directive}Directive`] = this._bind('parse')

		if(typeof this.parseArgs === 'function') {
			parser[`parse${directive}DirectiveArgs`] = this._bind('parseArgs')
		}

		if(typeof this.parseEnd === 'function') {
			parser[`parseEnd${this.directive}Directive`] = this._bind('parseEnd')
		}
	}

	// Abstract methods

	static parse(/* parser, node, args */) {
		throw new Error('Subclasses must implement')
	}

}
