export default function(x) {
    return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
}

export function shuffle(array) {
    var m = array.length,
        t,
        i;

    while (m) {
        i = Math.random() * m-- | 0;
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}