export class QuadTreeData {
    constructor(obj, bounds, flag) {
        this.object = obj || {};
        this.bounds = null;
        this.flag = flag || false;

    }

}

export class QuadTreeNode {
    constructor(props) {
        this.currentDepth = props.currentDepth || 0;
        this.maxDepth = props.maxDepth || 5;
        this.maxObjectsPerNode = props.maxObjectsPerNode || 15;
        this.nodeBounds = props.nodeBounds || new Rectangle2D();
        this.children = [];
        this.contents = [];
    }

}

export class QuadTree extends QuadTreeNode{
    constructor(props) {
        super(props);
    }
}
