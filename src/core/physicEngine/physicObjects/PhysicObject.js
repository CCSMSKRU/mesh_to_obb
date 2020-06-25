import {v1 as uuidv1} from 'uuid'
import {Point2D} from '@core/physicEngine/geometry/Geometry2D'
import {Vector2} from '@core/physicEngine/geometry/Vector2'
import {Point3D} from '@core/physicEngine/geometry/Geometry3D'
import {Vector3} from '@core/physicEngine/geometry/Vector3'

export class PhysicObject {
    constructor(obj, topLevelObj) {

        this.id = obj.id || uuidv1()

        this.name = obj.name || ''
        this.index = obj.index || 1
        this.alias = obj.alias || this.name + '_1'

        topLevelObj = topLevelObj || obj

        const items = obj.items || []
        const itemsPhysic = items.map((one, index) => {
            one.index = (index + 1)
            one.alias = this.alias + (index + 1)

            one.isPlatform = typeof one.isPlatform !== 'undefined' ? one.isPlatform : topLevelObj.isPlatform
            return new PhysicObject(one, topLevelObj)
        })

        let w = obj.w
        let h = obj.h
        let l = obj.l
        let offset = obj.offset || new Vector3()

        // Calculate by childs (offset and w|h|l)
        if (itemsPhysic.length) {
            if (obj.offset) {
                console.warn('"offset" will be ignored. If object has "items", "offset" is calculated', obj)
            }

            const offsetX = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.x : 0))
            const offsetY = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.y : 0))
            const offsetZ = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.z : 0))
            offset = new Vector3(offsetX, offsetY, offsetZ)

            w = typeof w !== 'undefined' ? w : Math.max(...itemsPhysic.map(one => {
                const relOffset = one.offset.subtract(offset)
                return one.w + relOffset.z
            }))
            h = typeof h !== 'undefined' ? h : Math.max(...itemsPhysic.map(one => {
                const relOffset = one.offset.subtract(offset)
                return one.h + relOffset.y
            }))
            l = typeof l !== 'undefined' ? l : Math.max(...itemsPhysic.map(one => {
                const relOffset = one.offset.subtract(offset)
                return one.l + relOffset.x
            }))
        }


        this._w = w
        this._h = h
        this._l = l

        this.offset = offset || new Vector3()
        this.offset_orig = this.offset

        if (obj.rotation && !obj.isPlatform && !obj.isRamp){
            console.warn('Rotation available only for platform. (isPlatform or isRamp parameter). rotation will be ignored');
        }

        this.rotation = (obj.rotation && (obj.isPlatform || obj.isRamp))? obj.rotation : null
        this.rotation_orig = this.rotation

        this.states = obj.states || {}

        this.graphicOptions = obj.graphicOptions || {}
        this.graphicOptionsAll = obj.graphicOptionsAll || {}

        this.items = items // Instances of PhysicObject

        const contactItemOffsetX = obj.contactItemOffsetX || this.l / 10
        const contactItemOffsetY = obj.contactItemOffsetY || this.w / 10
        this.isSupport = obj.isSupport // Опорный box
        this.contactItems = obj.isSupport // Items to contact with platform
            ? Array.isArray(obj.contactItems) && obj.contactItems.length
                ? obj.contactItems
                : [
                    new Point3D(this.l - contactItemOffsetX, this.w - contactItemOffsetY, 0),
                    new Point3D(this.l - contactItemOffsetX, contactItemOffsetY, 0),
                    new Point3D(contactItemOffsetX, this.w - contactItemOffsetY, 0),
                    new Point3D(contactItemOffsetX, contactItemOffsetY, 0)
                ]
            : null
        this.isPlatform = obj.isPlatform // On this plane can be placed transport (another objects)
        this.isRamp = obj.isRamp // On this plane transport can move up

    }

    get supports(){
        if (this._supports) return this._supports
        this._supports = this.items.map(one=>one.supports).flat()
        if (this.isSupport) this._supports.push(this)
        return this._supports
    }

    get platforms(){
        if (this._platforms) return this._platforms
        this._platforms = this.items.map(one=>one.platforms).flat()
        if (this.isPlatform && !this.items.length) this._platforms.push(this)
        return this._platforms
    }

    get w(){
        return this._w
    }
    set w(val){
        this._w = isNaN(+val)? 0 :+val
        this._size = null
    }
    get l(){
        return this._l
    }
    set l(val){
        this._l = isNaN(+val)? 0 :+val
        this._size = null
    }
    get h(){
        return this._h
    }
    set h(val){
        this._h = isNaN(+val)? 0 :+val
        this._size = null
    }

    get origin(){
        if (!this._origin){
            this._origin = new Point3D(0, 0, 0)
        }
        return this._origin
    }
    get size(){
        if (!this._size){
            this._size = new Vector3(this._l, this._h, this._w)
        }
        return this._size
    }

    toState(state){
        this.items.forEach(one=>one.toState(state))

        if (this.items.length) return

        if (!state){
            this.rotation = this.rotation_orig
            this.offset = this.offset_orig
            return
        }

        let state_obj = this.states[state]
        if (!state_obj) return

        if (state_obj.rotation) this.rotation = state_obj.rotation
        if (state_obj.offset) this.offset = state_obj.offset

    }

    toFinishState(){
        this.toState('FINISH')
    }

}
