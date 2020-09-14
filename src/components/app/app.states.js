/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */


import * as toastr from 'toastr'
import * as bootbox from 'bootbox'
import {$} from '@core/jquery.extends'
import {createButton, createInput, createItems} from '@core/template.functions'
import {Vector3} from '@core/physicEngine/geometry/Vector3'


const populateStates = (projects = []) => {
    return projects.map(one => {
        return `<div 
                    class="one-state-row"
                    data-type="state-row-select"
                    data-name="${one.name}"
                    data-id="${one.sysname}"
                >
                    <div class="name">${one.name} (${one.sysname})</div>
                    <div>
                         ${!one.generated? `<button 
                            class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" 
                            data-type="state-row-rotate180-btn"
                            data-name="${one.name}"
                            data-id="${one.sysname}"
                          >
                          <i class="material-icons"
                            data-name="${one.name}"
                            data-id="${one.sysname}"
                          >3d_rotation</i>
                        </button>` : ``}
                        <button 
                            class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" 
                            data-type="state-row-remove-btn"
                            data-name="${one.name}"
                            data-id="${one.sysname}"
                          >
                          <i class="material-icons"
                            data-name="${one.name}"
                            data-id="${one.sysname}"
                          >delete</i>
                        </button>
                    </div>
                   
                </div>`
    }).join('')
}

export function manageStateInit() {
    this.$on('toolbar:manageStates', (e) => {

        // const states = this.project && this.project.model? this.project.model.getAllStates() : []
        const states = this.project && this.project.model? this.project.model.states : []
        console.log('states', states)
        console.log('model', this.project.model)

        const _t = this

        const newStateObj = {
            options: {
                datas: [
                    'data-type="newState_input"',
                    'data-category="newState"',
                ],
                inputDesignType:'mdl-textfield--floating-label',
                prefix: 'newStateObj_'
            },
            items: [
                {
                    name: 'name',
                    title: 'Name',
                    value: '',
                    width: 180,
                    func: createInput
                },
                {
                    name: 'sysname',
                    title: 'Sysname',
                    value: '',
                    width: 180,
                    func: createInput
                },
                {
                    name: '180',
                    icon: '3d_rotation',
                    datas: [
                        'data-type="newState180_button"',
                    ],
                    func: createButton
                },
                {
                    name: 'add',
                    icon: 'add',
                    datas: [
                        'data-type="newState_button"',
                    ],
                    func: createButton
                }
            ],
        }

        const html = `
                    <h5>Select STATE. Model changes will be applied for this state</h5>
                    <div class="load-project-states-container">
                        <h5>New state:</h5>
                        <div class="new-state-container">
                            ${createItems(newStateObj)}
                        </div>
                        <h5>States:</h5>
                        <div class="states-container">
                            ${states.length? populateStates(states) : '<div>No states created</div>'}
                        </div>
                    </div>
                `

        const b1 = bootbox.dialog({
            title: "Manage states",
            message: html,
            buttons:{

                toMain: {
                    label: 'Unselect state',
                    callback: ()=> {
                        _t.project.model.toState()
                        _t.$emit('model:selectState', {})
                        _t.$emit('project:updateModel')
                        toastr.success('STATE UNSELECTED!')
                        b1.modal('hide')
                    }
                },
                close: {
                    label: 'Close',
                    callback: ()=>{}
                },
            }
        })

        // Применим стили Material Design
        const els = [...b1.find('*[data-needUpgrade]')]
        els.forEach(one => componentHandler.upgradeElement(one))





        b1.find('[data-type="newState_input"]').off('input').on('input', function(e) {
            e.stopPropagation()
            const $this = $(this)

            if ($this.data('name') === 'name'){
                const $container = $this.parents('.new-state-container')

                const sysname = $this.val().toUpperCase().replace(/\s/ig, '_')

                const $sysname = $container.find('#newStateObj_sysname')

                $sysname.val(sysname)

                if (sysname) $sysname.parent().addClass('is-dirty')
                else $sysname.parent().removeClass('is-dirty')
                // $sysname[0].MaterialTextfield.checkDirty()

            }
        })

        b1.find('[data-type="newState_button"]').off('click').on('click', function(e) {
            e.stopPropagation()
            if (!_t.project || !_t.project.model) toastr.error('No model')

            const $this = $(this)

            if ($this.data('name') === 'add'){
                const $container = $this.parents('.new-state-container')

                const $name = $container.find('#newStateObj_name')
                const name = $name.val()

                const $sysname = $container.find('#newStateObj_sysname')
                const sysname = $sysname.val()

                if (!name) return toastr.info('Name is empty')
                if (!sysname) return toastr.info('Sysname is empty')

                // addState
                _t.project.model.addState(name, sysname)
                b1.modal('hide')
                _t.$emit('toolbar:manageStates')

            }

            // const id = $this.data('id')
            // const project = projects.filter(one => one.id === id)[0]
            // if (project) {
            //     b1.modal('hide')
            //     _t.loadProject(project)
            // }
        })

        b1.find('[data-type="newState180_button"]').off('click').on('click', function(e) {
            e.stopPropagation()
            // const $this = $(this)
            bootbox.confirm({
                title: `Generate STATE 180° from DEFAULT state`,
                message: '<div class="attention">Are you sure?</div>',
                callback: (res) => {
                    if (!res) return
                    const err = _t.project.model.generateState(null, {namePostfix:'180', rotate: new Vector3(0, 180, 0)})
                    if (err){
                        console.log(err)
                        toastr.error(err.message)
                        return
                    }
                    b1.modal('hide')
                    _t.$emit('toolbar:manageStates')
                }
            })
        })


        b1.find('[data-type="state-row-select"]').off('click').on('click', function(e) {
            const $this = $(this)
            const sysname = $this.data('id')
            _t.project.model.toState(sysname)
            _t.project.model.selectedState.editMode = true
            _t.$emit('model:selectState', {state:_t.project.model.selectedState})
            _t.$emit('project:updateModel')

            toastr.success('STATE SELECTED!')
            b1.modal('hide')
            // const project = projects.filter(one => one.id === id)[0]
            // if (project) {
            //     b1.modal('hide')
            //     _t.loadProject(project)
            // }
        })



        b1.find('button[data-type="state-row-remove-btn"]').off('click').on('click', function(e) {
            e.stopPropagation()
            const $this = $(this)
            const sysname = $this.data('id')
            bootbox.confirm({
                title: `Remove STATE "${$this.data('name')} (${sysname})"`,
                message: '<div class="attention">Are you sure?</div>',
                callback: (res) => {
                    if (!res) return
                    const err = _t.project.model.removeState(sysname)
                    if (!err) {
                        const row = $this.parents('.one-state-row')[0]
                        if (row) row.remove()
                    }
                    _t.$emit('project:updateModel')
                    toastr.success('STATE successful removed')
                }
            })
        })

        b1.find('button[data-type="state-row-rotate180-btn"]').off('click').on('click', function(e) {
            e.stopPropagation()
            const $this = $(this)
            const sysname = $this.data('id')
            bootbox.confirm({
                title: `Generate STATE 180° from CURRENT state`,
                message: '<div class="attention">Are you sure?</div>',
                callback: (res) => {
                    if (!res) return
                    const err = _t.project.model.generateState(sysname, {namePostfix:'180', rotate: new Vector3(0, 180, 0)})
                    if (err){
                        console.log(err)
                        toastr.error(err.message)
                        return
                    }
                    b1.modal('hide')
                    _t.$emit('toolbar:manageStates')
                }
            })
        })

    })
}
