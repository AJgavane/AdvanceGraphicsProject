function OBBFromTriangle(mesh) {
	var Ai, Am = 0;
	var mu = new THREE.Vector3();
	var mui = new THREE.Vector3();
	var C = new THREE.Matrix3();
	var cxx = 0, cyy = 0, czz = 0, cxy = 0, cxz = 0, cyz = 0;
	for(var tri = 0; tri < mesh.geometry.faces.length; tri++) {
		var pFace = mesh.geometry.faces[tri];
		var p = mesh.geometry.vertices[pFace.a];
		var q = mesh.geometry.vertices[pFace.b];
		var r = mesh.geometry.vertices[pFace.c];
		mui.addVectors(p,q);
		mui.addVectors(mui,r)
		mui.divideScalar(3);
		var qminusp = new THREE.Vector3();
		var rminusp = new THREE.Vector3();
		qminusp.subVectors(q,p);
		rminusp.subVectors(r,p);
		
		qminusp.crossVectors(qminusp, rminusp);
		// qminusp.normalize();
		Ai = qminusp.length()/2;
		mu.addScaledVector(mui, Ai);
		Am += Ai;

		cxx += (9*mui.x*mui.x + p.x*p.x + q.x*q.x + r.x*r.x) * (Ai/12);
		cxy += (9*mui.x*mui.y + p.x*p.y + q.x*q.y + r.x*r.y) * (Ai/12);
		cxz += (9*mui.x*mui.z + p.x*p.z + q.x*q.z + r.x*r.z) * (Ai/12);
		cyy += (9*mui.y*mui.y + p.y*p.y + q.y*q.y + r.y*r.y) * (Ai/12);
		cyz += (9*mui.y*mui.z + p.y*p.z + q.y*q.z + r.y*r.z) * (Ai/12);
		cxx += (9*mui.z*mui.z + p.z*p.z + q.z*q.z + r.z*r.z) * (Ai/12);
		// console.log(cxx + " " + cxy + " " + cxz + " " + cyy + " " + cyz + " " + czz);
	}

	mu.divideScalar(Am);
	cxx /= Am; cxy /= Am; cxz /= Am; cyy /= Am; cyz /= Am; czz /= Am;

	cxx -= mu.x*mu.x; cxy -= mu.x*mu.y; cxz -= mu.x*mu.z;
	cyy -= mu.y*mu.y; cyz -= mu.y*mu.z; czz -= mu.z*mu.z;

	C.set(	cxx, cxy, cxz, 
			cxy, cyy, cyz,
			cxz, cyz, czz);
	// console.log(cxx + " " + cxy + " " + cxz + " " + cyy + " " + cyz + " " + czz);
	// console.log(C);
	 return buildFromC(C, mesh);
}

function buildFromC(C, mesh){
	var eigenVector = new THREE.Matrix3();
	var temp = [[C.elements[0], C.elements[1], C.elements[2]], 
				[C.elements[3], C.elements[4], C.elements[5]],
				[C.elements[6], C.elements[7], C.elements[8]]];
	// console.log(temp);
	var eig = numeric.eig(temp);
	var r = new THREE.Vector3(eig.E.x[0][0], eig.E.x[0][1], eig.E.x[0][2]);
	var u = new THREE.Vector3(eig.E.x[1][0], eig.E.x[1][1], eig.E.x[1][2]);
	var f = new THREE.Vector3(eig.E.x[2][0], eig.E.x[2][1], eig.E.x[2][2]);
	r.normalize(); u.normalize(); f.normalize();
	// console.log(r);
	// console.log(u);
	// console.log(f);

	var rot = new THREE.Matrix3();
	rot.set(r.x, u.x, f.x,
			r.y, u.y, f.y,
			r.z, u.z, f.z);
	// building bb
	var min = new THREE.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE );
	var max = new THREE.Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
	var points = mesh.geometry.vertices;
	for(var p =0; p < points.length; p++){
		var point = new THREE.Vector3( r.dot(points[p]), u.dot(points[p]), f.dot(points[p]));
		if(point.x < min.x)
			min.setX(point.x);
		if(point.y < min.y)
			min.setY(point.y);
		if(point.z < min.z)
			min.setZ(point.z);

		if(point.x > max.x)
			max.setX(point.x);
		if(point.y > max.y)
			max.setY(point.y);
		if(point.z > max.z)
			max.setZ(point.z);
	}
	var center = new THREE.Vector3();
	center.addVectors(min,max);
	center.divideScalar(2);
	var position = new THREE.Vector3();
	position.set(
			center.x*rot.elements[0] + center.y*rot.elements[1] + center.z*rot.elements[2],
			center.x*rot.elements[3] + center.y*rot.elements[4] + center.z*rot.elements[5],
			center.x*rot.elements[6] + center.y*rot.elements[7] + center.z*rot.elements[8]
		);
	var bbRad = new THREE.Vector3();
	bbRad.subVectors(max, min);
	bbRad.divideScalar(2);
	// console.log(min);
	// console.log(max);
	// console.log(position);
	// I have rot, position, bbRad for OBB
	return {rotation: rot, position:position, radius:bbRad};
}