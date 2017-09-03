const InmutableArray = require('array-inmutable')

function FunctorFilterArrayLikeIterable (iterable, noValue) {
    this.iterable = iterable
    this.noValue = noValue
    this.cs = InmutableArray([])
}

function map (f) {
    const obj = Object.create(this.constructor.prototype)
    obj.cs = this.cs.push(f)
    obj.iterable = this.iterable
    return obj
}

function filter (p) {
    const obj = Object.create(this.constructor.prototype)
    obj.cs = this.cs.push(val => p(val) ? val : this.noValue)
    obj.iterable = this.iterable
    return obj
}

Object.defineProperties(FunctorFilterArrayLikeIterable.prototype, {
    map: {
        value: map
    },
    filter: {
        value: filter
    },
    [Symbol.iterator]: {
        * value () {
            const cs = this.cs
            const array = cs.array
            const iterable = this.iterable
            const length = iterable.length
            for (let i = 0; i < length; ++i) {
                let val = iterable[i]
                for (let j = 0; j < cs.length; ++j) {
                    val = array[j](val)
                    if (val === this.noValue) {
                        break
                    }
                }
                if (val !== this.noValue) {
                    yield val
                }
            }
        }
    }
})

module.exports = FunctorFilterArrayLikeIterable
