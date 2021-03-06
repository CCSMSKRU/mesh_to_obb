/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */


import {createButton, createInput, createItems, createSwitch} from '@core/template.functions'
import {v4} from 'uuid'

export function createOptions(data = {}, options = {}) {
    const dataId = options.id || data.id || v4()

    const opacity = typeof options.opacity !== 'undefined' ? options.opacity : 1

    const model = data.model
    const topModel = model? data.model.getTopModel() : null



    const blocks = {
        selected: {
            isSelected: !!data.model,
            options: {
                datas: [
                    'data-type="option_input"',
                    'data-category="selected"',
                ],
                inputDesignType:'mdl-textfield--floating-label',
                prefix: 'selected_'
            },
            items: [
                {
                    name: 'name',
                    title: 'Name',
                    value: model ? model.name : '',
                    func: createInput
                },
                {
                    name: 'alias',
                    title: 'Alias',
                    value: topModel ? topModel.alias : '',
                    func: createInput
                },
            ],
            isSupport: {
                func: createSwitch,
                options: {
                    datas: [
                        'data-type="option_switch"',
                        'data-category="supportPlatformRamp"',
                    ],
                },
                items: [
                    {
                        name: 'isSupport',
                        title: 'isSupport',
                        checked: model ? model.isSupport : ''
                    }
                ],
            },
            isPlatform: {
                func: createSwitch,
                options: {
                    datas: [
                        'data-type="option_switch"',
                        'data-category="supportPlatformRamp"',
                    ],
                },
                items: [
                    {
                        name: 'isPlatform',
                        title: 'isPlatform',
                        checked: model ? model.isPlatform : ''
                    }
                ],
            },
            isRamp: {
                func: createSwitch,
                options: {
                    datas: [
                        'data-type="option_switch"',
                        'data-category="supportPlatformRamp"',
                    ],
                },
                items: [
                    {
                        name: 'isRamp',
                        title: 'isRamp',
                        checked: model ? model.isRamp : ''
                    },
                    {
                        name: 'isSteepRamp',
                        title: 'isSteepRamp',
                        checked: model ? model.isSteepRamp : ''
                    },
                ],
            },
            buttons: {
                func: createButton,
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
                        title: 'Add child',
                        // width:40
                    },
                    {
                        name: 'remove',
                        icon: 'delete',
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
                inputDesignType:'mdl-textfield--floating-label',
                prefix: 'defaultSteps_'
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
                    icon: 'done',
                    datas: [
                        'data-type="option_button"',
                        'data-category="defaultSteps"',
                    ],
                    func: createButton
                }
            ]
        },
        boxContainer: {
            position: {
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxContainerPosition"',
                    ],
                    inputDesignType:'mdl-textfield--floating-label',
                    prefix: 'boxContainerPosition_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model ? model.position.x : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model ? model.position.y : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model ? model.position.z : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    }
                ]
            },
            rotation: {
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxContainerRotation"',
                    ],
                    inputDesignType:'mdl-textfield--floating-label',
                    prefix: 'boxContainerRotation_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model ? model.rotation.x : 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model ? model.rotation.y : 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model ? model.rotation.z : 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    }
                ]
            },

        },
        box: {
            position: {
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxPosition"',
                    ],
                    inputDesignType:'mdl-textfield--floating-label',
                    prefix: 'boxPosition_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model ? model.content.position.x : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model ? model.content.position.y : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model ? model.content.position.z : 0,
                        type: 'number',
                        step: options.defaultSteps.position
                    }
                ]
            },
            size: {
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxSize"',
                    ],
                    inputDesignType:'mdl-textfield--floating-label',
                    prefix: 'boxSize_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: model ? model.content.size.x : 0,
                        type: 'number',
                        step: options.defaultSteps.size
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: model ? model.content.size.y : 0,
                        type: 'number',
                        step: options.defaultSteps.size
                    },
                    {
                        name: 'autoY',
                        icon: 'flip_to_back',
                        datas: [
                            'data-type="option_button"',
                            'data-category="boxSize"',
                        ],
                        func: createButton
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: model ? model.content.size.z : 0,
                        type: 'number',
                        step: options.defaultSteps.size
                    },
                    {
                        name: 'autoZ',
                        icon: 'flip_to_back',
                        datas: [
                            'data-type="option_button"',
                            'data-category="boxSize"',
                        ],
                        func: createButton
                    }
                ]
            },
            rotation: {
                func: createInput,
                options: {
                    datas: [
                        'data-type="option_input"',
                        'data-category="boxRotation"',
                    ],
                    inputDesignType:'mdl-textfield--floating-label',
                    prefix: 'boxRotation_'
                },
                items: [
                    {
                        name: 'x',
                        title: 'X',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    },
                    {
                        name: 'y',
                        title: 'Y',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    },
                    {
                        name: 'z',
                        title: 'Z',
                        width: 50,
                        value: 0,
                        type: 'number',
                        step: options.defaultSteps.rotation
                    }
                ]
            },

        },
        addWheelAxle: {
            func: createButton,
            options: {
                datas: [
                    'data-type="option_button"',
                    'data-category="wheelAxleAdd"',
                ],
                prefix: 'wheelAxleAdd_'
            },
            items: [
                {
                    name: 'add',
                    icon: 'add'
                }
            ]
        },
        // wheels: ,
    }

    // Add wheels (supportPoints)
    const wheelAxles = topModel
        ? topModel._wheelAxles || []
        : []

    const wheelAxlesBoxes = wheelAxles.map((one, index)=>{
        const box = {
            func: createInput,
            options: {
                datas: [
                    `data-id_=${one.id}`,
                    'data-type="option_input"',
                    `data-category="wheelAxle"`,
                ],
                inputDesignType:'mdl-textfield--floating-label',
                prefix: `wheelAxle_`
            },
            items: [
                {
                    name: 'x',
                    title: 'X',
                    width: 50,
                    value: one.x || 0,
                    type: 'number',
                    min: -100000,
                    max: 100000,
                    step: 10
                },
                {
                    name: 'y',
                    title: 'Y',
                    width: 50,
                    value: one.y || 0,
                    type: 'number',
                    min: -100000,
                    max: 100000,
                    step: 10
                },
                {
                    name: 'width',
                    title: 'Width',
                    width: 50,
                    value: one.width || (topModel? topModel.content.size.z : 1000),
                    type: 'number',
                    min: 1,
                    max: 100000,
                    step: 10
                },
                {
                    name: 'radius',
                    title: 'Radius',
                    width: 50,
                    value: one.radius || 10,
                    type: 'number',
                    min: 1,
                    max: 100000,
                    step: 10
                },
                {
                    name: 'remove',
                    icon: 'delete',
                    datas: [
                        `data-id_=${one.id}`,
                        'data-type="option_button"',
                        `data-category="wheelAxleRemove"`,
                    ],
                    func: createButton
                }
            ]
        }
        return box
    })



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
                    <div class="flex between">
                        ${createItems(blocks.selected.isSupport)}
                    </div>
                    <div class="flex between">
                        ${createItems(blocks.selected.isPlatform)}
                    </div>
                    <div class="flex between">
                        ${createItems(blocks.selected.isRamp)}
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
            <div class="options__box wheel_axles">
                <h5>Wheel axles</h5>
                ${
        wheelAxlesBoxes.map((one, index) => {
            return `
                <div class="flex between" data-type='wheelAxleContainer' data-id="${one.id || index}">
                    <div class="label"><b>${index}:</b></div>
                    ${createItems(one)}
                </div>`
        })
        }
                <div class="flex between">
                    ${createItems(blocks.addWheelAxle)}
                </div>
            </div>
            
            
        </div>
        `
}
