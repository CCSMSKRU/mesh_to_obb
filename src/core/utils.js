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

export function download(content, fileName, contentType) {
    var a = document.createElement("a")
    var file = new Blob([content], {type: contentType})
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
}

export function copyToClipboard(str) {
    const el = document.createElement('textarea')
    el.value = str
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
}
