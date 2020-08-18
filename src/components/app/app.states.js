/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */


import * as toastr from 'toastr'
import * as bootbox from 'bootbox'
import {$} from '@core/jquery.extends'
import {createButton, createInput, createItems} from '@core/template.functions'


const populateStates = (projects = []) => {
    return projects.map(one => {
        return `<div 
                    class="one-state-row"
                    data-type="state-row-select"
                    data-name="${one.name}"
                    data-id="${one.id}"
                >
                    <div class="name">${one.name} (${one.id})</div>
                    <button 
                        class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" 
                        data-type="state-row-remove-btn"
                        data-name="${one.name}"
                        data-id="${one.id}"
                      >
                      <i class="material-icons"
                        data-name="${one.name}"
                        data-id="${one.id}"
                      >delete</i>
                    </button>
                </div>`
    }).join('')
}

export function manageStateInit() {
    this.$on('toolbar:manageStates', (e) => {

        let projects
        try {
            projects = JSON.parse(localStorage.getItem('projects'))
        } catch (e) {
            toastr.error('Error while parsing localStorage "projects". You can clear LocalStorage manually')
            console.error('Error while parsing localStorage "projects"', e, localStorage.getItem('projects'))
            return
        }

        if (!projects.length) return toastr.info('No saved projects')


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
                    width: 150,
                    func: createInput
                },
                {
                    name: 'sysname',
                    title: 'Sysname',
                    value: '',
                    width: 150,
                    func: createInput
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
                        ${populateStates(projects)}
                    </div>
                `

        const b1 = bootbox.alert({
            title: "Manage states",
            message: html
        })
        const _t = this
        b1.find('[data-type="state-row-select"]').off('click').on('click', function(e) {
            const $this = $(this)
            const id = $this.data('id')
            const project = projects.filter(one => one.id === id)[0]
            if (project) {
                b1.modal('hide')
                _t.loadProject(project)
            }
        })

        b1.find('button[data-type="project-row-remove-btn"]').off('click').on('click', function(e) {
            e.stopPropagation()
            const $this = $(this)
            const id = $this.data('id')
            bootbox.confirm({
                title: `Remove Project "${$this.data('name')} (${id})"`,
                message: '<div class="attention">Are you sure?</div>',
                callback: (res) => {
                    if (!res) return
                    const err = _t.removeProject(id)
                    if (!err) $this.parent('.one-project-row').remove()
                    toastr.success('Project successful deleted')
                }
            })
        })

    })
}
