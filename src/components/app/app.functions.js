/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import * as toastr from 'toastr'
import MyError from '@core/error'

export const populateProjects = (projects = [])=>{
    return projects.map(one=>{
        return `<div 
                    class="one-project-row"
                    data-type="project-row-select"
                    data-name="${one.name}"
                    data-id="${one.id}"
                >
                    <div class="name">${one.name} (${one.id})</div>
                    <button 
                        class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored" 
                        data-type="project-row-remove-btn"
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


export const readFromJSONFile = async (file) => {

    return new Promise((res, rej)=>{
        var reader = new FileReader()
        reader.onload = () => {
            console.log('RES', reader.result);
            try {
                const json = JSON.parse(reader.result)
                res(json)
            } catch (e) {
                rej(new MyError('Invalid JSON', {e, result:reader.result}))
            }

        }
        reader.onerror = (error) => {
            rej(new MyError('Error while reading file', {error, file}))
        }
        reader.readAsText(file)
    })

}
