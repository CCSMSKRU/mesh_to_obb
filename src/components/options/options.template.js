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

function createInput(item = {}, options = {}) {
    const name = item.name || ''
    const prefix = options.prefix || v4()
    const id = item.id ? prefix + item.id : prefix + name
    const title = item.title || ''
    const width = item.width || options.width
    const type = item.type || 'text'
    const datas = item.datas || options.datas || []
    const value = typeof item.value !== 'undefined'
        ? item.value
        : (typeof options.defaultValue? options.defaultValue : null)

    const pattern = item.pattern || patternsForType[type] || ''
    const errorText = item.errorText || errorMessagesForType[type] || ''

    const min = item.min
    const max = item.max
    const step = item.step


    return `<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" data-needUpgrade="1" style="${width ? 'width:' + width + 'px; min-width: initial;' : ''}">
                <input class="mdl-textfield__input" 
                    type="${type}" 
                    pattern="${pattern}" 
                    id="${id}"
                    data-name="${name}"
                    ${datas.join(' ')}
                    ${value !== null ? 'value="' + value + '"' : ''}
                    ${typeof min !== 'undefined' ? 'min="' + min + '"' : ''}
                    ${typeof max !== 'undefined' ? 'max="' + max + '"' : ''}
                    ${typeof step !== 'undefined' ? 'step="' + step + '"' : ''}
                >
                <label class="mdl-textfield__label" for="${id}">${title}</label>
                <span class="mdl-textfield__error">${errorText}</span>
              </div>`
}

function createButton(item = {}, options = {}) {
    const name = item.name || ''
    const icon = item.icon || ''
    const title = item.title || ''
    const width = item.width || options.width
    const datas = item.datas || options.datas || []

    const icon_html = icon
        ? `<i class="material-icons" ${datas.join(' ')} data-name="${name}">${icon}</i>` : ``
    const btn_type = options.designType || icon? ' mdl-button--icon' : ' mdl-button--raised'
    const btn_colored = options.btnColored? ' mdl-button--colored' : ''
                     // mdl-button mdl-js-button mdl-button--raised mdl-button--colored
    return `<div class="mdl-button mdl-js-button${btn_type}${btn_colored}" 
                ${datas.join(' ')}
                data-name="${name}"
                style="${width ? 'width:' + width + 'px; min-width: initial;' : ''}"
                    >${title}${icon_html}</div>`
}

function createSwitch(item = {}, options = {}) {

    const prefix = options.prefix || v4()
    const name = item.name || ''
    const id = item.id ? prefix + item.id : prefix + name
    const title = item.title || ''
    const width = item.width || options.width
    const datas = item.datas || options.datas || []
    const checked = item.checked ? 'checked' : ''


    return `<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${id}" ${datas.join(' ')} data-name="${name}">
              <input type="checkbox" id="${id}" class="mdl-switch__input" ${checked} ${datas.join(' ')} data-name="${name}">
              <span class="mdl-switch__label">${title}</span>
            </label>`
}

function createItems(block){
    return block.items.map((one, index) => {
        one.index = index
        const func = typeof one.func === 'function' ? one.func : block.func
        return func(one, block.options)
    }).join('')
}

export function createOptions(data = {}, options = {}) {
    const dataId = options.id || data.id || v4()

    const opacity = typeof options.opacity !== 'undefined'? options.opacity : 1

    const model = data.model

    const blocks = {
        selected: {
            isSelected: !!data.model,
            options: {
                datas: [
                    'data-type="option_input"',
                    'data-category="selected"',
                ],
                prefix: 'selected_'
            },
            items: [
                {
                    name: 'name',
                    title: 'Name',
                    value: model? model.name : '',
                    func: createInput
                },
            ],
            buttons: {
                func:createButton,
                options: {
                    datas: [
                        'data-type="option_button"',
                        'data-category="selected"',
                    ],
                },
                items: [
                    {
                        name: 'addChild',
                        // icon:'add',
                        title:'Add child',
                        // width:40
                    },
                    {
                        name: 'remove',
                        icon:'delete',
                        // title:'Add child'
                    }
                ],
            }
        },
        defaultSteps: {
            func: createInput,
            options: {
                datas: [
                    'data-type="option_input"',
                    'data-category="defaultSteps"',
                ],
                prefix:'defaultSteps_'
            },
            items: [
                {
                    name: 'size',
                    title: 'Size',
                    width: 50,
                    value: options.defaultSteps.size || 1,
                    type: 'number',
                    min: 1,
                    max: 100000
                },
                {
                    name: 'position',
                    title: 'Position',
                    width: 50,
                    value: options.defaultSteps.position || 1,
                    type: 'number',
                    min: 1,
                    max: 100000
                },
                {
                    name: 'rotation',
                    title: 'Rotation',
                    width: 50,
                    value: options.defaultSteps.rotation || 1,
                    type: 'number',
                    min: 1,
                    max: 90
                },
                {
                    name: 'apply',
                    icon:'done',
                    datas: [
                        'data-type="option_button"',
                        'data-category="defaultSteps"',
                    ],
                    func:createButton
                }
            ]
        },
        boxContainer: {
            position:{
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxContainerPosition"',
                    ],
                    prefix:'boxContainerPosition_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model? model.position.x : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model? model.position.y : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model? model.position.z : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    }
                ]
            },
            rotation:{
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxContainerRotation"',
                    ],
                    prefix:'boxContainerRotation_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model? model.rotation.x : 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model? model.rotation.y : 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model? model.rotation.z : 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    }
                ]
            },

        },
        box: {
            position:{
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxPosition"',
                    ],
                    prefix:'boxPosition_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model? model.content.position.x : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model? model.content.position.y : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model? model.content.position.z : 0,
                        type: 'number',
                        step:options.defaultSteps.position
                    }
                ]
            },
            size:{
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxSize"',
                    ],
                    prefix:'boxSize_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model? model.content.size.x : 0,
                        type: 'number',
                        step:options.defaultSteps.size
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model? model.content.size.y : 0,
                        type: 'number',
                        step:options.defaultSteps.size
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model? model.content.size.z : 0,
                        type: 'number',
                        step:options.defaultSteps.size
                    }
                ]
            },
            rotation:{
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxRotation"',
                    ],
                    prefix:'boxRotation_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step:options.defaultSteps.rotation
                    }
                ]
            },

        }
    }

    if (!blocks.selected.isSelected) {
        return `
        <div class="options-container" data-type="options-container" data-id="options_${dataId}">
            <div class="label">No model selected</div>
        </div>
        `
    }

    return `
        <div class="options-container" data-type="options-container" data-id="options_${dataId}">
            <div class="options__box main_control">
<!--                    <h5>Selected</h5>-->
                    <div class="flex">
                        <div class="label">Name:</div>
                        ${createItems(blocks.selected)}
                    </div>
                     <div class="flex between">
                        ${createItems(blocks.selected.buttons)}
                    </div>
            </div>
            <div class="options__box main_control">
                <h5>Main options</h5>
                <div class="flex">
                    <div class="label">Opacity:</div>
                    <input 
                        class="mdl-slider mdl-js-slider" 
                        data-needUpgrade="1" 
                        type="range" min="0" 
                        max="1" 
                        step="0.1" 
                        value="${opacity}" 
                        tabindex="0"
                        data-type="option_input"
                        data-name="option_opacity"
                    >
                </div>
                <div class="flex between">
                    <div class="label">Default step:</div>
                    ${createItems(blocks.defaultSteps)}
                </div>
            </div>
            <div class="options__box box_container_options">
                <h5>Box container options</h5>
                <div class="flex between">
                    <div class="label">Position:</div>
                    ${createItems(blocks.boxContainer.position)}
                </div>
                <div class="flex between">
                    <div class="label">Rotation:</div>
                    ${createItems(blocks.boxContainer.rotation)}
                </div>
            </div>
            <div class="options__box box_options">
                <h5>Box options</h5>
                <div class="flex between">
                    <div class="label">Position:</div>
                    ${createItems(blocks.box.position)}
                </div>
                <div class="flex between">
                    <div class="label">Size:</div>
                    ${createItems(blocks.box.size)}
                </div>
                <div class="flex between">
                    <div class="label">Rotation:</div>
                    ${createItems(blocks.box.rotation)}
                </div>
            </div>
             
            
        </div>
        `
}
