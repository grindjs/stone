import './MockParser'

export class MakeNode {

	constructor(parser = null) {
		this.parser = parser || new MockParser
	}

	identifier(identifier) {
		const node = this.parser.startNode()
		node.name = identifier
		return this.parser.finishNode(node, 'Identifier')
	}

	auto(type) {
		if(typeof type !== 'string') {
			return type
		}

		return this.identifier(type, this.parser)
	}

	new(callee, args) {
		const node = this.parser.startNode()
		node.type = 'NewExpression'
		node.callee = this.auto(callee)
		node.arguments = Array.isArray(args) ? args.map(arg => this.auto(arg)) : [ this.auto(args) ]
		return this.parser.finishNode(node, 'NewExpression')
	}

	object(properties) {
		const node = this.parser.startNode()
		node.type = 'ObjectExpression'
		node.properties = properties || [ ]
		return this.parser.finishNode(node, 'ObjectExpression')
	}

	property(key, value) {
		const node = this.parser.startNode()
		node.key = this.auto(key)

		if(!value.isNil) {
			node.value = this.auto(value)
			node.kind = 'init'
		}

		return this.parser.finishNode(node, 'Property')
	}

	spread(type) {
		const node = this.parser.startNode()
		node.argument = this.auto(type, this.parser)
		return this.parser.finishNode(node, 'SpreadElement')
	}

	assignment(left, right, operator = '=') {
		const node = this.parser.startNode()
		node.operator = operator
		node.left = this.auto(left)
		node.right = this.auto(right)
		return this.parser.finishNode(node, 'AssignmentExpression')
	}

	declaration(left, right, kind = 'const') {
		const declarator = this.parser.startNode()
		declarator.id = this.auto(left)
		declarator.init = this.auto(right)
		this.parser.finishNode(declarator, 'VariableDeclarator')

		const declaration = this.parser.startNode()
		declaration.declarations = [ declarator ]
		declaration.kind = kind
		return this.parser.finishNode(declaration, 'VariableDeclaration')
	}

	literal(value) {
		const node = this.parser.startNode()
		node.value = value
		node.raw = value
		return this.parser.finishNode(node, 'Literal')
	}

	return(value) {
		const node = this.parser.startNode()

		if(!value.isNil) {
			node.argument = this.auto(value)
		}

		return this.parser.finishNode(node, 'ReturnStatement')
	}

	break() {
		return this.parser.finishNode(this.parser.startNode(), 'BreakStatement')
	}

	continue() {
		return this.parser.finishNode(this.parser.startNode(), 'ContinueStatement')
	}

	block(statements) {
		const node = this.parser.startNode()
		node.body = statements
		return this.parser.finishNode(node, 'BlockStatement')
	}

	null() {
		const node = this.parser.startNode()
		node.type = 'Literal'
		node.value = null
		node.raw = 'null'
		return this.parser.finishNode(node, 'Literal')
	}

	empty() {
		return this.parser.finishNode(this.parser.startNode(), 'StoneEmptyExpression')
	}

}

export const make = new MakeNode
