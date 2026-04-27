//gpu (GLSL code here)
//tranformation with vertices
let VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main (){
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
`;

//works with the color and depth
let FRAGMENT_SHADER = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main (){
        gl_FragColor = u_FragColor;
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
    if (!a_Position<0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
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
    //set an init val for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI(){
    //button events
    document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true};
    document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false};
    document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true};
    document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false};
    document.getElementById('animationFrontLeftOnButton').onclick = function() {g_legAnimation=true};
    document.getElementById('animationFrontLeftOffButton').onclick = function() {g_legAnimation=false};
    document.getElementById('animationNeckOnButton').onclick = function() {g_neckAnimation=true};
    document.getElementById('animationNeckOffButton').onclick = function() {g_neckAnimation=false};

    //color slider events
    document.getElementById('bodySlide').addEventListener('mousemove', function() { g_bodyAngle = this.value; renderAllShapes(); });
    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });
    document.getElementById('legSlide').addEventListener('mousemove', function() { g_frontLeftLegAngle = this.value; g_frontRightLegAngle = -this.value; g_backLeftLegAngle = -this.value; g_backRightLegAngle = this.value; g_hoof1Angle = this.value; g_hoof2Angle = this.value; g_hoof3Angle = -this.value; g_hoof4Angle = -this.value; renderAllShapes(); });
    document.getElementById('kneesSlide').addEventListener('mousemove', function() {g_kneeAngle = this.value; renderAllShapes(); });

    //other slider events
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}
//cpu
function main(){
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    initMouseControls();
    gl.clearColor(0.51, 0.61, 0.51, 1.0);
    //renderAllShapes();
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
            var factor = 100 / canvas.height;
            var dx = factor * (x - g_lastX);
            var dy = factor * (y - g_lastY);
            g_mouseX = g_mouseX + dy;
            g_mouseY = g_mouseY + dx;
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

// draw shapes on canvas
function renderAllShapes(){ //1.8 in the instructor's videos
    var startTime = performance.now(); //check time @start of the function
    //pass the matrix to u_ModelMatrix attribute
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_mouseX, 1, 0, 0).rotate(g_mouseY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    //clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //BODYBODYBODY OF THE COW
    // Draw the body cube
    var body = new Cube();
    body.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    body.matrix.translate(-0.25, -0.35, 0.0);
    body.matrix.rotate(-g_bodyAngle, 0, 1, 0);
    var bodyCoordinatesMat = new Matrix4(body.matrix);
    body.matrix.scale(0.6, 0.6, 0.9);
    body.render();
    //tail
    var tail = new Cube();
    tail.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    tail.matrix = new Matrix4(bodyCoordinatesMat);
    tail.matrix.translate(0.25, 0.3, 0.9);
    tail.matrix.scale(0.1, 0.1, 0.1);
    tail.render();
    //neck
    var neck = new Cube();
    neck.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    neck.matrix = new Matrix4(bodyCoordinatesMat);
    neck.matrix.translate(0.3, 0.1, 0.04);
    neck.matrix.rotate(-50, 1, 0, 0);
    neck.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var yellowCoordinatesMat = new Matrix4(neck.matrix);
    neck.matrix.scale(0.25, 0.7, 0.4);
    neck.matrix.translate(-0.5, 0, 0);
    neck.render();
    //head
    var head = new Cube();
    head.color = [0.85, 0.50, 0.22, 1.0]; //light brown
    head.matrix = yellowCoordinatesMat;
    head.matrix.translate(0.0, 0.7, 0.0);
    head.matrix.rotate(50, 1, 0, 0);
    head.matrix.rotate(g_magentaAngle, 0, 0, 1);
    var headCoordinatesMat = new Matrix4(head.matrix);
    head.matrix.scale(0.4, 0.4, 0.4);
    head.matrix.translate(-0.5, 0, -0.001);
    head.render();
    //right ear
    var rightEar = new Cube();
    rightEar.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    rightEar.matrix =  new Matrix4(headCoordinatesMat);
    rightEar.matrix.translate(-0.2, 0.3, 0.0);
    rightEar.matrix.scale(0.2, 0.3, 0.05);
    rightEar.matrix.rotate(50 + g_pokeAngle, 0, 0, 1);
    rightEar.matrix.translate(-0.5, -0.5, 0);
    rightEar.render();
    // left ear
    var leftEar = new Cube();
    leftEar.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    leftEar.matrix = new Matrix4(headCoordinatesMat);
    leftEar.matrix.translate(0.18, 0.3, 0.0);
    leftEar.matrix.scale(0.2, 0.3, 0.05);
    leftEar.matrix.rotate(50 - g_pokeAngle, 0, 0, 1);
    leftEar.matrix.translate(-0.5, -0.5, 0);
    leftEar.render();
    //nose
    var nose = new Cube();
    nose.color = [0.86, 0.62, 0.55, 1.0]; //pink reddish
    nose.matrix = new Matrix4(headCoordinatesMat);
    nose.matrix.rotate(0.2 * g_pokeAngle, 0, 0, 1);
    nose.matrix.translate(-0.176, 0.03, -0.05);
    nose.matrix.scale(0.35, 0.18, 0.05);
    nose.render();
    //CIRCLE SHAPED EYES
    //left eye
    var leftEye = new Circle();
    leftEye.color = [0.0, 1.0, 1.0, 0.0];
    leftEye.size = 30;
    leftEye.segments = 20;
    leftEye.matrix = new Matrix4(headCoordinatesMat);
    leftEye.matrix.translate(0.2, 0.3, 0.0);
    leftEye.matrix.scale(0.2, 0.3, 0.05);
    leftEye.matrix.translate(-1.3, 0, -0.1);
    leftEye.render();
    //left eye color
    var leftEye = new Circle();
    leftEye.color = [0.35, 0.60, 0.40, 1.0];
    leftEye.size = 20;
    leftEye.segments = 20;
    leftEye.matrix = new Matrix4(headCoordinatesMat);
    leftEye.matrix.translate(0.2, 0.3, 0.0);
    leftEye.matrix.scale(0.2, 0.3, 0.05);
    leftEye.matrix.translate(-1.2 + 0.001*g_pokeAngle, 0, -0.2);
    leftEye.render();
    // right eye
    var rightEye = new Circle();
    rightEye.color = [0.0, 1.0, 1.0, 0.0];
    rightEye.size = 30;
    rightEye.segments = 20;
    rightEye.matrix = new Matrix4(headCoordinatesMat);
    rightEye.matrix.translate(0.2, 0.3, 0.0);
    rightEye.matrix.scale(0.2, 0.3, 0.05);
    rightEye.matrix.translate(-0.6, 0, -0.1);
    rightEye.render();
    // right eye color
    var rightEye = new Circle();
    rightEye.color = [0.35, 0.60, 0.40, 1.0];
    rightEye.size = 20;
    rightEye.segments = 20;
    rightEye.matrix = new Matrix4(headCoordinatesMat);
    rightEye.matrix.translate(0.2, 0.3, 0.0);
    rightEye.matrix.scale(0.2, 0.3, 0.05);
    rightEye.matrix.translate(-0.5 + 0.001*g_pokeAngle, 0, -0.2);
    rightEye.render();
    //LEGSSSSSSS
    //back left leg
    var leg1 = new Cube();
    leg1.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    leg1.matrix = new Matrix4(bodyCoordinatesMat);
    leg1.matrix.scale(0.8, 0.3, 0.6);
    leg1.matrix.translate(0.15, -0.5, 1);
    leg1.matrix.rotate(g_backLeftLegAngle, 1, 0, 0);
    var leg1CoordinatesMat = new Matrix4(leg1.matrix);
    leg1.matrix.scale(0.28, 0.7, 0.4);
    leg1.matrix.translate(-0.5, 0, 0);
    leg1.render();
    //mid part of right leg
    var mid1 = new Cube();
    mid1.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    mid1.matrix = new Matrix4(leg1CoordinatesMat);
    mid1.matrix.translate(0.0, -0.7, 0.0);
    mid1.matrix.rotate(0, 1, 0, 0);
    mid1.matrix.rotate(g_kneeAngle, 1, 0, 0);
    var mid1CoordinatesMat = new Matrix4(mid1.matrix);
    mid1.matrix.scale(0.25, 0.7, 0.3);
    mid1.matrix.translate(-0.5, 0, 0);
    mid1.render();
    //hoof part of right leg
    var hoof1 = new Cube();
    hoof1.color = [0.85, 0.50, 0.22, 1.0]; //light brown
    hoof1.matrix = new Matrix4(mid1CoordinatesMat);
    hoof1.matrix.rotate(-g_hoof1Angle, 1, 0, 0);
    hoof1.matrix.scale(0.3, 0.3, 0.3);
    hoof1.matrix.translate(-0.5, -1, -0.2);
    hoof1.render();
    //front left leg
    var leg2 = new Cube();
    leg2.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    leg2.matrix = new Matrix4(bodyCoordinatesMat);
    leg2.matrix.scale(0.8, 0.3, 0.6);
    leg2.matrix.translate(0.15, -0.5, 0.1);
    leg2.matrix.rotate(g_frontLeftLegAngle, 1, 0, 0);
    var leg2CoordinatesMat = new Matrix4(leg2.matrix);
    leg2.matrix.scale(0.28, 0.7, 0.4);
    leg2.matrix.translate(-0.5, 0, 0);
    leg2.render();
    //mid part of left leg
    var mid2 = new Cube();
    mid2.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    mid2.matrix = new Matrix4(leg2CoordinatesMat);
    mid2.matrix.translate(0.0, -0.7, 0.0);
    mid2.matrix.rotate(0, 1, 0, 0);
    mid2.matrix.rotate(g_kneeAngle, 1, 0, 0); //slowing down dadam middle joint
    var mid2CoordinatesMat = new Matrix4(mid2.matrix);
    mid2.matrix.scale(0.25, 0.7, 0.3);
    mid2.matrix.translate(-0.5, 0, 0);
    mid2.render();
    //hoof part of left leg
    var hoof2 = new Cube();
    hoof2.color = [0.85, 0.50, 0.22, 1.0]; //light brown
    hoof2.matrix = new Matrix4(mid2CoordinatesMat);
    hoof2.matrix.rotate(g_hoof2Angle, 1, 0, 0);
    hoof2.matrix.scale(0.3, 0.3, 0.3);
    hoof2.matrix.translate(-0.5, -1, -0.2);
    hoof2.render();
    //front right leg
    var leg3 = new Cube();
    leg3.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    leg3.matrix = new Matrix4(bodyCoordinatesMat);
    leg3.matrix.scale(0.8, 0.3, 0.6);
    leg3.matrix.translate(0.6, -0.5, 0.1);
    leg3.matrix.rotate(g_frontRightLegAngle, 1, 0, 0);
    var leg3CoordinatesMat = new Matrix4(leg3.matrix);
    leg3.matrix.scale(0.28, 0.7, 0.4);
    leg3.matrix.translate(-0.5, 0, 0);
    leg3.render();
    //mid part of right leg
    var mid3 = new Cube();
    mid3.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    mid3.matrix = new Matrix4(leg3CoordinatesMat);
    mid3.matrix.translate(0.0, -0.7, 0.0);
    mid3.matrix.rotate(0, 1, 0, 0);
    mid3.matrix.rotate(g_kneeAngle, 1, 0, 0);
    var mid3CoordinatesMat = new Matrix4(mid3.matrix);
    mid3.matrix.scale(0.25, 0.7, 0.3);
    mid3.matrix.translate(-0.5, 0, 0);
    mid3.render();
    //hoof part of right leg
    var hoof3 = new Cube();
    hoof3.color = [0.85, 0.50, 0.22, 1.0]; //light brown
    hoof3.matrix = new Matrix4(mid3CoordinatesMat);
    hoof3.matrix.rotate(g_hoof3Angle, 1, 0, 0);
    hoof3.matrix.scale(0.3, 0.3, 0.3);
    hoof3.matrix.translate(-0.5, -1, -0.2);
    hoof3.render();
    //back right leg
    var leg4 = new Cube();
    leg4.color = [0.45, 0.22, 0.08, 1.0]; //dark brown
    leg4.matrix = new Matrix4(bodyCoordinatesMat);
    leg4.matrix.scale(0.8, 0.3, 0.6);
    leg4.matrix.translate(0.6, -0.5, 1);
    leg4.matrix.rotate(g_backRightLegAngle, 1, 0, 0);
    var leg4CoordinatesMat = new Matrix4(leg4.matrix);
    leg4.matrix.scale(0.28, 0.7, 0.4);
    leg4.matrix.translate(-0.5, 0, 0);
    leg4.render();
    //mid part of right leg
    var mid4 = new Cube();
    mid4.color = [0.72, 0.36, 0.12, 1.0]; //medium brown
    mid4.matrix = new Matrix4(leg4CoordinatesMat);
    mid4.matrix.translate(0.0, -0.7, 0.0);
    mid4.matrix.rotate(0, 1, 0, 0);
    mid4.matrix.rotate(g_kneeAngle, 1, 0, 0);
    var mid4CoordinatesMat = new Matrix4(mid4.matrix);
    mid4.matrix.scale(0.25, 0.7, 0.3);
    mid4.matrix.translate(-0.5, 0, 0);
    mid4.render();
    //hoof part of right leg
    var hoof4 = new Cube();
    hoof4.color = [0.85, 0.50, 0.22, 1.0]; //light brown
    hoof4.matrix = new Matrix4(mid4CoordinatesMat);
    hoof4.matrix.rotate(-g_hoof4Angle, 1, 0, 0);
    hoof4.matrix.scale(0.3, 0.3, 0.3);
    hoof4.matrix.translate(-0.5, -1, -0.2);
    hoof4.render();

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