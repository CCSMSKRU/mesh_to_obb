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

    // get _11(){return this.__11;}
    // set _11(val){this.__11 = val;}
    // get _12(){return this.__12;}
    // set _12(val){this.__12 = val;}
    // get _13(){return this.__13;}
    // set _13(val){this.__13 = val;}
    // get _21(){return this.__21;}
    // set _21(val){this.__21 = val;}
    // get _22(){return this.__22;}
    // set _22(val){this.__22 = val;}
    // get _23(){return this.__23;}
    // set _23(val){this.__23 = val;}
    // get _31(){return this.__31;}
    // set _31(val){this.__31 = val;}
    // get _32(){return this.__32;}
    // set _32(val){this.__32 = val;}
    // get _33(){return this.__33;}
    // set _33(val){this.__33 = val;}

    decomposeYawPitchRoll_OLD() {
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


    // http://nghiaho.com/?page_id=846
    // http://nghiaho.com/uploads/code/rotation_matrix_demo.m
    /*
    * function rotation_matrix_demo

        disp("Picking random Euler angles (radians)");

        x = 2*pi*rand() - pi % -180 to 180
        y = pi*rand() - pi*0.5 % -90 to 90
        z = 2*pi*rand() - pi % -180 to 180

        disp("\nRotation matrix is:");
        R = compose_rotation(x,y,z)

        disp("Decomposing R");
        [x2,y2,z2] = decompose_rotation(R)

        disp("");
        err = sqrt((x2-x)*(x2-x) + (y2-y)*(y2-y) + (z2-z)*(z2-z))

        if err < 1e-5
            disp("Results are correct!");
        else
            disp("Oops wrong results :(");
        end
    end

    function [x,y,z] = decompose_rotation(R)
        x = atan2(R(3,2), R(3,3));
        y = atan2(-R(3,1), sqrt(R(3,2)*R(3,2) + R(3,3)*R(3,3)));
        z = atan2(R(2,1), R(1,1));
    end

    function R = compose_rotation(x, y, z)
        X = eye(3,3);
        Y = eye(3,3);
        Z = eye(3,3);

        X(2,2) = cos(x);
        X(2,3) = -sin(x);
        X(3,2) = sin(x);
        X(3,3) = cos(x);

        Y(1,1) = cos(y);
        Y(1,3) = sin(y);
        Y(3,1) = -sin(y);
        Y(3,3) = cos(y);

        Z(1,1) = cos(z);
        Z(1,2) = -sin(z);
        Z(2,1) = sin(z);
        Z(2,2) = cos(z);

        R = Z*Y*X;
    end
    * */

    decomposeYawPitchRoll() {
        // x = atan2(R(3,2), R(3,3));
        // y = atan2(-R(3,1), sqrt(R(3,2)*R(3,2) + R(3,3)*R(3,3)));
        // z = atan2(R(2,1), R(1,1));

        const x = Math.atan2(this._32, this._33)
        const y = Math.atan2(-this._31, Math.sqrt(Math.pow(this._32) + Math.pow(this._33)))
        const z = - Math.atan2(this._21, this._11) // У меня ось в другую сторону

        return new Vector3(this.radToDeg(x), this.radToDeg(y), this.radToDeg(z))
        // return new Vector3(x, y, z)
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
