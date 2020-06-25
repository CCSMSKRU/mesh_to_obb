import {PhysicObject} from '@core/physicEngine/physicObjects/PhysicObject'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {AABB, OBB} from '@core/physicEngine/geometry/Geometry3D'

export class ObjectPosition extends PhysicObject {
    constructor(obj, position = new Vector3(0, 0, 0)) {
        super(obj)
        this.position = position
        this.items = this.items.map((one, index) => {
            return new ObjectPosition(one, position)
        })

        this.collisions = []
    }
    get x(){
        return this.position.x
    }
    get y(){
        return this.position.y
    }
    get z(){
        return this.position.z
    }

    get box(){
        if (!this._box){
            if (this.rotation){
                const rotateMatrix = new Matrix3().rotation(this.rotation.x, this.rotation.y, this.rotation.z)
                this._box = new OBB(this.position.add(this.offset), this.size, rotateMatrix)
            }else{
                this._box = new AABB(this.position.add(this.offset), this.size)
            }
        }
        return this._box
    }


    move(vDirection) {
        if (!vDirection) return

        this.position = this.position.add(vDirection)
        this._box = null
        this.items.forEach(one => one.move(vDirection))
    }

    moveTo(position) {
        if (!(position instanceof Vector3)) {
            console.error('position must be Vector3')
            return
        }

        this.position = position
        this._box = null
        this.items.forEach(one => one.moveTo(position))
    }

    checkOn(platformObjectPos){
        if (!this.supports.length) throw new MyError('physicObject must has isSupport')
        // Все точки у всех опорных блоков должны быть вблизи от поверхности isPlatform
        let isOnOne
        this.supports.forEach(support=>{
            if (isOnOne) return

            // support.contactItems.forEach(point=>{
            //     const pointCorrected = point.add(support.position).add(support.offset)
            //     let box
            //     if (platform.rotation){
            //         const rotateMatrix = new Matrix3().rotation(platform.rotation.x, platform.rotation.y, platform.rotation.z)
            //         box = new OBB(platform.position.add(platform.offset), platform.size, rotateMatrix)
            //     }else{
            //         box = new AABB(platform.position.add(platform.offset), platform.size)
            //     }
            //
            //
            //     const closest = box.closestPoint(pointCorrected)
            //     const line = new Line(pointCorrected, closest)
            //
            //     console.log(line.length(), pointCorrected, closest, box);
            //
            //     // const raycast = box.raycast(ray)
            //     // console.log(raycast, pointCorrected, box);
            // })

            let isOnCurrent;
            for (const platform of platformObjectPos.platforms) {
                isOnCurrent = true
                for (const point of support.contactItems) {
                    const pointCorrected = point.add(support.position).add(support.offset)
                    const closest = platform.box.closestPoint(pointCorrected)
                    const line = new Line(pointCorrected, closest)
                    const ln = line.length()
                    // if (ln === 20){
                    //     debugger;
                    // }
                    if (line.length() >= 30) {
                        isOnCurrent = false
                        break;
                    }
                }
                if (isOnCurrent) {
                    break;
                }
            }
            isOnOne = isOnCurrent
            // platformObjectPos.platforms.forEach(platform=>{
            //     const isNear = support.contactItems.map(point=>{
            //         const pointCorrected = point.add(support.position).add(support.offset)
            //         const closest = platform.box.closestPoint(pointCorrected)
            //         const line = new Line(pointCorrected, closest)
            //         return (line.length() < 30)
            //     })
            //
            // })
        })
        return isOnOne
    }


}
