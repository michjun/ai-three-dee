import Head from "next/head";
import styles from "./index.module.css";
import { useState } from "react";
import Preview from "../components/preview";

export default function Home() {
  const [modelDescription, setModelDescription] = useState("");
  const [model, setModel] = useState();
  const [preview, setPreview] = useState();

  function onSave(event) {
    event.preventDefault();
  }

  function onPreview(event) {
    event.preventDefault();
    if (model) {
      try {
        const jsonString = model
          .replace(/(\w+)\s*:/g, '"$1":')
          .replace(/},\s*]/g, "}]");
        setPreview(JSON.parse(jsonString));
      } catch (error) {
        console.error("Error parsing the input string:", error);
        alert("invalid data");
      }
    } else {
      alert("Please generate a model first.");
    }
  }

  function onModelChange(event) {
    setModel(event.target.value);
  }

  async function onSubmitModel(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelDescription: modelDescription }),
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setModel(data.result.content);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Text to 3D with Primitive Shapes</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <div className={styles.historyContainer}></div>
      <div className={styles.editorContainer}>
        <div className={styles.topBar}>
          <div className={styles.left}>
            <form onSubmit={onSubmitModel}>
              <input
                id="model"
                type="text"
                value={modelDescription}
                placeholder="I want to create a 3D model of a..."
                onChange={(event) => setModelDescription(event.target.value)}
                className={styles.modelInput}
              />
              <button type="submit" className={styles.button}>
                Let's Go!
              </button>
            </form>
          </div>
          <div className={styles.right}>
            <button className={styles.button} onClick={onSave}>
              Save
            </button>
            <button className={styles.button} onClick={onPreview}>
              Preview &#187;
            </button>
          </div>
        </div>
        <textarea
          className={styles.editor}
          id="editor"
          value={model}
          onChange={onModelChange}
        />
      </div>
      <div className={styles.previewContainer}>
        <Preview previewObjects={preview} className={styles.preview} />
      </div>
    </div>
  );
}
