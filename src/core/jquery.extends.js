/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import jquery from "jquery";
export const $ = jquery

$.create = (tagName, classes = '') => {
    const el = document.createElement(tagName)
    if (classes) {
        el.classList.add(classes)
    }
    // el.textPrototype = el.text
    // el.text = (text) => {
    //     if (typeof text !== 'undefined') {
    //         if (el[0].tagName.toLowerCase() === 'input') {
    //             el.val(text)
    //             return this
    //         }
    //         el.textPrototype(text)
    //         return this
    //     }
    //     if (el.tagName.toLowerCase() === 'input') {
    //         return el.val()
    //     }
    //     return el.textPrototype()
    // }

    return $(el)
}

