// just an interface for type safety.
export interface Station {
	name: string,
	pos: {
		lat: number,
		lng: number
	},
	availPorts: number,
	totalPorts: number
};