import hasSetter from 'has-setter'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {Matrix4} from '@core/physicEngine/geometry/Matrix4'
import {v1 as uuidv1} from 'uuid'
import * as THREE from 'three'
import MyError, {isError, UserError, UserOk} from '@core/error'
import {cloneObj} from '@core/functions'
import {$} from "@core/jquery.extends"
import {PhysicEngine} from "@core/physicEngine/PhysicEngine"

export class Geometry3D {
    constructor(props) {
        this.deviation = 1 / (props ? (props.round || 1000) : 1000)

    }
}

export const degToRad = (deg) => {
    return deg / 180 * Math.PI
}
export const radToDeg = (rad) => {
    return rad / Math.PI * 180
}

const CMP = (a, b) => {
    return Math.abs(b - a) < 1 / 10000
}

export class Point3D extends Vector3 {
    constructor(x, y, z) {
        super(x, y, z)

    }
}

export class Line {
    constructor(start, end) {
        this.start = start || new Point3D()
        this.end = end || new Point3D()

        this.deviation = 1

    }

    length() {
        return this.end.subtract(this.start).magnitude()
    }

    lengthSq() {
        return this.end.subtract(this.start).magnitudeSq()
    }

    closestPoint(point) {
        const lVec = this.end.subtract(this.start) // Line Vector
        const lVec_dot = lVec.dot(lVec)
        // if (!lVec_dot) // Надо вникнуть что в этом случае. (будет только если вектор 0,0,0)
        let t = point.subtract(this.start).dot(lVec) / lVec_dot
        t = Math.max(t, 0)
        t = Math.min(t, 1)
        return this.start.add(lVec.multiplyS(t))
    }

    pointOn(point) {
        const closest = this.closestPoint(point)
        const distanceSq = closest.subtract(point).magnitudeSq()
        return distanceSq === 0
    };

}

export class Ray {
    constructor(origin, direction) {
        this.origin = origin || new Point3D()
        this.direction = direction || new Vector3(0, 0, 1)

        this.deviation = 1
        this.fromPoints = (from, to) => {
            return new Ray(from, to.subtract(from).normalize())
        }

    }

    normalizeDirection() {
        this.direction = this.direction.normalize()
        return this
    }

    pointOn(point) {
        if (point.equal(this.origin)) return true

        const norm = point.subtract(this.origin).normalize()
        const diff = norm.dot(this.direction)
        return diff === 1
    };

    closestPoint(point) {
        let t = point.subtract(this.origin).dot(this.direction)
        t = Math.max(t, 0)
        return this.origin.add(this.direction.multiplyS(t))
    }
}


export class Sphere {
    constructor(position, radius) {
        this.position = position || new Point3D()
        this.radius = radius || 1
    }

    pointIn(point) {

        const magSq = point.subtract(this.position).magnitudeSq()
        const radSq = this.radius * this.radius
        return magSq < radSq
    };

    closestPoint(point) {
        let sphereToPoint = point.subtract(this.position).normalize().multiplyS(this.radius)
        return sphereToPoint.add(this.position)
    };

    sphereIn(sphere) {
        const radiiSum = this.radius + sphere.radius
        const sqDistance = this.position.subtract(sphere.position).magnitudeSq()
        return sqDistance < radiiSum * radiiSum
    }

    aabbIn(aabb) {
        const closestPoint = aabb.closestPoint(this.position)
        const distSq = this.position.subtract(closestPoint).magnitudeSq()
        const radiusSq = this.radius * this.radius
        return distSq < radiusSq
    };

    obbIn(obb) {
        const closestPoint = obb.closestPoint(this.position)
        const distSq = this.position.subtract(closestPoint).magnitudeSq()
        const radiusSq = this.radius * this.radius
        return distSq < radiusSq
    }

    planeIn(plane) {
        const closestPoint = plane.closestPoint(this.position)
        const distSq = this.position.subtract(closestPoint).magnitudeSq()
        const radiusSq = this.radius * this.radius
        return distSq < radiusSq
    }

    raycast(ray) {
        const e = this.position.subtract(ray.origin)
        const rSq = this.radius * this.radius
        const eSq = e.magnitudeSq()
        // ray.direction is assumed to be normalized
        const a = e.dot(ray.direction)

        const bSq = eSq - (a * a)
        const f = Math.sqrt(rSq - bSq)

        // No collision has happened
        if (rSq - (eSq - (a * a)) < 0) {
            return false // -1 is invalid.
        }
        // outResult->t = t;
        // outResult->hit = true;
        // outResult->point = ray.origin + ray.direction * t;
        // outResult->normal = Normalized(outResult->point
        //     - sphere.position);
        // Не проверено
        const t = (eSq < rSq) ? a + f : a - f
        const point = ray.origin.add(ray.direction.multiplyS(t))
        const normal = point.subtract(this.position)
        return {
            t,
            hit: true,
            point: point,
            normal
        }
        // // Ray starts inside the sphere
        // else if (eSq < rSq) {
        //     return a + f // Just reverse direction
        // }
        // // else Normal intersection
        // return a - f
    }

    linetest(line) {
        const closest = line.closestPoint(this.position)
        const distSq = this.position.subtract(closest).magnitudeSq()
        return distSq <= (this.radius * this.radius)
    }

    triangleIn(triangle) {
        return triangle.sphereIn(this)
    }
}

export class AABB {
    static fromMinMax = (min, max) => {
        return new AABB(min.add(max).multiplyS(0.5), max.subtract(min).multiplyS(0.5))
    }

    constructor(position, size) {
        this.position = position || new Point3D()
        this.size = size || new Vector3(0, 0, 0)
    }

    copy() {
        return new AABB(new Point3D(...this.position.asArray), new Vector3(...this.size.asArray))
    }


    getMin() {
        let p1 = this.position.add(this.size)
        let p2 = this.position.subtract(this.size)

        return new Vector3(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.min(p1.z, p2.z))
    }

    getMax() {
        let p1 = this.position.add(this.size)
        let p2 = this.position.subtract(this.size)

        return new Vector3(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y), Math.max(p1.z, p2.z))
    }

    pointIn(point) {
        const min = this.getMin()
        const max = this.getMax()

        if (point.x < min.x || point.y < min.y || point.z < min.z) return false
        if (point.x > max.x || point.y > max.y || point.z > max.z) return false
        return true
    };

    closestPoint(point) {
        const min = this.getMin()
        const max = this.getMax()

        let x = point.x
        let y = point.y
        let z = point.z

        // x = (x < min.x) ? min.x : x
        // y = (y < min.x) ? min.y : y
        // z = (z < min.x) ? min.z : z
        //
        // x = (x > max.x) ? max.x : x
        // y = (y > max.x) ? max.y : y
        // z = (z > max.x) ? max.z : z


        x = (x < min.x) ? min.x : x
        y = (y < min.y) ? min.y : y
        z = (z < min.z) ? min.z : z

        x = (x > max.x) ? max.x : x
        y = (y > max.y) ? max.y : y
        z = (z > max.z) ? max.z : z

        return new Point3D(x, y, z)
    }

    sphereIn(sphere) {
        return sphere.aabbIn(this)
    }

    aabbIn(aabb) {
        const aMin = this.getMin()
        const aMax = this.getMax()
        if (!aabb) debugger
        const bMin = aabb.getMin()
        const bMax = aabb.getMax()

        return (aMin.x <= bMax.x && aMax.x >= bMin.x) &&
            (aMin.y <= bMax.y && aMax.y >= bMin.y) &&
            (aMin.z <= bMax.z && aMax.z >= bMin.z)
    };

    obbIn(obb) {
        const o = obb.orientation.asArray

        const test = [
            new Vector3(1, 0, 0),          // AABB axis 1
            new Vector3(0, 1, 0),          // AABB axis 2
            new Vector3(0, 0, 1),          // AABB axis 3
            new Vector3(o[0], o[1], o[2]), // OBB axis 1
            new Vector3(o[3], o[4], o[5]), // OBB axis 2
            new Vector3(o[6], o[7], o[8])  // OBB axis 3
            // We will fill out the remaining axis in the next step
        ]

        for (let i = 0; i < 3; ++i) { // Fill out rest of axis
            test[6 + (i * 3) + 0] = test[i].cross(test[0])
            test[6 + (i * 3) + 1] = test[i].cross(test[1])
            test[6 + (i * 3) + 2] = test[i].cross(test[2])
        }

        const intervalInstance = new Interval()
        for (let i = 0; i < 15; ++i) {
            if (!intervalInstance.overlapOnAxis(this, obb, test[i])) {
                return false // Seperating axis found
            }
        }
        return true // Seperating axis not found
    }

    planeIn(plane) {
        const pLen = this.size.x * Math.abs(plane.normal.x) +
            this.size.y * Math.abs(plane.normal.y) +
            this.size.z * Math.abs(plane.normal.z)

        const dot = plane.normal.dot(this.position)
        const dist = dot - plane.distance
        return Math.abs(dist) <= pLen
    }

    raycast(ray) {
        const min = this.getMin()
        const max = this.getMax()

        const t1 = (min.x - ray.origin.x) / ray.direction.x
        const t2 = (max.x - ray.origin.x) / ray.direction.x
        const t3 = (min.y - ray.origin.y) / ray.direction.y
        const t4 = (max.y - ray.origin.y) / ray.direction.y
        const t5 = (min.z - ray.origin.z) / ray.direction.z
        const t6 = (max.z - ray.origin.z) / ray.direction.z

        console.log('AABB raycast')
        const tmin = Math.max(
            Math.max(
                Math.min(t1, t2),
                Math.min(t3, t4)
            ),
            Math.min(t5, t6)
        )
        const tmax = Math.min(
            Math.min(
                Math.max(t1, t2),
                Math.max(t3, t4)
            ),
            Math.max(t5, t6)
        )

        if (tmax < 0) return false
        if (tmin > tmax) return false

        // Не проверено
        const t = (tmin < 0) ? tmax : tmin
        const t2_ = (tmin < 0) ? tmin : tmax
        const point = ray.origin.add(ray.direction.multiplyS(t))
        let normal
        const normals = [
            new Vector3(-1, 0, 0), new Vector3(1, 0, 0),
            new Vector3(0, -1, 0), new Vector3(0, 1, 0),
            new Vector3(0, 0, -1), new Vector3(0, 0, 1),
        ]
        const t_arr = [t1, t2, t3, t4, t5, t6]
        for (let i = 0; i < 6; i++) {
            if (CMP(t, t_arr[i])) {
                normal = normals[i].normalize()
            }
        }
        return {
            t,
            t2: t2_,
            hit: true,
            point,
            normal
        }

        // if (tmin < 0) return tmax
        // return tmin
    }

    linetest(line) {
        const origin = line.start
        const direction = line.end.subtract(line.start).normalize()
        const ray = new Ray(origin, direction)
        const t = this.raycast(ray)

        return t >= 0 && t * t <= line.lengthSq()
    }

}

export class OBB extends AABB {
    constructor(position, size, orientation) {
        super(position, size)
        this.position = position || new Point3D()
        this.size = size || new Vector3()
        this.orientation = orientation || new Matrix3()
    }

    copy() {
        return new OBB(new Point3D(...this.position.asArray), new Vector3(...this.size.asArray), new Matrix3(...this.orientation.asArray))
    }

    get rotation() {
        // return new Vector3(this.orientation.)
        console.warn('OBB get rotation gives a correct result only at angles around the X axis from 0 to 90 degrees (excluding 0 and 90)')
        return this.orientation.decomposeYawPitchRoll()
    }

    getBounds() {
        const intervalInstance = new Interval()
        const xI = intervalInstance.getIntervalOBB(this, new Vector3(1, 0, 0))
        const yI = intervalInstance.getIntervalOBB(this, new Vector3(0, 1, 0))
        const zI = intervalInstance.getIntervalOBB(this, new Vector3(0, 0, 1))
        const min = new Vector3(xI.min, yI.min, zI.min)
        const max = new Vector3(xI.max, yI.max, zI.max)
        return AABB.fromMinMax(min, max)
    }

    pointIn(point) {

        let dir = point.subtract(this.position)
        for (let i = 0; i < 3; ++i) {
            const axis = new Vector3(...this.orientation[i])
            const distance = dir.dot(axis)
            if (distance > this.size.asArray[i]) return false
            if (distance < -this.size.asArray[i]) return false
        }
        return true
    };

    closestPoint(point) {
        let result = new Point3D(...this.position.asArray)
        let dir = point.subtract(this.position)
        for (let i = 0; i < 3; ++i) {
            const axis = new Vector3(...this.orientation[i])
            let distance = dir.dot(axis)
            if (distance > this.size.asArray[i]) distance = this.size.asArray[i]
            if (distance < -this.size.asArray[i]) distance = -this.size.asArray[i]
            result = result.add(axis.multiplyS(distance))
        }
        return result
    }

    sphereIn(sphere) {
        return sphere.obbIn(this)
    }

    aabbIn(aabb) {
        return aabb.obbIn(this)
    }

    obbIn(obb) {
        const o1 = this.orientation.asArray
        const o2 = obb.orientation.asArray

        const test = [
            new Vector3(o1[0], o1[1], o1[2]),
            new Vector3(o1[3], o1[4], o1[5]),
            new Vector3(o1[6], o1[7], o1[8]),
            new Vector3(o2[0], o2[1], o2[2]),
            new Vector3(o2[3], o2[4], o2[5]),
            new Vector3(o2[6], o2[7], o2[8])
        ]

        for (let i = 0; i < 3; ++i) { // Fill out rest of axis
            test[6 + i * 3 + 0] = test[i].cross(test[0])
            test[6 + i * 3 + 1] = test[i].cross(test[1])
            test[6 + i * 3 + 2] = test[i].cross(test[2])
        }

        const intervalInstance = new Interval()
        for (let i = 0; i < 15; ++i) {
            if (!intervalInstance.overlapOnAxis(this, obb, test[i])) {
                return false // Seperating axis found
            }
        }
        return true // Seperating axis not found
    }

    planeIn(plane) {
        const o = this.orientation.asArray
        const rot = [ // rotation / orientation
            new Vector3(o[0], o[1], o[2]),
            new Vector3(o[3], o[4], o[5]),
            new Vector3(o[6], o[7], o[8]),
        ]
        const normal = plane.normal
        const pLen = this.size.x * Math.abs(normal.dot(rot[0])) +
            this.size.y * Math.abs(normal.dot(rot[1])) +
            this.size.z * Math.abs(normal.dot(rot[2]))
        const dot = plane.normal.dot(obb.position)
        const dist = dot - plane.distance
        return Math.abs(dist) <= pLen
    }

    raycast(ray) {

        const o = this.orientation.asArray
        const size = this.size.asArray
        // X, Y and Z axis of OBB
        let X = new Vector3(o[0], o[1], o[2])
        let Y = new Vector3(o[3], o[4], o[5])
        let Z = new Vector3(o[6], o[7], o[8])
        const p = this.position.subtract(ray.origin)
        const f = new Vector3(
            X.dot(ray.direction),
            Y.dot(ray.direction),
            Z.dot(ray.direction)
        )
        const e = new Vector3(
            X.dot(p),
            Y.dot(p),
            Z.dot(p)
        )
        const t = [0, 0, 0, 0, 0, 0]

        const fAsArray = f.asArray
        const eAsArray = e.asArray

        for (let i = 0; i < 3; ++i) {
            if (CMP(fAsArray[i], 0)) {
                if (-eAsArray[i] - size[i] > 0 || -eAsArray[i] + size[i] < 0) {
                    return false
                }
                fAsArray[i] = 0.00001 // Avoid div by 0!
            }
            t[i * 2 + 0] = (eAsArray[i] + size[i]) / fAsArray[i] // min
            t[i * 2 + 1] = (eAsArray[i] - size[i]) / fAsArray[i] // max
        }

        const tmin = Math.max(
            Math.max(
                Math.min(t[0], t[1]),
                Math.min(t[2], t[3])),
            Math.min(t[4], t[5])
        )
        const tmax = Math.min(
            Math.min(
                Math.max(t[0], t[1]),
                Math.max(t[2], t[3])),
            Math.max(t[4], t[5])
        )
        if (tmax < 0) return false
        if (tmin > tmax) return false

        // Не проверено
        const t_res = (tmin < 0) ? tmax : tmin
        const t_res2 = (tmin < 0) ? tmin : tmax
        const point = ray.origin.add(ray.direction.multiplyS(t))
        let normal
        const normals = [
            X,			// +x
            X.multiplyS(-1),	// -x
            Y,			// +y
            Y.multiplyS(-1),	// -y
            Z,			// +z
            Z.multiplyS(-1)	// -z
        ]
        for (let i = 0; i < 6; i++) {
            if (CMP(t, t[i])) {
                normal = normals[i].normalize()
            }
        }
        return {
            t: t_res,
            t2: t_res2,
            hit: true,
            point,
            normal
        }

        // if (tmin < 0) return tmax
        // return tmin
    }

    linetest(line) {
        const origin = line.start
        const direction = line.end.subtract(line.start).normalize()
        const ray = new Ray(origin, direction)
        const t = this.raycast(ray)

        return t >= 0 && t * t <= line.lengthSq()
    }
}

export class Plane {
    constructor(normal, distance) {
        this.normal = normal || new Vector3(1, 0, 0)
        this.distance = distance || 0
    }

    planeEquation(point) {
        return point.dot(this.normal) - this.distance
    }

    pointOn(point) {
        const dot = point.dot(this.normal)
        return dot.subtract(this.distance) === 0
    }

    closestPoint(point) {
        const dot = point.dot(this.normal)
        const distance = dot - this.distance
        return point.subtract(this.normal).multiplyS(distance)
    }

    sphereIn(sphere) {
        return sphere.planeIn(this)
    }

    aabbIn(aabb) {
        return aabb.planeIn(this)
    }

    obbIn(obb) {
        return obb.planeIn(this)
    }

    planeIn(plane) {
        // Cross product returns 0 when used on parallel lines
        const d = this.normal.cross(plane.normal)
        return d.dot(d) !== 0 // Consider using an epsilon!
    }

    raycast(ray) {
        let nd = ray.direction.dot(this.normal)
        let pn = ray.origin.dot(this.normal)

        if (nd >= 0) return false
        const t = (this.distance - pn) / nd

        if (t < 0) return false

        const point = ray.origin.add(ray.direction.multiplyS(t))
        const normal = this.normal.normalize()

        return {
            t,
            hit: true,
            point,
            normal
        }

        // if (t >= 0) return t
        // return -1
    }

    linetest(line) {
        const ab = line.end.subtract(line.start)

        const nA = this.normal.dot(line.start)
        const nAB = this.normal.dot(ab)

        // If the line and plane are parallel, nAB will be 0
        // This will cause a divide by 0 exception below
        // If you plan on testing parallel lines and planes
        // it is sage to early out when nAB is 0.

        const t = (this.distance - nA) / nAB
        return t >= 0 && t <= 1
    }

}

export class Triangle {
    constructor(a, b, c) {
        this._a = a || new Point3D()
        this._b = b || new Point3D()
        this._c = c || new Point3D()
    }

    get a() {
        return this._a
    }

    set a(val) {
        this._a = val
    }

    get b() {
        return this._b
    }

    set b(val) {
        this._b = val
    }

    get c() {
        return this._c
    }

    set c(val) {
        this._c = val
    }

    get points() {
        return [this._a, this._b, this._c]
    }

    get values() {
        return [...this._a.asArray, ...this._b.asArray, ...this._c.asArray]
    }

    pointIn(point) {
        const a = this.a.subtract(point)
        const b = this.b.subtract(point)
        const c = this.c.subtract(point)

        const normPBC = b.cross(c) // Normal of PBC (u)
        const normPCA = c.cross(a) // Normal of PCA (v)
        const normPAB = a.cross(b) // Normal of PAB (w)
        if (normPBC.dot(normPCA) < 0) {
            return false
        } else if (normPBC.dot(normPAB) < 0) {
            return false
        }
        return true
    }

    fromTriangle() {
        const normal = this.b.subtract(this.a).cross(this.c.subtract(this.a)).normalize()
        const distance = normal.dot(this.a)
        return new Plane(normal, distance)
    }

    closestPoint(point) {
        const plane = this.fromTriangle()
        const closest = plane.closestPoint(point)
        if (this.pointIn(closest)) return closest

        const c1 = new Line(this.a, this.b).closestPoint(point) // Line AB
        const c2 = new Line(this.b, this.c).closestPoint(point) // Line BC
        const c3 = new Line(this.c, this.a).closestPoint(point) // Line CA

        const magSq1 = point.subtract(c1).magnitudeSq()
        const magSq2 = point.subtract(c2).magnitudeSq()
        const magSq3 = point.subtract(c3).magnitudeSq()

        if (magSq1 < magSq2 && magSq1 < magSq3) return c1
        else if (magSq2 < magSq1 && magSq2 < magSq3) return c2

        return c3
    };

    sphereIn(sphere) {
        const closest = this.closestPoint(sphere.position)
        const magSq = closest.subtract(sphere.position).magnitudeSq()
        return magSq <= sphere.radius * sphere.radius
    }

    aabbIn(aabb) {
        const f0 = this.b.subtract(this.a)
        const f1 = this.c.subtract(this.b)
        const f2 = this.a.subtract(this.c)

        const u0 = new Vector3(1, 0, 0)
        const u1 = new Vector3(0, 1, 0)
        const u2 = new Vector3(0, 0, 1)

        const test = [
            u0, // AABB Axis 1
            u1, // AABB Axis 2
            u2, // AABB Axis 3
            f0.cross(f1),
            u0.cross(f0), u0.cross(f1), u0.cross(f2),
            u1.cross(f0), u1.cross(f1), u1.cross(f2),
            u2.cross(f0), u2.cross(f1), u2.cross(f2)
        ]

        const intervalInstance = new Interval()
        for (let i = 0; i < 13; ++i) {
            if (!intervalInstance.overlapOnAxis(aabb, this, test[i])) {
                return false // Separating axis found
            }
        }
        return true // Separating axis not found
    };

    obbIn(obb) {
        const f0 = this.b.subtract(this.a)
        const f1 = this.c.subtract(this.b)
        const f2 = this.a.subtract(this.c)

        // const orientation = obb.orientation.asArray;

        const u0 = new Vector3(...obb.orientation[0])
        const u1 = new Vector3(...obb.orientation[1])
        const u2 = new Vector3(...obb.orientation[2])

        const test = [
            u0, // AABB Axis 1
            u1, // AABB Axis 2
            u2, // AABB Axis 3
            f0.cross(f1),
            u0.cross(f0), u0.cross(f1), u0.cross(f2),
            u1.cross(f0), u1.cross(f1), u1.cross(f2),
            u2.cross(f0), u2.cross(f1), u2.cross(f2)
        ]

        const intervalInstance = new Interval()
        for (let i = 0; i < 13; ++i) {
            if (!intervalInstance.overlapOnAxis(obb, this, test[i])) {
                return false // Separating axis found
            }
        }
        return true // Separating axis not found
    };

    planeIn(plane) {
        const side1 = plane.planeEquation(this.a)
        const side2 = plane.planeEquation(this.b)
        const side3 = plane.planeEquation(this.c)

        if (CMP(side1, 0) && CMP(side2, 0) && CMP(side3, 0)) {
            return true
        }
        if (side1 > 0 && side2 > 0 && side3 > 0) {
            return false
        }
        if (side1 < 0 && side2 < 0 && side3 < 0) {
            return false
        }
        return true
    };

    triangleIn(triangle) {
        const t1_f0 = this.b.subtract(this.a) // Triangle 1, Edge 0
        const t1_f1 = this.c.subtract(this.b) // Triangle 1, Edge 1
        const t1_f2 = this.a.subtract(this.c) // Triangle 1, Edge 2

        const t2_f0 = triangle.b.subtract(triangle.a) // Triangle 2, Edge 0
        const t2_f1 = triangle.c.subtract(triangle.b) // Triangle 2, Edge 1
        const t2_f2 = triangle.a.subtract(triangle.c) // Triangle 2, Edge 2

        const axisToTest = [
            t1_f0.cross(t1_f1),
            t2_f0.cross(t2_f1),
            t2_f0.cross(t1_f0), t2_f0.cross(t1_f1),
            t2_f0.cross(t1_f2), t2_f1.cross(t1_f0),
            t2_f1.cross(t1_f1), t2_f1.cross(t1_f2),
            t2_f2.cross(t1_f0), t2_f2.cross(t1_f1),
            t2_f2.cross(t1_f2),
        ]

        const intervalInstance = new Interval()
        for (let i = 0; i < 11; ++i) {
            if (!intervalInstance.overlapOnAxis(this, triangle, axisToTest[i])) {
                return false // Seperating axis found
            }
        }
        return true // Seperating axis not found
    }

    barycentric(point) {
        const ap = point.subtract(this.a)
        const bp = point.subtract(this.b)
        const cp = point.subtract(this.c)

        const ab = this.b.subtract(this.a)
        const ac = this.c.subtract(this.a)
        const bc = this.c.subtract(this.b)
        const cb = this.b.subtract(this.c)
        const ca = this.a.subtract(this.c)

        let v = ab.subtract(ab.project(cb))
        const a = 1 - (v.dot(ap) / v.dot(ab))

        v = bc.subtract(bc.project(ac))
        const b = 1 - (v.dot(bp) / v.dot(bc))

        v = ca.subtract(ca.project(ab))
        const c = 1 - (v.dot(cp) / v.dot(ca))

        return new Vector3(a, b, c)
    }

    raycast(ray) {
        const plane = this.fromTriangle()
        const raycast_res = plane.raycast(ray)
        if (!raycast_res) return false

        const t = raycast_res.t
        const result = ray.origin.add(ray.direction.multiplyS(t))

        const barycentric = result.barycentric(this)
        if (barycentric.x >= 0 && barycentric.x <= 1 &&
            barycentric.y >= 0 && barycentric.y <= 1 &&
            barycentric.z >= 0 && barycentric.z <= 1) {

            const normal = plane.normal.normalize()

            return {
                t,
                hit: true,
                point: result,
                normal
            }
            // return t
        }

        return false
    }

    linetest(line) {
        const origin = line.start
        const direction = line.end.subtract(line.start).normalize()
        const ray = new Ray(origin, direction)
        const t = this.raycast(ray)
        return t >= 0 && t * t <= line.lengthSq()
    }

}

export class Interval {
    constructor(min, max) {
        this.min = min || 0
        this.max = max || 0

        this.getIntervalAABB = (aabb, axis) => {
            const i = aabb.getMin()
            const a = aabb.getMax()

            let verts = [
                new Vector3(i.x, a.y, a.z),
                new Vector3(i.x, a.y, i.z),
                new Vector3(i.x, i.y, a.z),
                new Vector3(i.x, i.y, i.z),
                new Vector3(a.x, a.y, a.z),
                new Vector3(a.x, a.y, i.z),
                new Vector3(a.x, i.y, a.z),
                new Vector3(a.x, i.y, i.z)
            ]

            let min_ = axis.dot(verts[0])
            let max_ = min_

            for (let i = 1; i < 8; ++i) {
                let projection = axis.dot(verts[i])
                if (projection < min_) {
                    min_ = projection
                }
                if (projection > max_) {
                    max_ = projection
                }
            }
            return new Interval(min_, max_)

        }

        this.getIntervalOBB = (obb, axis) => {
            let verts = []

            const C = obb.position
            const E = obb.size.asArray
            const o = [...obb.orientation[0], ...obb.orientation[1], ...obb.orientation[2]]
            // OBB Axis
            const A = [
                new Vector3(o[0], o[1], o[2]),
                new Vector3(o[3], o[4], o[5]),
                new Vector3(o[6], o[7], o[8]),
            ]

            verts[0] = C
                .add(A[0].multiplyS(E[0]))
                .add(A[1].multiplyS(E[1]))
                .add(A[2].multiplyS(E[2]))
            verts[1] = C
                .subtract(A[0].multiplyS(E[0]))
                .add(A[1].multiplyS(E[1]))
                .add(A[2].multiplyS(E[2]))
            verts[2] = C
                .add(A[0].multiplyS(E[0]))
                .subtract(A[1].multiplyS(E[1]))
                .add(A[2].multiplyS(E[2]))
            verts[3] = C
                .add(A[0].multiplyS(E[0]))
                .add(A[1].multiplyS(E[1]))
                .subtract(A[2].multiplyS(E[2]))
            verts[4] = C
                .subtract(A[0].multiplyS(E[0]))
                .subtract(A[1].multiplyS(E[1]))
                .subtract(A[2].multiplyS(E[2]))
            verts[5] = C
                .add(A[0].multiplyS(E[0]))
                .subtract(A[1].multiplyS(E[1]))
                .subtract(A[2].multiplyS(E[2]))
            verts[6] = C
                .subtract(A[0].multiplyS(E[0]))
                .add(A[1].multiplyS(E[1]))
                .subtract(A[2].multiplyS(E[2]))
            verts[7] = C
                .subtract(A[0].multiplyS(E[0]))
                .subtract(A[1].multiplyS(E[1]))
                .add(A[2].multiplyS(E[2]))

            // console.log('verts',verts);

            let min_ = axis.dot(verts[0])
            let max_ = min_

            for (let i = 1; i < 8; ++i) {
                let projection = axis.dot(verts[i])
                if (projection < min_) {
                    min_ = projection
                }
                if (projection > max_) {
                    max_ = projection
                }
            }
            return new Interval(min_, max_)
        }

        this.getIntervalTriangle = (triangle, axis) => {

            let min_ = axis.dot(triangle.points[0])
            let max_ = min_

            for (let i = 1; i < 3; ++i) {
                const value = axis.dot(triangle.points[i])
                min_ = Math.min(min_, value)
                max_ = Math.max(max_, value)
            }
            return new Interval(min_, max_)
        }

        this.getInterval = (__bb, axis) => {
            if (__bb instanceof OBB) return this.getIntervalOBB(__bb, axis)
            if (__bb instanceof AABB) return this.getIntervalAABB(__bb, axis)
            if (__bb instanceof Triangle) return this.getIntervalTriangle(__bb, axis)
            throw 'Неизвестный тип параллелепипеда'
        }

        this.overlapOnAxis = (__bb1, __bb2, axis) => {
            const a = this.getInterval(__bb1, axis)
            const b = this.getInterval(__bb2, axis)
            return ((b.min <= a.max) && (a.min <= b.max))
        }

    }


}


export class Mesh {
    constructor(obj = {}, accelerator) {
        this.numTriangles = 0
        this._triangles = obj.triangles || []
        this._vertices = obj.vertices || []
        this._values = []

        this._bounds = null
        if (obj.values) this.values = obj.values

        this.accelerator = accelerator


    }

    get vertices() {
        return this._vertices
    }

    get triangles() {
        return this._triangles
    }

    get values() {
        return this._values
    }

    set values(val) {
        this._values = val
        this._vertices = []
        this._triangles = []
        let arr = []
        this._values.forEach(one => {
            this._vertices.push(one)
            arr.push(one)
            if (arr.length === 3) {
                this._triangles.push(new Triangle(...arr))
                arr = []
            }
        })
    }

    get bounds() {
        if (!this._bounds) {
            this._bounds = AABB.fromMinMax(this.getMin(), this.getMax())
        }
        return this._bounds
    }


    getMin() {
        const min = new Vector3(0, 0, 0)

        for (let i = 0; i < this.vertices.length; ++i) {
            let vertex = this.vertices[i] || new Vector3(0, 0, 0)
            min.x = Math.min(vertex.x, min.x)
            min.y = Math.min(vertex.y, min.y)
            min.z = Math.min(vertex.z, min.z)
        }

        return min
    }

    getMax() {
        const max = new Vector3(0, 0, 0)

        for (let i = 0; i < this.vertices.length; ++i) {
            let vertex = this.vertices[i] || new Vector3(0, 0, 0)
            max.x = Math.max(vertex.x, max.x)
            max.y = Math.max(vertex.y, max.y)
            max.z = Math.max(vertex.z, max.z)
        }

        return max
    }

    accelerate() {
        if (!this.accelerator) {
            return
        }
        // const min = this.vertices[0] || new Vector3(0, 0, 0)
        // const max = this.vertices[0] || new Vector3(0, 0, 0)
        // for (let i = 1; i < this.vertices.length; ++i) {
        //     let vertex = this.vertices[i] || new Vector3(0, 0, 0)
        //     min.x = Math.min((vertex).x, min.x)
        //     min.y = Math.min((vertex).y, min.y)
        //     min.z = Math.min((vertex).z, min.z)
        //     max.x = Math.max(vertex.x, max.x)
        //     max.y = Math.max(vertex.y, max.y)
        //     max.z = Math.max(vertex.z, max.z)
        // }
        const min = this.getMin()
        const max = this.getMax()

        this.accelerator = new BVHNode()
        // const aabbInstance = new AABB()
        this.accelerator.bounds = AABB.fromMinMax(min, max)
        this.accelerator.triangles = [...Object.keys(this.triangles)]
        this.accelerator.split(this, 3)
    }

    meshRay(ray) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                const res = triangle.raycast(ray)
                if (res >= 0) return res
            }
            return -1
        }

        return this.accelerator.objectIn(this, ray, 'raycast')
    }

    meshAABB(aabb) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.aabbIn(aabb)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, aabb, 'aabbIn')
    }

    linetest(line) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.linetest(line)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, line, 'linetest')
    };

    meshSphere(sphere) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.sphereIn(sphere)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, sphere, 'sphereIn')
    };

    meshOBB(obb) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.obbIn(obb)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, obb, 'obbIn')
    };

    meshPlane(plane) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.planeIn(plane)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, plane, 'planeIn')
    };

    meshTriangle(triangle) {
        if (!this.accelerator) {
            for (let i in this.triangles) {
                let triangle = this.triangles[i]
                if (triangle.triangleIn(triangle)) return true
            }
            return false
        }
        return this.accelerator.objectIn(this, triangle, 'triangleIn')
    };
}

export class BVHNode {
    constructor() {
        this.bounds = null // aabb
        this.children = [] // [] of BVHNode
        this.triangles = [] // [] of Triangles INDEXES from model (Mesh)
        // BVHNode() : children(0), numTriangles(0), triangles(0) {}
    }

    // get bounds(){
    //     return this._bounds;
    // }
    // set bounds(val){
    //     this._bounds = val;
    // }
    // get children(){
    //     return this._children;
    // }
    // set children(val){
    //     this._children = val;
    // }
    // get triangles(){
    //     return this._triangles;
    // }
    // set triangles(val){
    //     this._triangles = val;
    // }

    split(model, depth) {
        if (depth-- === 0) { // Decrements depth
            return
        }
        if (!this.children && this.triangles.length) { // Only split if it's a leaf
            // Only split if this node contains triangles
            const c = this.bounds.position
            const e = this.bounds.size.multiplyS(0.5)

            this.children[0].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, -e.z), e))
            this.children[1].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, -e.z), e))
            this.children[2].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, +e.z), e))
            this.children[3].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, +e.z), e))
            this.children[4].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, -e.z), e))
            this.children[5].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, -e.z), e))
            this.children[6].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, +e.z), e))
            this.children[7].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, +e.z), e))
        }
        // If this node was just split
        if (this.children && this.triangles.length) {
            this.children.forEach(child => {
                this.triangles.forEach(t_index => {
                    const t = model.triangles[t_index]
                    if (t.aabbIn(child.bounds)) {
                        child.triangles.push(t_index)
                        // this.children[i].numTriangles += 1;
                    }
                })
                if (!child.triangles.length) return
                child.split(model, depth)

            })
        }
    }

    // split(model, depth) {
    //     if (depth-- === 0) { // Decrements depth
    //         return;
    //     }
    //     if (!this.children) { // Only split if it's a leaf
    //         // Only split if this node contains triangles
    //         if (this.numTriangles > 0) {
    //             // this.children = new BVHNode(8);
    //             this.children = [];
    //             const c = this.bounds.position;
    //             const e = this.bounds.size.multiplyS(0.5);
    //
    //             this.children[0].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, -e.z), e));
    //             this.children[1].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, -e.z), e));
    //             this.children[2].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, +e.z), e));
    //             this.children[3].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, +e.z), e));
    //             this.children[4].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, -e.z), e));
    //             this.children[5].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, -e.z), e));
    //             this.children[6].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, +e.z), e));
    //             this.children[7].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, +e.z), e));
    //         }
    //     }
    //     // If this node was just split
    //     if (this.children && this.numTriangles > 0) {
    //         for (let i = 0; i < 8; ++i) { // For each child
    //             this.children[i].numTriangles = 0;
    //             for (let j = 0; j < this.numTriangles; j++) {
    //                 const t = model.triangles[this.triangles[j]];
    //                 // if (TriangleAABB(t, this.children[i].bounds)) {
    //                 if (t.aabbIn(this.children[i].bounds)) {
    //                     this.children[i].numTriangles += 1;
    //                 }
    //             }
    //             if (this.children[i].numTriangles === 0) {
    //                 continue;
    //             }
    //             this.children[i].triangles = this.children[i].numTriangles;
    //             let index = 0;
    //             for (let j = 0; j < this.numTriangles; ++j) {
    //                 const t = model.triangles[this.triangles[j]];
    //                 if (t.aabbIn(this.children[i].bounds)) {
    //                     this.children[i].triangles[index++] = this.triangles[j];
    //                 }
    //             }
    //         }
    //         this.numTriangles = 0;
    //         this.triangles = 0;
    //         for (let i = 0; i < 8; i++) {
    //             this.children[i].split(model, depth);
    //         }
    //     }
    // }
    free() {
        this.bounds = null
        this.children = []
        this.triangles = []
    }

    objectIn(model, object_, func_name) {
        const false_res = func_name === 'raycast' ? -1 : false
        for (let i in this.triangles) {
            let t_index = this.triangles[i]
            if (typeof model.triangles[t_index][func_name] !== 'function') return false_res
            const res = model.triangles[t_index][func_name](object_)
            if (res >= 0) return res
        }

        if (!this.children.length) return false_res

        for (let i in this.children) {
            const child = this.children[i]
            // Если мы пересекаем этот (дочерний, один из 8) ящик (область), то вызовем проверку и для него
            if (child.bounds[func_name](object_) >= 0) {
                let res = child.objectIn(model, object_, func_name)
                if (res >= 0) return res
            }
        }
        return false_res
    }

    // raycast(model, ray){
    //     for (let i in this.triangles) {
    //         let t_index = this.triangles[i];
    //         const res = model.triangles[t_index].raycast(ray);
    //         if (res >= 0) return res;
    //     }
    //
    //     if (!this.children.length) return -1;
    //
    //     for (let i in this.children) {
    //         const child = this.children[i];
    //         // Если мы пересекаем этот (дочерний, один из 8) ящик (область), то вызовем проверку и для него
    //         if (child.bounds.raycast(ray) >= 0) {
    //             let res = child.raycast(model, ray);
    //             if (res >= 0) return res;
    //         }
    //     }
    //     return -1;
    // }


}

export class Model {
    static fromOBJ(obj = {}, dropOrig) {
        let content, pos, size, orientation
        if (obj.content && obj.content.instanceName) {
            switch (obj.content.instanceName) {
                case 'AABB':
                    pos = new Vector3(obj.content.position._x, obj.content.position._y, obj.content.position._z)
                    size = new Vector3(obj.content.size._x, obj.content.size._y, obj.content.size._z)
                    content = new AABB(pos, size)
                    break
                case 'OBB':
                    pos = new Vector3(obj.content.position._x, obj.content.position._y, obj.content.position._z)
                    size = new Vector3(obj.content.size._x, obj.content.size._y, obj.content.size._z)
                    orientation = new Matrix3(...[...obj.content.orientation[0], ...obj.content.orientation[1], ...obj.content.orientation[2]])
                    content = new OBB(pos, size, orientation)
                    break
                default:
                    console.warn('Method has not implementation for this instanceName', obj.content.instanceName, obj.content)
                    break
            }
        }

        if (dropOrig) {
            obj.position_orig = undefined
            obj.rotation_orig = undefined
        }

        const position_ = obj.position_orig || obj.position
        const position = position_ ? new Vector3(position_._x, position_._y, position_._z) : null


        let rotation_ = obj.rotation_orig || obj.rotation
        const rotation = rotation_ ? new Vector3(rotation_._x, rotation_._y, rotation_._z) : null

        if (obj.states && Array.isArray(obj.states)) {
            obj.states = obj.states.map(state => {
                const objRes = {...state}
                objRes.editMode = false // не важно что сохранено
                if (state.position) {
                    state.position = new Vector3(state.position._x, state.position._y, state.position._z)
                    objRes.position = new Vector3(...state.position.asArray)
                }
                if (state.rotation) {
                    state.rotation = new Vector3(state.rotation._x, state.rotation._y, state.rotation._z)
                    objRes.rotation = new Vector3(...state.rotation.asArray)
                }
                return objRes
            })
        }


        const model = new Model({...obj, content, position, rotation})

        if (obj.childs && Array.isArray(obj.childs)) {
            obj.childs.forEach(child => {
                model.addChild(Model.fromOBJ(child, dropOrig))
            })
        }
        return model

    }

    constructor(obj = {}) {

        this.id = uuidv1()
        this.name = obj.name || 'unnamed'

        this._content = null // Mesh|AABB|OBB
        this._parent = null // Model
        this._childs = []
        this._bounds = null // AABB
        this._boundsFull = null // AABB (with childs)
        this.type = obj.type || ''
        this.states = obj.states || []
        this._wheelAxles = obj.wheelAxles || []


        this._position = obj.position || new Vector3()
        this.graphicOptions = obj.graphicOptions || {}


        if (obj.content) this.content = obj.content
        if (obj.rotation) this.rotation = obj.rotation

        if (!this._rotation) this._rotation = new Vector3()


        Object.keys(obj).forEach(key => {
            if (typeof this[key] === 'undefined') this[key] = obj[key]
        })

        this.isSupport = obj.isSupport // Опорный box

        this.supportGroups = this.isSupport
            ? obj.supportGroups
            || (() => {
                // console.log('this.content.size', this.content.size.asArray, this.position.asArray)
                let sizeCorrected = this.content && this.content.size ? this.content.size : this.bounds.size
                if (this.content) sizeCorrected = sizeCorrected.subtract(this.content.position)

                // const supportOffset = obj.supportOffset || 100
                // const supportOffsetX = obj.supportOffsetX || supportOffset || 100
                // const supportOffsetZ = obj.supportOffsetZ || supportOffset || 100
                // const supportOffsetY = obj.supportOffsetY || -300

                const supportOffset = obj.supportOffset || 0
                const supportOffsetX = obj.supportOffsetX || supportOffset || 100
                const supportOffsetZ = obj.supportOffsetZ || supportOffset || 100
                const supportOffsetY = obj.supportOffsetY || -300

                const groups = []
                const dic = [
                    {
                        name: 'FRONT_LEFT',
                        items: [
                            {
                                id: uuidv1(),
                                point: new Point3D(sizeCorrected.x - supportOffsetX, -sizeCorrected.y + supportOffsetY, -sizeCorrected.z + supportOffsetZ),
                            },
                            // {
                            //     id: uuidv1(),
                            //     point: new Point3D(sizeCorrected.x, -sizeCorrected.y, -sizeCorrected.z + supportOffsetZ),
                            // }
                        ]
                    },
                    {
                        name: 'FRONT_RIGHT',
                        items: [
                            {
                                id: uuidv1(),
                                point: new Point3D(sizeCorrected.x - supportOffsetX, -sizeCorrected.y + supportOffsetY, sizeCorrected.z - supportOffsetZ),
                            },
                            // {
                            //     id: uuidv1(),
                            //     point: new Point3D(sizeCorrected.x, -sizeCorrected.y, sizeCorrected.z - supportOffsetZ),
                            // }
                        ]
                    },
                    {
                        name: 'REAR_LEFT',
                        items: [
                            {
                                id: uuidv1(),
                                point: new Point3D(-sizeCorrected.x + supportOffsetX, -sizeCorrected.y + supportOffsetY, sizeCorrected.z - supportOffsetZ)
                            },
                            // {
                            //     id: uuidv1(),
                            //     point: new Point3D(-sizeCorrected.x, -sizeCorrected.y, sizeCorrected.z - supportOffsetZ)
                            // }
                        ]
                    },
                    {
                        name: 'REAR_RIGHT',
                        items: [
                            {
                                id: uuidv1(),
                                point: new Point3D(-sizeCorrected.x + supportOffsetX, -sizeCorrected.y + supportOffsetY, -sizeCorrected.z + supportOffsetZ),
                            },
                            // {
                            //     id: uuidv1(),
                            //     point: new Point3D(-sizeCorrected.x, -sizeCorrected.y, -sizeCorrected.z + supportOffsetZ),
                            // }
                        ]
                    }
                ]

                for (let i = 0; i < 4; i++) {

                    // const items = []
                    // for (let j = 0; j < 2; j++) {
                    //     items.push(dic[i].items[0])
                    // }
                    groups.push({
                        id: uuidv1(),
                        name: dic[i].name,
                        modelId: this.id,
                        items: dic[i].items
                        // items: items
                    })
                }

                return groups

                // return [
                //     {
                //         name: 'MAIN',
                //         modelId: this.id,
                //         items: [
                //             new Point3D(sizeCorrected.x - supportOffsetX, -sizeCorrected.y + supportOffsetY, sizeCorrected.z - supportOffsetZ),
                //             new Point3D(sizeCorrected.x - supportOffsetX, -sizeCorrected.y + supportOffsetY, -sizeCorrected.z + supportOffsetZ),
                //             new Point3D(-sizeCorrected.x + supportOffsetX, -sizeCorrected.y + supportOffsetY, -sizeCorrected.z + supportOffsetZ),
                //             new Point3D(-sizeCorrected.x + supportOffsetX, -sizeCorrected.y + supportOffsetY, sizeCorrected.z - supportOffsetZ)
                //         ]
                //     },
                // ]
            })()
            : null

        this.isPlatform = obj.isPlatform // On this plane can be placed transport (another objects)
        this.isRamp = obj.isRamp // On this plane transport can move up
        this.isSteepRamp = obj.isSteepRamp // On this plane transport can move up

        this.rollbacks = {}

        this.saveOrigState()

    }

    saveOrigState() {
        this.position_orig = new Vector3(...this._position.asArray)
        this.rotation_orig = new Vector3(...this._rotation.asArray)
    }


    destroy() {
        this._parent = null
        this._childs.forEach(one => one.destroy())
        this._childs = null
        // if (this.type === 'THREEJS_OBJ'){
        //     this._content.geometry.dispose()
        // }
        this._content = null
    }


    getForStore() {
        const res = {
            content: this.content && getPrimitiveInstanceName(this.content) ? this.content : null,
            childs: this.childs.map(child => child.getForStore()),
            position: this.position,
            rotation: this.rotation,
            position_orig: this.position_orig,
            rotation_orig: this.rotation_orig,
            states: this.states,
            wheelAxles: this._wheelAxles,
            graphicOptions: cloneObj(this.graphicOptions),
        }
        if (res.content) res.content.instanceName = getPrimitiveInstanceName(res.content)
        Object.keys(this).forEach(key => {
            if (key.charAt(0) === '_') key = key.slice(1)
            if ((typeof this[key] === 'object' && this[key] !== null) || typeof this[key] === 'function') return
            if (!(this.hasOwnProperty(key) || hasSetter(this, key))) return
            res[key] = this[key]
        })


        return res
    }


    get topModelId() {
        return this.parent ? this.parent.topModelId : this.id
    }

    getTopModel() {
        return this.parent ? this.parent.getTopModel() : this
    }

    isTop() {
        return !this.parent
    }

    get isTop(){
        return !this.parent
    }

    get bounds() {
        return this._bounds
    }

    set bounds(val) {
        this._bounds = val
    }

    get boundsFull() {
        if (!this._boundsFull) {


            let world = this.getWorldMatrix()
            let aabb = this._content.getBounds()

            let size = aabb.size

            let position = world.multiplyPoint(aabb.position)
            let orientation = world.cut(3, 3)
            const local = new OBB(position, size, orientation).getBounds()

            let min = local.getMin()
            let max = local.getMax()

            const bounds = [...this._childs]
            bounds.forEach(one => {
                const local = one.boundsFull
                const oneMin = local.getMin()
                const oneMax = local.getMax()

                if (min.x > oneMin.x) min.x = oneMin.x
                if (min.y > oneMin.y) min.y = oneMin.y
                if (min.z > oneMin.z) min.z = oneMin.z
                if (max.x < oneMax.x) max.x = oneMax.x
                if (max.y < oneMax.y) max.y = oneMax.y
                if (max.z < oneMax.z) max.z = oneMax.z
            })


            // console.log('this.supportGroupsAll', this.supportGroupsAll)
            this.supportGroupsAll.forEach(group => {
                group.items.forEach(one => {
                    if (min.x > one.point.x) min.x = one.point.x
                    if (min.y > one.point.y) min.y = one.point.y
                    if (min.z > one.point.z) min.z = one.point.z
                    if (max.x < one.point.x) max.x = one.point.x
                    if (max.y < one.point.y) max.y = one.point.y
                    if (max.z < one.point.z) max.z = one.point.z
                })
                // const local = one.boundsFull
                // const oneMin = local.getMin()
                // const oneMax = local.getMax()
                //
                // if (min.x > oneMin.x) min.x = oneMin.x
                // if (min.y > oneMin.y) min.y = oneMin.y
                // if (min.z > oneMin.z) min.z = oneMin.z
                // if (max.x < oneMax.x) max.x = oneMax.x
                // if (max.y < oneMax.y) max.y = oneMax.y
                // if (max.z < oneMax.z) max.z = oneMax.z
            })

            this._boundsFull = AABB.fromMinMax(min, max)
        }
        // console.log(this._boundsFull.size);
        return this._boundsFull
    }

    getAllStates(fromParent) {
        if (!fromParent && this.parent) {
            return this.parent.getAllStates()
        }
        return [...this.states, ...this._childs.map(one => one.getAllStates(true)).flat()]
    }

    getTopStates() {
        return this.getTopModel().states
    }

    get selectedState() {
        if (typeof this._selectedState !== 'undefined') return this._selectedState
        this._selectedState = this.getTopModel()._selectedState
        return this._selectedState
    }

    clearSelectedState(fromParent) {
        if (!fromParent && this.parent) {
            return this.parent.clearSelectedState()
        }
        this._selectedState = undefined
        this._childs.forEach(one => one.clearSelectedState(true))
    }

    set selectedState(state) {
        this.clearSelectedState()
        this.getTopModel()._selectedState = state
    }

    clearBoundsFull(fromParent) {
        if (!fromParent && this.parent) {
            return this.parent.clearBoundsFull()
        }
        this._boundsFull = null
        this.updatePosition()
        this._childs.forEach(one => one.clearBoundsFull(true))
    }

    updatePosition(vDirection) {
        this._getWorldMatrix = null
        this._supportGroupsAll = null
        this._wheelAxlesWorld = null
        this._platforms = null
        if (vDirection && this._boundsFull) {
            this._boundsFull.position = this._boundsFull.position.add(vDirection)
        }
        if (!this.getTopModel().isInToStateProcess) {
            if (this.selectedState && this.selectedState.editMode) this.saveToSelectedState()
            else if (!this.selectedState) this.saveOrigState()
        }
        this._childs.forEach(one => one.updatePosition(vDirection))
    }

    calcBounds() {
        if (!this._content) return new AABB()
        if (this.type === 'THREEJS_OBJ') return new AABB()

        const min = this._content.getMin()
        const max = this._content.getMax()
        return AABB.fromMinMax(min, max)
    }

    get content() {
        return this._content
    }

    set content(val) {
        this._content = val
        // if (!this._content) return

        this.bounds = this.calcBounds()
        // return
    }

    get supportGroupsAll() {
        if (this._supportGroupsAll) return this._supportGroupsAll

        // const groups = []

        const world = this.getWorldMatrix()
        const groups = this.supportGroups
            ? this.supportGroups.map(one => {
                return {
                    ...one,
                    items: one.items.map(item => {
                        const newItem = {
                            ...item,
                            point: world.multiplyPoint(item.point)
                        }
                        return newItem
                    })
                }
            })
            : []
        this.childs.forEach(child => {
            groups.push(...child.supportGroupsAll)
        })
        this._supportGroupsAll = groups

        return this._supportGroupsAll
    }

    get wheelAxles(){
        if (this._wheelAxlesWorld) return this._wheelAxlesWorld

        const world = this.getWorldMatrix()
        this._wheelAxlesWorld = this._wheelAxles.map(axle=>{
            const point = world.multiplyPoint(new Point3D(axle.x, axle.y, 0))
            return {
                ...axle,
                x:point.x,
                y:point.y,
            }
        })
        return this._wheelAxlesWorld
    }

    get platforms() {
        if (this._platforms) return this._platforms
        this._platforms = this.isPlatform
            ? [this.getOBB()]
            : []
        this.childs.forEach(child => {
            this._platforms.push(...child.platforms)
        })

        return this._platforms
    }

    get rotation() {
        return this._rotation
    }

    /**
     * Method set rotation
     * All components of the rotation vector will be replaced
     * @param vRotation
     */
    set rotation(vRotation) {
        if (!(vRotation instanceof Vector3)) throw new Error('Value must be Vector3')
        this._rotation = vRotation
        // Обнулим _boundsFull чтобы они посчитались при следующей необходимости заново
        this.clearBoundsFull()
        if (!this.getTopModel().isInToStateProcess) {
            if (this.selectedState && this.selectedState.editMode) this.saveToSelectedState()
            else if (!this.selectedState) this.saveOrigState()
        }
    }

    get position() {
        return this._position
    }

    set position(vPosition) {
        if (!(vPosition instanceof Vector3)) throw new Error('Value must be Vector3')
        const diffX = vPosition.x - this.position.x
        const diffY = vPosition.y - this.position.y
        const diffZ = vPosition.z - this.position.z
        this.move(new Vector3(diffX, diffY, diffZ))
    }

    get absolutePosition() {
        let world = this.getWorldMatrix()
        // const inv = world.inverse()
        // const position = world.multiplyPoint(new Vector3(...this.position.asArray))
        const position = world.getTranslation()
        // if (this.parent) return position.add(this.parent.absolutePosition)
        return position
    }

    // set positionX(val){
    //     if (!(vPositions instanceof Vector3)) throw new Error('Value must be Vector3')
    //     this._position = vRotation
    //     // Обнулим _boundsFull чтобы они посчитались при следующей необходимости заново
    //     this.clearBoundsFull()
    // }

    get parent() {
        return this._parent
    }

    get childs() {
        return this._childs
    }

    get verticesAll() {
        if (this._verticesAll) return this._verticesAll
        this._verticesAll = []
        if (this.type !== 'THREEJS_OBJ') return this._verticesAll

        function getChildVertices(node) {
            let vertices = []
            if (node.geometry) {
                const position = node.geometry.attributes.position
                const vector = new THREE.Vector3()

                let arr = []
                position.array.forEach(one => {
                    arr.push(one)
                    if (arr.length === 3) {
                        const vector = new THREE.Vector3(...arr).applyMatrix4(node.matrixWorld)
                        vertices.push(vector)
                        // vertices.push(new Vector3(...arr))
                        arr = []
                    }
                })
                // for (let i = 0; i < position.length; i++) {
                //     arr.push(position[i])
                //     if (arr.length === 3){
                //         vertices.push(new Vector3(...arr))
                //         arr = []
                //     }
                // }

                // for (let i = 0, l = position.count; i < l; i++) {
                //
                //     // vector.fromBufferAttribute(position, i)
                //     // // console.log(vector);
                //     // // vector.applyMatrix4(node.matrixWorld)
                //     // vertices.push(vector)
                //
                //     arr.push(position[i])
                //     if (arr.length === 3){
                //         vertices.push(new Vector3(...arr))
                //         arr = []
                //     }
                // }

                // for (let i = 0, l = position.count; i < l; i++) {
                //
                //     vector.fromBufferAttribute(position, i)
                //     // console.log(vector);
                //     // vector.applyMatrix4(node.matrixWorld)
                //     vertices.push(vector)
                // }
            }
            if (node.children && node.children.length) {
                node.children.forEach(child => {
                    vertices = vertices.concat(getChildVertices(child))
                })
            }
            return vertices
        }

        this._verticesAll = getChildVertices(this._content)
        return this._verticesAll
    }

    getById(id) {
        if (this.id === id) return this

        for (let i = 0; i < this.childs.length; i++) {
            const model = this.childs[i].getById(id)
            if (model) return model
        }
        return false
    }

    addChild(child) {
        if (!(child instanceof Model)) throw new Error('child must be a Model instance')
        child._parent = this
        if (!this._childs.includes(child)) this._childs.push(child)
        this.clearBoundsFull()
    }

    removeChild(child) {
        child.destroy()
        this._childs = this._childs.filter(one => one !== child)
        this.clearBoundsFull()
    }

    getAllChilds(model) {
        const res = model ? [model] : []
        if (!model) model = this
        if (Array.isArray(model.childs)) model.childs.forEach(one => res.push(...this.getAllChilds(model.childs)))
        return res
    }

    getWorldMatrix() {
        if (this._getWorldMatrix) return this._getWorldMatrix

        let translation = new Matrix4().translation(this.position)
        let rotation = new Matrix4().rotation(...this.rotation.asArray)

        let localMat = rotation.multiply(translation)

        let parentMat = this.parent ? this.parent.getWorldMatrix() : null

        // if (this.parent){
        //     localMat = localMat.multiply(this.parent.getWorldMatrix())
        // } else {
        //     localMat = localMat.multiply(new Matrix4(1, 0, 0, 0,
        //         0, 1, 0, 0,
        //         0, 0, 1, 0,
        //         0, 0, 0, 1))
        // }
        this._getWorldMatrix = parentMat ? localMat.multiply(parentMat) : localMat
        return this._getWorldMatrix
    }

    getOBB() {
        let world = this.getWorldMatrix()
        let aabb = this.bounds

        let size = aabb.size
        let position = world.multiplyPoint(aabb.position)
        let orientation = world.cut(3, 3)

        // if (this._content && this._content.orientation) orientation = orientation.multiply(this._content.orientation)
        if (this._content && this._content.orientation) orientation = this._content.orientation.multiply(orientation)

        return new OBB(position, size, orientation)
    };

    addState(name, sysname) {
        if (sysname && typeof sysname !== 'string') sysname = '' + sysname
        const exist = this.states.filter(one => one.sysname === sysname)[0]
        if (exist) return exist
        const state = {
            name: name || 'Unnamed',
            sysname
        }
        this.states.push(state)

        if (this.parent) {
            // Добавим стейт верхней модели
            const topModel = this.getTopModel()
            const topModelState = topModel.states.filter(one => one.sysname === sysname)[0]
            if (!topModelState) topModel.addState(state.name, state.sysname)
        }

        return state
    }

    copyState(state, options = {}) {
        let newState
        if (state) {
            if (!options.sysname_orig) options.sysname_orig = state.sysname
            const copyOfState = {}
            Object.keys(state).forEach(key => {
                if (state[key] instanceof Vector3) copyOfState[key] = new Vector3(...state[key].asArray)
                else if (typeof state[key] === 'object' && state[key] !== null) copyOfState[key] = cloneObj(state[key])
                copyOfState[key] = state[key]
            })
            newState = {...copyOfState, ...options}
            this.states.push(newState)
        } else {
            newState = this.addState(options.name, options.sysname)
        }

        this.childs.forEach(child => {
            const childState = child.states.filter(one => one.sysname === options.sysname_orig)[0]
            child.copyState(childState, options)
        })

        return newState
    }

    generateState(stateOrigSysname, options = {}) {
        if (stateOrigSysname && typeof stateOrigSysname !== 'string') stateOrigSysname = '' + stateOrigSysname
        const state = this.getTopModel().states.filter(one => one.sysname === stateOrigSysname)[0]
        const namePostfix = options.namePostfix || ''
        const name = options.name || (state ? state.name + '_' + namePostfix : namePostfix)
        const sysnamePostfix = options.sysnamePostfix
            ? options.sysnamePostfix.toUpperCase().replace(/\s/ig, '_')
            : namePostfix.toUpperCase().replace(/\s/ig, '_')
        const sysname = options.sysname || (state ? state.sysname + '_' + sysnamePostfix : sysnamePostfix)
        if (!sysname) return new MyError('No sysname or namePostfix or sysnamePostfix', {options})
        const exist = this.getTopModel().states.filter(one => one.sysname === sysname)[0]
        if (exist) return new UserError('State with same sysname already exist', {options, exist})

        let newState = this.copyState(state, {name, sysname})
        // let newState = this.addState(name, sysname)

        const selectedState = this.selectedState
        this.toState(newState.sysname)
        this.selectedState.editMode = true
        this.selectedState.generated = true
        if (options.rotate) this.rotate(options.rotate)
        if (options.move) this.move(options.move)
        this.selectedState.editMode = false
        this.toState(selectedState)

    }

    removeState(sysname, fromParent) {
        if (sysname && typeof sysname !== 'string') sysname = '' + sysname
        if (!fromParent && this.parent) {
            return this.parent.saveToSelectedState()
        }
        if (!fromParent && this.selectedState && this.selectedState.sysname === sysname) this.toState()
        this.states = this.states.filter(one => one.sysname !== sysname)
        this._childs.forEach(one => one.removeState(sysname, true))
    }

    saveToSelectedState(fromParent) {
        if (!fromParent && this.parent) {
            return this.parent.saveToSelectedState()
        }

        if (!this.selectedState) return

        const changes = {}

        // const state =
        //     this.states.filter(one => one.sysname === this.selectedState.sysname)[0]
        //     || this.addState(this.selectedState.name, this.selectedState.sysname)

        if (this.position_orig && !this.position.equal(this.position_orig)) changes['position'] = new Vector3(...this.position.asArray)
        if (this.rotation_orig && !this.rotation.equal(this.rotation_orig)) changes['rotation'] = new Vector3(...this.rotation.asArray)

        // if (state.position && !this.position.equal(state.position)) changes['position'] = new Vector3(...this.position.asArray)
        // if (state.rotation && !this.rotation.equal(state.rotation)) changes['rotation'] = new Vector3(...this.rotation.asArray)
        // Object.keys(changes).forEach(key => state[key] = changes[key])

        let state = this.states.filter(one => one.sysname === this.selectedState.sysname)[0]
        if (Object.keys(changes).length) {
            // const state =
            //     this.states.filter(one => one.sysname === this.selectedState.sysname)[0]
            //     || this.addState(this.selectedState.name, this.selectedState.sysname)
            if (!state) state = this.addState(this.selectedState.name, this.selectedState.sysname)
            Object.keys(changes).forEach(key => {
                // this[`${key}_orig`] = changes[key]
                state[key] = changes[key]
            })
        } else if (state) {
            state['position'] = undefined
            state['rotation'] = undefined
        }

        this._childs.forEach(one => one.saveToSelectedState(true))
    }

    toState(sysname, fromParent) {
        if (sysname && typeof sysname !== 'string') sysname = '' + sysname
        if (!fromParent && this.parent) {
            return this.parent.toState(sysname)
        }

        // // Установим флаг, что сейчас идет переход в определенное состояние
        // this.isInToStateProcess = true

        if (!this.parent) {
            // Установим флаг, что сейчас идет переход в определенное состояние
            this.isInToStateProcess = true
            // Установим новый state
            this.selectedState = this.getTopModel().states.filter(one => one.sysname === sysname)[0] || null
        }
        // Обновим значения моделей

        this._childs.forEach(one => one.toState(sysname, true))

        let state_obj = this.states.filter(one => one.sysname === sysname)[0] || {}
        this.position = state_obj.position || this.position_orig || this._position
        this.rotation = state_obj.rotation || this.rotation_orig || this._rotation

        this.updatePosition()


        if (!this.parent) {
            // Снимем флаг, что сейчас идет переход в определенное состояние
            this.isInToStateProcess = false
        }


    }

    toFinishState() {
        this.toState('FINISH')
    }

    raycast(ray) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        const origin = inv.multiplyPoint(ray.origin)
        const direction = inv.multiplyVector(ray.direction)
        const local = new Ray(origin, direction).normalizeDirection()
        // console.log('LLLLSldldsLL', origin, direction, local)
        if (this.content) {
            if (this.content instanceof Mesh) return this.content.meshRay(local)
            return this.content.raycast(local)
        }
        return false
    };

    linetest(line) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        const start = inv.multiplyPoint(line.start)
        const end = inv.multiplyVector(line.end)
        const local = new Line(start, end)
        if (this.content) return this.content.linetest(local)
        return false
    }

    modelSphere(sphere) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        const position = inv.multiplyPoint(sphere.position)
        const local = new Sphere(position, sphere.radius) // В книге радиус отсутствует, но это похоже ошибка.
        if (this.content) return this.content.meshSphere(local)
        return false
    }

    modelAABB(aabb) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        let size = aabb.size
        let position = inv.multiplyPoint(aabb.position)
        let orientation = inv.cut(3, 3)

        let local = new OBB(position, size, orientation)
        if (this.content) return typeof this.content.obbIn === "function" ? this.content.obbIn(local) : this.content.meshOBB(local)
        return false
    }

    modelOBB(obb) {
        const world = this.getWorldMatrix()
        let inv = world.inverse()

        // const inv2 = inv.multiply(new Matrix4(
        //     1, 0, 0, 0,
        //     0, -1, 0, 0,
        //     0, 0, -1, 0,
        //     0, 0, 0, 1
        // ))
        //
        // console.log('world inv inv2', world.asArray, inv.asArray, inv2.asArray)
        //
        // inv = inv2


        let size = obb.size
        let position = inv.multiplyPoint(obb.position)
        let orientation = obb.orientation.multiply(inv.cut(3, 3))

        let local = new OBB(position, size, orientation)

        if (this.content) {
            if (this.content instanceof Mesh) return this.content.meshOBB(local)
            if (this.content instanceof OBB) {
                // const contentAABB = new AABB(this.content.position, this.content.size)
                return this.content.obbIn(local)
            }
            // return this.content instanceof Mesh ? this.content.meshOBB(local) : this.content.obbIn(local)
        }
        return false
    }

    modelPlane(plane) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        let normal = inv.multiplyVector(plane.normal)
        let distance = plane.distance

        let local = new Plane(normal, distance)
        if (this.content) return this.content.meshPlane(local)
        return false
    };

    modelTriangle(triangle) {
        const world = this.getWorldMatrix()
        const inv = world.inverse()

        let a = inv.multiplyPoint(triangle.a)
        let b = inv.multiplyPoint(triangle.b)
        let c = inv.multiplyPoint(triangle.c)

        let local = new Triangle(a, b, c)
        if (this.content) return this.content.meshTriangle(local)
        return false
    };


    // Будет корректно работать, ели до этого была вызвана applySupportReaction
    // или как либо еще применена supportItemRays
    checkOn(platformModel) {
        if (!this.supportGroupsAll.length) return new UserError('Model must has isSupport flag', {model: this})
        // Все точки у всех опорных блоков должны быть вблизи от поверхности isPlatform

        // Union by group.name
        const groups = {}
        this.supportGroupsAll.forEach(group => {
            if (!groups[group.name]) groups[group.name] = {...group, items: []}
            groups[group.name].items.push(...group.items)
        })

        const checkOnAliasArr = []

        Object.keys(groups).forEach(key => {
            const group = groups[key]

            group.isOnePointHasSupport = false // Хотя бы одна точка имеет опору

            group.items.forEach(item => {
                if (group.isOnePointHasSupport) return

                // Точки касающиеся любой поверхности
                const itemsOnPlane = !item.supportReaction && item.raysDown
                    ? item.raysDown.filter(one => one.object)
                    : null

                // Соотавляем alias из касающихся точек
                if (itemsOnPlane && itemsOnPlane.length){
                    checkOnAliasArr.push(itemsOnPlane.map(one => one.object.id).join('='))
                }

                // Точки касающиеся поверхности isPlatform
                const itemsOnPlatformPlane = itemsOnPlane
                    ? itemsOnPlane.filter(one =>one.object.isPlatform)
                    : null

                if (itemsOnPlatformPlane && itemsOnPlatformPlane.length) {
                    group.isOnePointHasSupport = true
                }
            })
        })

        this._checkOnAlias = checkOnAliasArr.join('_')
        //
        // console.log('_checkOnAlias:', this._checkOnAlias)

        const res = !Object.values(groups).filter(one => !one.isOnePointHasSupport).length

        // console.log('checkOn==', res)
        return res
    }


    /**
     * add vector to current position. All children will be moved too
     * @param vDirection
     * @returns {*}
     */
    move(vDirection) {
        if (!vDirection) return
        this._position = this._position.add(vDirection)
        // this.clearBoundsFull(true)
        // if (this._boundsFull) {
        //     this._boundsFull.position = this._boundsFull.position.add(vDirection)
        //     this._childs.forEach(one => one._boundsFull.position = one._boundsFull.position.add(vDirection))
        // }
        this.updatePosition(vDirection)

        return this
    }

    /**
     * if one of the components is null, it will not be changed
     * @param x
     * @param y
     * @param z
     */
    moveTo(x = null, y = null, z = null) {
        const diffX = x !== null ? x - this.position.x : null
        const diffY = y !== null ? y - this.position.y : null
        const diffZ = z !== null ? z - this.position.z : null
        this.move(new Vector3(diffX, diffY, diffZ))
    }

    moveContent(vDirection) {
        if (!vDirection) return
        if (!this.content || !this.content.position) return
        this.content.position = this.content.position.add(vDirection)
        this.bounds = this.calcBounds()
        this.clearBoundsFull()
    }

    setPositionX(val) {
        const diff = val - this.position.x
        this.move(new Vector3(diff, 0, 0))
    }

    setPositionY(val) {
        const diff = val - this.position.y
        this.move(new Vector3(0, diff, 0))
    }

    setPositionZ(val) {
        const diff = val - this.position.z
        this.move(new Vector3(0, 0, diff))
    }

    setContentPositionX(val) {
        if (!this.content || !this.content.position) return
        const diff = val - this.content.position.x
        this.moveContent(new Vector3(diff, 0, 0))
    }

    setContentPositionY(val) {
        if (!this.content || !this.content.position) return
        const diff = val - this.content.position.y
        this.moveContent(new Vector3(0, diff, 0))
    }

    setContentPositionZ(val) {
        if (!this.content || !this.content.position) return
        const diff = val - this.content.position.z
        this.moveContent(new Vector3(0, 0, diff))
    }

    sizeX(x) {
        if (isNaN(+x)) return
        if (!(this._content instanceof OBB || this._content instanceof AABB)) return
        this._content.size = new Vector3(x, this._content.size.y, this._content.size.z)
        this._content.sizeNeedUpdate = true
        this.clearBoundsFull()
    }

    sizeY(y) {
        if (isNaN(+y)) return
        if (!(this._content instanceof OBB || this._content instanceof AABB)) return
        this._content.size = new Vector3(this._content.size.x, y, this._content.size.z)
        this._content.sizeNeedUpdate = true
        this.clearBoundsFull()
    }

    sizeZ(z) {
        if (isNaN(+z)) return
        if (!(this._content instanceof OBB || this._content instanceof AABB)) return
        this._content.size = new Vector3(this._content.size.x, this._content.size.y, z)
        this._content.sizeNeedUpdate = true
        this.clearBoundsFull()
    }

    /**
     * Method change rotation
     * if one of the components of the vector is zero, this rotation direction will not be changed
     * @param vRotate
     */
    rotate(vRotate) {
        if (!vRotate) return
        this._rotation = this._rotation.add(vRotate)
        // Обнулим _boundsFull чтобы они посчитались при следующей необходимости заново
        this.clearBoundsFull()
        // if (!this.getTopModel().isInToStateProcess) {
        //     if (this.selectedState && this.selectedState.editMode) this.saveToSelectedState()
        //     else if (!this.selectedState) this.saveOrigState()
        // }
    }

    rotateToX(val) {
        const diff = val - this._rotation.x
        this.rotate(new Vector3(diff, 0, 0))
    }

    rotateToY(val) {
        const diff = val - this._rotation.y
        this.rotate(new Vector3(0, diff, 0))
    }

    rotateToZ(val) {
        const diff = val - this._rotation.z
        this.rotate(new Vector3(0, 0, diff))
    }

    rotateTo(vector) {
        const diffX = vector.x - this._rotation.x
        const diffY = vector.y - this._rotation.y
        const diffZ = vector.z - this._rotation.z
        this.rotate(new Vector3(diffX, diffY, diffZ))
    }

    rotateX(val) {
        this.rotate(new Vector3(val, 0, 0))
    }

    rotateY(val) {
        this.rotate(new Vector3(0, val, 0))
    }

    rotateZ(val) {
        this.rotate(new Vector3(0, 0, val))
    }

    setGraphicOption(key, val, childs) {
        this.graphicOptions[key] = val
        this.graphicOptions.needUpdate = true
        if (childs) this.childs.forEach(one => one.setGraphicOption(key, val, childs))
    }

    setField(key, val, childs) {
        this[key] = val
        if (childs) this.childs.forEach(one => one.setField(key, val, childs))
    }

    async prepareImg3D(state_alias, options = {}) {

        const modelForImg3D = Model.fromOBJ(this.getForStore())

        if (state_alias) modelForImg3D.toState(state_alias)

        return new Promise((res, rej) => {
            const width = options.width || 600
            const height = options.height || 350
            const container = $.create('div', 'transportPic').width(width).height(height)
            // const pEngine = new pE
            const pEngine = new PhysicEngine()
            const scene = pEngine.createScene()

            scene.addModel(modelForImg3D)

            const cameraPosition = new Vector3(2000, 8000, 10000)
            const cameraTarget = modelForImg3D.boundsFull.position
            // debugger;

            pEngine.init3D({
                ...{
                    width: width,
                    height: height,
                    css: {
                        backgroundColor: '#fff',
                        // border: '1px solid'
                    },
                    cameraPosition,
                    cameraTarget,
                    // clearColor:0x000000,
                    axesHelper: true,
                    // drawBounds: true,
                    drawSupports: true,
                    preserveDrawingBuffer: true
                }, ...options
            }, container)

            pEngine.renderScene3D(scene)
            setTimeout(() => {
                const _img3D = pEngine.img3D()
                pEngine.stopRenderScene3D()
                // console.log('_img3D', _img3D)
                res(_img3D)
            }, 0)
        })
    }

    /**
     * Return Promise first time. Next calls return base64
     * @param state_alias
     * @param options
     * @returns {Promise<*>|*}
     */
    img3D(state_alias, options = {}) {
        if (!this.images3D) this.images3D = {}
        const alias = state_alias || '_DEFAULT_'
        if (this.images3D[alias]) return this.images3D[alias]
        const imgPromise = this.prepareImg3D(state_alias, options)
        imgPromise.then(res => {
            this.images3D[alias] = res
        })
        // this.images3D[alias] = await imgPromise
        // console.log('this.images3D[alias]', this.images3D[alias] instanceof Promise)
        return imgPromise
    }


}


function getPrimitiveInstanceName(obj) {
    if (obj instanceof Point3D) return 'Point3D'
    if (obj instanceof Vector3) return 'Vector3'
    if (obj instanceof Line) return 'Line'
    if (obj instanceof Ray) return 'Ray'
    if (obj instanceof Sphere) return 'Sphere'
    if (obj instanceof OBB) return 'OBB'
    if (obj instanceof AABB) return 'AABB'
    if (obj instanceof Plane) return 'Plane'
    if (obj instanceof Triangle) return 'Triangle'
    return false
}















