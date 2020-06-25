import {AABB} from '@core/physicEngine/geometry/Geometry3D'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {checkCollision2Objects} from '@core/physicEngine/Scene/scene.collision'

export class Scene {
    constructor(props) {

        this._objects = []
        this.octree = null

        this.querySizeVec = new Vector3(100, 100, 100)
    }

    get objects() {
        return this._objects
    }

    addModel(model) {
        if (!this._objects.includes(model)) this._objects.push(model)
        model.childs.forEach(one=>this.addModel(one))
    }

    removeModel(model) {
        model.childs.forEach(one=>this.removeModel(one))
        this._objects = this._objects.filter(one => one !== model)
    }

    updateModel(model) {
        this.removeModel(model)
        this.addModel(model)
    }

    findChildren(model) {
        const children = []
        for (const one of this._objects) {
            const parent = one.parent
            if (!parent) continue
            if (parent === model) {
                children.push(one)
                continue
            }

        }
        console.error('МЕТОД НЕДОПИСАН')
        return children
    }

    raycast(ray) {
        if (this.octree){
            return this.octree.raycast(ray)
        }

        let result
        let result_t = -1
        for (const one of this._objects) {
            const t = one.raycast(ray)
            if (!result && t >= 0) {
                result = one
                result_t = t
            } else if (result && t < result_t) {
                result = one
                result_t = t
            }

        }
        return result

    }

    query(primitiv, objects_) {
        if (this.octree){
            return this.octree.query(primitiv)
        }

        const objects = objects_ || this._objects
        return objects.filter(one => {
            const collisionBoundsFull = primitiv.aabbIn(one.boundsFull)
            if (!collisionBoundsFull) return

            const bounds = one.getOBB()
            return (primitiv.obbIn(bounds))
        })
    }

    accelerate(position, size = 0){
        if (!this.octree) return false
        const min = new Vector3(position.x - size, position.y - size, position.z - size)
        const max = new Vector3(position.x + size, position.y + size, position.z + size)
        const octree = new OctreeNode()
        octree.bounds = AABB.fromMinMax(min, max)
        this._objects.forEach(oneObj =>{
            octree.models.push(oneObj)
        })
        splitTree(octree, 5)
        return true
    }

    checkCollision(model) {

        // Здесь сперва можно делать query исключать себя и своих детей и делать сравнение только с остальными объектами попавшими в query
        const qAABB = new AABB(model.boundsFull.position, model.boundsFull.size.add(this.querySizeVec))
        const objects = this.query(qAABB, this._objects.filter(one=>one.topModelId !== model.id))

        // const objects = this._objects.filter(one=>one.topModelId !== model.id)

        for (const object of objects) {
            let collisions = checkCollision2Objects(model, object)

            if (!collisions) continue

            console.log(collisions, object);

            return {
                self:model,
                target:object,
                collisions
            }
        }
    }

}



class OctreeNode {
    constructor(props) {

        this.bounds = null
        this.children = null
        this.models = []

    }

    insert(model) {
        const bounds = model.getOBB()
        if (this.bounds.obbIn(bounds)) {
            if (!this.children) {
                this.models.push(model)
            } else {
                this.children.forEach(child => {
                    child.insert(model)
                })
            }
        }
    }

    remove(model) {
        if (!this.children) {
            this.models = this.models.filter(one => one !== model)
        } else {
            this.children.forEach(child => {
                child.remove(model)
            })
        }
    }

    update(model) {
        this.remove(model)
        this.insert(model)
    }

    findClosest(models = [], ray) {
        if (!models.length) return 0
        let closest
        let closest_t = -1
        models.forEach(model => {
            const t = model.raycast(ray)
            if (t < 0) return
            if (closest_t < 0 || t < closest_t) {
                closest_t = t
                closest = model
            }
        })

        return closest
    }

    raycast(ray) {
        const t = this.bounds.raycast(ray)
        if (t >= 0) {
            if (!this.children) {
                return this.findClosest(this.models, ray)
            } else {
                const models = this.children.map(child => {
                    return child.raycast(ray)
                }).filter(one => one !== 0)
                return this.findClosest(models)
            }
        }

        return 0
    }

    query(primitiv) {

        let results = []
        if (primitiv.aabbIn(this.bounds)){
            if (!this.children) {
                results =  this.models.filter(model => {
                    const bounds = model.getOBB()
                    return (primitiv.obbIn(bounds))
                })
            } else {
                this.children.forEach(child =>{
                    const childs = child.query(primitiv)
                    if (childs.length){
                        results = [...results, ...childs]
                    }
                })
            }
        }
        return results

    }

}

const splitTree = (node, depth = 0) => {
    if (depth-- <= 0) return

    if (!node.children) {
        node.children = new Array(8).fill(new OctreeNode())

        const c = node.bounds.position
        const e = node.bounds.size.multiplyS(0.5)

        node.children[0].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, -e.z)), e)
        node.children[1].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, -e.z)), e)
        node.children[2].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, +e.z)), e)
        node.children[3].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, +e.z)), e)
        node.children[4].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, -e.z)), e)
        node.children[5].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, -e.z)), e)
        node.children[6].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, +e.z)), e)
        node.children[7].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, +e.z)), e)
    }

    if (node.children && node.models.length) {
        node.children.forEach(child => {
            child.models.forEach(model => {
                const bounds = model.getOBB()
                if (child.bounds.obbIn(bounds)) child.models.push(model)
            })
        })
        node.models = []

        node.children.forEach(child => {
            splitTree(child, depth)
        })
    }
}
