// asg4.js
//gpu (GLSL code here)
//tranformation with vertices
let VERTEX_SHADER = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_NormalMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        //mat4 NormalMatrix = transpose(inverse(u_ModelMatrix));
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0)));
        //v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
        //v_Normal = normalize(vec3(u_ModelMatrix * vec4(a_Normal,1)));
        //v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }
`;

//works with the color and depth
let FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    uniform float u_texColorWeight;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;
    uniform vec3 u_lightColor;
    uniform bool u_spotLightOn;
    void main() {
        vec4 baseColor = u_FragColor;
        vec4 texColor;
        if (u_whichTexture == -3) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0); return; //when normals
        } else if (u_whichTexture == -2) {
            gl_FragColor = baseColor; //use color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0); //use UV debug color
        } else if (u_whichTexture == 0) { // sky texture
            texColor = texture2D(u_Sampler0, v_UV);
            gl_FragColor = (1.0 - u_texColorWeight) * baseColor + u_texColorWeight * texColor;
        } else if (u_whichTexture == 1) { // ground texture
            texColor = texture2D(u_Sampler1, v_UV);
            gl_FragColor = (1.0 - u_texColorWeight) * baseColor + u_texColorWeight * texColor;
        } else if (u_whichTexture == 2) {
            texColor = texture2D(u_Sampler2, v_UV);
            gl_FragColor = (1.0 - u_texColorWeight) * baseColor + u_texColorWeight * texColor;
        } else { //error, put reddish
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
        }
        //vec3 lightVector = vec3(v_VertPos)-u_lightPos;
        //float r=length(lightVector);
        //if (r<1.0) {
        //    gl_FragColor= vec4(1,0,0,1);
        //} else if (r<2.0) {
        //    gl_FragColor= vec4(0,1,0,1);
        //}
        //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

        //new
        vec3 lightVector = u_lightPos-vec3(v_VertPos);
        float r=length(lightVector);

        // Red/Green Distance Visualization
        // if (r<1.0) {
        //   gl_FragColor= vec4(1,0,0,1);
        // } else if (r<2.0) {
        //   gl_FragColor= vec4(0,1,0,1);
        // }

        // Light Falloff Visualization 1/r^2
        // gl_FragColor= vec4(vec3(gl_FragColor)/(r*r),1);

        // N dot L
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N,L), 0.0);

        // Reflection
        vec3 R = reflect(-L, N);

        // eye
        vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

        // specular NOT WORKING AT ALL CHANGING TO VEC3
        // float specular = pow(max(dot(E,R), 0.0),64.0) * 0.8;

        //vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL *0.7;
        vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * 0.7;
        vec3 specular = u_lightColor * pow(max(dot(E, R), 0.0), 32.0) * 0.5;
        vec3 ambient = vec3(gl_FragColor) * 0.2;

        vec3 spot = normalize(vec3(0.0, -1.0, 0.0));
        float spotVar = smoothstep(0.82, 0.95, dot(normalize(-lightVector), spot));
        vec3 finalColor = ambient;
        if (u_lightOn) {
            finalColor += diffuse + specular;
        }
        if (u_spotLightOn) {
            finalColor += (diffuse + specular) * spotVar;
        }
        if (u_lightOn || u_spotLightOn) {
            gl_FragColor = vec4(finalColor, 1.0);
        } 
    }
`;
//constants
const POINT = 0; //that is our square
const TRIANGLE = 1;
const CIRCLE = 2;

//global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let a_UV;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let a_Normal;
let u_lightPos;
let u_cameraPos;
let u_NormalMatrix;
let u_lightColor;
let u_spotLightOn;
let u_lightOn;

//globals related to UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;//init val
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_bodyAngle = 0;
let g_yellowAngle = 0; //neck
let g_magentaAngle = 0;
let g_frontLeftLegAngle = 0;
let g_frontRightLegAngle = 0;
let g_backLeftLegAngle = 0;
let g_backRightLegAngle = 0;
let g_hoof4Angle = 0;
let g_hoof3Angle = 0;
let g_hoof2Angle = 0;
let g_hoof1Angle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_legAnimation = false;
let g_neckAnimation = false;
let g_mouseX = 0;
let g_mouseY = 0;
let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_pokeAngle = 0;
let g_dragging = false;
let g_lastX = -1;
let g_lastY = -1;
let g_kneeAngle = 0;
let g_normalOn = false;
let u_texColorWeight;
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let g_lightColor = [1.0, 1.0, 0.9];
let g_spotLightOn = true;
let g_lightAnimationOff = false;

function setupWebGL(){ //dont touch forever during this quarter
    canvas = document.getElementById('webgl');
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});//changing for better speed
    if (!gl) {
        console.log('Failed to get the WebGL context');
        return -1;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    if (!initShaders(gl,VERTEX_SHADER,FRAGMENT_SHADER)) {
        console.log('Failed to load/compile shaders');
        return -1;
    }
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position<0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return -1;
    }
    //get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    //get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrixf');
        return;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get u_Sampler0');
        return;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get u_Sampler1');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }
    u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
    if (!u_texColorWeight) {
        console.log('Failed to get u_texColorWeight');
        return;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2'); //mult textures
    if (!u_Sampler2) {
        console.log('Failed to get u_Sampler2');
        return;
    }
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get u_NormalMatrix');
        return;
    }
    u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!u_lightColor) {
        console.log('Failed to get u_lightColor');
        return;
    }
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get u_lightOn');
        return;
    }
    u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
    if (!u_spotLightOn) {
        console.log('Failed to get u_spotLightOn');
        return;
    }
    //set an init val for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI(){
    //button events
    document.getElementById('lightOn').onclick = function() {g_lightOn=true;};
    document.getElementById('lightOff').onclick = function() {g_lightOn=false;};
    document.getElementById('normalOn').onclick = function() {g_normalOn = true; renderAllShapes();};
    document.getElementById('normalOff').onclick = function() {g_normalOn = false; renderAllShapes();};
    document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightAnimationOff = true; g_lightPos[0] = this.value/100; renderAllShapes(); }});
    document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes(); }});
    document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes(); }});
    document.getElementById('lightColorR').addEventListener('mousemove', function() { g_lightColor[0] = this.value / 100; renderAllShapes(); });
    document.getElementById('lightColorG').addEventListener('mousemove', function() { g_lightColor[1] = this.value / 100; renderAllShapes(); });
    document.getElementById('lightColorB').addEventListener('mousemove', function() { g_lightColor[2] = this.value / 100; renderAllShapes(); });
    document.getElementById('spotLightOn').onclick = function() { g_spotLightOn = true; renderAllShapes(); };
    document.getElementById('spotLightOff').onclick = function() { g_spotLightOn = false; renderAllShapes(); };

    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures() {                         
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    var image0 = new Image(); //create an sky image object
    var image1 = new Image(); //create an ground image object
    var image2 = new Image(); //multiple textures
    if (!image0||!image1||!image2) {
        console.log('Failed to create the image object');
        return false;
    }
    //rgister the event handler to be called on loading an image
    image0.onload = function() { sendImageToTexture0(image0); };
    image1.onload = function() { sendImageToTexture1(image1); };
    image2.onload = function() { sendImageToTexture2(image2); };
    //tell the browser to load an image
    image0.src = 'sky.jpeg';
    image1.src = 'ground_block_texture.jpeg'
    image2.src = 'stone.jpeg'
    return true;
}

function sendImageToTexture0(image) {
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //flip the image's y axis
    //enable the texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    //bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    //set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw a rectangle
    console.log('finished loadTexture0');
}
function sendImageToTexture1(image) {
    var texture = gl.createTexture(); //create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //flip the image's y axis
    //enable the texture unit 0
    gl.activeTexture(gl.TEXTURE1);
    //bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    //set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw a rectangle
    console.log('finished loadTexture1');
}
function sendImageToTexture2(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create texture2');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
    console.log('finished loadTexture2');
}

//cpu
function main(){
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    initMouseControls();
    document.onkeydown = keydown;
    initTextures();
    initMap();
    gl.clearColor(0.173, 0.737, 0.925, 1.0);
    requestAnimationFrame(tick);
}

function initMouseControls() { //see textbook RotateObject.js
    canvas.onmousedown = function(ev) {
        if (ev.shiftKey) {
            g_pokeAnimation = true;
            g_pokeStartTime = g_seconds;
            return;
        }
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            g_lastX = x;
            g_lastY = y;
            g_dragging = true;
        }
    };
    canvas.onmouseup = function(ev) {
        g_dragging = false;
    };
    canvas.onmousemove = function(ev) {
        var x = ev.clientX;
        var y = ev.clientY;
        if (g_dragging) {
            var dx = x - g_lastX;
            var sensitivity = 0.3;
            g_camera.pan(-dx * sensitivity);
            renderAllShapes();
        }
        g_lastX = x;
        g_lastY = y;
    };
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0-g_startTime;

//its time
function tick() {
    //save curr time
    g_seconds = performance.now() / 1000.0-g_startTime;
    //console.log(g_seconds);
    updateAnimationAngles();
    //draw everything
    renderAllShapes();
    //update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_bodyAngle = 20 * Math.sin(g_seconds);
    }
    if (g_magentaAnimation) {
        g_magentaAngle = 5 * Math.sin(g_seconds);
    }
    if (g_neckAnimation) {
        g_yellowAngle = 5 * Math.sin(g_seconds);
    }
    if (g_legAnimation) {
        g_frontLeftLegAngle = 8 * Math.sin(g_seconds);
        g_frontRightLegAngle = -8 * Math.sin(g_seconds);
        g_backLeftLegAngle = -8 * Math.sin(g_seconds);
        g_backRightLegAngle = 8 * Math.sin(g_seconds);
        
        g_hoof1Angle = 3 * Math.sin(3 * g_seconds);
        g_hoof2Angle = -3 * Math.sin(3 * g_seconds);
        g_hoof3Angle = 3 * Math.sin(3 * g_seconds);
        g_hoof4Angle = -3 * Math.sin(3 * g_seconds);
    }
    if (g_pokeAnimation) {
        let pokeTime = g_seconds - g_pokeStartTime;
        if (pokeTime < 1.5) {
            g_pokeAngle = 6 * Math.sin(8 * pokeTime);
        } else {
            g_pokeAnimation = false;
            g_pokeAngle = 0;
        }
    }
    if (!g_lightAnimationOff) g_lightPos[0] = Math.cos(g_seconds);
}
var g_shapesList = []
function click(ev) {
    let [x,y] = convertCoordinateEventToGL(ev); //to see x y as local variables
    // Create and store the new point

    let point = new Triangle();
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType==TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
    }
    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);
    renderAllShapes();
}

function convertCoordinateEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return([x,y]);
}

function keydown(ev) {
    //if (ev.keyCode == 39) { //right arrow THIS WORKS START
    //    g_eye[0] += 0.2;
    //    g_at[0] += 0.2;
    //} else if (ev.keyCode == 37) { //left arrow 
    //    g_eye[0] -= 0.2;
    //    g_at[0] -= 0.2;
    //} THIS WORKS END
    if (ev.key === 'w' || ev.key === 'W') {
        g_camera.moveForward();
    } else if (ev.key === 's' || ev.key === 'S') {
        g_camera.moveBackwards();
    } else if (ev.key === 'a' || ev.key === 'A') {
        g_camera.moveLeft();
    } else if (ev.key === 'd' || ev.key === 'D') {
        g_camera.moveRight();
    } else if (ev.key === 'q' || ev.key === 'Q') {
        g_camera.panLeft();
    } else if (ev.key === 'e' || ev.key === 'E') {
        g_camera.panRight();
    } else if (ev.key === 'b' || ev.key === 'B') {
    addBlockInFront();
    } else if (ev.key === 'r' || ev.key === 'R') {
    deleteBlockInFront();
    }
    renderAllShapes();
    console.log(ev.keyCode);
}

//var g_eye = [0, 0, 3];
//var g_at = [0, 0, -100];
//var g_up = [0, 1, 0];
var g_camera = new Camera();
var g_map = [];
function initMap(){
    for (let x = 0; x < 32; x++) {
        let row = [];
        for (let y = 0; y < 32; y++) {
            let height = 0;
            if (y === 0 || y === 31 || x === 0 || x === 31) { //outer bound
                height = 3;
            }
            //random blocks by GPT
            if (y === 6 && x > 4 && x < 25) height = 2;
            if (y === 14 && x > 8 && x < 30) height = 1;
            if (x === 10 && y > 8 && y < 22) height = 4;
            if (x === 20 && y > 3 && y < 18) height = 2;
            //random hallways by GPT
            if ((y === 6 && x === 12) || (y === 14 && x === 16) || (x === 10 && y === 15)) {
                height = 0;
            }
            row.push(height);
        }
        g_map.push(row);
    }
}
function drawMap() {
    //var maze = new Cube();
    for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 16; y++) {
            var height = g_map[x][y];
            //console.log(x, y);
            //if (x < 1 || x == 31 || y == 0 || y == 31) {
            //    //var body = new Cube();
            //    body.color = [0.8, 1.0, 1.0, 1.0];
            //    body.matrix.translate(0, -.75, 0);
            //    body.matrix.scale(.4, .4, .4);
            //    body.matrix.translate(x - 16, 0, y - 16);
            //    body.renderfaster();
            //body.color = [0.8, 1.0, 1.0, 1.0];
            //body.matrix.translate(0, -.75, 0);
            //body.matrix.scale(.4, .4, .4);
            //body.matrix.translate(x - 16, 0, y - 16);
            //body.renderfaster();
            //for (let i = 0; i < height; i++) { //WORKS BEAUTIFULLY ADDING STONE TO THE MIX
            //    let maze = new Cube();
            //    maze.color = [0.55, 0.35, 0.20, 1.0];
            //    maze.textureNum = 1;
            //    //maze.matrix.translate(x - 16, i - 1, y - 16);
            //    maze.matrix.translate(x - 16, i - 0.95, y - 16);
            //    maze.renderfasterUV();
            //}
            for (let i = 0; i < height; i++) { //stone and earth
                let maze = new Cube();
                //stone on outside and earth on inside
                //if (x === 0 || x === 31 || y === 0 || y === 31) {
                //    maze.color = [0.55, 0.35, 0.20, 1.0];
                //    maze.textureNum = 1;
                //} else {
                //    maze.color = [0.35, 0.35, 0.35, 1.0];
                //    maze.textureNum = 1;
                //}
                //maze.matrix.translate(x - 16, i - 0.95, y - 16);
                //if (g_normalOn) {
                //    maze.renderNormal();
                //} else {
                //    maze.renderfasterUV();
                //}
                //maze.matrix.translate(x - 8, i - 0.95, y - 8);
                maze.textureNum = g_normalOn ? -3 : 1; 
                if (g_normalOn) {
                    maze.renderNormal(); 
                } else { 
                    maze.renderfasterUV(); 
                }
            }
        }
    }
}
function drawGround(){
    //ground the ground plane
    let ground = new Cube();
    ground.color = [0.20, 0.55, 0.20, 1.0];
    ground.textureNum = g_normalOn ? -3 : -2;
    ground.matrix.translate(-16, -1.05, -16);
    ground.matrix.scale(32, 0.05, 32);
    ground.renderNormal();
}
function drawSky(){
    //texture did not work have no idea how to make it work even made a separate render function still did not work out
    //draw the sky
    let sky = new Cube();
    sky.color = [0.173, 0.737, 0.925, 1.0];
    if (g_normalOn) {
        sky.textureNum = -3;
    } else {
        sky.textureNum = -2;
    }
    //sky.matrix.translate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]); disattaching from camera
    sky.matrix.translate(-100, -100, -100);
    sky.matrix.scale(200, 200, 200);
    if (g_normalOn) {
        sky.renderNormal();
    } else {
        sky.renderfaster();
    }
}
function drawCow(){
    //BODYBODYBODY OF THE COW
    // Draw the body cube
    var body = new Cube();
    body.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    body.textureNum = g_normalOn ? -3 : -2;
    body.matrix.translate(0.35, -0.5, 0.5);
    body.matrix.rotate(180, 0, 1, 0);
    body.matrix.rotate(-g_bodyAngle, 0, 1, 0);
    var bodyCoordinatesMat = new Matrix4(body.matrix);
    body.matrix.scale(0.6, 0.6, 0.9);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.renderNormal();
}
function drawCoin(x, z) {
    let coin = new Circle();
    coin.color = [1.0, 0.8, 0.1, 1.0]; // gold
    coin.size = 25;
    coin.segments = 24;
    coin.matrix.translate(x, -0.45, z);
    //2D coin lol
    coin.matrix.rotate(0, 0, 1, 0);
    coin.render();
}

// draw shapes on canvas
function renderAllShapes(){ //1.8 in the instructor's videos
    var startTime = performance.now(); //check time @start of the function
    //pass the projection matrix
    //var projMat = new Matrix4();
    //projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
    //gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    //pass the view matrix
    //var viewMat = new Matrix4();
    //viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0],  g_at[1],  g_at[2], g_up[0],  g_up[1],  g_up[2]);
    //viewMat.setLookAt(
    //    g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
    //    g_camera.at.x,  g_camera.at.y,  g_camera.at.z,
    //    g_camera.up.x,  g_camera.up.y,  g_camera.up.z
    //    0, 10, 25, //camera position THIS ONE WORKS
    //    0, 0, 0, //at
    //    0, 1, 0 //up
    //    g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    //    g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
    //    g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]
    //);
    //gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    g_camera.updateProjectionMatrix(canvas);
    g_camera.updateViewMatrix();
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);
    //pass the matrix to u_ModelMatrix attribute
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    //var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_mouseX, 1, 0, 0).rotate(g_mouseY, 0, 1, 0);
    //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    //clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSky();
    //pass light position to GLSL
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    //pass the camera position to GLSL
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    //pass the light status
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform1i(u_spotLightOn, g_spotLightOn);

    //draw light
    var light = new Cube();
    light.color = [2,2,0,1];
    light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.renderNormal(); 

    //draw Sphere
    var sp = new Sphere();
    //sp.textureNum=-1;
    if (g_normalOn) sp.textureNum = -3;
    sp.matrix.translate(-1, -0.55, -0.6);
    sp.matrix.scale(.4,.4,.4);
    sp.render();

    //gl.clear(gl.COLOR_BUFFER_BIT);
    //drawSky();
    drawGround();
    drawMap();
    drawCow();
    //check the time at the end of the func, and show on web
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");
}
//set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function getBlockInFront() { //getting the area of the block right in front of use
    let d = g_camera.calcD();
    d.normalize();
    let targetX = g_camera.eye.elements[0] + d.elements[0] * 2;
    let targetZ = g_camera.eye.elements[2] + d.elements[2] * 2;
    let mapX = Math.floor(targetX + 16);
    let mapY = Math.floor(targetZ + 16);
    if (mapX < 0 || mapX >= 32 || mapY < 0 || mapY >= 32) {
        return null;
    }
    return [mapX, mapY];
}
//use B key
function addBlockInFront() {
    let block = getBlockInFront();
    if (block == null) return;
    let x = block[0];
    let y = block[1];
    g_map[x][y] = Math.min(g_map[x][y] + 1, 4); //up to height 4
}
//use R key
function deleteBlockInFront() {
    let block = getBlockInFront();
    if (block == null) return;
    let x = block[0];
    let y = block[1];
    g_map[x][y] = Math.max(g_map[x][y] - 1, 0);
}