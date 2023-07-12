import { useState } from "react";
import Button from "@/components/shared/Button";
import RefineForm from "@/components/RefineForm";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

export const availableActions = {
  gallery: "gallery",
  refine: "refine",
  export: "export",
  save: "save",
  preview: "preview",
  share: "share",
};

export default function ActionBar({
  creation,
  onCreationChange,
  actions,
  showPreview,
  saveCreation,
  shareCreation,
  className,
}) {
  const [refine, setRefine] = useState(false);

  function canRefine() {
    return creation.refinesLeft > 0;
  }

  async function showRefinePopup(event) {
    if (canRefine()) {
      setRefine(true);
    }
  }

  function showGallery(e) {
    window.location.href = `/gallery`;
  }

  // TODO: p5 doesn't have easy support to export to GLB, so we
  // are using three.js here. consider migrating everything to three.js
  function exportGlb(e) {
    var exporter = new GLTFExporter();
    var scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Creates a white light with 0.5 intensity
    scene.add(ambientLight);
    const shapes = JSON.parse(creation.contentToJson());
    shapes.forEach(function (shape) {
      let geometry;
      switch (shape.shape) {
        case "Box":
        case "Cube":
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case "Sphere":
        case "Ball":
          geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        case "Cylinder":
          geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
          break;
        case "Cone":
          geometry = new THREE.ConeGeometry(1, 1, 32);
          break;
        case "Triangle Pyramid":
          geometry = new THREE.ConeGeometry(1, 1, 3);
          break;
        case "Square Pyramid":
          geometry = new THREE.ConeGeometry(1, 1, 4);
          break;
        case "Donut":
        case "Ring":
          geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }
      // Create the material with the color
      let material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          shape.color.r / 255,
          shape.color.g / 255,
          shape.color.b / 255
        ),
        opacity: shape.color.a ? shape.color.a / 255 : 1,
        transparent: shape.color.a ? shape.color.a / 255 < 1 : false,
      });
      // Create the mesh
      let mesh = new THREE.Mesh(geometry, material);
      // Set the position, rotation, and scale
      mesh.position.set(shape.position.x, shape.position.y, shape.position.z);
      if (
        ["Cone", "Triangle Pyramid", "Square Pyramid"].includes(shape.shape)
      ) {
        mesh.rotation.x = Math.PI;
      }
      mesh.rotation.x += -shape.rotation.x;
      mesh.rotation.y = -shape.rotation.y;
      mesh.rotation.z = -shape.rotation.z;
      mesh.scale.set(shape.scale.x, shape.scale.y, shape.scale.z);
      // Add to the scene
      scene.add(mesh);
    });

    // Export to GLB
    exporter.parse(
      scene,
      function (gltf) {
        var output = JSON.stringify(gltf, null, 2);
        var blob = new Blob([output], { type: "model/gltf-binary" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = "output.glb";
        link.href = url;
        link.click();
      },
      { binary: true }
    );
  }

  return (
    <div
      className={`h-16 border flex justify-between w-full items-center pl-2.5 box-border bottom-0 ${className}`}
    >
      <div>
        {actions.includes(availableActions.gallery) && (
          <Button className="ml-2.5" onClick={showGallery}>
            Visit Showroom
          </Button>
        )}
      </div>
      <div>
        {actions.includes(availableActions.refine) && (
          <Button
            disabled={!canRefine()}
            onClick={showRefinePopup}
            className="mr-2.5"
          >
            Refine Spell
          </Button>
        )}
        <RefineForm
          showForm={refine}
          creation={creation}
          onCreationChange={onCreationChange}
          onComplete={() => setRefine(false)}
        />
        {actions.includes(availableActions.export) && (
          <Button
            onClick={exportGlb}
            disabled={creation.validate().errors.length > 0}
            className="mr-2.5"
          >
            Export As GLB
          </Button>
        )}
        {actions.includes(availableActions.save) && (
          <Button
            onClick={saveCreation}
            disabled={creation.validate().errors.length > 0}
            className="mr-2.5"
          >
            Save
          </Button>
        )}
        {actions.includes(availableActions.share) && (
          <Button
            onClick={shareCreation}
            disabled={creation.validate().errors.length > 0}
            className="mr-2.5"
          >
            Share
          </Button>
        )}
        {actions.includes(availableActions.reload) && (
          <Button
            onClick={showPreview}
            disabled={!creation.content}
            className="mr-2.5"
          >
            Reload &#187;
          </Button>
        )}
      </div>
    </div>
  );
}
