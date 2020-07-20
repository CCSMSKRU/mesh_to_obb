/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {v4} from 'uuid'

const patternsForType = {
    text: '.*',
    float: '-?[0-9]*(\\.[0-9]+)?',
    number: '-?[0-9]*',
}

const errorMessagesForType = {
    text: 'Something is wrong',
    float: 'Input is not a float',
    number: 'Input is not a number',
}

export function createInput(item = {}, options = {}) {
    const name = item.name || ''
    const prefix = options.prefix || v4()
    const id = item.id ? prefix + item.id : prefix + name
    const title = item.title || ''
    const width = item.width || options.width
    const type = item.type || 'text'
    const attributes = item.attributes || []
    const datas = item.datas || options.datas || []
    const value = typeof item.value !== 'undefined'
        ? item.value
        : (typeof options.defaultValue !== 'undefined'? options.defaultValue : null)

    const pattern = item.pattern || patternsForType[type] || ''
    const errorText = item.errorText || errorMessagesForType[type] || ''

    const min = item.min
    const max = item.max
    const step = item.step
    const designType = options.inputDesignType || item.designType || ''
    // mdl-textfield--floating-label

    return `<div class="mdl-textfield mdl-js-textfield ${designType}" data-needUpgrade="1" style="${width ? 'width:' + width + 'px; min-width: initial;' : ''}">
                <input class="mdl-textfield__input" 
                    type="${type}" 
                    pattern="${pattern}" 
                    id="${id}"
                    data-name="${name}"
                    ${datas.join(' ')}
                    ${attributes.join(' ')}
                    ${value !== null ? 'value="' + value + '"' : ''}
                    ${typeof min !== 'undefined' ? 'min="' + min + '"' : ''}
                    ${typeof max !== 'undefined' ? 'max="' + max + '"' : ''}
                    ${typeof step !== 'undefined' ? 'step="' + step + '"' : ''}
                >
                <label class="mdl-textfield__label" for="${id}">${title}</label>
                <span class="mdl-textfield__error">${errorText}</span>
              </div>`
}

export function createButton(item = {}, options = {}) {
    const name = item.name || ''
    const icon = item.icon || ''
    const title = item.title || ''
    const width = item.width || options.width
    const datas = item.datas || options.datas || []
    const hint = item.hint

    const icon_html = icon
        ? `<i class="material-icons" ${datas.join(' ')} data-name="${name}">${icon}</i>` : ``
    const btn_type = options.designType || icon? ' mdl-button--icon' : ' mdl-button--raised'
    const btn_colored = options.btnColored? ' mdl-button--colored' : ''
    // mdl-button mdl-js-button mdl-button--raised mdl-button--colored
    return `<div class="mdl-button mdl-js-button${btn_type}${btn_colored}" 
                ${datas.join(' ')}
                data-name="${name}"
                style="${width ? 'width:' + width + 'px; min-width: initial;' : ''}"
                ${hint? 'title="' + hint + '"' : ''}
            >${title}${icon_html}
                
            </div>`
}

export function createSwitch(item = {}, options = {}) {

    const prefix = options.prefix || v4()
    const name = item.name || ''
    const id = item.id ? prefix + item.id : prefix + name
    const title = item.title || ''
    const width = item.width || options.width
    const datas = item.datas || options.datas || []
    const attributes = item.attributes || []
    const checked = item.checked ? 'checked' : ''


    return `<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" data-needUpgrade="1" for="${id}" ${datas.join(' ')} data-name="${name}">
              <input 
                type="checkbox" 
                id="${id}"
                data-name="${name}"
                ${datas.join(' ')}
                ${attributes.join(' ')}
                class="mdl-switch__input" ${checked} ${datas.join(' ')} 
                
                >
              <span class="mdl-switch__label">${title}</span>
            </label>`
}


export function createItems(block) {
    return block.items.map((one, index) => {
        one.index = index
        const func = typeof one.func === 'function' ? one.func : block.func
        return func(one, block.options)
    }).join('')
}
