import { useEffect, useRef, useState } from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Preview({ canvasSize, previewObjects }) {
  const sketchRef = useRef("");
  // Hacky way to trigger rerender
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!previewObjects) return;

    let maxScale = 0;
    let maxY = 0;
    let minY = 0;
    previewObjects.forEach((item) => {
      const { x: sx, y: sy, z: sz } = item.scale;
      const { x: px, y: py, z: pz } = item.position;
      maxScale = Math.max(maxScale, sx, sy, sz, px, py, pz);
      maxY = Math.max(maxY, py);
      minY = Math.min(minY, py);
    });

    // Create a new p5.js sketch function using the provided code
    const sketch = (p) => {
      let unit = maxScale > 5 ? (0.4 * canvasSize) / maxScale : canvasSize / 8;
      let angleY = 0;
      let angleX = 0;

      const drawObjects = (objects) => {
        for (let obj of objects) {
          p.push();

          p.translate(
            obj.position.x * unit,
            -obj.position.y * unit,
            obj.position.z * unit
          );
          p.rotateX(obj.rotation.x);
          p.rotateY(obj.rotation.y);
          p.rotateZ(obj.rotation.z);
          p.scale(obj.scale.x, obj.scale.y, obj.scale.z);

          if (obj.shape === "Cube" || obj.shape === "Box") {
            p.box(unit);
          } else if (obj.shape === "Ball" || obj.shape === "Sphere") {
            p.sphere(unit);
          } else if (obj.shape === "Cylinder") {
            p.cylinder(unit);
          } else if (obj.shape === "Cone") {
            p.cone(unit);
          } else if (obj.shape === "Triangle Pyramid") {
            p.cone(unit, unit, 4);
          } else if (obj.shape === "Square Pyramid") {
            p.cone(unit, unit, 5);
          } else if (obj.shape === "Donut" || obj.shape === "Ring") {
            p.torus(unit, unit / 3);
          }
          p.pop();
        }
      };

      p.setup = () => {
        p.createCanvas(canvasSize, canvasSize, p.WEBGL);
      };

      p.draw = () => {
        p.background(0);
        p.ambientLight(100);
        p.pointLight(255, 255, 255, 0, -200, 300);

        p.push();
        p.rotateY(angleY);
        p.rotateX(angleX);
        p.translate(0, ((maxY + minY) * unit) / 2, 0);
        p.noStroke();

        drawObjects(previewObjects);
        p.pop();

        angleY = p.map(p.mouseX, 0, p.width, 0, p.TWO_PI);
        angleX = p.map(p.mouseY, 0, p.height, 0, p.TWO_PI);
      };
    };

    sketchRef.current = sketch;
    setIndex(index + 1);
  }, [previewObjects, canvasSize]);

  return (
    <NextReactP5Wrapper
      sketch={sketchRef.current}
      index={index}
      className="w-full h-full"
    />
  );
}
