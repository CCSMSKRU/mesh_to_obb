/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

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
