export const directive = 'super'

/**
 * Alias of compileSuper for compatibility with Blade
 * @return {string} Code to render the super section
 */
export const parsers = { parseParentDirective: parse }

/**
 * Renders content from the section section
 * @return {string} Code to render the super section
 */
export function parse(node) {
	if(!this._currentSection || this._currentSection.length === 0) {
		this.raise(this.start, `\`@${node.directive}\` outside of \`@section\``)
	}

	node.section = { ...this._currentSection[this._currentSection.length - 1].id }
	return this.finishNode(node, 'StoneSuper')
}

// Due to how sections work, we can cheat by treating as yield
// which will pop off the next chunk of content in the section
// and render it within ours
export { generate, walk, scope } from './StoneYield'
