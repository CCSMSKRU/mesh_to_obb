export class Vector3 {
    constructor(x, y, z) {
        this._x = +x || 0;
        this._y = +y || 0;
        this._z = +z ||0;
        // this._asArray = [this._x, this.y_, this._z];
        // this.get = (index)=>{
        //     return this.asArray[index];
        // }

        this.degToRad = (deg)=>{
            return deg / 180 * Math.PI;
        };
        this.radToDeg = (rad)=>{
            return rad / Math.PI * 180;
        };

    }

    get x(){
        return this._x;
    }
    set x(val){
        this._x = val;
    }
    get y(){
        return this._y;
    }
    set y(val){
        this._y = val;
    }
    get z(){
        return this._z;
    }
    set z(val){
        this._z = val;
    }
    get asArray(){
        return [this._x, this._y, this._z];
    }

    getMatrix(){
        return new Matrix(this.asArray,1,3);
        // return new Matrix(this.asArray,3,1);
    }

    add(v){
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(v) {
        if (!(v instanceof Vector3)) {
            console.log(v);
            throw new Error('In Vector3 multiply v is not a Vector3. See console')
        }
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    multiplyS(num) {
        return new Vector3(this.x * num, this.y * num, this.z * num);
    }

    div(num){
        if (!num) throw 'Cannot divide by zero'
        return new Vector3(this.x / num, this.y / num, this.z / num)
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    equal(v, round = 1000) {
        const deviation = 1 / round;
        if (Math.abs(this.x - v.x) > deviation) return false;
        if (Math.abs(this.y - v.y) > deviation) return false;
        if (Math.abs(this.z - v.z) > deviation) return false;
        return true;
    }

    magnitude(){
        return Math.sqrt(this.dot(this));
    }

    magnitudeSq() {
        return this.dot(this);
    }

    distance(v) {
        return this.magnitude(this.subtract(v));

    }

    normalize() {
        return this.multiplyS((1 / this.magnitude()));
    }

    normalized() {
        return this.multiplyS((1 / this.magnitude()));
    }

    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        // return this.multiplyS((1 / this.magnitude()));
        return new Vector3(x, y, z)
    }

    angle(v){
        const m = Math.sqrt(this.magnitudeSq() * v.magnitudeSq());
        return Math.acos(this.dot(v) / m);
    }

    project(v){
        const dot = this.dot(v);
        const magSq = v.magnitudeSq();
        return v.multiplyS(dot / magSq);
    }

    perpendicular(v){
        return this.subtract(this.project(v));
    }

    reflection(v){
        const d = this.dot(v);
        return this.subtract(v.multiplyS(d * 2));
    }

    round(num){

        if (!num || isNaN(+num)){
            return new Vector3(
                Math.round(this.x),
                Math.round(this.y),
                Math.round(this.z)
            )
        }
        const powNum = Math.pow(10, num)
        return new Vector3(
            Math.round(this.x * powNum) / powNum,
            Math.round(this.y * powNum) / powNum,
            Math.round(this.z * powNum) / powNum
        )
    }

}


Vector3.prototype.degToRad = function (deg) {
    return deg / 180 * Math.PI;
};
Vector3.prototype.radToDeg = function (rad) {
    return rad / Math.PI * 180;
};

Vector3.prototype.average = function (vectors = []) {
    if (!vectors.length) throw 'Method need one or more vector(s)'
    let sum = new Vector3()
    vectors.forEach(vec=>sum = sum.add(vec))
    return sum.div(vectors.length)
};






















