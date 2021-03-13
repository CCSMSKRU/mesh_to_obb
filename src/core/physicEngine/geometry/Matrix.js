import {cache} from '@core/physicEngine/geometry/matrix.cache'

// let cache;

export class Matrix {
    constructor(elems = [], rowCount = 2, colCount = 2) {
        if (!Array.isArray(elems)) elems = []
        this._rowCount = rowCount
        this._colCount = colCount
        // this.asArray = [];

        this[0] = null
        this[2] = null
        this[3] = null
        this[4] = null

        for (let row = 0; row < this._rowCount; row++) {

            const arr = []
            for (let col = 0; col < this._colCount; col++) {
                const elem = elems.length
                    // ? Math.round(elems.shift() * 100000)/100000
                    ? Math.round(elems.shift() * 100000)/100000
                    : (row === col) ? 1 : 0
                arr.push(elem)
            }

            this[row] = arr
        }


        // for (let i = 0; i < this._rowCount * this._colCount; i++) {
        //     const row = Math.floor(i / this._colCount)
        //     const col = i % this._colCount
        //
        //     var elem = (elems.length) ? elems.shift() : (() => {
        //         return (row === col) ? 1 : 0
        //     })()
        //     if (!this[row]) this[row] = []
        //     this[row].push(elem)
        //     // this.asArray.push(elem);
        //     // var alias = '__' + String(row + 1) + String(col + 1)
        //     // this[alias] = elem
        // }
        this.newMatrix = (arr, colCount, rowCount) => {
            return new Matrix(arr, colCount, rowCount)
        }
        this.degToRad = (deg) => {
            return deg / 180 * Math.PI
        }
        this.radToDeg = (rad) => {
            return rad / Math.PI * 180
        }
    }

    get _11() {
        return this[0][0]
    }

    set _11(val) {
        this[0][0] = val
    }

    get _12() {
        return this[0][1]
    }

    set _12(val) {
        this[0][1] = val
    }

    get _13() {
        return this[0][2]
    }

    set _13(val) {
        this[0][2] = val
    }

    get _14() {
        return this[0][3]
    }

    set _14(val) {
        this[0][3] = val
    }

    get _21() {
        return this[1][0]
    }

    set _21(val) {
        this[1][0] = val
    }

    get _22() {
        return this[1][1]
    }

    set _22(val) {
        this[1][1] = val
    }

    get _23() {
        return this[1][2]
    }

    set _23(val) {
        this[1][2] = val
    }

    get _24() {
        return this[1][3]
    }

    set _24(val) {
        this[1][3] = val
    }

    get _31() {
        return this[2][0]
    }

    set _31(val) {
        this[2][0] = val
    }

    get _32() {
        return this[2][1]
    }

    set _32(val) {
        this[2][1] = val
    }

    get _33() {
        return this[2][2]
    }

    set _33(val) {
        this[2][2] = val
    }

    get _34() {
        return this[2][3]
    }

    set _34(val) {
        this[2][3] = val
    }

    get _41() {
        return this[3][0]
    }

    set _41(val) {
        this[3][0] = val
    }

    get _42() {
        return this[3][1]
    }

    set _42(val) {
        this[3][1] = val
    }

    get _43() {
        return this[3][2]
    }

    set _43(val) {
        this[3][2] = val
    }

    get _44() {
        return this[3][3]
    }

    set _44(val) {
        this[3][3] = val
    }

    get rowCount() {
        return this._rowCount
    }

    get colCount() {
        return this._colCount
    }

    // get asArray() {
    //     var arr = []
    //
    //     for (let i = 0; i < this._rowCount; i++) {
    //         arr = [...arr, ...this[i]]
    //     }
    //     return arr
    // }

    get asArray() {
        const arr = []
        for (let i = 0; i < this._rowCount; i++) {
            for (let c = 0; c < this._colCount; c++) {
                arr.push(this[i][c])
            }
        }
        return arr
    }



    transpose() {
        let arr = []
        for (let i = 0; i < this.rowCount * this.colCount; i++) {
            const row = Math.floor(i / this.rowCount)
            const col = i % this.rowCount
            arr[i] = this.asArray[this.colCount * col + row]
        }
        return this.newMatrix(arr, this.colCount, this.rowCount) // После транспонирования столбци и строки меняются местами
    }

    multiplyS(scalar) {
        var arr = this.asArray.map(one => one * scalar)
        return this.newMatrix(arr, this.rowCount, this.colCount)
    }

    multiply(m) {
        let alias
        if (cache) {
            alias = cache.alias([...this.asArray, ...m.asArray], 'multiply')
            const res = cache.get(alias)
            if (res) return res
        }
        if (this.colCount !== m.rowCount) {
            console.error('One', this, 'Two', m)
            throw 'Матрицы не могут быть перемножены, так как имеют разную размерность'
        }
        var arr = []
        for (let i = 0; i < this.rowCount; ++i) {
            for (let j = 0; j < m.colCount; ++j) {
                arr[m.colCount * i + j] = 0
                for (let k = 0; k < m.rowCount; ++k) {
                    let a = this.colCount * i + k
                    let b = m.colCount * k + j
                    arr[m.colCount * i + j] += this.asArray[a] * m.asArray[b]
                }
            }
        }
        const res = this.newMatrix(arr, this.rowCount, m.colCount)
        if (cache) {
            cache.set(alias, res)
        }
        return res
    }

    determinant2() {
        return this[0][0] * this[1][1] - this[0][1] * this[1][0]
    }

    cut(row, col) {
        var arr = []
        for (let i = 0; i < this.rowCount; ++i) {
            for (let j = 0; j < this.colCount; ++j) {
                if (i === row || j === col) {
                    continue
                }
                arr.push(this[i][j])
            }
        }
        return this.newMatrix(arr, this.rowCount - 1, this.colCount - 1)
    }

    minor2() {
        var arr = [this._22, this._21, this._12, this._11]
        return this.newMatrix(arr, 2, 2)
    }

    minor() {
        if (this.rowCount === 2) return this.minor2()

        var arr = []
        for (let i = 0; i < this.rowCount; ++i) {
            for (let j = 0; j < this.colCount; ++j) {
                // const cuted = this.cut(i,j);
                // const determinated = (this.rowCount === 3)? cuted.determinant2() : cuted.determinant();

                arr.push(this.cut(i, j).determinant())
            }
        }

        return this.newMatrix(arr, this.rowCount, this.colCount)
    }

    cofactor() {
        var arr = []
        for (let i = 0; i < this.rowCount; ++i) {
            for (let j = 0; j < this.colCount; ++j) {
                let t = this.colCount * j + i // Target index
                let s = this.colCount * j + i // Source index
                const sign = Math.pow(-1, i + j) // + or –
                arr[t] = this.minor().asArray[s] * sign
            }
        }
        return this.newMatrix(arr, this.rowCount, this.colCount)
    }

    determinant() {
        // if (this.rowCount === 2) return this.determinant2();
        let res = 0
        const cofactor = this.cofactor()
        for (let j = 0; j < this.colCount; ++j) {
            // let index = this.colCount * 0 + j;
            // res += this.asArray[index] * cofactor[0][j];

            res += this.asArray[j] * cofactor[0][j]
        }
        return res
    }

    adjugate() {
        return this.cofactor().transpose()
    }

    inverse() {
        const det = this.determinant()
        // const deviation = 1 / 1000;
        // if (Math.abs(det) > deviation) {
        if (+det.toFixed(10) === 0) {
            return this.newMatrix(null, this.rowCount, this.colCount)
        }
        return this.adjugate().multiplyS(1 / det)
    }

    /*------------------------------------*/


}




















