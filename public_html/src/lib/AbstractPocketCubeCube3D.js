/*
 * @(#)AbstractPocketCubeCube3D.js  1.0  2014-01-17
 * Copyright (c) 2014 Werner Randelshofer, Switzerland. MIT License.
 */
"use strict";

// --------------
// require.js
// --------------
define("AbstractPocketCubeCube3D", ["Cube3D", "PocketCube", "CubeAttributes", "SplineInterpolator", "J3DI", "Node3D"],
function (Cube3D, PocketCube, CubeAttributes, SplineInterpolator, J3DI, Node3D) {


  /** Constructor
   * Creates the 3D geometry of a Rubik's Cube.
   *  Subclasses must call initAbstractPocketCubeCube3D(). 
   */
  class AbstractPocketCubeCube3D extends Cube3D.Cube3D {
    constructor(partSize) {
      super();

      this.cornerCount = 8;
      this.edgeCount = 0;
      this.sideCount = 0;
      this.centerCount = 1;
      this.partCount = 8 + 0 + 0 + 1;
      this.cornerOffset = 0;
      this.edgeOffset = 8;
      this.sideOffset = 8;
      this.centerOffset = 8;
      this.stickerCount = 4 * 6;

      this.cube = PocketCube.newPocketCube();
      this.cube.addCubeListener(this);
      this.attributes = this.createAttributes();

      this.partToStickerMap = new Array(this.partCount);
      for (var i = 0; i < this.partCount; i++) {
        this.parts[i] = new Node3D.Node3D();
        this.partOrientations[i] = new Node3D.Node3D();
        this.partExplosions[i] = new Node3D.Node3D();
        this.partLocations[i] = new Node3D.Node3D();

        this.partOrientations[i].add(this.parts[i]);
        this.partExplosions[i].add(this.partOrientations[i]);
        this.partLocations[i].add(this.partExplosions[i]);
        this.add(this.partLocations[i]);

        this.identityPartLocations[i] = new J3DIMatrix4();
        this.partToStickerMap[i] = new Array(3);
      }

      for (var i = 0; i < this.stickerCount; i++) {
        this.partToStickerMap[this.stickerToPartMap[i]][this.stickerToFaceMap[i]] = i;

        this.stickers[i] = new Node3D.Node3D();
        this.stickerOrientations[i] = new Node3D.Node3D();
        this.stickerExplosions[i] = new Node3D.Node3D();
        this.stickerLocations[i] = new Node3D.Node3D();
        this.stickerTranslations[i] = new Node3D.Node3D();

        this.stickerOrientations[i].add(this.stickers[i]);
        this.stickerExplosions[i].add(this.stickerOrientations[i]);
        this.stickerLocations[i].add(this.stickerExplosions[i]);
        this.stickerTranslations[i].add(this.stickerLocations[i]);
        this.add(this.stickerTranslations[i]);

        this.developedStickers[i] = new Node3D.Node3D();

        this.currentStickerTransforms[i] = new Node3D.Node3D();
        this.add(this.currentStickerTransforms[i]);
        //this.currentDevelopedMatrix[i]=new J3DIMatrix4();
        this.identityStickerLocations[i] = new J3DIMatrix4();
      }

      this.partSize = 2.0;

      /*
       * Corners
       *             +---+---+---+
       *          ulb|4.0|   |2.0|ubr
       *             +---+   +---+
       *             |     1     |
       *             +---+   +---+
       *          ufl|6.0|   |0.0|urf
       * +---+---+---+---+---+---+---+---+---+---+---+---+
       * |4.1|   |6.2|6.1|   |0.2|0.1|   |2.2|2.1|   |4.2|
       * +---+   +---+---+   +---+---+   +---+---+   +---+
       * |     3     |     2     |     0     |     5     |
       * +---+   +---+---+   +---+---+   +---+---+   +---+
       * |5.2|   |7.1|7.2|   |1.1|1.2|   |3.1|3.2|   |5.1|
       * +---+---+---+---+---+---+---+---+---+---+---+---+
       *          dlf|7.0|   |1.0|dfr
       *             +---+   +---+
       *             |     4     |
       *             +---+   +---+
       *          dbl|5.0|   |3.0|drb
       *             +---+---+---+
       */
      var cornerOffset = this.cornerOffset;

      // Move all corner parts to up right front (= position of corner[0]). 
      // nothing to do

      // Rotate the corner parts into place

      // 0:urf
      //--no transformation---
      // 1:dfr
      this.identityPartLocations[cornerOffset + 1].rotate(180, 0, 0, 1);
      this.identityPartLocations[cornerOffset + 1].rotate(90, 0, 1, 0);
      // 2:ubr
      this.identityPartLocations[cornerOffset + 2].rotate(270, 0, 1, 0);
      // 3:drb
      this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 0, 1);
      this.identityPartLocations[cornerOffset + 3].rotate(180, 0, 1, 0);
      // 4:ulb
      this.identityPartLocations[cornerOffset + 4].rotate(180, 0, 1, 0);
      // 5:dbl
      this.identityPartLocations[cornerOffset + 5].rotate(180, 1, 0, 0);
      this.identityPartLocations[cornerOffset + 5].rotate(90, 0, 1, 0);
      // 6:ufl
      this.identityPartLocations[cornerOffset + 6].rotate(90, 0, 1, 0);
      // 7:dlf
      this.identityPartLocations[cornerOffset + 7].rotate(180, 0, 0, 1);

      // ----------------------------         
      // Reset all rotations
      for (var i = 0; i < this.partCount; i++) {
        this.partLocations[i].matrix.load(this.identityPartLocations[i]);
      }
    }

    loadGeometry() {
      // ----------------------------         
      // Load geometry
      var self = this;
      var fRepaint = function () {
        self.repaint();
      };

      var modelUrl = this.getModelUrl();

      // parts
      this.centerObj = J3DI.loadObj(null, modelUrl + "center.obj", fRepaint);
      this.cornerObj = J3DI.loadObj(null, modelUrl + "corner.obj", fRepaint);

      // stickers
      this.stickerObjs = new Array(this.stickerCount);
      for (var i = 0; i < this.stickerObjs.length; i++) {
        this.stickerObjs[i] = J3DI.newJ3DIObj();
      }
      this.corner_rObj = J3DI.loadObj(null, modelUrl + "corner_r.obj", function () {
        self.initAbstractPocketCubeCube3D_corner_r();
        self.repaint();
      });
      this.corner_uObj = J3DI.loadObj(null, modelUrl + "corner_u.obj", function () {
        self.initAbstractPocketCubeCube3D_corner_u();
        self.repaint();
      });
      this.corner_fObj = J3DI.loadObj(null, modelUrl + "corner_f.obj", function () {
        self.initAbstractPocketCubeCube3D_corner_f();
        self.repaint();
      });
    }

    validateAttributes() {
      if (!this.isAttributesValid) {
        this.isAttributesValid = true;

        for (var i = 0; i < this.stickerObjs.length; i++) {
          this.stickerObjs[i].hasTexture = this.attributes.stickersImageURL != null;
        }
      }
    }

    initAbstractPocketCubeCube3D_corner_r() {
      var s = this.corner_rObj;
      var s180 = new J3DI.J3DIObj();
      s180.setTo(s);
      s180.rotateTexture(180);

      this.stickerObjs[ 0] = s.clone();
      this.stickerObjs[ 3] = s180.clone();
      this.stickerObjs[ 8] = s.clone();
      this.stickerObjs[11] = s180.clone();
      this.stickerObjs[12] = s.clone();
      this.stickerObjs[15] = s180.clone();
      this.stickerObjs[20] = s.clone();
      this.stickerObjs[23] = s180.clone();

      this.initAbstractPocketCubeCube3D_textureScales();
    }
    initAbstractPocketCubeCube3D_corner_f() {
      var s = this.corner_fObj;
      var s180 = new J3DI.J3DIObj();
      s180.setTo(s);
      s180.rotateTexture(180);

      this.stickerObjs[ 1] = s.clone();
      this.stickerObjs[ 2] = s180.clone();
      this.stickerObjs[ 9] = s.clone();
      this.stickerObjs[10] = s180.clone();
      this.stickerObjs[13] = s.clone();
      this.stickerObjs[14] = s180.clone();
      this.stickerObjs[21] = s.clone();
      this.stickerObjs[22] = s180.clone();

      this.initAbstractPocketCubeCube3D_textureScales();
    }
    initAbstractPocketCubeCube3D_corner_u() {
      var s = this.corner_uObj;
      var s90 = new J3DI.J3DIObj();
      s90.setTo(s);
      s90.rotateTexture(90);
      var s180 = new J3DI.J3DIObj();
      s180.setTo(s);
      s180.rotateTexture(180);
      var s270 = new J3DI.J3DIObj();
      s270.setTo(s);
      s270.rotateTexture(270);

      this.stickerObjs[ 4] = s180.clone();
      this.stickerObjs[ 5] = s90.clone();
      this.stickerObjs[ 6] = s270.clone();
      this.stickerObjs[ 7] = s.clone();
      this.stickerObjs[16] = s180.clone();
      this.stickerObjs[17] = s90.clone();
      this.stickerObjs[18] = s270.clone();
      this.stickerObjs[19] = s.clone();

      this.initAbstractPocketCubeCube3D_textureScales();
    }
    initAbstractPocketCubeCube3D_textureScales() {
      var attr = this.attributes;

      for (var i = 0; i < this.stickerObjs.length; i++) {
        if (!this.stickerObjs[i].loaded)
          continue;

        if (this.stickerObjs[i].isTextureScaled)
          continue;
        if (i * 2 + 1 < this.stickerOffsets.length) {
          this.stickerObjs[i].textureOffsetX = this.stickerOffsets[i * 2];
          this.stickerObjs[i].textureOffsetY = this.stickerOffsets[i * 2 + 1];
        }
        this.stickerObjs[i].textureScale = 84 / 512;
        this.stickerObjs[i].isTextureScaled = true;
      }

      this.isAttributesValid = false;
    }
    getPartIndexForStickerIndex(stickerIndex) {
      return stickerToPartMap[stickerIndex];
    }
    getStickerIndexForPartIndex(partIndex, orientationIndex) {
      return this.partToStickerMap[partIndex][orientationIndex];
    }
    /** Default cube attributes. */
    createAttributes() {
      var a = CubeAttributes.newCubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
      var partsPhong = [0.5, 0.6, 0.4, 16.0];//shiny plastic [ambient, diffuse, specular, shininess]
      for (var i = 0; i < this.partCount; i++) {
        a.partsFillColor[i] = [40, 40, 40, 255];
        a.partsPhong[i] = partsPhong;
      }
      a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];

      var faceColors = [
        [255, 210, 0, 255], // right: yellow
        [0, 51, 115, 255], // up   : blue
        [140, 0, 15, 255], // front: red
        [248, 248, 248, 255], // left : white
        [0, 115, 47, 255], // down : green
        [255, 70, 0, 255] // back : orange
      ];

      var stickersPhong = [0.8, 0.2, 0.1, 8.0];//shiny paper [ambient, diffuse, specular, shininess]

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 4; j++) {
          a.stickersFillColor[i * 4 + j] = faceColors[i];
          a.stickersPhong[i * 4 + j] = stickersPhong;
        }
      }

      return a;
    }

    updateExplosionFactor(factor) {
      if (factor == null) {
        factor = this.attributes.explosionFactor;
      }
      var explosionShift = this.partSize * 1.5;
      var baseShift = explosionShift * factor;
      var shift = 0;
      var a = this.attributes;
      for (var i = 0; i < this.cornerCount; i++) {
        var index = this.cornerOffset + i;
        shift = baseShift + a.partExplosion[index];
        this.partExplosions[index].matrix.makeIdentity();
        this.partExplosions[index].matrix.translate(shift, shift, -shift);//ruf
      }
      this.fireStateChanged();
    }

    validateTwist(partIndices, locations, orientations, length, axis, angle, alpha) {
      var rotation = this.updateTwistRotation;
      rotation.makeIdentity();
      var rad = (90 * angle * (1 - alpha));
      switch (axis) {
        case 0:
          rotation.rotate(rad, -1, 0, 0);
          break;
        case 1:
          rotation.rotate(rad, 0, -1, 0);
          break;
        case 2:
          rotation.rotate(rad, 0, 0, 1);
          break;
      }

      var orientationMatrix = this.updateTwistOrientation;
      for (var i = 0; i < length; i++) {
        orientationMatrix.makeIdentity();
        if (partIndices[i] < this.edgeOffset) { //=> part is a corner
          // Base location of a corner part is urf. (= corner part 0)
          switch (orientations[i]) {
            case 0:
              break;
            case 1:
              orientationMatrix.rotate(90, 0, 0, 1);
              orientationMatrix.rotate(90, -1, 0, 0);
              break;
            case 2:
              orientationMatrix.rotate(90, 0, 0, -1);
              orientationMatrix.rotate(90, 0, 1, 0);
              break;
          }
        }
        this.partOrientations[partIndices[i]].matrix.load(orientationMatrix);
        var transform = this.partLocations[partIndices[i]].matrix;
        transform.load(rotation);
        transform.multiply(this.identityPartLocations[locations[i]]);
      }
    }

    cubeTwisted(evt) {
      if (this.repainter == null) {
        this.updateCube();
        return;
      }

      var layerMask = evt.layerMask;
      var axis = evt.axis;
      var angle = evt.angle;
      var model = this.cube;

      var partIndices = new Array(27);
      var locations = new Array(27);
      var orientations = new Array(27);
      var count = 0;

      var affectedParts = evt.getAffectedLocations();
      count = affectedParts.length;
      locations = affectedParts.slice(0, count);
      for (var i = 0; i < count; i++) {
        partIndices[i] = model.getPartAt(locations[i]);
        orientations[i] = model.getPartOrientation(partIndices[i]);
      }

      var finalCount = count;
      var self = this;
      var interpolator = SplineInterpolator.newSplineInterpolator(0, 0, 1, 1);
      var start = new Date().getTime();
      var duration = this.attributes.twistDuration * Math.abs(angle);
      this.isTwisting = true;
      var f = function () {
        var now = new Date().getTime();
        var elapsed = now - start;
        var value = elapsed / duration;
        if (value < 1) {
          self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, interpolator.getFraction(value));
          self.repainter.repaint(f);
        } else {
          self.validateTwist(partIndices, locations, orientations, finalCount, axis, angle, 1.0);
          self.isTwisting = false;
        }
      };
      this.repainter.repaint(f);
    }
  }

  /** Maps stickers to cube parts.
   * <p>
   * Sticker indices:
   * <pre>
   *         +---+---+
   *      ulb|1,0|1,1|ubr
   *         +--- ---+ 
   *  ulb ufl|1,2|1,3|urf ubr ubr ubl
   * +---+---+---+---+---+---+---+---+
   * |3,0|3,1|2,0|2,1|0,0|0,1|5,0|5,1|
   * +--- ---+--- ---+--- ---+--- ---+
   * |3,2|3,3|2,2|2,3|0,2|0,3|5,2|5,3|
   * +---+---+---+---+---+---+---+---+
   *  dbl dlf|4,0|4,1|dfr drb drb dbl
   *         +--- ---+
   *      dbl|4,2|4,3|drb
   *         +---+---+
   * </pre>
   * Sticker indices absolute values:
   * <pre>
   *         +---+---+
   *      ulb| 4 | 5 |ubr
   *         +--- ---+ 
   *  ulb ufl| 6 | 7 |urf ubr ubr ubl
   * +---+---+---+---+---+---+---+---+
   * |12 |13 | 8 | 9 | 0 | 1 |20 |21 |
   * +--- ---+--- ---+--- ---+--- ---+
   * |14 |15 |10 |11 | 2 | 3 |22 |23 |
   * +---+---+---+---+---+---+---+---+
   *  dbl dlf|16 |17 |dfr drb drb dbl
   *         +--- ---+
   *      dbl|18 |19 |drb
   *         +---+---+
   * </pre>
   * <p>
   * Part indices:
   * <pre>
   *         +---+---+
   *      ulb|4.0|2.0|ubr
   *         +--- ---+ 
   *  ulb ufl|6.0|0.0|urf ubr ubr ubl 
   * +---+---+---+---+---+---+---+---+
   * |4.1|6.2|6.1|0.2|0.1|2.2|2.1|4.2|
   * +--- ---+--- ---+--- ---+--- ---+
   * |5.2|7.1|7.2|1.1|1.2|3.1|3.2|5.1|
   * +---+---+---+---+---+---+---+---+
   *  dbl dlf|7.0|1.0|dfr drb drb dbl
   *         +--- ---+
   *      dbl|5.0|3.0|drb
   *         +---+---+
   * </pre>
   */
  AbstractPocketCubeCube3D.prototype.stickerToPartMap = [
    0, 2, 1, 3, // right
    4, 2, 6, 0, // up
    6, 0, 7, 1, // front
    4, 6, 5, 7, // left
    7, 1, 5, 3, // down
    2, 4, 3, 5  // back
  ];

  /** Maps parts to stickers. This is a two dimensional array. The first
   * dimension is the part index, the second dimension the orientation of
   * the part. 
   * This map is filled in by the init method!!
   */
  AbstractPocketCubeCube3D.prototype.partToStickerMap = null;

  /**
   * Gets the face of the part which holds the indicated sticker.
   * The sticker index is interpreted according to this scheme:
   * <pre>
   *         +---+---+
   *      ulb|1,0|1,1|ubr
   *         +--- ---+ 
   *  ulb ufl|1,2|1,3|urf ubr ubr ubl
   * +---+---+---+---+---+---+---+---+
   * |3,0|3,1|2,0|2,1|0,0|0,1|5,0|5,1|
   * +--- ---+--- ---+--- ---+--- ---+
   * |3,2|3,3|2,2|2,3|0,2|0,3|5,2|5,3|
   * +---+---+---+---+---+---+---+---+
   *  dbl dlf|4,0|4,1|dfr drb drb dbl
   *         +--- ---+
   *      dbl|4,2|4,3|drb
   *         +---+---+
   * </pre>
   * The faces (or orientation of the parts) according to this scheme:
   * <pre>
   *         +---+---+
   *      ulb|4.0|2.0|ubr
   *         +--- ---+ 
   *  ulb ufl|6.0|0.0|urf ubr ubr ubl 
   * +---+---+---+---+---+---+---+---+
   * |4.1|6.2|6.1|0.2|0.1|2.2|2.1|4.2|
   * +--- ---+--- ---+--- ---+--- ---+
   * |5.2|7.1|7.2|1.1|1.2|3.1|3.2|5.1|
   * +---+---+---+---+---+---+---+---+
   *  dbl dlf|7.0|1.0|dfr drb drb dbl
   *         +--- ---+
   *      dbl|5.0|3.0|drb
   *         +---+---+
   * </pre>
   */
  AbstractPocketCubeCube3D.prototype.stickerToFaceMap = [
    1, 2, 2, 1, // right
    0, 0, 0, 0, // up
    1, 2, 2, 1, // front
    1, 2, 2, 1, // left
    0, 0, 0, 0, // down
    1, 2, 2, 1 // back
  ];

AbstractPocketCubeCube3D.prototype.boxClickToLocationMap = [
  [[ 7, 6],[ 5, 4]],// left
  [[ 7, 5],[ 1, 3]],// down
  [[ 7, 6],[ 1, 0]],// front
  [[ 1, 0],[ 3, 2]],// right
  [[ 6, 4],[ 0, 2]],// up
  [[ 5, 4],[ 3, 2]],// back
];

  AbstractPocketCubeCube3D.prototype.boxClickToAxisMap = [
    [[0, 0], [0, 0]], // left
    [[1, 1], [1, 1]], // down
    [[2, 2], [2, 2]], // front
    [[0, 0], [0, 0]], // right
    [[1, 1], [1, 1]], // up
    [[2, 2], [2, 2]], // back
  ];
  AbstractPocketCubeCube3D.prototype.boxClickToAngleMap = [
    [[-1, -1], [-1, -1]],
    [[-1, -1], [-1, -1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[-1, -1], [-1, -1]],
  ];
  AbstractPocketCubeCube3D.prototype.boxClickToLayerMap = [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[2, 2], [2, 2]],
    [[2, 2], [2, 2]],
    [[2, 2], [2, 2]],
    [[1, 1], [1, 1]],
  ];
  AbstractPocketCubeCube3D.prototype.boxSwipeToAxisMap = [
    [1, 2, 1, 2], // left
    [2, 0, 2, 0], // down
    [1, 0, 1, 0], // front
    [1, 2, 1, 2], // right
    [2, 0, 2, 0], // up
    [1, 0, 1, 0], // back
  ];
  AbstractPocketCubeCube3D.prototype.boxSwipeToAngleMap = [
    [-1, -1, 1, 1], // left
    [1, 1, -1, -1], // down
    [1, -1, -1, 1], // front
    [1, 1, -1, -1], // right
    [-1, -1, 1, 1], // up
    [-1, 1, 1, -1], // back
  ];
  AbstractPocketCubeCube3D.prototype.boxSwipeToLayerMap = [
    [[[1, 2, 1, 2], [2, 2, 2, 2]], [[1, 1, 1, 1], [2, 1, 2, 1]]], // left
    [[[2, 1, 2, 1], [1, 1, 1, 1]], [[2, 2, 2, 2], [1, 2, 1, 2]]], // down
    [[[1, 1, 1, 1], [2, 1, 2, 1]], [[1, 2, 1, 2], [2, 2, 2, 2]]], // front
    [[[1, 2, 1, 2], [2, 2, 2, 2]], [[1, 1, 1, 1], [2, 1, 2, 1]]], // right
    [[[2, 1, 2, 1], [1, 1, 1, 1]], [[2, 2, 2, 2], [1, 2, 1, 2]]], // up
    [[[1, 1, 1, 1], [2, 1, 2, 1]], [[1, 2, 1, 2], [2, 2, 2, 2]]], // back
  ];
  /**
   * The following properties may have different values depending on
   * the 3D model being used.
   * <pre>
   *   0 1 2 3 4 5
   *      +---+ 
   * 0    | U |
   * 1    |   |
   *  +---+---+---+
   * 2| L | F | R |
   * 3|   |   |   |
   *  +---+---+---+
   * 4    | D | B |
   * 5    |   |   |
   *      +---+---+
   * </pre>
   */
  AbstractPocketCubeCube3D.prototype.stickerOffsets = [
    4, 2, 5, 2, //right
    4, 3, 5, 3,

    2, 0, 3, 0, //up
    2, 1, 3, 1,

    2, 2, 3, 2, //front
    2, 3, 3, 3,

    0, 2, 1, 2, //left
    0, 3, 1, 3,

    2, 4, 3, 4, //down
    2, 5, 3, 5,

    4, 4, 5, 4, //back
    4, 5, 5, 5
  ];


// ------------------
// MODULE API    
// ------------------
  return {
    AbstractPocketCubeCube3D: AbstractPocketCubeCube3D
  };
});
