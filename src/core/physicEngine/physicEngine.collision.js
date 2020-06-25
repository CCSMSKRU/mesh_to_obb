/**
 * parameters is instances of ObjectPosition
 * @param first
 * @param second
 */
import {AABB, OBB} from '@core/physicEngine/geometry/Geometry3D'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'


const getSecondExcludes = (first, second_items, excludes = []) => {

    second_items.forEach(one_second_item => {
        if (excludes.includes(one_second_item)) return false

        // const firstBox = new AABB(first.position.add(first.offset), first.size)
        // const secondBox = new AABB(one_second_item.position.add(one_second_item.offset), one_second_item.size)
        // let secondBox, collision;

        // if (one_second_item.rotation){
        //     const rotateMatrix = new Matrix3().rotation(one_second_item.rotation.x, one_second_item.rotation.y, one_second_item.rotation.z)
        //     secondBox = new OBB(one_second_item.position.add(one_second_item.offset), one_second_item.size, rotateMatrix)
        //     collision = firstBox.obbIn(secondBox)
        // }else{
        //     secondBox = new AABB(one_second_item.position.add(one_second_item.offset), one_second_item.size)
        //     collision = firstBox.aabbIn(secondBox)
        // }

        let collision

        if (one_second_item.rotation){
            collision = first.box.obbIn(one_second_item.box)
        }else{
            collision = first.box.aabbIn(one_second_item.box)
        }

        // const collision = firstBox.aabbIn(secondBox)
        if (!collision) {
            excludes.push(one_second_item)
            return
        }
        if (!one_second_item.items.length) return

        getSecondExcludes(first, one_second_item.items, excludes).forEach(one => excludes.push(one))
    })

    return excludes
}

export const checkCollision2Objects = (first, second, excludes = []) => {
    if (excludes.includes(second)) return false

    let collision_info

    if (second.rotation){
        collision_info = first.box.obbIn(second.box)
    }else{
        collision_info = first.box.aabbIn(second.box)
    }

    const collision = collision_info
        ? {first, second}
        : null
    if (!collision) return false


    // Проверить для всех уровней second и вернуть те которые в дальнейшем не нужно проверять
    const second_excludes = getSecondExcludes(first, second.items, excludes)

    if (!first.items.length) {
        // Это самый глубокий узел и он имеет коллизию
        // Найдем самый глубокий узел из второго объекта
        if (!second.items.length) return [collision]

        const second_collisions = second.items
            .map(one_second => {
                return checkCollision2Objects(first, one_second)
            })
            .filter(one => !!one)
            .flat()
        return second_collisions.length ? second_collisions : false
    }

    // Не самый глубокий узел, пойдем дальше (глубже)
    const first_collisions = first.items
        .map(one_first => {
            return checkCollision2Objects(one_first, second, second_excludes)
        })
        .filter(one => !!one)
        .flat()
    return first_collisions.length ? first_collisions : false
}
