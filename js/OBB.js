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
		czz += (9*mui.z*mui.z + p.z*p.z + q.z*q.z + r.z*r.z) * (Ai/12);
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

function OBBFromPoints(mesh) {
	var mu = new THREE.Vector3();
	var C = new THREE.Matrix3();
	var points = mesh.geometry.vertices;
	for(var i = 0; i < points.length; i++){
		mu.add(points[i]);
	}
	mu.divideScalar(points.length);
	var cxx = 0, cyy = 0, czz = 0, cxy = 0, cxz = 0, cyz = 0;
	for(var i = 0; i < points.length; i++){
		var p = points[i];
		cxx += p.x*p.x - mu.x*mu.x;
		cxy += p.x*p.y - mu.x*mu.y;
		cxz += p.x*p.z - mu.x*mu.z;
		cyy += p.y*p.y - mu.y*mu.y;
		cyz += p.y*p.z - mu.y*mu.z;
		czz += p.z*p.z - mu.z*mu.z;
	}
	C.set(	cxx, cxy, cxz, 
			cxy, cyy, cyz,
			cxz, cyz, czz);
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
	return {rotation:rot, position:position, radius:bbRad, max:max, min: min, r:r, u:u, f:f};
}

var obbsT = [];
function recOBBFromPoints(points){
	console.log(points.length);
	if(points.length > 200) {
		var P = getPartitionPoint(points);
		var set1 = generateSet(points, P, 0); // less
		var set2 = generateSet(points, P, 1); // mmore
		obbsT.push(recOBBFromPoints(set1));
		obbsT.push(recOBBFromPoints(set2));
	}
	var mu = new THREE.Vector3();
	var C = new THREE.Matrix3();
	for(var i = 0; i < points.length; i++){
		mu.add(points[i]);
	}
	mu.divideScalar(points.length);
	var cxx = 0, cyy = 0, czz = 0, cxy = 0, cxz = 0, cyz = 0;
	for(var i = 0; i < points.length; i++){
		var p = points[i];
		cxx += p.x*p.x - mu.x*mu.x;
		cxy += p.x*p.y - mu.x*mu.y;
		cxz += p.x*p.z - mu.x*mu.z;
		cyy += p.y*p.y - mu.y*mu.y;
		cyz += p.y*p.z - mu.y*mu.z;
		czz += p.z*p.z - mu.z*mu.z;
	}
	C.set(	cxx, cxy, cxz, 
			cxy, cyy, cyz,
			cxz, cyz, czz);
	 return recBuildFromC(C, points);
}

function getPartitionPoint(points) {
	var mu = new THREE.Vector3();
	for(var i = 0; i < points.length; i++){
		mu.add(points[i]);
	}
	mu.divideScalar(points.length);
	return mu;
}

function generateSet(points, p, val) {
	var set = [];
	for(var i = 0; i < points.length; i++){
		if(val == 0){
			if(points[i].y < p.y){
				set.push(points[i]);
			}
		}
		if(val == 1) {
			if(points[i].y >= p.y){
				set.push(points[i]);
			}
		}
	}
	return set;
}

function recBuildFromC(C, points){

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

	var rot = new THREE.Matrix3();
	rot.set(r.x, u.x, f.x,
			r.y, u.y, f.y,
			r.z, u.z, f.z);
	// building bb
	var min = new THREE.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE );
	var max = new THREE.Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
	
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
	return {rotation:rot, position:position, radius:bbRad, max:max, min: min, r:r, u:u, f:f};
}




function getBoundingBox(obb){
	var p = [];
	var r = new THREE.Vector3(obb.rotation.elements[0], obb.rotation.elements[3], obb.rotation.elements[6]);
	var u = new THREE.Vector3(obb.rotation.elements[1], obb.rotation.elements[4], obb.rotation.elements[7]);
	var f = new THREE.Vector3(obb.rotation.elements[2], obb.rotation.elements[5], obb.rotation.elements[8]);
	var temp = new THREE.Vector3();
	p[0] = new THREE.Vector3();
	p[0].addVectors(p[0],obb.position);
	p[0].addScaledVector(r, -obb.radius.x);
	p[0].addScaledVector(u, -obb.radius.y);
	p[0].addScaledVector(f, -obb.radius.z);

	p[1] = new THREE.Vector3();
	p[1].addVectors(p[1], obb.position);
	p[1].addScaledVector(r, obb.radius.x);
	p[1].addScaledVector(u, -obb.radius.y);
	p[1].addScaledVector(f, -obb.radius.z);

	p[2] = new THREE.Vector3();
	p[2].add(obb.position);
	p[2].addScaledVector(r, obb.radius.x);
	p[2].addScaledVector(u, -obb.radius.y);
	p[2].addScaledVector(f, obb.radius.z);

	p[3] = new THREE.Vector3();
	p[3].add(obb.position);
	p[3].addScaledVector(r, -obb.radius.x);
	p[3].addScaledVector(u, -obb.radius.y);
	p[3].addScaledVector(f, obb.radius.z);

	p[4] = new THREE.Vector3();
	p[4].add(obb.position);
	p[4].addScaledVector(r, -obb.radius.x);
	p[4].addScaledVector(u, obb.radius.y);
	p[4].addScaledVector(f, -obb.radius.z);

	p[5] = new THREE.Vector3();
	p[5].add(obb.position);
	p[5].addScaledVector(r, obb.radius.x);
	p[5].addScaledVector(u, obb.radius.y);
	p[5].addScaledVector(f, -obb.radius.z);

	p[6] = new THREE.Vector3();
	p[6].add(obb.position);
	p[6].addScaledVector(r, obb.radius.x);
	p[6].addScaledVector(u, obb.radius.y);
	p[6].addScaledVector(f, obb.radius.z);

	p[7] = new THREE.Vector3();
	p[7].add(obb.position);
	p[7].addScaledVector(r, -obb.radius.x);
	p[7].addScaledVector(u, obb.radius.y);
	p[7].addScaledVector(f, obb.radius.z);
	
	return p;
}