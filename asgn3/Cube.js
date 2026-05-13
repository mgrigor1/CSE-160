// Cube.js in asg3
class Cube {
    constructor() {
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32 = new Float32Array([
            0, 0, 0,   1, 1, 0,   1, 0, 0,
            0, 0, 0,   0, 1, 0,   1, 1, 0,
            0, 1, 0,   0, 1, 1,   1, 1, 1,
            0, 1, 0,   1, 1, 1,   1, 1, 0,
            1, 1, 0,   1, 1, 1,   1, 0, 0,
            1, 0, 0,   1, 1, 1,   1, 0, 1,
            0, 1, 0,   0, 1, 1,   0, 0, 0,
            0, 0, 0,   0, 1, 1,   0, 0, 1,
            0, 0, 0,   0, 0, 1,   1, 0, 1,
            0, 0, 0,   1, 0, 1,   1, 0, 0,
            0, 0, 1,   1, 1, 1,   1, 0, 1,
            0, 0, 1,   0, 1, 1,   1, 1, 1
        ]);
        this.cubeVerts = [
            0, 0, 0,   1, 1, 0,   1, 0, 0,
            0, 0, 0,   0, 1, 0,   1, 1, 0,
            0, 1, 0,   0, 1, 1,   1, 1, 1,
            0, 1, 0,   1, 1, 1,   1, 1, 0,
            1, 1, 0,   1, 1, 1,   1, 0, 0,
            1, 0, 0,   1, 1, 1,   1, 0, 1,
            0, 1, 0,   0, 1, 1,   0, 0, 0,
            0, 0, 0,   0, 1, 1,   0, 0, 1,
            0, 0, 0,   0, 0, 1,   1, 0, 1,
            0, 0, 0,   1, 0, 1,   1, 0, 0,
            0, 0, 1,   1, 1, 1,   1, 0, 1,
            0, 0, 1,   0, 1, 1,   1, 1, 1
        ];
        this.cubeVertsUV = new Float32Array([
            //front
            0,0,0,  0,0,   1,1,0,  1,1,   1,0,0,  1,0,
            0,0,0,  0,0,   0,1,0,  0,1,   1,1,0,  1,1,
            //back
            0,0,1,  0,0,   1,1,1,  1,1,   1,0,1,  1,0,
            0,0,1,  0,0,   0,1,1,  0,1,   1,1,1,  1,1,
            //top
            0,1,0,  0,0,   0,1,1,  0,1,   1,1,1,  1,1,
            0,1,0,  0,0,   1,1,1,  1,1,   1,1,0,  1,0,
            //bottom
            0,0,0,  0,0,   0,0,1,  0,1,   1,0,1,  1,1,
            0,0,0,  0,0,   1,0,1,  1,1,   1,0,0,  1,0,
            //left
            0,0,0,  0,0,   0,1,1,  1,1,   0,0,1,  1,0,
            0,0,0,  0,0,   0,1,0,  0,1,   0,1,1,  1,1,
            //right
            1,0,0,  0,0,   1,1,1,  1,1,   1,0,1,  1,0,
            1,0,0,  0,0,   1,1,0,  0,1,   1,1,1,  1,1
        ]);
    }
    render() {
        // var xy = this.position;
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        if (this.textureNum >= 0) {
            gl.uniform1f(u_texColorWeight, 1.0);   // use texture
        } else {
            gl.uniform1f(u_texColorWeight, 0.0);   // use base color only
        }
        // pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        //front of cube
        drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  1,1]);
        //drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        //drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

        //back of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3DUV([0,0,1,  1,1,1,  1,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1], [0,0,  0,1,  1,1]);
        //drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
        //drawTriangle3D([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);

        //top of cube
        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0,  0,1,  1,1]);
        drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0,  1,1,  1,0]);
        //drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        //drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);

        //bottom of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0,  0,0,1,  1,0,1], [0,0,  0,1,  1,1]);
        drawTriangle3DUV([0,0,0,  1,0,1,  1,0,0], [0,0,  1,1,  1,0]);
        //drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0]);
        //drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0]);

        //left of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3DUV([0,0,0,  0,1,1,  0,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,  0,1,1], [0,0,  0,1,  1,1]);
        //drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0]);
        //drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0]);

        //right of cube
        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], [0,0,  0,1,  1,1]);
        //drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
        //drawTriangle3D([1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0]);
    }
    renderfast() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        var allverts = [];
        allverts = allverts.concat([0,0,0,  1,1,0,  1,0,0]);
        allverts = allverts.concat([0,0,0,  0,1,0,  1,1,0]);

        allverts = allverts.concat([0,1,0,  0,1,1,  1,1,1]);
        allverts = allverts.concat([0,1,0,  1,1,1,  1,1,0]);

        allverts = allverts.concat([1,1,0,  1,1,1,  1,0,0]);
        allverts = allverts.concat([1,0,0,  1,1,1,  1,0,1]);

        allverts = allverts.concat([0,1,0,  0,1,1,  0,0,0]);
        allverts = allverts.concat([0,0,0,  0,1,1,  0,0,1]);

        allverts = allverts.concat([0,0,0,  0,0,1,  1,0,1]);
        allverts = allverts.concat([0,0,0,  1,0,1,  1,0,0]);

        allverts = allverts.concat([0,0,1,  1,1,1,  1,0,1]);
        allverts = allverts.concat([0,0,1,  0,1,1,  1,1,1]);

        drawTriangle3D(allverts);
    }
    renderfaster() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        //pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform1f(u_texColorWeight, this.textureNum >= 0 ? 1.0 : 0.0);
        //pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        //pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //if (g_vertexBuffer == null) {
        //    initTriangle3D();
        //}
        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
            if (!g_vertexBuffer) {
                console.log('Failed to create the buffer object');
                return;
            }
        }
        //gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        //write date into the buffer object
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allverts), gl.DYNAMIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.disableVertexAttribArray(a_UV);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    renderfasterUV() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        if (typeof u_texColorWeight !== 'undefined' && u_texColorWeight) {
            gl.uniform1f(u_texColorWeight, this.textureNum >= 0 ? 1.0 : 0.0);
        }
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
            if (!g_vertexBuffer) {
                console.log('Failed to create the buffer object');
                return;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertsUV, gl.DYNAMIC_DRAW);
        var FSIZE = this.cubeVertsUV.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}