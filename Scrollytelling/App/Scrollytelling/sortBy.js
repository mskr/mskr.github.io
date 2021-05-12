//

export default function sortByName(a, b) {
	if (a.name) {
		return a.name.localeCompare(b.name);
	}
	if (a[0]) {
		return a[0].localeCompare(b[0]);
	}
	return a.localeCompare(b);
}