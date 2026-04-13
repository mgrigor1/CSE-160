//gpu (GLSL code here)
//tranformation with vertices (sizes/shapes)
//vec4(a_Position, 1.0); xyz, w where w is related to the homogenous system
let VERTEX_SHADER = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main (){
        gl_Position = a_Position;
        gl_PointSize = u_Size;
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

//globals related to UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;//init val
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_rainbowBrush = false;

function setupWebGL(){ //dont touch forever during this quarter
    canvas = document.getElementById('webgl');
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});//changing for better speed
    if (!gl) {
        console.log('Failed to get the WebGL context');
        return -1;
    }
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
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('failed to get the storage location of u_Size');
        return -1;
    }
}

function addActionsForHtmlUI(){
    //button events
    //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,0.0]; };
    //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,0.0]; };
    document.getElementById('clearCanvas').onclick = function() { g_shapesList=[]; renderAllShapes();};
    document.getElementById('points').onclick = function() {g_selectedType=POINT};
    document.getElementById('triangles').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circles').onclick = function() {g_selectedType=CIRCLE};

    //color slider events
    document.getElementById('redS').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100});
    document.getElementById('greenS').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100});
    document.getElementById('blueS').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100});

    //other slider events
    document.getElementById('shapesizeS').addEventListener('mouseup', function() { g_selectedSize = this.value});
    document.getElementById('segmentS').addEventListener('mouseup', function() { g_selectedSegments = this.value});

    //button for butterfly func
    document.getElementById('drawButterfly').onclick = function(){drawButterfly();};

    //awesome thing
    document.getElementById('rainbowBrush').onclick = function(){g_rainbowBrush=!g_rainbowBrush;};
}
//cpu
function main(){
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    ShapeColor = [0.0, 0.0, 1.0];
    draw(gl);
    //document.getElementById('redS').addEventListener('mouseup', function(){ShapeColor[0]=this.value/20;draw(gl)});
    canvas.onmousedown = click;
    //canvas.onmousemove = click;
    canvas.onmousemove = function(ev){if(ev.buttons==1){click(ev)}};
    gl.clearColor(0.0, 0.0, 0.0, 1.0); //black
    gl.clear(gl.COLOR_BUFFER_BIT); //clear canvas
}


function draw(gl){
    gl.clearColor(0.0, 0.0, 0.0, 1.0); //black canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    console.log(gl);

    let triangle = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.5, 0.0]); //floating point
    console.log(triangle);

    //initShaders(VERTEX_SHADER,FRAGMENT_SHADER); //given in the lib
    //if (!initShaders(gl,VERTEX_SHADER,FRAGMENT_SHADER)) {
    //    console.log('Failed to load/compile shaders');
    //    return -1;
    //}
    
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create Buffer');
        return -1;
    }
    //buffer needs to bind the triangle
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    //    if (!a_Position<0) {
    //    console.log('Failed to get the storage location of a_Position');
    //    return -1;
    //}
    let xpos = -.9;
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); //3 cuz 3d and zeroes cuz no color data etc
    gl.enableVertexAttribArray(a_Position); 
    gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);

    //let ShapeColor = [0.0, 0.0, 1.0]; moving to main
    //let u_Color = gl.getUniformLocation(gl.program, "u_Color");
    gl.uniform4f(u_FragColor, ShapeColor[0], ShapeColor[1], ShapeColor[2], 1.0);//now shall draw
    gl.drawArrays(gl.TRIANGLES, 0, triangle.length/3);
}

var g_shapesList = []

//see ColoredPoints.js
//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

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
    //awesome thing
    if (g_rainbowBrush){
        point.color = [Math.random(),Math.random(),Math.random(),1.0];
    } else {
        point.color = g_selectedColor.slice();
    }
    //point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);
    // Store the coordinates to g_points array
    //g_points.push([x,y]);
    //g_colors.push(g_selectedColor.slice());
    // Store the coordinates to g_points array
    //if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    //} else if (x < 0.0 && y < 0.0) { // Third quadrant
    //    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    //} else {                         // Others
    //    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    //}
    //g_sizes.push(g_selectedSize);

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
    gl.clearColor(0.0, 0.0, 0.0, 1.0); //black
    gl.clear(gl.COLOR_BUFFER_BIT); //clear canvas
    // draw each shape in the list
    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
    // check the time at the end of the function & show on web page
    var duration = performance.now() - startTime;
    //sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

// set the text of a HTML element
//function sendTextToHTML(text, htmlID){
//    var htmlElm = document.getElementById(htmlID);
//    if (!htmlElm) {
//        console.log("Failed to get " + htmlID + " from HTML");
//        return -1;
//    }
//    htmlElm.innerHTML = text;
//}

function drawTriangle(vertices) {
    var n = 3; //num of vert
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); //assign buffer obj to a_Position var
    gl.enableVertexAttribArray(a_Position); //enable the assign to a_Position var
    //gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //return n;
}