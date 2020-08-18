/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {createButton, createInput} from '@core/template.functions'
import {loadMesh} from '@/components/toolbar/toolbar.functions'

export const getBlocks = (project, options) => {

    const loading = options.loading? 'Loading...' : ''
    const meshName = project.meshFile? project.meshFile.name : 'Mesh not loaded'

    return {
        project:{
            func: createButton,
            options: {
                datas: [
                    'data-type="toolbar_button"',
                    'data-category="project"',
                ],
            },
            items:[
                {
                    name: 'newProject',
                    icon: 'add',
                    hint:'New Project'
                },
                {
                    name: 'loadProject',
                    icon: 'folder_open',
                    hint:'Load Project'
                },
                {
                    name: 'saveProject',
                    icon: 'save',
                    hint:'Save Project'
                }
            ]
        },
        projectJSON:{
            func: createButton,
            options: {
                datas: [
                    'data-type="toolbar_button"',
                    'data-category="project"',
                ],
            },
            items:[
                {
                    name: 'uploadProject',
                    icon: 'attach_file',
                    hint:'Upload Project from JSON file'
                },
                {
                    name: 'downloadProject',
                    icon: 'get_app',
                    hint:'Save Project in JSON file'
                }
            ]
        },
        meshInput:{
            func: createInput,
            options: {
                datas: [
                    'data-type="toolbar_input"',
                    'data-category="mesh"',
                ],
            },
            items:[
                {
                    name: 'name',
                    title: 'Mesh not loaded',
                    width: 150,
                    value: loading || meshName,
                    type: 'text',
                    attributes:['disabled']
                },
            ]
        },
        meshBtns:{
            func: createButton,
            options: {
                datas: [
                    'data-type="toolbar_button"',
                    'data-category="mesh"',
                ],
            },
            items:[
                {
                    name: 'loadMesh',
                    icon: 'add',
                    action: loadMesh
                },
                {
                    name: 'removeMesh',
                    icon: 'delete',
                    action: loadMesh
                },
            ]
        },
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
                {
                    name: 'addState',
                    icon: 'add',
                    hint: 'Create new state'
                },
            ]
        },
    }
}
