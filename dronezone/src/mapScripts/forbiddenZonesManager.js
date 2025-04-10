// forbiddenZonesManager.js
import L from 'leaflet';

export class ForbiddenZonesManager {
  constructor(map) {
    this.map = map;
    this.fCoords = [];
    this.fNodes = [];
    this.fPolys = [];
    this.lastPolygon = null;
  }

  // Draw a forbidden polygon with the given coordinates
  drawForbiddenPoly(coords) {
   
    coords = this.sortCoordinates(coords);
    this.lastPolygon = L.polygon(coords, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      weight: 2
    }).addTo(this.map);
    
    this.fPolys.push(this.lastPolygon);

    return this.lastPolygon;
    console.log("Added forbidden polygon!", map.forbiddenManager?.fPolys?.length);

  }

  // Calculate the centroid of a set of coordinates
  calculateCentroid(coords) {
    let latSum = 0;
    let lonSum = 0;
    for (let i = 0; i < coords.length; i++) {
      latSum += coords[i].lat;
      lonSum += coords[i].lng;
    }
    return {
      lat: latSum / coords.length,
      lng: lonSum / coords.length
    };
  }

  // Calculate the angle between two points
  calculateAngle(point, center) {
    return Math.atan2(point.lat - center.lat, point.lng - center.lng);
  }

  // Sort the coordinates in counterclockwise order
  sortCoordinates(coords) {
    const centroid = this.calculateCentroid(coords);

    return [...coords].sort((a, b) => {
      let angleA = this.calculateAngle(a, centroid);
      let angleB = this.calculateAngle(b, centroid);
      return angleA - angleB;
    });
  }

  // Check if a line segment intersects with a polygon edge
  doLineSegmentsIntersect(p1, p2, p3, p4) {
    const d1x = p2.lng - p1.lng;
    const d1y = p2.lat - p1.lat;
    const d2x = p4.lng - p3.lng;
    const d2y = p4.lat - p3.lat;

    const det = d1x * d2y - d1y * d2x;
    if (det === 0) return false;
    
    const dx = p3.lng - p1.lng;
    const dy = p3.lat - p1.lat;
    
    const t = (dx * d2y - dy * d2x) / det;
    const u = (dx * d1y - dy * d1x) / det;
    
    return (t >= 0 && t <= 1 && u >= 0 && u <= 1);
  }

  // Check if a line segment intersects with a polygon
  doesLineIntersectPolygon(p1, p2, polygon) {
    const polygonCoords = polygon.getLatLngs()[0];
    
    if (this.isPointInPolygon(p1, polygon) || this.isPointInPolygon(p2, polygon)) {
      return true;
    }
    
    for (let i = 0; i < polygonCoords.length; i++) {
      const j = (i + 1) % polygonCoords.length;
      if (this.doLineSegmentsIntersect(p1, p2, polygonCoords[i], polygonCoords[j])) {
        return true;
      }
    }
    
    return false;
  }

  // Check if a point is inside a polygon
  isPointInPolygon(point, polygon) {
    const polygonCoords = polygon.getLatLngs()[0];
    let inside = false;
    const x = point.lat, y = point.lng;
    
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
      const xi = polygonCoords[i].lat, yi = polygonCoords[i].lng;
      const xj = polygonCoords[j].lat, yj = polygonCoords[j].lng;
      
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  // Check if a new point would create a line that intersects with any forbidden zone
  wouldLineIntersectForbiddenZone(newPoint, coords) {
    if (coords.length === 0) {
      return this.isPointInForbiddenZone(newPoint);
    }
    
    const lastPoint = coords[coords.length - 1];
    
    for (let i = 0; i < this.fPolys.length; i++) {
      if (this.doesLineIntersectPolygon(lastPoint, newPoint, this.fPolys[i])) {
        return true;
      }
    }
    
    return false;
  }

  // Check if a point is in any forbidden zone
  isPointInForbiddenZone(point) {
    for (let i = 0; i < this.fPolys.length; i++) {
      if (this.isPointInPolygon(point, this.fPolys[i])) {
        return true;
      }
    }
    return false;
  }

  // Remove all forbidden zones
  clearForbiddenZones() {
    this.fPolys.forEach(poly => poly.remove());
    this.fPolys = [];
    this.fCoords = [];
    this.fNodes = [];
    this.lastPolygon = null;
  }

  // Get all current forbidden polygons
  getForbiddenPolygons() {
    return this.fPolys;
  }
}

export default ForbiddenZonesManager;   