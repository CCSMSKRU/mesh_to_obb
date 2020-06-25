import {Matrix} from '@core/physicEngine/geometry/Matrix'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {cache} from '@core/physicEngine/geometry/matrix.cache'
// let cache;

export class Matrix4 extends Matrix{
    constructor(...props) {
        super([...props], 4, 4);

        this.newMatrix = (arr, colCount, rowCount)=>{
            if (colCount !== rowCount) return new Matrix(arr, colCount, rowCount);
            if (colCount === 2) return arr? new Matrix2(...arr) : new Matrix2();
            if (colCount === 3) return arr? new Matrix3(...arr) : new Matrix3();
            if (colCount === 4) return arr? new Matrix4(...arr) : new Matrix4();
            return new Matrix(arr, colCount, rowCount);
        };

        /**
         * @param coors Можно передать x,y,z или Vector3
         * @returns {Matrix4}
         */
        this.translation = (...coors) => {
            let alias
            if (cache){
                const coorsArr = coors[0] instanceof Vector3? coors[0].asArray : coors
                alias = cache.alias([...this.asArray, ...coorsArr], 'matrixTranslation')
                const res = cache.get(alias)
                if (res) return res
            }
            // var v = (coors[0] instanceof Vector3)? coors[0] : new Vector3(...coors);
            let x = (coors[0] instanceof Vector3) ? coors[0].x : coors[0];
            let y = (coors[0] instanceof Vector3) ? coors[0].y : coors[1];
            let z = (coors[0] instanceof Vector3) ? coors[0].z : coors[2];
            const res = new Matrix4(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1);

            if (cache){
                cache.set(alias, res)
            }
            return res
        };

        /**
         * @param coors Можно передать x,y,z или Vector3
         * @returns {Matrix4}
         */
        this.scale = (...coors) => {
            // var v = (coors[0] instanceof Vector3)? coors[0] : new Vector3(...coors);
            let x = (coors[0] instanceof Vector3) ? coors[0].x : coors[0];
            let y = (coors[0] instanceof Vector3) ? coors[1].y : coors[1];
            let z = (coors[0] instanceof Vector3) ? coors[2].z : coors[2];
            return new Matrix4(
                x, 0, 0, 0,
                0, y, 0, 0,
                0, 0, z, 0,
                0, 0, 0, 1);
        };

        this.rotationZ = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix4(
                Math.cos(angle), Math.sin(angle), 0, 0,
                -Math.sin(angle), Math.cos(angle), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
        };

        this.rotationX = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix4(
                1, 0, 0, 0,
                0, Math.cos(angle), Math.sin(angle), 0,
                0, -Math.sin(angle), Math.cos(angle), 0,
                0, 0, 0, 1);
        };

        this.rotationY = (angle) => {
            angle = this.degToRad(angle);
            return new Matrix4(
                Math.cos(angle), 0, -Math.sin(angle), 0,
                0, 1, 0, 0,
                Math.sin(angle), 0, Math.cos(angle), 0,
                0, 0, 0, 1);
        };

        this.rotation = (pitch, yaw, roll) => {
            let alias
            if (cache){
                alias = cache.alias([...this.asArray, ...[pitch, yaw, roll]], 'matrix4Rotation')
                const res = cache.get(alias)
                if (res) return res
            }
            const res = this.rotationZ(roll).multiply(this.rotationX(pitch)).multiply(this.rotationY(yaw));
            if (cache){
                cache.set(alias, res)
            }
            return res
        }

        this.transformEuler = (scale, eulerTartaion, translate)=>{
            return this.scale(scale).multiply(
                this.rotation(eulerTartaion.x, eulerTartaion.y, eulerTartaion.y)
            ).multiply(
                this.translation(translate)
            );
        };

        this.transformAxis = (scale, v_rotationAxis, angle, translate)=>{
            return this.scale(scale).multiply(
                this.axisAngle(v_rotationAxis, angle)
            ).multiply(
                this.translation(translate)
            );
        };

        this.transform = (scale, eulerTartaion_OR_rotationAxis, translate_OR_angle, null_OR_translate)=>{
            return (null_OR_translate === null)?
                this.transformEuler(scale, eulerTartaion_OR_rotationAxis, translate_OR_angle) :
                this.transformAxis(scale, eulerTartaion_OR_rotationAxis, translate_OR_angle, null_OR_translate);
        };

        this.lookAt = (position, target, up)=>{
            // const forward =  Normalized(target - position);
            const forward =  target.subtract(position).normalize();
            const right =  up.cross(forward).normalize();
            const newUp = forward.cross(right);

            return new Matrix4( // Transposed rotation!
                right.x, newUp.x, forward.x, 0,
                right.y, newUp.y, forward.y, 0,
                right.z, newUp.z, forward.z, 0,
                -right.dot(position), -newUp.dot(position), -forward.dot(position), 1);
        };

        this.projection = (fov, aspect, zNear, zFar) => {
            const tanHalfFov = Math.tan(this.degToRad((fov * 0.5)));
            const fovY = 1 / tanHalfFov; // cot(fov/2)
            const fovX = fovY / aspect; // cot(fov/2) / aspect
            return Matrix4(
                fovX, 0, 0, 0,
                0, fovY, 0, 0,
                0, 0, zFar / (zFar - zNear), 1,
                0, 0, 0, 0);
        };

        this.ortho = (left, right, bottom, top, zNear, zFar)=>{
            const _11 = 2 / (right - left);
            const _22 = 2 / (top - bottom);
            const _33 = 1 / (zFar - zNear);
            const _41 = (left + right) / (left - right);
            const _42 = (top + bottom) / (bottom - top);
            const _43 = (zNear) / (zNear - zFar);

            return new Matrix4(
                _11, 0, 0, 0,
                0, _22, 0, 0,
                0, 0, _33, 0,
                _41, _42, _43, 1
            );
        };
    }

    get _11(){return this.__11;}
    set _11(val){this.__11 = val;}
    get _12(){return this.__12;}
    set _12(val){this.__12 = val;}
    get _13(){return this.__13;}
    set _13(val){this.__13 = val;}
    get _14(){return this.__14;}
    set _14(val){this.__14 = val;}
    get _21(){return this.__21;}
    set _21(val){this.__21 = val;}
    get _22(){return this.__22;}
    set _22(val){this.__22 = val;}
    get _23(){return this.__23;}
    set _23(val){this.__23 = val;}
    get _24(){return this.__24;}
    set _24(val){this.__24 = val;}
    get _31(){return this.__31;}
    set _31(val){this.__31 = val;}
    get _32(){return this.__32;}
    set _32(val){this.__32 = val;}
    get _33(){return this.__33;}
    set _33(val){this.__33 = val;}
    get _34(){return this.__34;}
    set _34(val){this.__34 = val;}

    get _41(){return this.__41;}
    set _41(val){this.__41 = val;}
    get _42(){return this.__42;}
    set _42(val){this.__42 = val;}
    get _43(){return this.__43;}
    set _43(val){this.__43 = val;}
    get _44(){return this.__44;}
    set _44(val){this.__44 = val;}

    getTranslation(){
        return new Vector3(this._41, this._42, this._43);
    }

    getScale(){
        return new Vector3(this._11, this._22, this._33);
    }


    inverse(){
        const det
            = this._11 * this._22 * this._33 * this._44 + this._11 * this._23 * this._34 * this._42 + this._11 * this._24 * this._32 * this._43
            + this._12 * this._21 * this._34 * this._43 + this._12 * this._23 * this._31 * this._44 + this._12 * this._24 * this._33 * this._41
            + this._13 * this._21 * this._32 * this._44 + this._13 * this._22 * this._34 * this._41 + this._13 * this._24 * this._31 * this._42
            + this._14 * this._21 * this._33 * this._42 + this._14 * this._22 * this._31 * this._43 + this._14 * this._23 * this._32 * this._41
            - this._11 * this._22 * this._34 * this._43 - this._11 * this._23 * this._32 * this._44 - this._11 * this._24 * this._33 * this._42
            - this._12 * this._21 * this._33 * this._44 - this._12 * this._23 * this._34 * this._41 - this._12 * this._24 * this._31 * this._43
            - this._13 * this._21 * this._34 * this._42 - this._13 * this._22 * this._31 * this._44 - this._13 * this._24 * this._32 * this._41
            - this._14 * this._21 * this._32 * this._43 - this._14 * this._22 * this._33 * this._41 - this._14 * this._23 * this._31 * this._42;



        // const deviation = 1 / 100000;
        // if (Math.abs(det) > deviation) {
        if (+det.toFixed(10) === 0) {
            return new Matrix4()
        }

        const i_det = 1 / det;

        const result = [];
        result.push((this._22 * this._33 * this._44 + this._23 * this._34 * this._42 + this._24 * this._32 * this._43 - this._22 * this._34 * this._43 - this._23 * this._32 * this._44 - this._24 * this._33 * this._42) * i_det)
        result.push((this._12 * this._34 * this._43 + this._13 * this._32 * this._44 + this._14 * this._33 * this._42 - this._12 * this._33 * this._44 - this._13 * this._34 * this._42 - this._14 * this._32 * this._43) * i_det)
        result.push((this._12 * this._23 * this._44 + this._13 * this._24 * this._42 + this._14 * this._22 * this._43 - this._12 * this._24 * this._43 - this._13 * this._22 * this._44 - this._14 * this._23 * this._42) * i_det)
        result.push((this._12 * this._24 * this._33 + this._13 * this._22 * this._34 + this._14 * this._23 * this._32 - this._12 * this._23 * this._34 - this._13 * this._24 * this._32 - this._14 * this._22 * this._33) * i_det)
        result.push((this._21 * this._34 * this._43 + this._23 * this._31 * this._44 + this._24 * this._33 * this._41 - this._21 * this._33 * this._44 - this._23 * this._34 * this._41 - this._24 * this._31 * this._43) * i_det)
        result.push((this._11 * this._33 * this._44 + this._13 * this._34 * this._41 + this._14 * this._31 * this._43 - this._11 * this._34 * this._43 - this._13 * this._31 * this._44 - this._14 * this._33 * this._41) * i_det)
        result.push((this._11 * this._24 * this._43 + this._13 * this._21 * this._44 + this._14 * this._23 * this._41 - this._11 * this._23 * this._44 - this._13 * this._24 * this._41 - this._14 * this._21 * this._43) * i_det)
        result.push((this._11 * this._23 * this._34 + this._13 * this._24 * this._31 + this._14 * this._21 * this._33 - this._11 * this._24 * this._33 - this._13 * this._21 * this._34 - this._14 * this._23 * this._31) * i_det)
        result.push((this._21 * this._32 * this._44 + this._22 * this._34 * this._41 + this._24 * this._31 * this._42 - this._21 * this._34 * this._42 - this._22 * this._31 * this._44 - this._24 * this._32 * this._41) * i_det)
        result.push((this._11 * this._34 * this._42 + this._12 * this._31 * this._44 + this._14 * this._32 * this._41 - this._11 * this._32 * this._44 - this._12 * this._34 * this._41 - this._14 * this._31 * this._42) * i_det)
        result.push((this._11 * this._22 * this._44 + this._12 * this._24 * this._41 + this._14 * this._21 * this._42 - this._11 * this._24 * this._42 - this._12 * this._21 * this._44 - this._14 * this._22 * this._41) * i_det)
        result.push((this._11 * this._24 * this._32 + this._12 * this._21 * this._34 + this._14 * this._22 * this._31 - this._11 * this._22 * this._34 - this._12 * this._24 * this._31 - this._14 * this._21 * this._32) * i_det)
        result.push((this._21 * this._33 * this._42 + this._22 * this._31 * this._43 + this._23 * this._32 * this._41 - this._21 * this._32 * this._43 - this._22 * this._33 * this._41 - this._23 * this._31 * this._42) * i_det)
        result.push((this._11 * this._32 * this._43 + this._12 * this._33 * this._41 + this._13 * this._31 * this._42 - this._11 * this._33 * this._42 - this._12 * this._31 * this._43 - this._13 * this._32 * this._41) * i_det)
        result.push((this._11 * this._23 * this._42 + this._12 * this._21 * this._43 + this._13 * this._22 * this._41 - this._11 * this._22 * this._43 - this._12 * this._23 * this._41 - this._13 * this._21 * this._42) * i_det)
        result.push((this._11 * this._22 * this._33 + this._12 * this._23 * this._31 + this._13 * this._21 * this._32 - this._11 * this._23 * this._32 - this._12 * this._21 * this._33 - this._13 * this._22 * this._31) * i_det)

        /*if (result * m != mat4()) {
            std::cout << "ERROR! Expecting matrix x inverse to equal identity!\n";
        }*/

        return new Matrix4(...result);
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
        return new Matrix4(
            t * (x * x) + c, t * x * y + s * z, t * x * z - s * y, 0,
            t * x * y - s * z, t * (y * y) + c, t * y * z + s * x, 0,
            t * x * z + s * y, t * y * z - s * x, t * (z * z) + c, 0,
            0, 0, 0, 1
        )
    }

    multiplyPoint(v){
        let x =
            v.x * this._11 + v.y * this._21 +
            v.z * this._31 + 1  * this._41;
        let y =
            v.x * this._12 + v.y * this._22 +
            v.z * this._32 + 1  * this._42;
        let z =
            v.x * this._13 + v.y * this._23 +
            v.z * this._33 + 1  * this._43;
        return new Vector3(x, y, z);
    }

    multiplyVector(v){
        let x = v.x * this._11 + v.y * this._21 +
            v.z * this._31 + 0  * this._41;
        let y = v.x * this._12 + v.y * this._22 +
            v.z * this._32 + 0  * this._42;
        let z = v.x * this._13 + v.y * this._23 +
            v.z * this._33 + 0  * this._43;
        return new Vector3(x, y, z);
    }


}
