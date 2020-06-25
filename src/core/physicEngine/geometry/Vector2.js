import {Matrix} from './Matrix'

export class Vector2 {
    constructor(x, y) {
        this._x = x || 0
        this._y = y || 0
        // this.get = (index)=>{
        //     return this.asArray[index];
        // }

        this.degToRad = (deg) => {
            return deg / 180 * Math.PI
        }
        this.radToDeg = (rad) => {
            return rad / Math.PI * 180
        }
    }

    get x() {
        return this._x
    }

    set x(val) {
        this._x = val
    }

    get y() {
        return this._y
    }

    set y(val) {
        this._y = val
    }

    get asArray() {
        return [this._x, this._y]
    }

    getMatrix() {
        return new Matrix(this.asArray, 1, 2)
        // return new Matrix(this.asArray,2,1);
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y)
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y)
    }

    multiply(v) {
        return new Vector2(this.x * v.x, this.y * v.y)
    }

    multiplyS(num) {
        return new Vector2(this.x * num, this.y * num)
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    equal(v, round = 1000) {
        const deviation = 1 / round
        if (Math.abs(this.x - v.x) > deviation || Math.abs(this.y - v.y) > deviation) return false
        // if (Math.abs(this.y - v.y) > deviation) return false
        return true
    }

    magnitude() {
        return Math.sqrt(this.dot(this))
    }

    magnitudeSq() {
        return this.dot(this)
    }

    distance(v) {
        return this.magnitude(this.subtract(v))

    }

    normalize() {
        return this.multiplyS((1 / this.magnitude()))
    }

    normalized() {
        return this.multiplyS((1 / this.magnitude()))
    }

    angle(v) {
        const m = Math.sqrt(this.magnitudeSq() * v.magnitudeSq())
        return Math.acos(this.dot(v) / m)
    }

    project(v) {
        const dot = this.dot(v)
        const magSq = v.magnitudeSq()
        return v.multiplyS(dot / magSq)
    }

    perpendicular(v) {
        return this.subtract(this.project(v))
    }

    reflection(v) {
        const d = this.dot(v)
        return this.subtract(v.multiplyS(d * 2))
    }

}


Vector2.prototype.degToRad = function(deg) {
    return deg / 180 * Math.PI
}
Vector2.prototype.radToDeg = function(rad) {
    return rad / Math.PI * 180
}
