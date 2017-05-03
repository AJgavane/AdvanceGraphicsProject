Triangle = function(val) {
	var geometry = new THREE.Geometry();
	geometry.vertices= [new THREE.Vector3(-100, 10,0), 
						new THREE.Vector3(100, 10, 0), 
						new THREE.Vector3(0, 110,0)]; 
	geometry.faces = [new THREE.Face3(1,0,2)];
	this.mesh= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ color: val,  wireframe:false , side: THREE.DoubleSide}) );
	
}

Wall = function(l, b, h) {
	var geometry = new THREE.CubeGeometry(l,b,h);
	this.mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Colors.brown,  wireframe:false }) );
}

Floor = function(l,b) {
	var FloorGeom = new THREE.BoxGeometry(l,b,10,1,1,1);
	FloorGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	var FloorMat = new THREE.MeshPhongMaterial(
		{
			color: Colors.white, 
			shading: THREE.FlatShading,
			// wireframe:true
		}
	);
	this.mesh = new THREE.Mesh(FloorGeom, FloorMat);
	this.mesh.receiveShadow = true;
}

Pyramid = function(val) {
	var pyramidGeom = new THREE.CylinderGeometry(0, 1.5, 1.5, 4, false);
	var pyramidMat = new THREE.MeshLambertMaterial({
		color: 0x303030,
		side: THREE.DoubleSide,
		wireframe: false
	});
	this.mesh = new THREE.Mesh(pyramidGeom, pyramidMat);
}

Sphere = function(rad) {
	var sphereMat = new THREE.MeshLambertMaterial( { color: 0xdddddd, wireframe: showWireFrame } );
	var	sphereGeom = new THREE.SphereGeometry( rad, 16, 8 );
	this.mesh = new THREE.Mesh(sphereGeom, sphereMat);
}