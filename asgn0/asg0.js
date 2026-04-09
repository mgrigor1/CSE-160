// asg0.js
// some parts are from the YouTube Videos
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('cnv1');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }
  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //var v1 = new Vector3([2.25, 2.25, 0]); // create v1 and put in the middle
  //drawVector(v1, 'red'); // draw v1
}

//In asg0.js, create a function drawVector(v, color) that takes a Vector3 v and a string color (e.g. "red").  Inside this function, use the builtin javascript function lineTo() to draw the vector v1.
//The resolution of the canvas is 400x400, so scale your v1 coordinates by 20 when drawing it. This will make it easier to visualize vectors with length 1.

function drawVector(v, color) {
  var canvas = document.getElementById('cnv1');
  var ctx = canvas.getContext('2d');
  //context var updates
  ctx.strokeStyle = color;//ink color of the pen
  ctx.beginPath();
  ctx.moveTo(200, 200);//center
  //scaling by 20
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);//v is our vector that we got in the function
  ctx.stroke();//pen hits paper
}
//In asg0.js, create a function named handleDrawEvent() that is called whenever a user clicks on the draw button. Inside handleDrawEvent():
// Clear the canvas.
// Read the values of the text boxes to create v1.
// Call drawVector(v1, "red") .  

function handleDrawEvent(){ //first draw button
  var canvas = document.getElementById('cnv1');
  var ctx = canvas.getContext('2d');
  //let v1 = document.getElementById("canvas").value;
  //console.log(v1)
  // Draw a fresh black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var x = Number(document.getElementById('x_coordinate_v1').value); //read v1 x
  var y = Number(document.getElementById('y_coordinate_v1').value); //read v1 y
  var x2 = Number(document.getElementById('x_coordinate_v2').value); //read v2 x
  var y2 = Number(document.getElementById('y_coordinate_v2').value); //read v2 y

  var v1 = new Vector3([x, y, 0]); //v1
  var v2 = new Vector3([x2, y2, 0]); //v2
  drawVector(v1, 'red'); //draw the new v1 fully assembled vector
  drawVector(v2, 'blue'); //draw the new v1 fully assembled vector
}

//In asg0.js, write a function angleBetween(v1, v2) that uses the dot function to compute the angle between v1 and v2.
//Hint: Use the definition of dot product
//dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha).

function angleBetween(v1, v2) {
  var dot_product = Vector3.dot(v1, v2); //use fun from cuon
  var alpha = Math.acos(dot_product/(v1.magnitude()*v2.magnitude()));
  var anglebetw = alpha*180/Math.PI; //in degrees
  return anglebetw;
}

//In asg0.js, write a function areaTriangle(v1, v2) that uses the cross function to compute the area of the triangle created with v1 and v2.
//Hint: Remember  ||v1 x v2]]  equals to the area of the parallelogram that the vectors span.
//so divide by 2

function areaTriangle(v1, v2) {
  var cross_prod = Vector3.cross(v1, v2);
  var areaTrian = cross_prod.magnitude()/2;
  return areaTrian;
}
//handleDrawOperationEvent(): 
//Clear the canvas.
//Read the values of the text boxes to create v1 and call drawVector(v1, "red") .  
//Read the values of the text boxes to create v2 and call drawVector(v2, "blue") .  
//Read the value of the selector and call the respective Vector3 function. For add and sub operations, draw a green vector v3 = v1 + v2  or v3 = v1 - v2. For mul and div operations, draw two green vectors v3 = v1 * s and v4 = v2 * s.

function handleDrawOperationEvent(){ //second draw button
  var canvas = document.getElementById('cnv1');
  var ctx = canvas.getContext('2d');
  //let v1 = document.getElementById("canvas").value;
  //console.log(v1)
  // Draw a fresh black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var x = Number(document.getElementById('x_coordinate_v1').value); //read v1 x
  var y = Number(document.getElementById('y_coordinate_v1').value); //read v1 y
  var x2 = Number(document.getElementById('x_coordinate_v2').value); //read v2 x
  var y2 = Number(document.getElementById('y_coordinate_v2').value); //read v2 y
  var operation = document.getElementById('operation-select').value; //read operation
  var scalar = Number(document.getElementById('scalar-num').value); //read scalar
  
  var v1 = new Vector3([x, y, 0]); //v1
  var v2 = new Vector3([x2, y2, 0]); //v2
  drawVector(v1, 'red'); //draw the new v1 fully assembled vector
  drawVector(v2, 'blue'); //draw the new v1 fully assembled vector
  
  if (operation=='add') { //draw 1 green
    var v3 = new Vector3([x, y, 0]);//copy v1
    v3.add(v2); //add v2&v1
    drawVector(v3, 'green'); //draw resulting v3 green
  } else if (operation=='sub') { //OR
    var v3 = new Vector3([x, y, 0]); //copy v1
    v3.sub(v2); //subtract v2&v1
    drawVector(v3, 'green'); //draw resulting v3 green
  }
  if (operation=='mul') { //draw 2 green
    var v3 = new Vector3([x, y, 0]); //copy v1
    var v4 = new Vector3([x2, y2, 0]); //copy v2
    v3.mul(scalar); //mult both v3 by the scalar provided
    v4.mul(scalar); //and v4
    drawVector(v3, 'green'); //draw resulting v3 green
    drawVector(v4, 'green'); //draw resulting v4 green
  } else if (operation=='div') {
    var v3 = new Vector3([x, y, 0]); //copy v1
    var v4 = new Vector3([x2, y2, 0]); //copy v2
    v3.div(scalar); //div bot v3 by the scalar
    v4.div(scalar); //and v4
    drawVector(v3, 'green'); //draw resulting v3 green
    drawVector(v4, 'green'); //draw resulting v4 green
  }
  if (operation=='mag') {
    // Print the magnitude results of this operation to the console. Hint: use javascript builtin console.log() function and open your browser's console.
    console.log('Magnitude of v1 is: ' + v1.magnitude()); //print mag v1
    console.log('Magnitude of v2 is: ' + v2.magnitude()); //print mag v2
  } else if (operation=='nor') {
    var v3 = new Vector3([x, y, 0]); //copy v1
    var v4 = new Vector3([x2, y2, 0]); //copy v2
    v3.normalize(); //norm v1
    v4.normalize(); //norm v2
    drawVector(v3, 'green'); //draw resulting v3 green
    drawVector(v4, 'green'); //draw resulting v4 green
  }
  if (operation=='ang') {
    console.log('Angle between v1 & v2: ' + angleBetween(v1, v2)); //print the angbetw v1 & v2
  }
  if (operation=='area') {
    console.log('Area of triangle: ' + areaTriangle(v1, v2)); //print the area
  }
}