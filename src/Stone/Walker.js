import './Types'

export const Walker = { ...require('acorn/dist/walk').base }

for(const type of Object.values(Types)) {
	type.registerWalk(Walker)
}
