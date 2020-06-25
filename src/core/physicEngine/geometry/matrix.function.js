import {Matrix2} from '@core/physicEngine/geometry/Matrix2'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {Matrix4} from '@core/physicEngine/geometry/Matrix4'
import {Matrix} from '@core/physicEngine/geometry/Matrix'

export const newMatrix = (arr, colCount, rowCount)=>{
    if (colCount !== rowCount) return new Matrix(arr, colCount, rowCount);
    if (colCount === 2) return arr? new Matrix2(...arr) : new Matrix2();
            if (colCount === 3) return arr? new Matrix3(...arr) : new Matrix3();
            if (colCount === 4) return arr? new Matrix4(...arr) : new Matrix4();
    return new Matrix(arr, colCount, rowCount);
};
