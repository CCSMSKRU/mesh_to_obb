/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {v4} from 'uuid'

function createNode(node = {}, options = {}){
    const nodeId = node.id || v4()
    const text = node.text || node.name || '-'

    const childs = options.childsKey || 'childs'
    const selected = (options.selectedId && nodeId === options.selectedId) || node.selected
    console.log(options, selected);

    return `<div class="tree-node${selected? ' selected' : ''}" data-type="tree-node" data-id="${nodeId}">
                ${text}
                ${node[childs] && node[childs].length
                    ? `<div class="tree-childs" data-type="tree-childs">
                            ${node[childs].map(one=>createNode(one, options)).join('')}
                        </div>` 
                    : ``
                }
            </div>`
}

export function createTree(rootNode = {}, options = {}) {
    const dataId = options.id || rootNode.id || v4()
    return `
        
        <div class="tree-container" data-type="tree-container" data-id="tree_${dataId}">
            
            ${createNode(rootNode, options)}
        </div>
        `
}
