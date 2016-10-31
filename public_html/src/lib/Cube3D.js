/*
 * @(#)Cube3D.js  1.1  2014-02-02
 *
 * Copyright (c) 2011-2014 Werner Randelshofer, Switzerland.
 * You may not use, copy or modify this file, except in compliance with the
 * accompanying license terms.
 */
"use strict";

// --------------
// require.js
// --------------
define("Cube3D", ['Node3D','J3DIMath'], 
function(Node3D,J3DIMath) { 

/** Change event. */
class ChangeEvent {
  constructor(source) {
    this.source=source;
  }
}
 
/** Constructor
 * Base class for classes which implement the geometry of a 
 * Rubik's Cube like puzzle.
 *
 *
 */
class Cube3D extends Node3D.Node3D {
  constructor() {
    super();
  // subclasses must build the following model hierarchy
  // for use when the cube is assembled:
  //
  // cube3d                   Node3D root (this).
  // .partLocations           Node3D used to perform
  //                            location changes of the part.
  // .partExplosions          Node3D used to perform the
  //                            explosion effect.
  // .partOrientations        Node3D for orientation transformation
  //                            of the parts. These are rotations
  //                            around position 0.
  // .parts                   Node3D holding the mesh. May contain
  //                            a non-identity transform to position
  //                            the mesh, so that the part is
  //                            moved to position 0 and orientation 0.
  
  // subclasses must build the following model hierarchy
  // for use when the cube is developed:
  //
  // cube3d                   Node3D root (this).
  // .stickerTranslations     Node3D used to drag a sticker around
  // .stickerLocations        Node3D used to perform
  //                            location changes of the sticker.
  // .stickerExplosions       Node3D used to perform the
  //                            explosion effect.
  // .stickerOrientations     Node3D for orientation transformation
  //                            of the sticker. These are rotations
  //                            around position 0.
  // .stickers               Node3D holding the mesh. May contain
  //                            a non-identity transform to position
  //                            the mesh, so that the sticker is
  //                            moved to position 0 and orientation 0.
  
  this.cube = null;
  this.cornerCount=0;
  this.edgeCount=0;
  this.sideCount=0;
  
  this.centerCount=0;
  this.partCount=0;
  this.cornerOffset=0;
  this.edgeOffset=0;
  this.sideOffset=0;
  this.centerOffset=0;
  this.repainter=null;
  this.isTwisting=false;
  this.repaintFunction=null;
  
  this.parts=[];
  this.partOrientations=[];
  this.partExplosions=[];
  this.partLocations=[];
  
  this.stickers=[];
  this.stickerOrientations=[];
  this.stickerExplosions=[];
  this.stickerLocations=[];
  this.stickerTranslations=[];
  
  this.identityPartLocations=[];
  this.identityStickerLocations=[];
  //this.identityStickerOrientations=[]; Not needed, since == identity matrix
  
  this.listenerList=[];
  this.isCubeValid=false;
  this.updateTwistRotation=new J3DIMatrix4();
  this.updateTwistOrientation=new J3DIMatrix4();
  this.partSize=3;
  
  this.developedStickerTranslations=[];
  this.developedStickers=[];
  this.identityDevelopedMatrix=[];
  
  this.currentStickerTransforms=[];
  }
}

Cube3D.prototype.cubeChanged=function(evt) {
    this.updateCube();
}
Cube3D.prototype.cubeTwisted=function(evt) {
    this.updateCube();
}

Cube3D.prototype.updateCube=function() {
    //this.stopAnimation();
    this.isCubeValid = false;
    this.validateCube();
    this.fireStateChanged();
}

Cube3D.prototype.validateCube=function() {
    if (!this.isCubeValid) {
        this.isCubeValid = true;
        var model = this.cube;
        var partIndices = new Array(this.partCount);
        var locations = new Array(this.partCount);
        var orientations = new Array(this.partCount);
        for (var i = 0; i < this.partCount; i++) {
            locations[i] = i;
            partIndices[i] = model.getPartAt(locations[i]);
            orientations[i] = model.getPartOrientation(partIndices[i]);
        }
        this.validateTwist(partIndices, locations, orientations, this.partCount, 0, 0, 1);
    }
}
Cube3D.prototype.updateAttributes=function() {
    this.isAttributesValid = false;
    this.validateAttributes();
}
Cube3D.prototype.validateAttributes=function() {
    if (!this.isAttributesValid) {
        this.isAttributesValid = true;
        
        this.doValidateDevelopAttributes();
        this.doValidateAttributes();
    }
}
Cube3D.prototype.doValidateAttributes=function() {
  // subclasses can override this methods
}
Cube3D.prototype.doValidateDevelopAttributes=function() {
  if (this.attributes.developmentFactor == this.cachedDevelopmentFactor) {
    return;
  }
  this.cachedDevelopmentFactor = this.attributes.developmentFactor;
  
  var m1 = new J3DIMatrix4();
  var m2 = new J3DIMatrix4();

  for (var i=0; i<this.stickerCount; i++) {
    var j=this.stickerToPartMap[i];
    m1.load(this.partLocations[j].matrix);
    m1.multiply(this.partExplosions[j].matrix);
    m1.multiply(this.partOrientations[j].matrix);
    m1.multiply(this.parts[j].matrix);

    m2.load(this.stickerTranslations[i].matrix);
    m2.multiply(this.stickerLocations[i].matrix);
    m2.multiply(this.stickerExplosions[i].matrix);
    m2.multiply(this.stickerOrientations[i].matrix);
    m2.multiply(this.stickers[i].matrix);
    
    this.currentStickerTransforms[i].matrix.load(J3DIMath.rigidLerp(m1, m2, this.attributes.developmentFactor));
  }
}

   // protected abstract void validateTwist(int[] partIndices, int[] locations, int[] orientations, int length, int axis, int angle, float alpha);

/**
 * Adds a listener for ChangeEvent's.
 *
 * A listener must have a stateChanged() function.
 */
Cube3D.prototype.addChangeListener=function(l) {
  this.listenerList[this.listenerList.length]=l;
}

/**
 * Removes a listener for CubeEvent's.
 */
Cube3D.prototype.removeChangeListener=function(l) {
  for (var i=0;i<this.listenerList.length;i++) {
    if (this.listenerList[i]==l) {
      this.listenerList=this.listenerList.slice(0,i)+this.listenerList.slice(i+1);
      break;
    }
  }
}

/**
 * Notify all listeners that have registered varerest for
 * notification on this event type.
 */
Cube3D.prototype.fireStateChanged=function() {
  var event=new ChangeEvent(this);
    // Guaranteed to return a non-null array
    var listeners = this.listenerList;
    // Process the listeners last to first, notifying
    // those that are varerested in this event
    for (var i = listeners.length - 1; i >= 0; i -= 1) {
            listeners[i].stateChanged(event);
    }
}

Cube3D.prototype.repaint=function() {
  if (this.repaintFunction != null) {
    this.repaintFunction();
  }
}

/** Intersection test for a ray with the cube. 
 * The ray must be given as an object with {point:J3DIVector3, dir:J3DIVector3}
 * in the model coordinates of the cube.
 *
 * Returns null if no intersection, or the intersection data: 
 * {point:J3DIVector3, uv:J3DIVector3, t:float, axis:int, layerMask:int, 
 *  angle:int, ...}
 *
 * @return point Intersection point: 3D vector.
 * @return uv    Intersecton UV coordinates: 2D vector on the intersection plane.
 * @return t     The distance that the ray traveled to the intersection point.
 * @return axis  The twist axis.
 * @return layerMask The twist layer mask.
 * @return angle The twist angle.
 */
Cube3D.prototype.intersect=function (ray) {
  var cubeSize = this.partSize * this.cube.layerCount;
  
  var box = { pMin:new J3DIVector3(-cubeSize/2, -cubeSize/2, -cubeSize/2),
              pMax:new J3DIVector3( cubeSize/2,  cubeSize/2,  cubeSize/2) };
  var isect = J3DIMath.intersectBox(ray, box);
  
  if (isect != null) {
    var face=isect.face;
    var u=Math.floor(isect.uv[0]*this.cube.layerCount);
    var v=Math.floor(isect.uv[1]*this.cube.layerCount);

    isect.axis=this.boxClickToAxisMap[face][u][v];
    isect.layerMask=this.boxClickToLayerMap[face][u][v];
    isect.angle=this.boxClickToAngleMap[face][u][v];
  }
  
  return isect;
}
/** Intersection test for a ray with a developed cube. 
 * The ray must be given as an object with {point:J3DIVector3, dir:J3DIVector3}
 * in the model coordinates of the cube.
 *
 * Returns null if no intersection, or the intersection data: 
 * {point:J3DIVector3, uv:J3DIVector3, t:float, axis:int, layerMask:int, angle:int,
 *  ...}
 *
 * @return point Intersection point: 3D vector.
 * @return uv    Intersecton UV coordinates: 2D vector on the intersection plane.
 * @return t     The distance that the ray traveled to the intersection point.
 * @return axis  The twist axis.
 * @return layerMask The twist layer mask.
 * @return angle The twist angle.
 * @return sticker The sticker index.
 * @return part The part index.
 * @return face The face index.
 */
Cube3D.prototype.intersectDeveloped=function (ray) {
  var isect = null;
  var plane = { point:new J3DIVector3(), normal:new J3DIVector3() };
  var m = new J3DIMatrix4();
  
  var layerCount = this.cube.layerCount;
  var partSize = this.partSize;
  
  plane.point.load(0,0,-0.5*layerCount*this.partSize);
  plane.normal.load(0,0,-1);
  
  isect = J3DIMath.intersectPlane(ray, plane);
  if (isect != null) {
    var tileU=-1-Math.floor((isect.uv[0]-(1.5*layerCount*partSize)) / partSize);
    var tileV=Math.floor((isect.uv[1]+(1.5*layerCount*partSize)) / partSize);
    //console.log('col:'+(tileU)+'row:'+(tileV));

    if (tileV >= 0 && tileV < layerCount
        && tileU >= layerCount && tileU < layerCount*2) {
      isect.face = 1;
    } else if (tileV >= layerCount && tileV < layerCount*2
        && tileU >= 0 && tileU < (layerCount*4)) {
      switch (Math.floor(tileU / layerCount)) {
      case 0: 
        isect.face = 3; 
        break;
      case 1: 
        isect.face = 2; 
        break;
      case 2: 
        isect.face = 0; 
        break;
      case 3: 
        isect.face = 5; 
        break;
      default: 
        return null; // should never happen
      }
    } else if (tileV >= layerCount*2 && tileV < layerCount*3
        && tileU >= layerCount && tileU < layerCount*2) {
      isect.face = 4;
    } else {
      return null;
    }
    isect.sticker = isect.face*layerCount*layerCount+(tileV % layerCount) * layerCount + tileU % layerCount;
    isect.part = this.getPartIndexForStickerIndex(isect.sticker);
    isect.plane = plane;
  }
  
  return isect;
}


// ------------------
// MODULE API    
// ------------------
return {
  Cube3D : Cube3D
};
});