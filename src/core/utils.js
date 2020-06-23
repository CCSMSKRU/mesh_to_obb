export function capitalize(string) {
    if (typeof string !== 'string') return ''
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function range(start, end) {
    const min = Math.min(+start, +end)
    return new Array(Math.abs(+end - +start) + 1)
        .fill('')
        .map((_, index) => min + index)
}
