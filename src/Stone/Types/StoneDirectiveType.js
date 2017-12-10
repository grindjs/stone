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
	}

	static assertArgs(parser, args, minimum = 1, maximum = null) {
		if(minimum === maximum) {
			if(args.length !== minimum) {
				parser.raise(parser.start, `\`@${this.directive}\` must contain exactly ${minimum} argument${minimum !== 1 ? 's' : ''}`)
			}
		} else if(args.length < minimum) {
			parser.raise(parser.start, `\`@${this.directive}\` must contain at least ${minimum} argument${minimum !== 1 ? 's' : ''}`)
		} else if(!maximum.isNil && args.length > maximum) {
			parser.raise(parser.start, `\`@${this.directive}\` cannot contain more than ${maximum} argument${maximum !== 1 ? 's' : ''}`)
		}
	}

	// Abstract methods

	static parse(/* parser, node, args */) {
		throw new Error('Subclasses must implement')
	}

}
