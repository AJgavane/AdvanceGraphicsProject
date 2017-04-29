var v1 = new THREE.Vector3();
var v2 = new THREE.Vector3();
var N1 = new THREE.Vector3();
var N2 = new THREE.Vector3();
// Triangle - triangle overlap test
function triangle_triangle_overlap(p1, q1, r1, p2, q2, r2) {
	// console.log(p1 + " " + q1 + " " + r1);
	var dp1, dq1, dr1, dp2, dq2, dr2;
	// var v1 = new THREE.Vector3();
	// var v2 = new THREE.Vector3();
	// var N1 = new THREE.Vector3();
	// var N2 = new THREE.Vector3();

	// compute normal of tri 2
	v1.subVectors(p2, r2);
	v2.subVectors(q2, r2)
	N2.crossVectors(v1,v2);
	// console.log(N2);
	// Trivial reject
	v1.subVectors(p1,r2);
	dp1 = v1.dot(N2);
	v1.subVectors(q1,r2);
	dq1 = v1.dot(N2);
	v1.subVectors(r1,r2);
	dr1 = v1.dot(N2);
	// console.log(v1);
	// console.log(dp1 + " " + dq1 + " " + dr1);
	if( (dp1*dq1) > 0  && (dp1*dr1)>0 ) 
		return 0;

	// compute normal of tri 1
	v1.subVectors(q1, p1);
	v2.subVectors(r1, p1)
	N1.crossVectors(v1,v2);
	// console.log(N1);
	// Trivial reject
	v1.subVectors(p2,r1);
	dp2 = v1.dot(N1);
	v1.subVectors(q2,r1);
	dq2 = v1.dot(N1);
	v1.subVectors(r2,r1);
	dr2 = v1.dot(N1);
	// console.log(v1);
	// console.log(dp2 + " " + dq2 + " " + dr2);
	// uncomment the below line later
	// coplanar_tri_tri3d(p1,q1,r1,p2,q2,r2,N1,N2)
	if( (dp2*dq2) > 0  && (dp2*dr2)>0 ) 
		return 0;
	// permutations of t1 vertices
	// console.log("doing permutations!");
	if (dp1 > 0.0) {
	    if (dq1 > 0.0) 
	    	return TRI_TRI_3D(r1,p1,q1,p2,r2,q2,dp2,dr2,dq2);
	    else if (dr1 > 0.0) 
	    	return TRI_TRI_3D(q1,r1,p1,p2,r2,q2,dp2,dr2,dq2);
	    else 
	    	return TRI_TRI_3D(p1,q1,r1,p2,q2,r2,dp2,dq2,dr2);
	} else if (dp1 < 0.0) {
	    if (dq1 < 0.0) 
	    	return TRI_TRI_3D(r1,p1,q1,p2,q2,r2,dp2,dq2,dr2);
	    else if (dr1 < 0.0) 
	    	return TRI_TRI_3D(q1,r1,p1,p2,q2,r2,dp2,dq2,dr2);
	    else 
	    	return TRI_TRI_3D(p1,q1,r1,p2,r2,q2,dp2,dr2,dq2);
	} else {
	    if (dq1 < 0.0) {
	     	if (dr1 >= 0.0) 
	     		return TRI_TRI_3D(q1,r1,p1,p2,r2,q2,dp2,dr2,dq2);
	      	else 
	      		return TRI_TRI_3D(p1,q1,r1,p2,q2,r2,dp2,dq2,dr2);
		} else if (dq1 > 0.0) {
		    if (dr1 > 0.0) 
		    	return TRI_TRI_3D(p1,q1,r1,p2,r2,q2,dp2,dr2,dq2);
		    else 
		    	return TRI_TRI_3D(q1,r1,p1,p2,q2,r2,dp2,dq2,dr2);
		} else  {
		    if (dr1 > 0.0) 
		    	return TRI_TRI_3D(r1,p1,q1,p2,q2,r2,dp2,dq2,dr2);
		    else if (dr1 < 0.0) 
		    	return TRI_TRI_3D(r1,p1,q1,p2,r2,q2,dp2,dr2,dq2);
		    else 
		    	return coplanar_tri_tri3d(p1,q1,r1,p2,q2,r2,N1,N2);
		}
	}

	// return 123;
}

function TRI_TRI_3D(p1,q1,r1,p2,q2,r2,dp2,dq2,dr2) {
	// console.log("doing TRI_TRI_3D!");
	if (dp2 > 0.0) { 
		if (dq2 > 0.0) 
			return CHECK_MIN_MAX(p1,r1,q1,r2,p2,q2); 
		else if (dr2 > 0.0) 
			return CHECK_MIN_MAX(p1,r1,q1,q2,r2,p2);	
		else 
			return CHECK_MIN_MAX(p1,q1,r1,p2,q2,r2);
	} else if (dp2 < 0.0) { 
		if (dq2 < 0.0) 
			return CHECK_MIN_MAX(p1,q1,r1,r2,p2,q2);
		else if (dr2 < 0.0) 
			return CHECK_MIN_MAX(p1,q1,r1,q2,r2,p2);
		else 
			return CHECK_MIN_MAX(p1,r1,q1,p2,q2,r2);
	} else { 
		if (dq2 < 0.0) { 
			if (dr2 >= 0.0)  
				return CHECK_MIN_MAX(p1,r1,q1,q2,r2,p2);
			else 
				return CHECK_MIN_MAX(p1,q1,r1,p2,q2,r2);
		} else if (dq2 > 0.0) { 
			if (dr2 > 0.0) 
				return CHECK_MIN_MAX(p1,r1,q1,p2,q2,r2);
			else  
				return CHECK_MIN_MAX(p1,q1,r1,q2,r2,p2);
		} else  { 
			if (dr2 > 0.0) 
				return CHECK_MIN_MAX(p1,q1,r1,r2,p2,q2);
			else if (dr2 < 0.0) 
				return CHECK_MIN_MAX(p1,r1,q1,r2,p2,q2);
			else 
				return coplanar_tri_tri3d(p1,q1,r1,p2,q2,r2,N1,N2);
		}
	}
}

function CHECK_MIN_MAX(p1,q1,r1,p2,q2,r2){
	// console.log("doing CHECK_MIN_MAX!");
	v1.subVectors(p2,q1);;
	v2.subVectors(p1,q1);
	N1.crossVectors(v1,v2);
	v1.subVectors(q2,q1);
	// console.log("   " + v1.dot(N1));
	if(v1.dot(N1) > 0)
		return 0;
	v1.subVectors(p2,p1);
	v2.subVectors(r1,p1);
	N1.crossVectors(v1,v2);
	v1.subVectors(r2,p1);
	// console.log("   " + v1.dot(N1));
	if(v1.dot(N1) > 0)
		return 0;
	else 
		return 1;
}

function coplanar_tri_tri3d(p1,q1,r1,p2,q2,r2,normal_1,normal_2) {
	// console.log("coplanar_tri_tri3d");
	var P1 = new THREE.Vector2();
	var Q1 = new THREE.Vector2();
	var R1 = new THREE.Vector2();
	var P2 = new THREE.Vector2();
	var Q2 = new THREE.Vector2();
	var R2 = new THREE.Vector2();
	// var n_x, n_y, n_z;
	// console.log(normal_1);
	n_x = ((normal_1.x<0)?-normal_1.x:normal_1.x);
	n_y = ((normal_1.y<0)?-normal_1.y:normal_1.y);
	n_z = ((normal_1.z<0)?-normal_1.z:normal_1.z);
	// console.log(n_x + " " + n_y + " "  + n_z);
	// console.log("here");
	// return;
	if (( n_x > n_z ) && ( n_x >= n_y )) {
	// Project onto plane YZ

		P1.x = q1.z; P1.y = q1.y;
		Q1.x = p1.z; Q1.y = p1.y;
		R1.x = r1.z; R1.y = r1.y; 

		P2.x = q2.z; P2.y = q2.y;
		Q2.x = p2.z; Q2.y = p2.y;
		R2.x = r2.z; R2.y = r2.y; 

	} else if (( n_y > n_z ) && ( n_y >= n_x )) {
	// Project onto plane XZ

		P1.x = q1.x; P1.y = q1.z;
		Q1.x = p1.x; Q1.y = p1.z;
		R1.x = r1.x; R1.y = r1.z; 

		P2.x = q2.x; P2.y = q2.z;
		Q2.x = p2.x; Q2.y = p2.z;
		R2.x = r2.x; R2.y = r2.z; 

	} else {
	// Project onto plane XY

		P1.x = p1.x; P1.y = p1.y; 
		Q1.x = q1.x; Q1.y = q1.y; 
		R1.x = r1.x; R1.y = r1.y; 

		P2.x = p2.x; P2.y = p2.y; 
		Q2.x = q2.x; Q2.y = q2.y; 
		R2.x = r2.x; R2.y = r2.y; 
	}

	return tri_tri_overlap_test_2d(P1,Q1,R1,P2,Q2,R2);
}

function tri_tri_overlap_test_2d(p1, q1, r1, p2, q2, r2) {
	// console.log("tri_tri_overlap_test_2d!")
	if ( ORIENT_2D(p1,q1,r1) < 0.0 )
	    if ( ORIENT_2D(p2,q2,r2) < 0.0)
	      	return ccw_tri_tri_intersection_2d(p1,r1,q1,p2,r2,q2);
	    else
	     	return ccw_tri_tri_intersection_2d(p1,r1,q1,p2,q2,r2);
 	else
	    if ( ORIENT_2D(p2,q2,r2) < 0.0 )
	      	return ccw_tri_tri_intersection_2d(p1,q1,r1,p2,r2,q2);
	    else
	      	return ccw_tri_tri_intersection_2d(p1,q1,r1,p2,q2,r2);
}

function  ORIENT_2D(a, b, c) {
	return (a.x-c.x)*(b.y-c.y)-(a.y-c.y)*(b.x-c.x)
}

function ccw_tri_tri_intersection_2d(p1, q1, r1, p2, q2, r2) {
	// console.log("ccw_tri_tri_intersection_2d!");
	if ( ORIENT_2D(p2,q2,p1) >= 0.0 ) {
		if ( ORIENT_2D(q2,r2,p1) >= 0.0 ) {
			if ( ORIENT_2D(r2,p2,p1) >= 0.0 ) 
				return 1;
			else 
				return INTERSECTION_TEST_EDGE(p1,q1,r1,p2,q2,r2);
		} else {  
			if ( ORIENT_2D(r2,p2,p1) >= 0.0 ) 
				return INTERSECTION_TEST_EDGE(p1,q1,r1,r2,p2,q2);
			else 
				return INTERSECTION_TEST_VERTEX(p1,q1,r1,p2,q2,r2);
		}
	} else {
		if ( ORIENT_2D(q2,r2,p1) >= 0.0 ) {
			if ( ORIENT_2D(r2,p2,p1) >= 0.0 ) 
				return INTERSECTION_TEST_EDGE(p1,q1,r1,q2,r2,p2);
			else  
				return INTERSECTION_TEST_VERTEX(p1,q1,r1,q2,r2,p2);
		}
		else 
			return INTERSECTION_TEST_VERTEX(p1,q1,r1,r2,p2,q2);
	}
}

function INTERSECTION_TEST_VERTEX(P1, Q1, R1, P2, Q2, R2) {
	if (ORIENT_2D(R2,P2,Q1) >= 0.0)
    	if (ORIENT_2D(R2,Q2,Q1) <= 0.0)
      		if (ORIENT_2D(P1,P2,Q1) > 0.0) {
  				if (ORIENT_2D(P1,Q2,Q1) <= 0.0) 
  					return 1; 
 				else 
 					return 0;
 			} else {
  				if (ORIENT_2D(P1,P2,R1) >= 0.0)
   				 	if (ORIENT_2D(Q1,R1,P2) >= 0.0) 
   				 		return 1; 
  				  	else 
  				  		return 0;
  				else 
  					return 0;
  			}
    	else 
     		if (ORIENT_2D(P1,Q2,Q1) <= 0.0)
  				if (ORIENT_2D(R2,Q2,R1) <= 0.0)
    				if (ORIENT_2D(Q1,R1,Q2) >= 0.0) 
    					return 1; 
    				else 
    					return 0;
  				else 
  					return 0;
      		else 
      			return 0;
	else
    	if (ORIENT_2D(R2,P2,R1) >= 0.0) 
      		if (ORIENT_2D(Q1,R1,R2) >= 0.0)
 				if (ORIENT_2D(P1,P2,R1) >= 0.0) 
 					return 1;
  				else 
  					return 0;
     		else 
  				if (ORIENT_2D(Q1,R1,Q2) >= 0.0) {
    				if (ORIENT_2D(R2,R1,Q2) >= 0.0) 
    					return 1; 
   					else
   						return 0; 
   				} else 
   					return 0; 
    	else  
    		return 0; 
}

function INTERSECTION_TEST_EDGE(P1, Q1, R1, P2, Q2, R2) {
	if (ORIENT_2D(R2,P2,Q1) >= 0.0) {
    	if (ORIENT_2D(P1,P2,Q1) >= 0.0) { 
        	if (ORIENT_2D(P1,Q1,R2) >= 0.0) 
        		return 1; 
        	else 
        		return 0;
        } else { 
      		if (ORIENT_2D(Q1,R1,P2) >= 0.0){ 
  				if (ORIENT_2D(R1,P1,P2) >= 0.0) 
  					return 1; 
  				else 
  					return 0;
  			} 
      		else 
      			return 0;
      	} 
	} else {
		if (ORIENT_2D(R2,P2,R1) >= 0.0) {
		  	if (ORIENT_2D(P1,P2,R1) >= 0.0) {
				if (ORIENT_2D(P1,R1,R2) >= 0.0) 
					return 1;  
				else {
					if (ORIENT_2D(Q1,R1,R2) >= 0.0) 
						return 1; 
					else 
						return 0;
				}
			}
		  	else  
		  		return 0; 
		}	
		else return 0; 
	}
}