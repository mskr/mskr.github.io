import * as THREE from '../../components/three/build/three.module.js';

// Based on /three/src/extras/curves/CatmullRomCurve3.js
// Alternative could be /three/examples/jsm/curves/NURBSCurve.js

class MyCurve3 extends THREE.CatmullRomCurve3 {

	constructor( points = [], closed = false, curveType = 'centripetal', tension = 0.5 ) {

		super(points, closed, curveType, tension);

		this.subCurves = points.map((point, i) => new THREE.CatmullRomCurve3(
			[points[0]].concat(points).concat([points[points.length - 1]]).slice(0, i + 2)));

		this.u = this.subCurves.map(c => c.getLength() / this.getLength());

		console.log('MyCurve3', this.u.map(u => u.toFixed(2)));

		this.data = {};

	}

	getU(i) {
		if (i < 0) return 0;
		return this.u[i];
	}

	getPrevIndexByU(u) {
		for (let i = 1; i < this.points.length; i++) {
			const currentU = this.getU(i);
			if (currentU > u) {
				return i - 1;
			}
		}
		return this.points.length - 1;
	}

	getNextIndexByU(u) {
		for (let i = 0; i < this.points.length; i++) {
			const currentU = this.getU(i);
			if (currentU > u) {
				return i;
			}
		}
		return this.points.length - 1;
	}

	getNearestIndexByU(u) {
		let lastU = Infinity;
		for (let i = 0; i < this.points.length; i++) {
			const currentU = this.getU(i);
			if (currentU > u) {
				if (Math.abs(currentU - u) < Math.abs(lastU - u)) {
					return i;
				} else {
					return i - 1;
				}
			}
			lastU = currentU;
		}
		return this.points.length - 1;
	}

	setData(name, values) {
		console.assert(values.length == this.points.length);
		this.data[name] = values;
	}

	getDataAt(name, u) {
		const values = this.data[name];
		const t = this.getUtoTmapping( u );
		//TODO implement getData(values, t) analog to
		// CatmullRomCurve3.js@getPoint
	}
}

export default MyCurve3;

class TestMyCurve3 {

	constructor() {
		this.myCurve3 = new MyCurve3([
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0),
			new THREE.Vector3(2,0,0)
		]);
	}

	testGetU() {
		expect(this.myCurve3.getU(0)).toBe(0);
		expect(this.myCurve3.getU(1)).toBe(0.5);
		expect(this.myCurve3.getU(2)).toBe(1);
	}
}