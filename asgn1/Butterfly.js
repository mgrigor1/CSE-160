function drawButterfly() {
    gl.clearColor(0.0, 1.0, 1.0, 1.0); //blue canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    //console.log(gl);

    let x = 0.0, y = 0.0, d = 0.2;
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
    drawTriangle([x, y, x, y+d, x+d, y+d]);
    //first vertex second vertex third vertex
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); //yellow
    drawTriangle([x, y, x, y+d, x-d, y+d]);
    drawTriangle([x, y+d, x-d, y+d, x-d, y+2*d]);
    drawTriangle([x, y+d, x+d, y+d, x+d, y+2*d]);
    drawTriangle([x-d, y+d, x-d, y+2*d, x-2*d, y+d]);
    drawTriangle([x-2*d, y+d, x-d, y+2*d, x-2*d, y+2*d]);
    drawTriangle([x-2*d, y+d, x-2*d, y+2*d, x-3*d, y+d]);
    drawTriangle([x-3*d, y+d, x-2*d, y+2*d, x-3*d, y+2*d]);
    drawTriangle([x-3*d, y+d, x-2*d, y+d, x-2*d, y]);
    drawTriangle([x-2*d, y, x-d, y, x-d, y+d]);
    drawTriangle([x-2*d, y, x-2*d, y+d, x-d, y+d]);
    gl.uniform4f(u_FragColor, 1.0, 0.0, 1.0, 1.0); //purple first name
    drawTriangle([x-d, y, x-d, y+d, x, y]);
    drawTriangle([x-d, y, x, y, x-d, y-d]);
    drawTriangle([x+d, y, x+d, y+d, x, y]);
    drawTriangle([x+d, y, x, y, x+d, y-d]);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); //yellow
    drawTriangle([x+d, y+d, x+d, y+2*d, x+2*d, y+d]);
    drawTriangle([x+2*d, y+d, x+d, y+2*d, x+2*d, y+2*d]);
    drawTriangle([x+2*d, y+d, x+2*d, y+2*d, x+3*d, y+d]);
    drawTriangle([x+3*d, y+d, x+2*d, y+2*d, x+3*d, y+2*d]);
    drawTriangle([x+3*d, y+d, x+2*d, y+d, x+2*d, y]);
    drawTriangle([x+2*d, y, x+d, y, x+d, y+d]);
    drawTriangle([x+2*d, y, x+2*d, y+d, x+d, y+d]);
    drawTriangle([x-d, y, x-d, y-d, x-2*d, y]);
    drawTriangle([x, y, x-d, y-d, x, y-d]);
    drawTriangle([x+d, y, x+d, y-d, x+2*d, y]);
    drawTriangle([x, y, x+d, y-d, x, y-d]);
    //top wings done + first name initial
    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0); //green last name
    drawTriangle([x, y-d, x+d, y-d, x+d, y-2*d]);
    drawTriangle([x, y-d, x-d, y-d, x-d, y-2*d]);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); //yellow
    drawTriangle([x, y-d, x+d, y-2*d, x, y-2*d]);
    drawTriangle([x, y-d, x-d, y-2*d, x, y-2*d]);
    drawTriangle([x-d, y-d, x-d, y-2*d, x-2*d, y-2*d]);
    drawTriangle([x+d, y-d, x+d, y-2*d, x+2*d, y-2*d]);
    drawTriangle([x+d, y-2*d, x+2*d, y-2*d, x+d, y-3*d]);
    drawTriangle([x-d, y-2*d, x-2*d, y-2*d, x-d, y-3*d]);
    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0); //green last name
    drawTriangle([x-d, y-2*d, x-d, y-3*d, x, y-3*d]);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); //yellow
    drawTriangle([x-d, y-2*d, x, y-2*d, x, y-3*d]);
    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0); //green last name
    drawTriangle([x, y-2*d, x, y-3*d, x+d, y-3*d]);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); //yellow
    drawTriangle([x, y-2*d, x+d, y-2*d, x+d, y-3*d]);
    //bottom wings + last name initial
}