const InmutableArray = require('array-inmutable')

const apply = (a, f) => f(a)
const matches = a => p => p(a)

function FunctorFilterArrayLikeIterable (iterable) {
    this.iterable = iterable
    this.cs = []
    this.lastIndex = -1
}

function methodGenerator (methodName) {
    return function (f) {
        const obj = Object.create(this.constructor.prototype)
        const lastIndex = this.lastIndex
        const last = this.cs[lastIndex] || {}
        obj.cs = this.cs.concat([])
        if (last.type === methodName) {
            obj.cs[lastIndex].list = last.list.push(f)
        } else {
            ++this.lastIndex
            obj.cs.push({
                type: methodName,
                list: InmutableArray([f])
            })
        }
        obj.iterable = this.iterable
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
            const cs = this.cs
            const iterable = this.iterable
            const length = iterable.length
            for (let i = 0; i < length; ++i) {
                let val = iterable[i]
                let doYield = true
                for (let j = 0; j < cs.length; ++j) {
                    const obj = cs[j]
                    if (obj.type === 'map') {
                        val = obj.list.reduce(apply, val)
                    } else if (obj.type === 'filter' && !obj.list.every(matches(val))) {
                        doYield = false
                        break
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
