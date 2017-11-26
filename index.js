/*eslint max-depth: ["error", 5]*/

const InmutableArray = require('array-inmutable')

function FunctorFilterArrayLikeIterable (iterable) {
    this.iterable = iterable
    this.fs = new InmutableArray([])
    this.parts = []
    this.index = 0
}

function methodGenerator (methodName) {
    return function (f) {
        const obj = Object.create(this.constructor.prototype)
        const parts = this.parts
        obj.fs = this.fs.push(f)
        obj.iterable = this.iterable
        obj.index = this.index + 1
        const last = parts[parts.length - 1] || {}
        if (last.type === methodName) {
            obj.parts = this.parts.slice(0, -1)
            obj.parts.push({
                start: last.start,
                end: obj.index,
                type: methodName
            })
        } else {
            obj.parts = parts.concat([{
                start: this.index,
                end: obj.index,
                type: methodName
            }])
        }
        return obj
    }
}

Object.defineProperties(FunctorFilterArrayLikeIterable.prototype, {
    map: {
        value: methodGenerator('map')
    },
    filter: {
        value: methodGenerator('filter')
    },
    [Symbol.iterator]: {
        * value () {
            const fs = this.fs
            const parts = this.parts
            const iterable = this.iterable
            const length = iterable.length
            for (let i = 0; i < length; ++i) {
                let val = iterable[i]
                let doYield = true
                for (let j = 0; j < parts.length; ++j) {
                    const {start, end, type} = parts[j]
                    const array = fs.array
                    if (type === 'map') {
                        for (let k = start; k < end; ++k) {
                            val = array[k](val)
                        }
                    } else if (type === 'filter') {
                        for (let k = start; k < end; ++k) {
                            if (!array[k](val)) {
                                doYield = false
                                break
                            }
                        }
                        if (!doYield) {
                            break
                        }
                    }
                }
                if (doYield) {
                    yield val
                }
            }
        }
    }
})

module.exports = FunctorFilterArrayLikeIterable
