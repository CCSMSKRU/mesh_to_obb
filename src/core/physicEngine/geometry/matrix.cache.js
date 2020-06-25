const stringHash = require("string-hash")

class MatrixCache {
    constructor(props = {}) {
        this._items = []
        this.storeCount = props.storeCount && !isNaN(+props.storeCount) ? props.storeCount : 200
    }

    alias(arr, prefix = 'auto') {
        return stringHash(prefix + arr.join('_-_'))
    }

    get(alias) {
        const res = this._items.filter(one => one.alias === alias)[0]
        return res? res.val : null
    }

    add(alias, val) {
        this._items.push({
            alias,
            val: val
        })
        if (this._items.length > this.storeCount) {
            // this._items = this._items.splice(this._items.length - this.storeCount)

            // const from = this.storeCount / 2
            // this._items = this._items.filter((one, index)=> index > from)

            const arr = []
            const from = Math.round(this.storeCount / 2)
            for (let i = from; i < this._items.length; i++) {
                arr.push(this._items[i])
            }
            this._items = arr
        }
    }

    set(alias, val) {
        return this.add(alias, val)
    }

    clearTimeout() {
        // setTimeout(() => {
            console.log('CLEAR', this._items.length);
            this._items = this._items.splice(this.storeCount)
        // }, 500)
    }
}


export const cache = new MatrixCache()
