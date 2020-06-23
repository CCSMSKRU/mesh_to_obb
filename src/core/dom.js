class Dom {
    constructor(selector) {
        this.$el = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector
    }

    isDom(){
        return this instanceof Dom
    }

    getContext(str){
        return this.$el.getContext(str)
    }
    html(html) {
        if (typeof html === 'string') {
            this.$el.innerHTML = html
            return this
        }
        return this.$el.outerHTML.trim()
    }

    text(text) {
        if (typeof text !== 'undefined') {
            if (this.$el.tagName.toLowerCase() === 'input') {
                this.$el.value = text
                return this
            }
            this.$el.textContent = text
            return this
        }
        if (this.$el.tagName.toLowerCase() === 'input') {
            return this.$el.value.trim()
        }
        return this.$el.textContent.trim()
    }

    get data() {
        return this.$el.dataset
    }

    get id() {
        return this.data.id
    }

    on(eventType, cb) {
        this.$el.addEventListener(eventType, cb)
        return this
    }

    off(eventType, cb) {
        this.$el.removeEventListener(eventType, cb)
        return this
    }

    clear() {
        this.html('')
        return this
    }

    append(node) {
        if (node instanceof Dom) {
            node = node.$el
        }
        if (Element.prototype.append) {
            this.$el.append(node)
        } else {
            this.$el.appendChild(node)
        }
        return this
    }

    appendChild(node) {
        if (node instanceof Dom) {
            node = node.$el
        }
        this.$el.appendChild(node)
        return this
    }

    closest(selector) {
        return $(this.$el.closest(selector))
    }

    getCoors() {
        return this.$el.getBoundingClientRect()
    }

    find(selector) {
        const el = this.$el.querySelector(selector)
        return el ? $(el) : null
    }

    findAll(selector) {
        return this.$el.querySelectorAll(selector)
    }

    attr(attributes = {}) {
        Object.keys(attributes).forEach(key => this.$el.setAttribute(key, attributes[key]))
        // return this.$el.style
        return this
    }
    css(styles = {}) {
        Object.keys(styles).forEach(key => this.$el.style[key] = styles[key])
        // return this.$el.style
        return this
    }

    focus() {
        this.$el.focus()
        return this
    }

    addClass(classes) {
        if (classes) {
            this.$el.classList.add(classes)
        }
        return this
    }

    removeClass(classes) {
        if (classes) {
            this.$el.classList.remove(classes)
        }
        return this
    }

}

export function $(selector) {
    return new Dom(selector)
}

$.create = (tagName, classes = '') => {
    const el = document.createElement(tagName)
    if (classes) {
        el.classList.add(classes)
    }
    return $(el)
}

