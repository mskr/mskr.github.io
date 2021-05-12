export default function objectsFromJSON(json) {
	return Object.entries(json).map(pair => pair[1].object);
}