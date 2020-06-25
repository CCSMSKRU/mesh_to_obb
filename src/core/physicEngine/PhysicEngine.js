import {GraphicEngine} from '@core/physicEngine/GraphicEngine'

export class PhysicEngine extends GraphicEngine {
    // static createComplexPhysicObject = (obj, topLevelObj) => {
    //     const items = obj.items || []
    //     topLevelObj = topLevelObj || obj
    //     const itemsPhysic = items.map(one => {
    //
    //         return this.createComplexPhysicObject(one, topLevelObj)
    //     })
    //     let {w, h, l} = obj
    //     if (itemsPhysic.length) {
    //         if (obj.offset) console.warn('"offset" will be ignored. If object has "items", "offset" is calculated', obj)
    //
    //         const offsetX = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.x : 0))
    //         const offsetY = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.y : 0))
    //         const offsetZ = Math.min(...itemsPhysic.map(one => one.offset ? one.offset.z : 0))
    //         obj.offset = new Vector3(offsetX, offsetY, offsetZ)
    //
    //         w = typeof w !== 'undefined' ? w : Math.max(...itemsPhysic.map(one => {
    //             const relOffset = one.offset.subtract(obj.offset)
    //             return one.w + relOffset.y
    //         }))
    //         h = typeof h !== 'undefined' ? h : Math.max(...itemsPhysic.map(one => {
    //             const relOffset = one.offset.subtract(obj.offset)
    //             return one.h + relOffset.z
    //         }))
    //         l = typeof l !== 'undefined' ? l : Math.max(...itemsPhysic.map(one => {
    //             const relOffset = one.offset.subtract(obj.offset)
    //             return one.l + relOffset.x
    //         }))
    //     }
    //
    //     obj.isPlatform = typeof obj.isPlatform !== 'undefined' ? obj.isPlatform : topLevelObj.isPlatform
    //
    //     return new PhysicObject({...obj, w, h, l, items: itemsPhysic})
    // }

    constructor(obj) {
        super(obj)


    }






}
