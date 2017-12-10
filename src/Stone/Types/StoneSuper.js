import './StoneYield'

// Due to how sections work, we can cheat by treating as yield
// which will pop off the next chunk of content in the section
// and render it within ours

export class StoneSuper extends StoneYield {

	static directive = 'super'

	/**
	 * Renders content from the section section
	 * @return {string} Code to render the super section
	 */
	static parse(parser, node) {
		const stack = parser._sectionStack

		if(!Array.isArray(stack) || stack.length === 0) {
			parser.raise(parser.start, `\`@${node.directive}\` outside of \`@section\``)
		}

		node.section = { ...stack[stack.length - 1].id }
		return parser.finishNode(node, 'StoneSuper')
	}

}
