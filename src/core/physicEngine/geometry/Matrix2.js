import {Matrix} from './Matrix'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {Matrix4} from '@core/physicEngine/geometry/Matrix4'

export class Matrix2 extends Matrix {
    constructor(...props) {
        super([...props], 2, 2)

        this.newMatrix = (arr, colCount, rowCount)=>{
            if (colCount !== rowCount) return new Matrix(arr, colCount, rowCount);
            if (colCount === 2) return arr? new Matrix2(...arr) : new Matrix2();
            if (colCount === 3) return arr? new Matrix3(...arr) : new Matrix3();
            if (colCount === 4) return arr? new Matrix4(...arr) : new Matrix4();
            return new Matrix(arr, colCount, rowCount);
        };
    }

    // get _11() {
    //     return this.__11
    // }
    //
    // set _11(val) {
    //     this.__11 = val
    // }
    //
    // get _12() {
    //     return this.__12
    // }
    //
    // set _12(val) {
    //     this.__12 = val
    // }
    //
    // get _21() {
    //     return this.__21
    // }
    //
    // set _21(val) {
    //     this.__21 = val
    // }
    //
    // get _22() {
    //     return this.__22
    // }
    //
    // set _22(val) {
    //     this.__22 = val
    // }


    determinant() {
        return this[0][0] * this[1][1] - this[0][1] * this[1][0]
    }

}
