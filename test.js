const test = require('tape')
const tapSpec = require('tap-spec')

const FunctorFilterIterable = require('./')

const array = Object.freeze([1, 2, 3, 4, 5])
const string = 'abcd'
const double = e => e + e
const half = e => e / 2

test('constructor', function (t) {
    t.test('empty array', function (st) {
        const iterable = new FunctorFilterIterable([])
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty array', function (st) {
        const iterable = new FunctorFilterIterable(array, {})
        st.deepEqual([...iterable], array,
            'must return an iterable with the same values')
        st.end()
    })

    t.test('empty string', function (st) {
        const iterable = new FunctorFilterIterable('')
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty typed array', function (st) {
        const iterable = new FunctorFilterIterable(new Int8Array(array))
        st.deepEqual([...iterable], array,
            'must return an iterable with the same values')
        st.end()
    })
    t.end()
})

test('map', function (t) {
    t.test('empty array', function (st) {
        const iterable = new FunctorFilterIterable([]).map(double)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('non-empty string', function (st) {
        const iterable = new FunctorFilterIterable(string).map(double)
        const expected = [...string].map(double)
        st.deepEqual([...iterable], expected,
            'must return a new iterable with transformed values')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new FunctorFilterIterable(array)
            .map(double)
            .map(half)
        st.deepEqual([...iterable], array,
            'must be possible chain map method')
        st.end()
    })

    t.test('chaining composition rule', function (st) {
        const first = new FunctorFilterIterable(array)
            .map(double)
            .map(double)
        const second = new FunctorFilterIterable(array)
            .map(e => double(double(e)))
        st.deepEqual([...first], [...second],
            'composition rule for map must work')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new FunctorFilterIterable(array)
            .map(double)
        const first = intermediate.map(double)
        const second = intermediate.map(half)
        const firstExpected = array.map(double).map(double)
        const secondExpected = array.map(double).map(half)
        st.deepEqual([...first], firstExpected,
            'first result must be correct')
        st.deepEqual([...second], secondExpected,
            'second result must be correct')
        st.end()
    })
    t.end()
})

test('filter', function (t) {
    t.test('empty array', function (st) {
        const iterable = new FunctorFilterIterable([])
            .filter(() => true)
        st.deepEqual([...iterable], [],
            'must return an empty iterable')
        st.end()
    })
    t.test('filter some values', function (st) {
        const iterable = new FunctorFilterIterable(array)
            .filter(e => e % 2 === 0)
        const expected = array
            .filter(e => e % 2 === 0)
        st.deepEqual([...iterable], expected,
            'must filter the values that predicate returns true')
        st.end()
    })
    t.test('filter all', function (st) {
        const iterable = new FunctorFilterIterable(array)
            .filter(e => e <= 5)
        st.deepEqual([...iterable], array,
            'must filter all of values')
        st.end()
    })
    t.test('filter any', function (st) {
        const iterable = new FunctorFilterIterable(array)
            .filter(e => e > 5)
        st.deepEqual([...iterable], [],
            'must not filter any value')
        st.end()
    })
    t.test('chaining', function (st) {
        const iterable = new FunctorFilterIterable(array) // (1 2 3 4 5)
            .filter(e => e !== 3) // (1 2 4 5)
            .filter(e => e !== 4) // (1 2 5)
            .filter(e => e >= 2) // (2 5)
        st.deepEqual([...iterable], [2, 5],
            'must behave like Array#filter')
        st.end()
    })

    t.test('using intermediate iterables', function (st) {
        const intermediate = new FunctorFilterIterable(array)
            .filter(e => e !== 3) // (1 2 4 5)
        const first = intermediate
            .filter(e => e <= 4) // (1 2 4)
        const second = intermediate
            .filter(e => e > 2) // (4 5)
        st.deepEqual([...first], [1, 2, 4],
            'first result must be correct')
        st.deepEqual([...second], [4, 5],
            'second result must be correct')
        st.end()
    })
    t.end()
})

test.createStream()
    .pipe(tapSpec())
    .pipe(process.stdout)
