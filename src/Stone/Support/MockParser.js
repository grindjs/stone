const { Node } = require('acorn')

export class MockParser {

	options = { }

	startNode() {
		return new Node(this)
	}

	startNodeAt(pos, loc) {
		return new Node(this, pos, loc)
	}

	finishNode(node, type) {
		return this.finishNodeAt(node, type)
	}

	finishNodeAt(node, type, pos) {
		node.type = type

		if(!pos.isNil) {
			node.end = pos
		}

		return node
	}

}
