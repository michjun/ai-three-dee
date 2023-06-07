import { useEffect, useRef, useState } from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Preview({
  canvasSize,
  modelName,
  previewObjects,
  streamObjects,
}) {
  const sketchRef = useRef("");
  // Hacky way to trigger rerender
  const [index, setIndex] = useState(0);

  function defineScale(objects) {
    let maxScale = 0;
    let maxY = 0;
    let minY = 0;
    objects.forEach((item) => {
      const { x: sx, y: sy, z: sz } = item.scale;
      const { x: px, y: py, z: pz } = item.position;
      maxScale = Math.max(maxScale, sx, sy, sz, px, py, pz);
      maxY = Math.max(maxY, py);
      minY = Math.min(minY, py);
    });
    const unit =
      maxScale > 5 ? (0.4 * canvasSize.width) / maxScale : canvasSize.width / 8;
    return { maxY, minY, unit };
  }

  function placeObject(obj, p, unit, scaleMultiplier = 1) {
    p.translate(
      obj.position.x * unit,
      -obj.position.y * unit,
      obj.position.z * unit
    );
    p.rotateX(obj.rotation.x);
    p.rotateY(obj.rotation.y);
    p.rotateZ(obj.rotation.z);
    p.scale(
      obj.scale.x * scaleMultiplier,
      obj.scale.y * scaleMultiplier,
      obj.scale.z * scaleMultiplier
    );
  }

  function renderShape(obj, p, unit) {
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
  }

  // Completed model render mode
  useEffect(() => {
    if (!previewObjects || !canvasSize) return;

    // Create a new p5.js sketch function using the provided code
    const sketch = (p) => {
      const { maxY, minY, unit } = defineScale(previewObjects);
      let angleY = 0;
      let angleX = 0;
      let targetAngleX, targetAngleY, prevMouseX, prevMouseY;
      let font;

      const drawObjects = (objects) => {
        for (let obj of objects) {
          p.push();
          placeObject(obj, p, unit);
          renderShape(obj, p, unit);
          p.pop();
        }
      };

      p.preload = () => {
        font = p.loadFont(
          "https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf"
        );
      };

      p.setup = () => {
        const canvas = p.createCanvas(
          canvasSize.width,
          canvasSize.height,
          p.WEBGL
        );
        canvas.touchStarted(() => {
          prevMouseX = p.mouseX;
          prevMouseY = p.mouseY;
        });

        canvas.touchMoved(() => {
          if (prevMouseX !== undefined && prevMouseY !== undefined) {
            let deltaX = p.mouseX - prevMouseX;
            let deltaY = p.mouseY - prevMouseY;

            targetAngleY = p.map(
              deltaX,
              -p.width / 2,
              p.width / 2,
              -p.PI * 1.2,
              p.PI * 1.2
            );
            targetAngleX = p.map(
              deltaY,
              -p.height / 2,
              p.height / 2,
              p.PI / 2,
              -p.PI / 2
            );
          }
          return false;
        });

        canvas.mouseMoved(() => {
          targetAngleY = p.map(p.mouseX, 0, p.width, -p.PI * 1.2, p.PI * 1.2);
          targetAngleX = p.map(p.mouseY, 0, p.height, p.PI / 4, -p.PI / 4);
        });
      };

      p.draw = () => {
        p.background(0);
        p.ambientLight(100);
        p.pointLight(255, 255, 255, 0, -200, 300);

        // Only update the angles if the mouse has moved
        if (targetAngleX !== undefined && targetAngleY !== undefined) {
          angleX = p.lerp(angleX, targetAngleX, 0.1);
          angleY = p.lerp(angleY, targetAngleY, 0.1);
        }
        p.push();
        p.rotateX(angleX);
        p.rotateY(angleY);
        p.translate(0, ((maxY + minY) * unit) / 2, 0);
        p.noStroke();
        p.fill(255, 215, 0);
        drawObjects(previewObjects);
        p.pop();

        if (previewObjects.length > 1) {
          // Render text label to show all the components
          const modelDescription =
            previewObjects
              .map((obj) => obj.name.replace(/_/g, " "))
              .join(" + ") + ` = \n\n${modelName.toUpperCase()}`;
          p.push();
          p.textFont(font);
          p.textLeading(30);
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(18);
          p.text(
            modelDescription,
            -(canvasSize.width / 2 - 50),
            -(canvasSize.height / 2 - 40),
            canvasSize.width - 100,
            200
          );
          p.pop();
        }
      };
    };

    sketchRef.current = sketch;
    setIndex(index + 1);
  }, [previewObjects, canvasSize]);

  // Partial object stream render mode
  useEffect(() => {
    if (!streamObjects) return;

    // Create a new p5.js sketch function using the provided code
    const sketch = (p) => {
      const { maxY, minY, unit } = defineScale(streamObjects);
      let scaleMultiplier = 0.2;
      let font;

      const drawObjects = (objects) => {
        objects.forEach(function (obj, i) {
          // The scale up animation is only applied to the last object
          const isLastObject = i === objects.length - 1;
          p.push();
          placeObject(obj, p, unit, isLastObject ? scaleMultiplier : 1);
          renderShape(obj, p, unit);
          p.pop();
        });
      };

      p.preload = () => {
        font = p.loadFont(
          "https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf"
        );
      };

      p.setup = () => {
        p.createCanvas(canvasSize.width, canvasSize.height, p.WEBGL);
      };

      p.draw = () => {
        const getBackground = (variant) => {
          return p.color(
            p.map(p.cos(variant / 30), -1, 1, 40, 120),
            p.map(p.sin(variant / 30), -1, 1, 20, 50),
            p.map(p.sin(variant / 30), -1, 1, 100, 200)
          );
        };

        // Add a flashing effect in the beginning to ease
        // out the jumpy transition when new objects are added
        if (p.frameCount < 20 && streamObjects.length > 0) {
          p.background(
            215 + p.frameCount * 2,
            155 + p.frameCount * 5,
            235 + p.frameCount
          );
        } else {
          if (p.frameCount < 80 && streamObjects.length > 0) {
            let initialColor = p.color(255);
            let targetColor = getBackground(60);
            let t = p.map(p.frameCount, 20, 80, 0, 1); // Normalize frameCount to a range of 0 to 1
            let easedColor = p.lerpColor(initialColor, targetColor, t * t);
            p.background(easedColor);
          } else {
            p.background(getBackground(p.frameCount));
          }

          p.ambientLight(100 + 240 / p.frameCount);
          p.pointLight(255, 255, 255, 0, -200, 300);

          p.push();
          p.rotateY(p.frameCount / 80);
          p.translate(0, ((maxY + minY) * unit) / 2, 0);
          p.noStroke();
          drawObjects(streamObjects);
          p.pop();

          // Add a text label to the last object so that people
          // can see what we are currently rendering
          if (streamObjects.length > 0) {
            const lastObjectName = streamObjects[streamObjects.length - 1].name;
            p.push();
            p.textFont(font);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
            p.text(
              lastObjectName.replace(/_/g, " "),
              0,
              -(canvasSize.height / 2 - 100)
            );
            p.pop();
            if (scaleMultiplier < 1) {
              scaleMultiplier += 0.005;
            }
          }
        }
      };
    };

    sketchRef.current = sketch;
    setIndex(index + 1);
  }, [streamObjects]);

  return (
    <NextReactP5Wrapper
      sketch={sketchRef.current}
      index={index}
      className="w-full h-full"
    />
  );
}
