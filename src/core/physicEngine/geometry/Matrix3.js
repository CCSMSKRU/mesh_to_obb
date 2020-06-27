import {Matrix} from '@core/physicEngine/geometry/Matrix'
import {Matrix4} from '@core/physicEngine/geometry/Matrix4'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {Matrix2} from '@core/physicEngine/geometry/Matrix2'

export class Matrix3 extends Matrix{
    constructor(...props) {
        super([...props], 3, 3);

        this.newMatrix = (arr, colCount, rowCount)=>{
            if (colCount !== rowCount) return new Matrix(arr, colCount, rowCount);
            if (colCount === 2) return arr? new Matrix2(...arr) : new Matrix2();
            if (colCount === 3) return arr? new Matrix3(...arr) : new Matrix3();
            if (colCount === 4) return arr? new Matrix4(...arr) : new Matrix4();
            return new Matrix(arr, colCount, rowCount);
        };

        this.rotationZ = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix3(
                Math.cos(angle), Math.sin(angle), 0,
                -Math.sin(angle), Math.cos(angle), 0,
                0, 0, 1);
        };

        this.rotationX = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix3(
                1, 0, 0,
                0, Math.cos(angle), Math.sin(angle),
                0, -Math.sin(angle), Math.cos(angle));
        };

        this.rotationY = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix3(
                Math.cos(angle), 0, -Math.sin(angle),
                0, 1, 0,
                Math.sin(angle), 0, Math.cos(angle));
        };

        this.rotation = (pitch, yaw, roll) => {
            return this.rotationZ(roll).multiply(this.rotationX(pitch)).multiply(this.rotationY(yaw));
        };


    }

    get _11(){return this.__11;}
    set _11(val){this.__11 = val;}
    get _12(){return this.__12;}
    set _12(val){this.__12 = val;}
    get _13(){return this.__13;}
    set _13(val){this.__13 = val;}
    get _21(){return this.__21;}
    set _21(val){this.__21 = val;}
    get _22(){return this.__22;}
    set _22(val){this.__22 = val;}
    get _23(){return this.__23;}
    set _23(val){this.__23 = val;}
    get _31(){return this.__31;}
    set _31(val){this.__31 = val;}
    get _32(){return this.__32;}
    set _32(val){this.__32 = val;}
    get _33(){return this.__33;}
    set _33(val){this.__33 = val;}

    decomposeYawPitchRoll() {
        // https://coderoad.ru/1996957/%D0%9F%D1%80%D0%B5%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%AD%D0%B9%D0%BB%D0%B5%D1%80%D0%B0-%D0%B2-%D0%BC%D0%B0%D1%82%D1%80%D0%B8%D1%86%D1%83-%D0%B8-%D0%BC%D0%B0%D1%82%D1%80%D0%B8%D1%86%D1%8B-%D0%B2-%D0%AD%D0%B9%D0%BB%D0%B5%D1%80%D0%B0
        const euler = new Vector3()
        euler.x = Math.asin(-this._32)                  // Pitch
        if (Math.cos(euler.x) > 0.0001)                 // Not at poles
        {
            euler.y = Math.atan2(this._31, this._33)     // Yaw
            euler.z = Math.atan2(this._12, this._22)     // Roll
            // euler.z = Math.atan2(this._21, this._22)     // Roll
        } else {
            euler.y = 0                         // Yaw
            euler.z = Math.atan2(-this._21, this._11)    // Roll
        }
        return new Vector3(this.radToDeg(euler.x), this.radToDeg(euler.y), this.radToDeg(euler.z))
    }

    axisAngle(axis, angle){
        angle = this.degToRad(angle);
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;

        let x = axis.x;
        let y = axis.y;
        let z = axis.z;

        const deviation = 1 / 1000;
        if (axis.magnitudeSq() -1 > deviation){
            const inv_len = 1 / axis.magnitude();
            x *= inv_len; // Normalize x
            y *= inv_len; // Normalize y
            z *= inv_len; // Normalize z
        }
        return new Matrix3(
            t * (x * x) + c,t * x * y + s * z,t * x * z - s * y,
            t * x * y - s * z,t * (y * y) + c,t * y * z + s * x,
            t * x * z + s * y,t * y * z - s * x,t * (z * z) + c
        )
    }

    multiplyVector(v){
        let x = v.dot(new Vector3(this._11, this._21, this._31));
        let y = v.dot(new Vector3(this._12, this._22, this._32));
        let z = v.dot(new Vector3(this._13, this._23, this._33));
        return new Vector3(x, y, z);
    }


}
