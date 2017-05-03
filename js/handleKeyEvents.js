function handleKey(event) {
	var keyCode = event.which;

	if(keyCode == 87){
		pyramid.mesh.position.z += 5;
		// update(triangle);		
	}
	if(keyCode == 83	){
		pyramid.mesh.position.z -= 5;
		
	}
	if(keyCode == 65){
		pyramid.mesh.position.x += 5;
		
	}
	if(keyCode == 68){
		pyramid.mesh.position.x -= 5;
		
	}
	if(keyCode == 81){
		pyramid.mesh.position.y += 5;
		
	}
	if(keyCode == 69){
		pyramid.mesh.position.y -= 5;
		
	}
	if(keyCode == 67) {
		// console.log("rotate");
		pyramid.mesh.rotateY(-0.05);
	}
	if(keyCode == 70){
		if(showWireFrame ){
			showWireFrame = false;
		} else {
			showWireFrame =  true;
		}		
	}
	// i
	if(keyCode == 73){
		obstacles[2].mesh.rotation.x += 0.05;
	}
	// k
	if(keyCode == 75){
		obstacles[2].mesh.rotation.x -= 0.05;
	}
	//j
	if(keyCode == 74){
		obstacles[2].mesh.rotation.y -= 0.05;
	}
	// l
	if(keyCode == 76){
		obstacles[2].mesh.rotation.y += 0.05;
	}
}
