import {$} from '@core/jquery.extends'
import * as bootbox from 'bootbox'
import {createButton, createItems} from '@core/template.functions'
// import * as THREE from '~/three/build/three.module.js';
// import * as THREE from 'three/build/three.module';

export function loadMesh() {
    const input = $.create('input').attr({
        type: 'file',
        name: 'meshFile'
    })
    input.click()

    const _t = this
    input.on('change', e => {
        var file = e.target.files[0]
        this.$emit('toolbar:loadMesh', {file})
    })
}

export function uploadJSONProject() {
    const input = $.create('input').attr({
        type: 'file',
        name: 'JSONProject'
    })
    input.click()

    const _t = this
    input.on('change', e => {
        var file = e.target.files[0]
        this.$emit('toolbar:uploadJSONProject', {file})
    })
}

export function generateStateBlock() {


    const blocks = {
        state:{
            func: createButton,
            options: {
                datas: [
                    'data-type="toolbar_button"',
                    'data-category="state"',
                ],
            },
            items:[
                {
                    name: 'manageStates',
                    icon: 'settings',
                    hint: 'Select or remove State'
                },
            ]
        },
    }

    const selectedState = this.project && this.project.model ? this.project.model.selectedState : null


    return `<div class="toolbar__label${selectedState? ' state-selected' : ''}" data-id="stateBlock">
                <div class="label">STATE:</div>
                <div class="stateName" data-id="stateName">${selectedState ? selectedState.name : 'No state'}</div>
                ${createItems(blocks.state)}
            </div>`
}
