// Camera.js in asg3
class Camera {
    constructor() {
        //this.type='cube';
        //this.position = [0.0, 0.0, 0.0];
        //this.color = [1.0,1.0,1.0,1.0];
        this.fov = 60;
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.5;
        this.alpha = 5; //in degrees see the videos for the formulas
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
        this.updateViewMatrix();
    }
    updateProjectionMatrix(canvas) {
        this.projectionMatrix.setPerspective(this.fov, 1*canvas.width/canvas.height, 1, 1000);
    }
    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }
    /*forward() {
        var f = this.at.subtract(this.eye);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }
    back() {
        var f = this.eye.subtract(this.at);
        f = f.divide(f.length());
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }
    left() {
        var f = this.eye.subtract(this.at);
        f = f.divide(f.length());
        var s = f.cross(this.up);
        s = s.divide(s.length());
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }
    right() {
        var f = this.eye.subtract(this.at);
        f = f.divide(f.length());
        var s = f.cross(this.up);
        s = s.divide(s.length());
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }
    */
   //d = at - eye (from the video)
    calcD() { //var f = this.at.subtract(this.eye);
        let d = new Vector3();
        d.elements[0] = this.at.elements[0] - this.eye.elements[0];
        d.elements[1] = this.at.elements[1] - this.eye.elements[1];
        d.elements[2] = this.at.elements[2] - this.eye.elements[2];
        return d;
        this.updateViewMatrix();
    }
    //for rotation around eye see vid
    rotate(angDeg) {
        let d = this.calcD();
        let dx = d.elements[0];
        let dy = d.elements[1];
        let dz = d.elements[2];
        let r = Math.sqrt(dx * dx + dz * dz); //from vid
        let theta = Math.atan2(dz, dx);
        theta = theta + angDeg * Math.PI / 180.0;
        let newX = r * Math.cos(theta);
        let newZ = r * Math.sin(theta);
        this.at.elements[0] = this.eye.elements[0] + newX;
        this.at.elements[1] = this.eye.elements[1] + dy;
        this.at.elements[2] = this.eye.elements[2] + newZ;
    }
    //W moving forth
    moveForward() {
        let d = this.calcD(); //var f = this.eye.subtract(this.at);
        //cuon and vid
        d.normalize(); //f = f.divide(f.length());
        //making it a little slower
        d.elements[0] *= this.speed;
        d.elements[1] *= this.speed;
        d.elements[2] *= this.speed;
        //at = at + d
        this.at.elements[0] += d.elements[0];
        this.at.elements[1] += d.elements[1];
        this.at.elements[2] += d.elements[2];
        //eye = eye + d
        this.eye.elements[0] += d.elements[0];
        this.eye.elements[1] += d.elements[1];
        this.eye.elements[2] += d.elements[2];
        this.updateViewMatrix();
    }
    //S moving back
    moveBackwards() {
        let d = this.calcD(); //var f = this.eye.subtract(this.at);
        //cuon and vid
        d.normalize(); //f = f.divide(f.length());
        //making it a little slower
        d.elements[0] *= this.speed;
        d.elements[1] *= this.speed;
        d.elements[2] *= this.speed;
        //at = at - d
        this.at.elements[0] -= d.elements[0];
        this.at.elements[1] -= d.elements[1];
        this.at.elements[2] -= d.elements[2];
        //eye = eye - d
        this.eye.elements[0] -= d.elements[0];
        this.eye.elements[1] -= d.elements[1];
        this.eye.elements[2] -= d.elements[2];
        this.updateViewMatrix();
    }
    //A moving left
    moveLeft() {
        let d = this.calcD(); //var f = this.eye.subtract(this.at);
        //cuon and vid
        d.normalize(); //f = f.divide(f.length());
        var left = new Vector3();
        //cross f.cross(this.up);
        left.elements[0] = this.up.elements[1] * d.elements[2] - this.up.elements[2] * d.elements[1];
        left.elements[1] = this.up.elements[2] * d.elements[0] - this.up.elements[0] * d.elements[2];
        left.elements[2] = this.up.elements[0] * d.elements[1] - this.up.elements[1] * d.elements[0];
        left.normalize(); //s = s.divide(s.length());
        //slowing down moves
        left.elements[0] *= this.speed;
        left.elements[1] *= this.speed;
        left.elements[2] *= this.speed;
        //at = at - d
        this.at.elements[0] += left.elements[0];
        this.at.elements[1] += left.elements[1];
        this.at.elements[2] += left.elements[2];
        //eye = eye - d
        this.eye.elements[0] += left.elements[0];
        this.eye.elements[1] += left.elements[1];
        this.eye.elements[2] += left.elements[2];
        this.updateViewMatrix();
    }
    //D moving right
    moveRight() {
        let d = this.calcD(); //var f = this.eye.subtract(this.at);
        //cuon and vid
        d.normalize(); //f = f.divide(f.length());
        var right = new Vector3();
        //cross f.cross(this.up);
        right.elements[0] = d.elements[1] * this.up.elements[2] - d.elements[2] * this.up.elements[1];
        right.elements[1] = d.elements[2] * this.up.elements[0] - d.elements[0] * this.up.elements[2];
        right.elements[2] = d.elements[0] * this.up.elements[1] - d.elements[1] * this.up.elements[0];
        right.normalize(); //s = s.divide(s.length());
        //slowing down moves
        right.elements[0] *= this.speed;
        right.elements[1] *= this.speed;
        right.elements[2] *= this.speed;
        //at = at - d
        this.at.elements[0] += right.elements[0];
        this.at.elements[1] += right.elements[1];
        this.at.elements[2] += right.elements[2];
        //eye = eye - d
        this.eye.elements[0] += right.elements[0];
        this.eye.elements[1] += right.elements[1];
        this.eye.elements[2] += right.elements[2];
        this.updateViewMatrix();
    }
    //Q panning left
    panLeft() {
        this.rotate(-this.alpha);
    }
    //E panning right
    panRight() {
        this.rotate(this.alpha);
    }
    //pan for mouse
    pan(angle) {
        this.rotate(angle);
        this.updateViewMatrix();
    }
}

