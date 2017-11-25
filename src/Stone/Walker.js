import './Types'

export const Walker = { ...require('acorn/dist/walk').base }

for(const key of Object.keys(Types)) {
	Walker[key] = Types[key].walk.bind(Walker)
}
