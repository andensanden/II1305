
/**
 * Class representing a drone path made up of nodes.
 */
export class Dronepath {
    nodes = [];
    paths = [];
    bufferZones = [];

   /**
   * Creates a new Dronepath instance.
   * @param {string} owner - Identifier for who created this path.
   */
    constructor(owner, color) {
        this.owner = owner;
        this.color = color ? color : "blue";
    }
    
   /**
   * Adds a node to the drone path.
   * @param {Node} node - The node to add.
   */
    addNode(node) {
        this.nodes.push(node);
        this.buildPath();
        this.buildBuffer();
    }

    /**
    * Removes a node from the path by its index.
    * @param {number} index - The index of the node to remove.
    */
    removeNode(index) {
        this.nodes.splice(index, 1);
    }

    /*
    Builds the path based on the existing nodes
    */
    buildPath() {
        this.paths = [];
        for (var i = 0; i < this.nodes.length-1; i++) {
            this.paths.push([this.nodes[i].position, this.nodes[i+1].position]);
        }
    }

    /*
        Builds the buffer zone based on the existing nodes
    */
    buildBuffer() {
        this.bufferZones = [];
        const bufferWidth = 40;
        for (var i = 0; i < this.nodes.length-1; i++) {
            this.bufferZones.push(this.createBufferCoords([this.nodes[i].position, this.nodes[i+1].position], bufferWidth));
        }
    }

    /*
    Calculates the offset of the buffer zone coordinates from the path between the nodes.
    These coordinates are used in AddBufferZone to create the polygon.
    */
    createBufferCoords(coords, widthMeters) {
        if (coords.length < 2) return [];
        
        const halfWidth = widthMeters / 2 / 111320; // Approx meters to degrees
        let leftSide = [];
        let rightSide = [];
        
        const p1 = coords[0];
        const p2 = coords[1];
        const angle = Math.atan2(p2.lat - p1.lat, p2.lng - p1.lng);
        const perpAngle = angle + Math.PI/2;
        
        // Calculate offset points
        leftSide.push([
            p1.lat + Math.sin(perpAngle) * halfWidth,
            p1.lng + Math.cos(perpAngle) * halfWidth
        ]);
        rightSide.push([
            p1.lat - Math.sin(perpAngle) * halfWidth,
            p1.lng - Math.cos(perpAngle) * halfWidth
        ]);
        leftSide.push([
            p2.lat + Math.sin(perpAngle) * halfWidth,
            p2.lng + Math.cos(perpAngle) * halfWidth
        ]);
        rightSide.push([
            p2.lat - Math.sin(perpAngle) * halfWidth,
            p2.lng - Math.cos(perpAngle) * halfWidth
        ]);
        
        return leftSide.concat(rightSide.reverse());
    }

   /**
   * Converts the Dronepath into a JSON object.
   * @returns {{ nodes: Object[] }} An object representation of the drone path.
   */
    toJSON() {
        return {
            nodes: this.nodes.map(node => node.toJSON())
        }
    }
}