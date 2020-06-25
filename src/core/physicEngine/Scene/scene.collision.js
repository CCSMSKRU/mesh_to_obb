import {AABB, Mesh, Model, OBB} from '@core/physicEngine/geometry/Geometry3D'

export const checkCollision2Objects = (first, second) => {

    const collisionBoundsFull = first.boundsFull.aabbIn(second.boundsFull)
    if (!collisionBoundsFull) return


    // Внешняя рамка всей модели имеет коллизию.
    // Переберем всех детей чтобы определить где именно коллизия и есть ли она вообще

    let collisions

    if (first.childs && first.childs.length) {
        const second_collisions = first.childs
            .map(one_first => {
                return checkCollision2Objects(one_first, second)
            })
            .filter(one => !!one)
            .flat()
        collisions = second_collisions.length ? second_collisions : false
    }

    let collision
    if (first.content){
        // collision = first.getOBB().obbIn(second.getOBB())
        if (second instanceof Model) {
            if (second.content instanceof Mesh) collision = first.modelOBB(second.getOBB())
            if (second.content instanceof OBB) collision = first.modelOBB(second.getOBB())
            // collision = first.modelOBB(second.getOBB())
        }
        else if (second instanceof OBB) collision = first.modelOBB(second)
        else if (second instanceof AABB) collision = first.modelAABB(second)
    }
    if (collision) collisions = [collision]


    return collisions && collisions.length? collisions : false
}
