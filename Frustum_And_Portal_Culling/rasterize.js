/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_URL = "https://ncsucg4games.github.io/prog2/"; // location of input files
const INPUT_TRIANGLES_URL = INPUT_URL + "triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = INPUT_URL + "spheres.json"; // spheres file loc
const INPUT_ROOM_URL = INPUT_URL + "rooms.json";

var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(0.5,0.5,0.0); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
var fov = 0.5*Math.PI;

/* input model data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var triSetSizes = []; // this contains the size of each triangle set
var inputSpheres = []; // the sphere data as loaded from input files
var numSpheres = 0; // how many spheres in the input scene

/* model data prepared for webgl */
var vertexBuffers = []; // vertex coordinate lists by set, in triples
var normalBuffers = []; // normal component lists by set, in triples
var uvBuffers = []; // uv coord lists by set, in duples
var triangleBuffers = []; // indices into vertexBuffers by set, in triples
var textures = []; // texture imagery by set

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var vNormAttribLoc; // where to put normal for vertex shader
var vUVAttribLoc; // where to put UV for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var usingTextureULoc; // where to put using texture boolean for fragment shader
var textureULoc; // where to put texture for fragment shader

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var viewDelta = 0; // how much to displace view with each key press

/*My variables*/
var zNear = 0.1;
var zFar = 10;
var numOfTriangles =0;
var trianglesInASphere = 0;
var inputRoom = [];
var wallLength = 0;
var wallBredth = 0;
var wallHeight = 1;
var deltaBre = 0;
var deltaLen = 0;
var wallTexture = "rocktile.jpg";
var ceilingTexture = "sky.jpg";
var floorTexture = "glass.gif";
var wall = 0;
var numOfRooms;
var roomLights = [];
var portals = [];
var frametime = [];
var roomDimensions = [];
var frame =0;
var t1,t2;
var triSetOffset = 0;
var sphereSetOffset = 0;
var frustumPlanes = [];
var adjacencyGraph = [[],[]];
var culling = true;
var triRenderred = 0;
var sphereValue = 32;



// multiple lights
var mlightAmbient = [];
var mlightSpecular = [];
var mlightDiffuse = [];
var mlightPosition = [];


// ASSIGNMENT HELPER FUNCTIONS
function setWallParameters(){
    var widthOfNearPlane;
    var widthOfFarPlane;
    inputRoom = getJSONFile(INPUT_ROOM_URL, "room");
    // inputRoom = {
    //             "rooms": [["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"],
    //                       ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
    //                       ["s",  0,   0,   0,   0,   0,  "p",  1,   1,   1,   1,   1,  "s"],
    //                       ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
    //                       ["s",  0,   0,   0,   0,   0,  "p",  1,   1,   1,   1,   1,  "s"],
    //                       ["s",  0,   0,   0,   0,   0,  "s",  1,   1,   1,   1,   1,  "s"],
    //                       ["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"]],
    //                       // ["s", "s", "p", "p", "s", "s", "s", "s", "s", "p", "s", "s", "s"],
    //                       // ["s",  2,   2,   2,   2,   2,  "s",  3,   3,   3,   3,   3,  "s"],
    //                       // ["s",  2,   2,   2,   2,   2,  "p",  3,   3,   3,   3,   3,  "s"],
    //                       // ["s",  2,   2,   2,   2,   2,  "s",  3,   3,   3,   3,   3,  "s"],
    //                       // ["s",  2,   2,   2,   2,   2,  "p",  3,   3,   3,   3,   3,  "s"],
    //                       // ["s",  2,   2,   2,   2,   2,  "s",  3,   3,   3,   3,   3,  "s"],
    //                       // ["s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s", "s"]],
    //             "furniture": [[0,0,4,"sphere",0],[1,4,4,"triangleset",0],[1,1,4,"sphere",1]]
    //         };

        
    // console.log(inputRoom.rooms.length);
    wallLength = zFar/(inputRoom.rooms[0].length)/2;
    wallBredth = zFar/(inputRoom.rooms.length)/2;
    deltaBre = wallBredth*7/2-0.5;
    deltaLen = wallLength + 0.5;


    numOfRooms = getNumberOfRooms();  // portals are calculated in this function
    setRoomLights(numOfRooms);
    lightPosition = vec3.fromValues(roomLights[0].x,roomLights[0].y,roomLights[0].z);

    
    // mlightAmbient.push(lightAmbient); // default light ambient emission
    // mlightDiffuse.push(lightDiffuse) // default light diffuse emission
    // mlightSpecular.push(lightSpecular) // default light specular emission
    // mlightPosition.push(lightPosition);// default light position
    // console.log(mlightPosition);
    getFrustumPlanes();

    // console.log(wallLength + " " + wallBredth + " " + numOfRooms);
    for(var i = 0; i < numOfRooms; i++) {
        adjacencyGraph.push([]);
    }
    getAdjacencyGraph(numOfRooms);   
    
    // console.log("portals: ");   
    // console.log(portals);
}

function getAdjacencyGraph(numOfRooms) {

    roomLen = inputRoom.rooms[0].length; // along z
    roomBre = inputRoom.rooms.length;   // along x
    var portal = 0;
    for (var l = 0 ; l < roomLen; l++){
        for(var b = 0; b < roomBre; b++){
            if( inputRoom.rooms[b][l] == "p"){
                // console.log(b + " " + l);
                if(Number.isInteger(inputRoom.rooms[b+1][l]) && Number.isInteger(inputRoom.rooms[b-1][l])){
                    // console.log(inputRoom.rooms[b+1][l] + " " + inputRoom.rooms[b-1][l]);
                    adjacencyGraph[inputRoom.rooms[b+1][l]].push([inputRoom.rooms[b-1][l],portal]);
                    adjacencyGraph[inputRoom.rooms[b-1][l]].push([inputRoom.rooms[b+1][l],portal]);
                    // adjacencyGraph.push([inputRoom.rooms[b+1][l], inputRoom.rooms[b-1][l], portal]);
                    // adjacencyGraph.push([inputRoom.rooms[b-1][l], inputRoom.rooms[b+1][l], portal]);
                    portal++;
                } else if (Number.isInteger(inputRoom.rooms[b][l+1]) && Number.isInteger(inputRoom.rooms[b][l-1])){
                     adjacencyGraph[inputRoom.rooms[b][l+1]].push([inputRoom.rooms[b][l-1],portal]);
                     adjacencyGraph[inputRoom.rooms[b][l-1]].push([inputRoom.rooms[b][l+1],portal]);
                    // adjacencyGraph.push([inputRoom.rooms[b][l+1], inputRoom.rooms[b][l-1], portal]);  
                    // adjacencyGraph.push([inputRoom.rooms[b][l-1], inputRoom.rooms[b][l+1], portal]);    
                    portal++;
                }
            }
            
            // get portals along with it
        }
    }
    // console.log(adjacencyGraph);
}

function getFrustumPlanes() {
    // var p = vec3.clone(Eye);s
    var tandTheta = Math.tan(fov/2);
    // console.log(tandTheta);
    var Z = vec3.fromValues(0,0,0);
    vec3.sub(Z,Eye, Center);
    vec3.normalize(Z,Z);
    var X = vec3.fromValues(0,0,0);
    vec3.cross(X, Up, Z);
    vec3.normalize(X,X);
    var Y = vec3.fromValues(0,0,0);
    vec3.cross(Y, Z, X);

    var nearDist = zNear;
    var farDist = zFar;
    var nearH = zNear*tandTheta;
    var farH = zFar *tandTheta;
    var nearW = nearH;
    var farW = farH;
    var temp = vec3.fromValues(0,0,0);
   
    // fc = p + d *farDist
    // ftl,ftr,fbl,fbr
    var fc = vec3.fromValues(0,0,0);
    vec3.add(fc,Eye, vec3.scale(temp,Z,farDist));
    var nc = vec3.fromValues(0,0,0);
    vec3.add(nc,Eye, vec3.scale(temp,Z,nearDist));

    // nc = p + d *nearDist
    //ntl, ntr, nbl , nbr
    var nearNorm = vec3.create();
    vec3.scale(nearNorm,Z,-1);

    var farNorm = Z;

    var topNorm = vec3.create();
    vec3.scaleAndAdd(topNorm, nc, Y, nearH);
    vec3.sub(topNorm,topNorm,Eye);
    vec3.normalize(topNorm,topNorm);
    vec3.cross(topNorm,topNorm,X);
    var topPoint = vec3.create();
    vec3.scaleAndAdd(topPoint, nc, Y, nearH);

    var bottomNorm = vec3.create();
    vec3.scaleAndAdd(bottomNorm, nc, Y, -nearH);
    vec3.sub(bottomNorm,bottomNorm,Eye);
    vec3.normalize(bottomNorm,bottomNorm);
    vec3.cross(bottomNorm,bottomNorm,X);
    var bottomPoint = vec3.create();
    vec3.scaleAndAdd(bottomPoint, nc, Y, -nearH);

    var leftNorm = vec3.create();
    vec3.scaleAndAdd(leftNorm, nc, X, -nearW);
    vec3.sub(leftNorm,leftNorm,Eye);
    vec3.normalize(leftNorm,leftNorm);
    vec3.cross(leftNorm,leftNorm,Y);
    var leftPoint = vec3.create();
    vec3.scaleAndAdd(leftPoint, nc, Y, -nearH);
   
    var rightNorm = vec3.create();
    vec3.scaleAndAdd(rightNorm, nc, X, nearW);
    vec3.sub(rightNorm,rightNorm,Eye);
    vec3.normalize(rightNorm,rightNorm);
    vec3.cross(rightNorm,rightNorm,Y);
    var rightPoint = vec3.create();
    vec3.scaleAndAdd(rightPoint, nc, Y, nearH);


    frustumPlanes = [
        [nearNorm, nc],             //near pane
        [farNorm, fc],              // far plane
        [topNorm, topPoint],        //top plane
        [bottomNorm, bottomPoint],  //bottomplane
        [leftNorm, leftPoint],      // left plane
        [rightNorm, rightPoint]     // right plane
    ]
    // console.log(frustumPlanes);
}

// function to get position of light source in each room
function setRoomLights(numOfRooms){
    for(var r = 0; r < numOfRooms; r++){
        roomLen = inputRoom.rooms[0].length; // along z
        roomBre = inputRoom.rooms.length;   // along x
        roomList = [];
        min_l = 2*roomLen;
        min_b = 2*roomBre;
        max_l = -1;
        max_b = -1;
        for (var l = 0 ; l < roomLen; l++){
            for(var b = 0; b < roomBre; b++) {
                if( Number.isInteger(inputRoom.rooms[b][l]) ) {
                    if( inputRoom.rooms[b][l] == r ){
                        if(l<min_l)
                            min_l = l;
                        if(l>max_l)
                            max_l = l;
                        if(b < min_b)
                            min_b = b;
                        if(b > max_b)
                            max_b = b;
                    }
                }
            }
        }
        var center_b = (min_b+max_b)/2 * wallBredth - deltaBre+0.5;
        var center_l = (min_l+max_l)/2 * wallLength - deltaLen;
        roomDimensions.push({"xmin": min_b, "zmin":min_l, "xmax":max_b, "zmax":max_l});
        roomLights.push(
             {"x": center_b, "y": 0.9, "z": center_l, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]}
            );
        mlightPosition.push(vec3.fromValues(center_b,0.9,center_l));
    }
}

// fucntion to get number of rooms
function getNumberOfRooms(){
    roomLen = inputRoom.rooms[0].length; // along z
    roomBre = inputRoom.rooms.length;   // along x
    roomList = [];
    for (var l = 0 ; l < roomLen; l++){
        for(var b = 0; b < roomBre; b++) {
            if( Number.isInteger(inputRoom.rooms[b][l]) ) {
                if( !roomList.includes(inputRoom.rooms[b][l]) ){
                    roomList.push(inputRoom.rooms[b][l]);
                }
            }
                        // get portals along with it
            if( inputRoom.rooms[b][l] == "p"){
                // console.log("p @: " + b + " " + l);
                portals.push([
                    //Right face
                    [(b+1)*wallBredth-deltaBre, 0, l*wallLength-deltaLen],
                    [(b+1)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],
                    [(b+1)*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],
                    [(b+1)*wallBredth-deltaBre, 1, l*wallLength-deltaLen],
                    //LeftFace
                    [b*wallBredth-deltaBre, 0, l*wallLength-deltaLen],
                    [b*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],
                    [b*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],
                    [b*wallBredth-deltaBre, 1, l*wallLength-deltaLen]
                ]);
            }
        }
    }
    // console.log(portals);
    return roomList.length;
}


// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// does stuff when keys are pressed
function handleKeyDown(event) {
    
    const modelEnum = {TRIANGLES: "triangles", SPHERE: "sphere"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction
    
    function highlightModel(modelType,whichModel) {
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel]; 
        else
            handleKeyDown.modelOn = inputSpheres[whichModel]; 
        handleKeyDown.modelOn.on = true; 
    } // end highlight model
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model

    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {
        
        // model selection
        case "Space": 
            if (handleKeyDown.modelOn != null)
                handleKeyDown.modelOn.on = false; // turn off highlighted model
            handleKeyDown.modelOn = null; // no highlighted model
            handleKeyDown.whichOn = -1; // nothing highlighted
            break;
        case "ArrowRight": // select next triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn+1) % numTriangleSets);
            break;
        case "ArrowLeft": // select previous triangle set
            highlightModel(modelEnum.TRIANGLES,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numTriangleSets-1);
            break;
        case "ArrowUp": // select next sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn+1) % numSpheres);
            break;
        case "ArrowDown": // select previous sphere
            highlightModel(modelEnum.SPHERE,(handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn-1 : numSpheres-1);
            break;
            
        // view change
        case "KeyA": // translate view left, rotate left with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,viewDelta));
            break;
        case "KeyD": // translate view right, rotate right with shift
            Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,-viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,-viewDelta));
            } // end if shift not pressed
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
                Up = vec3.cross(Up,viewRight,vec3.subtract(lookAt,Center,Eye)); /* global side effect */
            } else {
                
                    Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,viewDelta));
                    Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,viewDelta));
                
            } // end if shift not pressed
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-viewDelta));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye,defaultEye);
            Center = vec3.copy(Center,defaultCenter);
            Up = vec3.copy(Up,defaultUp);
            break;
            
        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,viewRight,viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,viewRight,-viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,lookAt,-viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,lookAt,viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift 
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp,Up,viewDelta));
            break;
        case "KeyP": // translate down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt,dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp,Up,-viewDelta));
            break;
        case "Backspace": // reset model transforms to default
            for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
                vec3.set(inputTriangles[whichTriSet].translation,0,0,0);
                vec3.set(inputTriangles[whichTriSet].xAxis,1,0,0);
                vec3.set(inputTriangles[whichTriSet].yAxis,0,1,0);
            } // end for all triangle sets
            for (var whichSphere=0; whichSphere<numSpheres; whichSphere++) {
                vec3.set(inputSpheres[whichSphere].translation,0,0,0);
                vec3.set(inputSpheres[whichSphere].xAxis,1,0,0);
                vec3.set(inputSpheres[whichSphere].yAxis,0,1,0);
            } // end for all spheres
            break;
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed

    // create a webgl canvas and set it up
    var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
    gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL


/* ****************************************************************************************************/
/* ****************************************************************************************************/
/* ****************************************************************************************************/
/* ****************************************************************************************************/
/* ****************************************************************************************************/


// read models in, load them into webgl buffers
function loadModels() {
    
    // load a texture for the current set or sphere
    function loadTexture(whichModel,currModel,textureFile) {
        
        // load a 1x1 gray image into texture for use when no texture, and until texture loads
        textures[whichModel] = gl.createTexture(); // new texture struct for model
        var currTexture = textures[whichModel]; // shorthand
        gl.bindTexture(gl.TEXTURE_2D, currTexture); // activate model's texture
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // invert vertical texcoord v, load gray 1x1
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,new Uint8Array([64, 64, 64, 255]));  
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // invert vertical texcoord v
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // use linear filter for magnification
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // use mipmap for minification
        gl.generateMipmap(gl.TEXTURE_2D); // construct mipmap pyramid
        gl.bindTexture(gl.TEXTURE_2D, null); // deactivate model's texture
        
        // if there is a texture to load, asynchronously load it
        if (textureFile != false) {
            currTexture.image = new Image(); // new image struct for texture
            currTexture.image.onload = function () { // when texture image loaded...
                gl.bindTexture(gl.TEXTURE_2D, currTexture); // activate model's new texture
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, currTexture.image); // norm 2D texture
                gl.generateMipmap(gl.TEXTURE_2D); // rebuild mipmap pyramid
                gl.bindTexture(gl.TEXTURE_2D, null); // deactivate model's new texture
            } // end when texture image loaded
            currTexture.image.onerror = function () { // when texture image load fails...
                console.log("Unable to load texture " + textureFile); 
            } // end when texture image load fails
            currTexture.image.crossOrigin = "Anonymous"; // allow cross origin load, please
            currTexture.image.src = INPUT_URL + textureFile; // set image location
        } // end if material has a texture
    } // end load texture
    
    // make a sphere with radius 1 at the origin, with numLongSteps longitudes. 
    // Returns verts, tris and normals.
    function makeSphere(numLongSteps) {
        
        try {
            if (numLongSteps % 2 != 0)
                throw "in makeSphere: uneven number of longitude steps!";
            else if (numLongSteps < 4)
                throw "in makeSphere: number of longitude steps too small!";
            else { // good number longitude steps
            
                // make vertices, normals and uvs -- repeat longitude seam
                const INVPI = 1/Math.PI, TWOPI = Math.PI+Math.PI, INV2PI = 1/TWOPI, epsilon=0.001*Math.PI;
                var sphereVertices = [0,-1,0]; // vertices to return, init to south pole
                var sphereUvs = [0.5,0]; // uvs to return, bottom texture row collapsed to one texel
                var angleIncr = TWOPI / numLongSteps; // angular increment 
                var latLimitAngle = angleIncr * (Math.floor(numLongSteps*0.25)-1); // start/end lat angle
                var latRadius, latY, latV; // radius, Y and texture V at current latitude
                for (var latAngle=-latLimitAngle; latAngle<=latLimitAngle+epsilon; latAngle+=angleIncr) {
                    latRadius = Math.cos(latAngle); // radius of current latitude
                    latY = Math.sin(latAngle); // height at current latitude
                    latV = latAngle*INVPI + 0.5; // texture v = (latAngle + 0.5*PI) / PI
                    for (var longAngle=0; longAngle<=TWOPI+epsilon; longAngle+=angleIncr) { // for each long
                        sphereVertices.push(-latRadius*Math.sin(longAngle),latY,latRadius*Math.cos(longAngle));
                        sphereUvs.push(longAngle*INV2PI,latV); // texture u = (longAngle/2PI)
                    } // end for each longitude
                } // end for each latitude
                sphereVertices.push(0,1,0); // add north pole
                sphereUvs.push(0.5,1); // top texture row collapsed to one texel
                var sphereNormals = sphereVertices.slice(); // for this sphere, vertices = normals; return these

                // make triangles, first poles then middle latitudes
                var sphereTriangles = []; // triangles to return
                var numVertices = Math.floor(sphereVertices.length/3); // number of vertices in sphere
                for (var whichLong=1; whichLong<=numLongSteps; whichLong++) { // poles
                    sphereTriangles.push(0,whichLong,whichLong+1);
                    sphereTriangles.push(numVertices-1,numVertices-whichLong-1,numVertices-whichLong-2);
                    
                } // end for each long
                var llVertex; // lower left vertex in the current quad
                for (var whichLat=0; whichLat<(numLongSteps/2 - 2); whichLat++) { // middle lats
                    for (var whichLong=0; whichLong<numLongSteps; whichLong++) {
                        llVertex = whichLat*(numLongSteps+1) + whichLong + 1;
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+1,llVertex+numLongSteps+2);
                        sphereTriangles.push(llVertex,llVertex+numLongSteps+2,llVertex+1);
                                            } // end for each longitude
                } // end for each latitude
            } // end if good number longitude steps
            trianglesInASphere = sphereTriangles.length;
            return({vertices:sphereVertices, normals:sphereNormals, uvs:sphereUvs, triangles:sphereTriangles});
        } // end try
        
        catch(e) {
            console.log(e);
        } // end catch
    } // end make sphere
    
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data
    inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres"); // read in the sphere data
    triSetOffset = inputTriangles.length;
    sphereSetOffset = inputSpheres.length;
    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {

            if(inputRoom == String.null) {
                throw "Unable to load rooms file";
            } else {
                var room;
                var furniture = inputRoom.furniture;
                var triSetToAdd = null;
                var sphereToAdd = null;
                // console.log(furniture);
                roomLen = inputRoom.rooms[0].length; // along z
                roomBre = inputRoom.rooms.length;   // along x
                for (var l = 0 ; l < roomLen; l++){
                    for(var b = 0; b < roomBre; b++) {
                        if(inputRoom.rooms[b][l] == 's') {
                            // rightFace
                            inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "rocktile.jpg"}, 
                                    "vertices": [[(b+1)*wallBredth-deltaBre, 0, l*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],
                                                [(b+1)*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre,1,(l)*wallLength-deltaLen]],
                                    "normals": [[1, 0, 0],[1, 0,0],[1, 0,0],[1, 0,0]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    "triangles": [[0,1,2],[0,2,3]]
                                    // "triangles": [[1,3,0],[2,3,1]]
                                }
                            );
                            // left Face
                            inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "rocktile.jpg"}, 
                                    "vertices": [[(b)*wallBredth-deltaBre, 0, l*wallLength-deltaLen],[(b)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],
                                                [(b)*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],[(b)*wallBredth-deltaBre,1,(l)*wallLength-deltaLen]],
                                    "normals": [[-1, 0, 0],[-1, 0,0],[-1, 0,0],[-1, 0,0]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    // "triangles": [[0,3,1],[1,3,2]]
                                    "triangles": [[0,1,2],[0,2,3]]
                                }
                            );
                            // backface
                             inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "rocktile.jpg"}, 
                                    "vertices": [[(b+1)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],[(b)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],
                                                [(b)*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre,1,(l+1)*wallLength-deltaLen]],
                                    "normals": [[ 0, 0, 1],[ 0,0, 1],[0,0, 1],[0,0, 1]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    "triangles": [[0,1,2],[0,2,3]]
                                }
                            );
                             //front face
                            inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "rocktile.jpg"}, 
                                    "vertices": [[(b)*wallBredth-deltaBre, 0, (l)*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre, 0, (l)*wallLength-deltaLen],
                                                [(b+1)*wallBredth-deltaBre, 1, (l)*wallLength-deltaLen],[(b)*wallBredth-deltaBre,1,(l)*wallLength-deltaLen]],
                                    "normals": [[ 0, 0, -1],[ 0,0, -1],[0,0, -1],[0,0, -1]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    "triangles": [[0,1,2],[0,2,3]]
                                }
                            );
                        } // if 's' ends
                        // floor
                        inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "rocktile.jpg"}, 
                                    "vertices": [[b*wallBredth-deltaBre, 0, l*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre, 0, l*wallLength-deltaLen],
                                                [(b+1)*wallBredth-deltaBre, 0, (l+1)*wallLength-deltaLen],[b*wallBredth-deltaBre,0,(l+1)*wallLength-deltaLen]],
                                    "normals": [[0, 1, 0],[0,1,0],[0, 1,0],[0,1,0]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    "triangles": [[0,1,2],[0,2,3]]
                                }
                            );
                         // Ceiling
                         inputTriangles.push(
                                {
                                    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.6,0.6], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 0.9, "texture": "glass.gif"}, 
                                    "vertices":[[b*wallBredth-deltaBre, 1, l*wallLength-deltaLen],[(b+1)*wallBredth-deltaBre, 1, l*wallLength-deltaLen],
                                                [(b+1)*wallBredth-deltaBre, 1, (l+1)*wallLength-deltaLen],[b*wallBredth-deltaBre,1,(l+1)*wallLength-deltaLen]],
                                    "normals": [[0, -1, 0],[0,-1,0],[0, -1,0],[0,-1,0]],
                                    "uvs": [[0,0], [0,1], [1,1], [1,0]],
                                    "triangles": [[0,1,2],[0,2,3]]
                                }
                            );

                        // check for furniture
                        for (var f = 0 ; f < furniture.length; f++) {
                            if( furniture[f][0] == inputRoom.rooms[b][l]) {  // if the room number matches
                                // console.log("xmin "+ b +"," + l );
                                if( (b == roomDimensions[furniture[f][0]].xmin + furniture[f][1]) && l == (roomDimensions[furniture[f][0]].zmin+furniture[f][2])) { // add a furniture
                                    // console.log("here " + f);
                                    if(furniture[f][3] == "triangleset"){
                                        // add triangle at that position
                                        var whichTriSet = furniture[f][4];
                                        triSetToAdd = inputTriangles[whichTriSet];
                                        var temp = triSetToAdd;
                                        inputTriangles.push(temp);
                                        // change the vertices of the triset and push into input triangles
                                        for(var vtx = 0; vtx <triSetToAdd.vertices.length; vtx++){
                                            triSetToAdd.vertices[vtx][0] += (b)*wallBredth-deltaBre;
                                            triSetToAdd.vertices[vtx][2] = (l)*wallLength-deltaLen;
                                        }
                                        inputTriangles.push(triSetToAdd);
                                    }
                                    if(furniture[f][3] == "sphere") {
                                        // console.log("Its a sphere: " + b + " " + l);
                                        var whichSphere = furniture[f][4];
                                        sphereToAdd =  inputSpheres[whichSphere];
                                        sphereToAdd.x += b*wallBredth-deltaBre;
                                        sphereToAdd.z = l*wallLength-deltaLen + wallLength/2;
                                        inputSpheres.push(sphereToAdd);
                                        // console.log(inputSpheres);
                                    }
                                }
                            }
                        }
                    } // for b ends
                } //for l ends              
            }

            var currSet; // the current triangle set
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the vertices array
            var normToAdd; // vtx normal to add to the normal array
            var uvToAdd; // uv coords to add to the uv arry
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                currSet = inputTriangles[whichSet];
                
                // set up hilighting, modeling translation and rotation
                currSet.center = vec3.fromValues(0,0,0);  // center point of tri set
                currSet.on = false; // not highlighted
                currSet.translation = vec3.fromValues(0,0,0); // no translation
                currSet.xAxis = vec3.fromValues(1,0,0); // model X axis
                currSet.yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex, normal and uv arrays, define model center and axes
                currSet.glVertices = []; // flat coord list for webgl
                currSet.glNormals = []; // flat normal list for webgl
                currSet.glUvs = []; // flat texture coord list for webgl
                var numVerts = currSet.vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = currSet.vertices[whichSetVert]; // get vertex to add
                    normToAdd = currSet.normals[whichSetVert]; // get normal to add
                    uvToAdd = currSet.uvs[whichSetVert]; // get uv to add
                    // console.log(currSet.glVertices);
                    currSet.glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set vertex list
                    currSet.glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set normal list
                    currSet.glUvs.push(uvToAdd[0],uvToAdd[1]); // put uv in set uv list
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(currSet.center,currSet.center,vtxToAdd); // add to ctr sum
                    
                } // end for vertices in set
                vec3.scale(currSet.center,currSet.center,1/numVerts); // avg ctr sum

                // send the vertex coords, normals and uvs to webGL; load texture
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glNormals),gl.STATIC_DRAW); // data in
                uvBuffers[whichSet] = gl.createBuffer(); // init empty webgl set uv coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(currSet.glUvs),gl.STATIC_DRAW); // data in
                loadTexture(whichSet,currSet,currSet.material.texture); // load tri set's texture

                // set up the triangle index array, adjusting indices across sets
                currSet.glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = currSet.triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    // console.log(whichSetTri + " " + whichSet);
                    triToAdd = currSet.triangles[whichSetTri]; // get tri to add
                    currSet.glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(currSet.glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set 

            
            if (inputSpheres == String.null)
                throw "Unable to load spheres file!";
            else {
                
                // init sphere highlighting, translation and rotation; update bbox
                var sphere; // current sphere
                var temp = vec3.create(); // an intermediate vec3
                var minXYZ = vec3.create(), maxXYZ = vec3.create();  // min/max xyz from sphere
                numSpheres = inputSpheres.length; // remember how many spheres
                for (var whichSphere=0; whichSphere<numSpheres; whichSphere++) {
                    sphere = inputSpheres[whichSphere];
                    sphere.on = false; // spheres begin without highlight
                    sphere.translation = vec3.fromValues(0,0,0); // spheres begin without translation
                    sphere.xAxis = vec3.fromValues(1,0,0); // sphere X axis
                    sphere.yAxis = vec3.fromValues(0,1,0); // sphere Y axis 
                    sphere.center = vec3.fromValues(0,0,0); // sphere instance is at origin
                    vec3.set(minXYZ,sphere.x-sphere.r,sphere.y-sphere.r,sphere.z-sphere.r); 
                    vec3.set(maxXYZ,sphere.x+sphere.r,sphere.y+sphere.r,sphere.z+sphere.r); 
                    vec3.min(minCorner,minCorner,minXYZ); // update world bbox min corner
                    vec3.max(maxCorner,maxCorner,maxXYZ); // update world bbox max corner
                    loadTexture(numTriangleSets+whichSphere,sphere,sphere.texture); // load the sphere's texture
                } // end for each sphere
                viewDelta = vec3.length(vec3.subtract(temp,maxCorner,minCorner)) / 100; // set global

                // make one sphere instance that will be reused, with 32 longitude steps
                var oneSphere = makeSphere(256);

                // send the sphere vertex coords and normals to webGL
                vertexBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.vertices),gl.STATIC_DRAW); // data in
                normalBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.normals),gl.STATIC_DRAW); // data in
                uvBuffers.push(gl.createBuffer()); // init empty webgl sphere vertex uv buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[uvBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(oneSphere.uvs),gl.STATIC_DRAW); // data in
        
                triSetSizes.push(oneSphere.triangles.length);
                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length-1]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(oneSphere.triangles),gl.STATIC_DRAW); // data in
            } // end if sphere file loaded

        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
    
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aVertexUV; // vertex texture uv
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 vVertexUV; // interpolated uv for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            
            // vertex uv
            vVertexUV = aVertexUV;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        
        // texture properties
        uniform bool uUsingTexture; // if we are using a texture
        uniform sampler2D uTexture; // the texture for the fragment
        varying vec2 vVertexUV; // texture uv of fragment
            
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to find lit color
            vec3 litColor = ambient + diffuse + specular; 
            
            if (!uUsingTexture) {
                gl_FragColor = vec4(litColor, 1.0);
            } else {
                vec4 texColor = texture2D(uTexture, vec2(vVertexUV.s, vVertexUV.t));
            
                // gl_FragColor = vec4(texColor.rgb * litColor, texColor.a);
                gl_FragColor = vec4(texColor.rgb * litColor, 1.0);
            } // end if using texture
        } // end main
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                vUVAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexUV"); // ptr to vertex UV attrib
                gl.enableVertexAttribArray(vUVAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                usingTextureULoc = gl.getUniformLocation(shaderProgram, "uUsingTexture"); // ptr to using texture
                textureULoc = gl.getUniformLocation(shaderProgram, "uTexture"); // ptr to texture
                
                // pass global (not per model) constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

function getPlanePointDistance(plane, point){
    var temp = vec3.create();
    var distance = vec3.dot(plane[0], vec3.sub(temp, point, plane[1]));
    return distance;
}

function isVisible(currSet) {
    // check if triset is visible and within the frustum and return the value
    // console.log(currSet);
    // var bbOfTri = [Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MIN_VALUE]; // [xmin,xmax, zmin,zmax]
    var yOfTri = 0;
    var out, inside;
    for(var p = 0; p < frustumPlanes.length; p++){
        out = 0; inside = 0;
        for(var v = 0; v < currSet.vertices.length; v++){
            // console.log(frustumPlanes.length + " " + currSet.vertices.length);
            if(getPlanePointDistance(frustumPlanes[p], currSet.vertices[v]) < 0){
                // var dist = getPlanePointDistance(frustumPlanes[p], currSet.vertices[v]) 
                // console.log(dist);
                out++;
            }
            else
                inside++;
            // for(var i = 0; i < 3; i++){
            //     yOfTri += currSet.vertices[v][1];
            //     // xmin
            //     if(currSet.vertices[v][0] < bbOfTri[0])
            //         bbOfTri[0] = currSet.vertices[v][0];
            //     // x max
            //     if(currSet.vertices[v][0] > bbOfTri[1])
            //         bbOfTri[1] = currSet.vertices[v][0];
            //     // zmin
            //     if(currSet.vertices[v][2] < bbOfTri[2])
            //         bbOfTri[2] = currSet.vertices[v][2];
            //     // zmax
            //     if(currSet.vertices[v][2] > bbOfTri[3])
            //         bbOfTri[3] = currSet.vertices[v][2];
            // }
        }
        // var centerOfTri = [(bbOfTri[0]+bbOfTri[1])/2, (bbOfTri[2]+bbOfTri[3])/2 ];
            
        // console.log(centerOfTri + " " + Eye);
        // if(yOfTri >0 && yOfTri <3) {
        //     if(centerOfTri[0]-Eye[0]<viewDelta && centerOfTri[1]-Eye[2]<viewDelta )
        //         console.log("collision");
        //         Eye = vec3.sub(Eye,Eye,vec3.scale(temp,lookAt,viewDelta));
        // }
        if(inside == 0)
            return false;
        else
            return true;
    }
    return true;
}

function isSphereVisible(sphere) {
    var out, inside;
    for(var p = 0; p < frustumPlanes.length; p++){
        out = 0; inside = 0;
        var sphereCenter = vec3.fromValues(sphere.x, sphere.y, sphere.z);
       if(getPlanePointDistance(frustumPlanes[p], sphereCenter) < 0){
           return false;
        }
        else //if (getPlanePointDistance(frustumPlanes[p], sphereCenter) < sphere.r)
            return true;
    }
    return true;
}

// get the current room number
function getEyeRoom(){
    var eyeRoom = -1;
    var eyePosition = Eye;
    for(var r = 0; r < numOfRooms; r++){
        if( (eyePosition[0] < roomDimensions[r].xmax*wallBredth-deltaBre ) &&
             (eyePosition[0] > roomDimensions[r].xmin*wallBredth-deltaBre)){
            if ( (eyePosition[2] < roomDimensions[r].zmax*wallLength-deltaLen) && 
                 (eyePosition[2] > roomDimensions[r].zmin*wallLength-deltaLen) ) {
                eyeRoom = r;
            }
        }
    }
    return eyeRoom;
}

function isInSameRoomAsEye(currSet) {
    // find position of eye and currSet if same room then return true
    var eyePosition = Eye;
    // console.log(eyePosition);
    var eyeRoom = -1;
    var objRoom = 0;
    var triangleCenter = [0,0,0];
    for( var v = 0; v < currSet.vertices.length; v++) {
        triangleCenter[0] += currSet.vertices[v][0];
        triangleCenter[1] += currSet.vertices[v][1];
        triangleCenter[2] += currSet.vertices[v][2];
    }
    triangleCenter[0] /= currSet.vertices.length;
    triangleCenter[1] /= currSet.vertices.length;
    triangleCenter[2] /= currSet.vertices.length;
   
    eyeRoom = getEyeRoom();
   
    if(eyeRoom == -1)
        return true;
    if( (triangleCenter[0] < roomDimensions[eyeRoom].xmax*wallBredth ) &&
         (triangleCenter[0] > roomDimensions[eyeRoom].xmin*wallBredth-2*deltaBre)){
        if ( (triangleCenter[2] < roomDimensions[eyeRoom].zmax*wallLength) && 
             (triangleCenter[2] > roomDimensions[eyeRoom].zmin*wallLength-2*deltaLen) ) {
            return true;
        }
    }
   
    return false;
}

function isSphereInSameRoomAsEye(sphere) {
    var eyePosition = Eye;
    var eyeRoom = -1;
    eyeRoom = getEyeRoom();
    if(eyeRoom == -1)
        return true;
    if( (sphere.x < roomDimensions[eyeRoom].xmax*wallBredth ) &&
         (sphere.x > roomDimensions[eyeRoom].xmin*wallBredth-1.2*deltaBre)){
        if ( (sphere.z < roomDimensions[eyeRoom].zmax*wallLength) && 
             (sphere.z > roomDimensions[eyeRoom].zmin*wallLength-1.2*deltaLen) ) {
            return true;
        }
    }
   
    return false;
}

function getDistance(p1,p2){
    var dist = 0;
    dist = (p1[0]-p2[0])*(p1[0]-p2[0]) + (p1[1]-p2[1])*(p1[1]-p2[1]) + (p1[2]-p2[2])*(p1[2]-p2[2]);
    return Math.sqrt(dist);
}

function isPortalVisible(portal){
    var out, inside;
    for(var p = 0; p < frustumPlanes.length; p++){
        out = 0; inside = 0;
        for(var v = 0; v < portal.length; v++){
            if(getPlanePointDistance(frustumPlanes[p], portal[v]) < 0){
                out++;
            }
            else
                inside++;
        }
        if(inside == 0)
            return false;
        else
            return true;
    }
    return true;
}

function getBoundingBox(portal) {
    if(!isPortalVisible(portal)){
        // console.log("nt Vis");
        return null;
    }
    var xmin = portal[0][0];
    var zmin = portal[0][2];
    var xmax = xmin;
    var zmax = zmin;
    for (var v = 0; v < portal.length; v++){
        if(portal[v][0] < xmin)
            xmin = portal[v][0];
        if(portal[v][0] > xmax)
            xmax = portal[v][0];
        if(portal[v][2] < zmin)
            zmin = portal[v][2];
        if(portal[v][2] > xmax)
            zmax = portal[v][2];

    }
 
    var vertMin = [];
    var vertMax = [];
    var minDist = 100000;
    var maxDist = -1;
    var tempDst = 0;
    // console.log(portal.length);
    for (var v = 0; v < portal.length; v++){
        tempDst = getDistance(Eye,portal[v]);
        // console.log(v + " " + tempDst);
        if(minDist >= tempDst){
            // console.log("here");
            minDist = tempDst;
            // console.log(minDist);
            vertMin = portal[v];
        }            
        if(maxDist <= tempDst){
            maxDist = tempDst;
            vertMax = portal[v];
        }
    }
    var boundingBox = [
            [vertMin[0], 0, vertMin[2]],
            [vertMin[0], 1, vertMin[2]],
            [vertMax[0], 1, vertMin[2]],
            [vertMax[0], 0, vertMin[2]]
        ];

    // var boundingBox = [
    //         [xmin, 0, zmin],
    //         [xmin, 1, zmin],
    //         [xmax, 1, zmin],
    //         [xmax, 0, zmin]
    //     ];
    return boundingBox;
}

// Calculate the angle suspended by eye and 2 points
function getAngle(p1,p2) {
    var v1 = vec3.fromValues(p1[0]-Eye[0], p1[1] - Eye[1], p1[2]-Eye[2]);
    var v2 = vec3.fromValues(p2[0]-Eye[0], p2[1] - Eye[1], p2[2]-Eye[2]);
    var angle = vec3.angle(v1,v2);
    return angle;
}

// Caculate the solid angle suspended by the bounding box
function getPortalCenter(bb) {
    var center = [0,0,0];
    var bbLen = bb.length;
    for (var i = 0; i < bbLen; i++){
        center[0] += bb[i][0]/4; 
        center[1] += bb[i][1]/4; 
        center[2] += bb[i][2]/4; 
    }
    // console.log(center);
    return center;
}

function idx(row, col) {
    return (col*4 + row-5);
}

function getPortalFrustum(portal){
    var portalFrustum = [];
    var bBox = getBoundingBox(portal); // will be 4 vertices of a plane
    // console.log(bBox);
    // var bBox = [
    //        portal[1], portal[2], portal[6], portal[5]
    //     ];

    var pm = [];
    // console.log(portal[0][0] + " " + portal[4][0]);
    var left = portal[4];
    var right = portal[0];
    var center = vec3.create();
    vec3.add(center,left,right);
    vec3.scale(center, center, 0.5);
    var temp1 = vec3.create();
    var  temp2 = vec3.create();
    vec3.sub(temp1,center,Eye);
    vec3.sub(temp2,left,center)
    if( vec3.dot(temp1, temp2) > 0){
        left = right;
        right = portal[4];
        // console.log("left: " + left + " rigt: " + right);
    }

    mat4.frustum(pm, left[0], right[0], 0, 1, vec3.length(temp1), 10);

    // extracting planes from frustum;
    var nearNorm = vec3.fromValues(pm[idx(3,1)] + pm[idx(4,1)],
                                   pm[idx(3,2)] + pm[idx(4,2)],
                                   pm[idx(3,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(nearNorm, nearNorm);
    // console.log(nearNorm);
    var farNorm = vec3.fromValues( -pm[idx(3,1)] + pm[idx(4,1)],
                                   -pm[idx(3,2)] + pm[idx(4,2)],
                                   -pm[idx(3,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(farNorm, farNorm);
    // console.log(farNorm);

    var bottomNorm = vec3.fromValues(pm[idx(2,1)] + pm[idx(4,1)],
                                     pm[idx(2,2)] + pm[idx(4,2)],
                                     pm[idx(2,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(bottomNorm, bottomNorm);
    // console.log(bottomNorm);

    var topNorm = vec3.fromValues(  -pm[idx(2,1)] + pm[idx(4,1)],
                                    -pm[idx(2,2)] + pm[idx(4,2)],
                                    -pm[idx(2,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(topNorm, topNorm);
    // console.log(topNorm);

    var leftNorm = vec3.fromValues( pm[idx(1,1)] + pm[idx(4,1)],
                                     pm[idx(1,2)] + pm[idx(4,2)],
                                     pm[idx(1,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(leftNorm, leftNorm);
    // console.log(leftNorm);

    var rightNorm = vec3.fromValues( -pm[idx(1,1)] + pm[idx(4,1)],
                                     -pm[idx(1,2)] + pm[idx(4,2)],
                                     -pm[idx(1,3)] + pm[idx(4,3)]
                                   );
    vec3.normalize(rightNorm, rightNorm);
    // console.log(rightNorm);


    // if(bBox == null)
    //     return null;

    // get portal normal
    // var pNorm = vec3.create();
    // var v1 = vec3.fromValues(bBox[1][0] - bBox[0][0], bBox[1][1] - bBox[0][1], bBox[1][2] - bBox[0][2]);
    // var v2 = vec3.fromValues(bBox[3][0] - bBox[0][0], bBox[3][1] - bBox[0][1], bBox[3][2] - bBox[0][2]);
    // vec3.cross(pNorm, v2, v1);
    // vec3.normalize(pNorm,pNorm);

    // top plane eye, bb[1],bb[2]
    // var topNorm =  vec3.create();
    // vec3.sub(v1, bBox[1], Eye);
    // vec3.sub(v2, bBox[2], Eye);
    // vec3.cross(topNorm, v1, v2);
    // vec3.normalize(topNorm,topNorm);



    // bottom plane eye, bb[0],bb[3]
    // var bottomNorm = vec3.create();
    // vec3.sub(v1, bBox[0], Eye);
    // vec3.sub(v2, bBox[3], Eye);
    // vec3.cross(bottomNorm, v2, v1);
    // vec3.normalize(bottomNorm,bottomNorm);

    // left plane eye, bb[0],bb[1]
    // var leftNorm = vec3.create();
    // vec3.sub(v1, bBox[0], Eye);
    // vec3.sub(v2, bBox[1], Eye);
    // vec3.cross(leftNorm, v1, v2);
    // vec3.normalize(leftNorm, leftNorm);
    // var temp = [leftNorm, bBox[1]];
    // if(getPlanePointDistance(temp, bBox[3]) > 0){
    //     console.log("leftNorm : " + leftNorm);
    //     vec3.scale(leftNorm,leftNorm,-1);
    // }

    // right plane eye, bb[2],bb[3]
    // var rightNorm = vec3.create();
    // vec3.sub(v1, bBox[2], Eye);
    // vec3.sub(v2, bBox[3], Eye);
    // vec3.cross(rightNorm, v1 , v2);
    // vec3.normalize(rightNorm, rightNorm);
    // temp = [rightNorm, bBox[2]];
    // if(getPlanePointDistance(temp, bBox[1]) > 0){
    //     console.log("rightNorm : " + rightNorm);
    //     vec3.scale(rightNorm,rightNorm,-1);
    // }

    // near norm  bb[1],[2],[3]
    // var nearNorm = vec3.create();
    // vec3.normalize(nearNorm,pNorm);

    var bottomPt = [left[0], 1, left[1]];
        portalFrustum = [
            [nearNorm, bBox[1]],             //near pane
            // [farNorm, fc],              // far plane
            [topNorm, bottomPt],        //top plane
            [bottomNorm, left],  //bottomplane
            [leftNorm,left],      // left plane
            [rightNorm, right]     // right plane
        ]
    return portalFrustum;
}

function getPortalBounds(portal){
    var xmin = Number.MAX_VALUE
    var zmin = Number.MAX_VALUE
    var xmax = Number.MIN_VALUE
    var zmax = Number.MIN_VALUE
    for (var v = 0; v < portal.length; v++){
        if(portal[v][0] < xmin)
            xmin = portal[v][0];
        if(portal[v][0] > xmax)
            xmax = portal[v][0];
        if(portal[v][2] < zmin)
            zmin = portal[v][2];
        if(portal[v][2] > zmax)
            zmax = portal[v][2];

    }
    var boundingBox = [
        [xmin, 0, zmin],
        [xmin, 1, zmin],
        [xmax, 1, zmax],
        [xmax, 0, zmax]
        ];
    return boundingBox;
}

function pointWithinBounds(p, bound){
    if ( (p[0] > bound[1][0] && p[0] < bound[2][0]) &&
         (p[2] > bound[1][2] && p[2] < bound[2][2]) )
        return true;
    else 
        return false;
}

function pointLiesInPlane(p1, plane, bound){
    var dtr = 0;
    var P1minusP0 = vec3.create();
    vec3.sub(P1minusP0, p1, Eye);
    dtr = vec3.dot(plane, P1minusP0);
    if(dtr == 0)
        return true;
    else {
        var ntr = 0;
        var v0minusP0 = vec3.create();
        vec3.sub(v0minusP0, bound[0], Eye);
        ntr = vec3.dot(plane, v0minusP0);
        var r = ntr/dtr;
        // console.log("r@: " + r);
        if(r >= 0 && r <= 1){
            var intersect = vec3.create();
            var temp = vec3.create();
            vec3.sub(temp, p1, Eye);
            vec3.scaleAndAdd(intersect, Eye, temp,r);
            if(pointWithinBounds(intersect, bound)){
                return true;
            }
            else 
                return false;
        }
        else 
            return false;      
    }
    // return false;
}



function isVisibleThroughPortals(currSet) {
    var result = true;
        
    for(var p = 0 ; p < portals.length; p++){
        // check if portal is visible to eye, else continue;
        var inside = 0;
        var outside = 0;
        if(!isPortalVisible(portals[p])){
            // console.log("nt Vis" + p);
            continue;
        }
        // console.log( portals[p]);
        // var portalFrustum = getPortalFrustum(portals[p]);
        var portalBoundaries = getPortalBounds(portals[p]);
        // console.log(portalBoundaries);
        // get portal plane
        var portalPlane = vec3.create();
        var v1 = vec3.create();
        vec3.sub(v1,portalBoundaries[1], portalBoundaries[0]);
        var v2 = vec3.create();
        vec3.sub(v2,portalBoundaries[3], portalBoundaries[0]);
        vec3.cross(portalPlane, v1,v2);
        vec3.normalize(portalPlane,portalPlane);
        for (var v = 0 ; v < currSet.vertices.length; v++) {
            if(pointLiesInPlane(currSet.vertices[v], portalPlane, portalBoundaries)){
                inside++;
            }
        }
        if(inside == 0)
            result = false;
        else 
            return true;
    }
    return result;
}

function isSphereVisibleThroughPortals(sphere) {
    var result = true;
     for(var p = 0 ; p < portals.length; p++){
        // check if portal is visible to eye, else continue;
        var inside = 0;
        var outside = 0;
        if(!isPortalVisible(portals[p])){
            // console.log("nt Vis" + p);
            continue;
        }
        // console.log( portals[p]);
        // var portalFrustum = getPortalFrustum(portals[p]);
        var portalBoundaries = getPortalBounds(portals[p]);
        // console.log(portalBoundaries);
        // get portal plane
        var portalPlane = vec3.create();
        var v1 = vec3.create();
        vec3.sub(v1,portalBoundaries[1], portalBoundaries[0]);
        var v2 = vec3.create();
        vec3.sub(v2,portalBoundaries[3], portalBoundaries[0]);
        vec3.cross(portalPlane, v1,v2);
        vec3.normalize(portalPlane,portalPlane);
        var center = [sphere.x, sphere.y, sphere.z]
       
        if(pointLiesInPlane(center, portalPlane, portalBoundaries)){
            return true;
        }
        else 
            return false;
    }
    return result;
}
// render the loaded model
function renderModels() {
    t1 = new Date();
    getFrustumPlanes();
    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCenter = vec3.create();

        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        vec3.negate(negCenter,currModel.center);
        mat4.multiply(sumRotation,sumRotation,mat4.fromTranslation(temp,negCenter)); // rotate * -translate
        mat4.multiply(sumRotation,mat4.fromTranslation(temp,currModel.center),sumRotation); // translate * rotate * -translate
        mat4.fromTranslation(mMatrix,currModel.translation); // translate in model matrix
        mat4.multiply(mMatrix,mMatrix,sumRotation); // rotate in model matrix
    } // end make model transform
    
    var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var hpvMatrix = mat4.create(); // hand * proj * view matrices
    var hpvmMatrix = mat4.create(); // hand * proj * view * model matrices
    const HIGHLIGHTMATERIAL = 
        {ambient:[0.5,0.5,0], diffuse:[0.5,0.5,0], specular:[0,0,0], n:1, alpha:1, texture:false}; // hlht mat
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up handedness, projection and view
    mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,fov,1,zNear,zFar); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(hpvMatrix,hMatrix,pMatrix); // handedness * projection
    mat4.multiply(hpvMatrix,hpvMatrix,vMatrix); // handedness * projection * view

    // render each triangle set
    var triNotRendered = 0;
    triRenderred = 0;
    numOfTriangles = 0;
    var currSet, setMaterial; // the tri set and its material properties
    for (var whichTriSet=triSetOffset; whichTriSet<numTriangleSets; whichTriSet++) {
        currSet = inputTriangles[whichTriSet];
        numOfTriangles += currSet.triangles.length;
        // *************************************************Culling test**********************************//
        if(culling){
            if(!isVisible(currSet)  || (!isVisibleThroughPortals(currSet) && !isInSameRoomAsEye(currSet))){
                // console.log("Vis: " + !isVisible(currSet) + 
                //     " sameroom: " + !isInSameRoomAsEye(currSet) +
                //     " portal: " + !isVisibleThroughPortals(currSet));
                triNotRendered++;
                continue;
            }
        }
        // portal culling
        triRenderred += currSet.triangles.length;
        
        // make model transform, add to view project
        makeModelTransform(currSet);
        mat4.multiply(hpvmMatrix,hpvMatrix,mMatrix); // handedness * project * view * model
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, hpvmMatrix); // pass in the hpvm matrix
        
        // reflectivity: feed to the fragment shader
        if (inputTriangles[whichTriSet].on)
            setMaterial = HIGHLIGHTMATERIAL; // highlight material
        else
            setMaterial = currSet.material; // normal material
        gl.uniform3fv(ambientULoc,setMaterial.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,setMaterial.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,setMaterial.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,setMaterial.n); // pass in the specular exponent
        gl.uniform1i(usingTextureULoc,(currSet.material.texture != false)); // whether the set uses texture
        gl.activeTexture(gl.TEXTURE0); // bind to active texture 0 (the first)
        gl.bindTexture(gl.TEXTURE_2D, textures[whichTriSet]); // bind the set's texture
        gl.uniform1i(textureULoc, 0); // pass in the texture and active texture 0
        
        // position, normal and uv buffers: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate position
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichTriSet]); // activate normal
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[whichTriSet]); // activate uv
        gl.vertexAttribPointer(vUVAttribLoc,2,gl.FLOAT,false,0,0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        
    } // end for each triangle set
    
    // render each sphere
    var sphere, currentMaterial, instanceTransform = mat4.create(); // the current sphere and material
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[vertexBuffers.length-1]); // activate vertex buffer
    gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed vertex buffer to shader
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[normalBuffers.length-1]); // activate normal buffer
    gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed normal buffer to shader
    gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffers[uvBuffers.length-1]); // activate uv
    gl.vertexAttribPointer(vUVAttribLoc,2,gl.FLOAT,false,0,0); // feed
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[triangleBuffers.length-1]); // activate tri buffer
    
    var spRendered = 0;
    var spNotRendered = 0;
    for (var whichSphere=sphereSetOffset; whichSphere<numSpheres; whichSphere++) {
        sphere = inputSpheres[whichSphere];
        numOfTriangles += trianglesInASphere;
        if(!isSphereVisible(sphere) || (!isSphereVisibleThroughPortals(sphere) && !isSphereInSameRoomAsEye(sphere)) ){
            spNotRendered++;
            // console.log(whichSphere);
            continue;
        }
        spRendered++
        triRenderred += trianglesInASphere;
        // define model transform, premult with pvmMatrix, feed to shader
        makeModelTransform(sphere);
        mat4.fromTranslation(instanceTransform,vec3.fromValues(sphere.x,sphere.y,sphere.z)); // recenter sphere
        mat4.scale(mMatrix,mMatrix,vec3.fromValues(sphere.r,sphere.r,sphere.r)); // change size
        mat4.multiply(mMatrix,instanceTransform,mMatrix); // apply recenter sphere
        hpvmMatrix = mat4.multiply(hpvmMatrix,hpvMatrix,mMatrix); // premultiply with hpv matrix
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in model matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, hpvmMatrix); // pass in handed project view model matrix

        // reflectivity: feed to the fragment shader
        if (sphere.on)
            currentMaterial = HIGHLIGHTMATERIAL;
        else
            currentMaterial = sphere;
        gl.uniform3fv(ambientULoc,currentMaterial.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,currentMaterial.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,currentMaterial.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,currentMaterial.n); // pass in the specular exponent
        gl.uniform1i(usingTextureULoc,(sphere.texture != false)); // whether the sphere uses texture
        gl.activeTexture(gl.TEXTURE0); // bind to active texture 0 (the first)
        gl.bindTexture(gl.TEXTURE_2D, textures[numTriangleSets+whichSphere]); // bind the set's texture
        gl.uniform1i(textureULoc, 0); // pass in the texture and active texture 0

        // draw a transformed instance of the sphere
        gl.drawElements(gl.TRIANGLES,triSetSizes[triSetSizes.length-1],gl.UNSIGNED_SHORT,0); // render

    } // end for each sphere

    // console.log(triNotRendered + " " + triRenderred + " " + spNotRendered + " " + spRendered);
    t2 = new Date();
    frametime[frame] = (t2-t1);
    frame +=1;
    frame = frame % 10;
    averageFrameTime = 1000/getAverageTime();
    document.getElementById('test').innerHTML = averageFrameTime.toFixed(2);
    document.getElementById('triRend').innerHTML = triRenderred.toFixed(2);
} // end render model

function getAverageTime() {
    var result = 0;
    for( var i = 0 ; i < frametime.length; i++){
        result += frametime[i];
    }
    return (result/frametime.length);
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
    setupWebGL(); // set up the webGL environment
    setWallParameters();
    loadModels(); // load in the models from tri file
    setupShaders(); // setup the webGL shaders
    renderModels(); // draw the triangles using webGL
     document.getElementById('tri').innerHTML = numOfTriangles;//.toFixed(2);
} // end main