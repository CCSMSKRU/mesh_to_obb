/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {v4 as uuidv4} from 'uuid'
import {Model, OBB} from '@core/physicEngine/geometry/Geometry3D'
import {loadModel} from '@/logicComponents/project/project.functions'
import {Vector3} from '@core/physicEngine/geometry/Vector3'

export class Project {
    constructor(obj = {}) {
        this.id = obj.id || uuidv4()
        this.name = obj.name || 'Empty'
        this.meshFile = obj.meshFile
        this.meshUrl = obj.meshUrl

        this.options = {
            model:{
                opacity:0.8
            }
        }
    }

    init() {

    }

    loadMeshUrl(file) {
        return new Promise((res, rej) => {
            this.meshFile = file

            var reader = new FileReader()
            reader.onload = () => {
                this.meshUrl = reader.result
                res(this.meshUrl)
            }
            reader.onerror = (error) => {
                console.error('error while reading file', error)
                rej(error)
            }
            reader.readAsDataURL(file)
        })
    }

    loadMeshModel() {

        return loadModel(this.meshUrl)
            .then(object => {
                this.meshModel = new Model({
                    name: 'modelThreejs',
                    type: 'THREEJS_OBJ',
                    content: object
                })
            })


    }

    loadModel() {

        return new Promise((res, rej) => {
            this.model = new Model({
                name: 'Model1',
                content: new OBB(null, new Vector3(1000, 1000, 1000))
            })

            this.selectedModel = this.model
            res(null)
        })


    }

}
