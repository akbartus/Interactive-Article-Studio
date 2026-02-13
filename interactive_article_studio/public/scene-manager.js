// Save/Load Manager
class SceneManager {
  constructor() {
    this.currentProjectId = null;
    this.projectListElement = null;
    this.statusMessageElement = null;
  }

  init() {
    this.projectListElement = document.getElementById("project-list");
    this.statusMessageElement = document.getElementById("status-message");

    // Store instance globally so modal functions can access it
    window.sceneManagerInstance = this;

    // Set up event listeners
    document
      .getElementById("save-scene-btn")
      .addEventListener("click", () => openSaveSceneModal());
    document
      .getElementById("load-scene-btn")
      .addEventListener("click", () => this.loadSelectedScene());
    document
      .getElementById("refresh-projects-btn")
      .addEventListener("click", () => this.loadProjectList());
    document
      .getElementById("delete-project-btn")
      .addEventListener("click", () => openDeleteProjectsModal());

    // Load project list on init
    this.loadProjectList();
  }

  showStatus(message, type = "success") {
    // Use the new notification system instead of the panel message
    showNotification(message, type);
  }

  captureSceneData() {
    const scene = document.querySelector("a-scene");
    const data = {
      entities: [],
      tooltips: [],
      cameraRecordings: [],
      selectedRecording: null,
      scrollAnimation: null,
      articleStructure: null,
      effects: {},
      sky: {},
      grid: {},
      cameraSpeed: null,
    };

    // Capture all 3D models (GLTF and Gaussian Splats)
    const models = scene.querySelectorAll("[gltf-model]");
    models.forEach((model) => {
      const position = model.getAttribute("position");
      const rotation = model.getAttribute("rotation");
      const scale = model.getAttribute("scale");
      const src = model.getAttribute("gltf-model");

      data.entities.push({
        type: "gltf",
        src: src,
        position: position,
        rotation: rotation,
        scale: scale,
      });
    });

    // Capture Gaussian Splats
    const splats = scene.querySelectorAll("[gaussian-splatting]");
    splats.forEach((splat) => {
      const parent = splat.parentElement;
      const position = parent.getAttribute("position");
      const rotation = parent.getAttribute("rotation");
      const scale = parent.getAttribute("scale");
      const splatAttr = splat.getAttribute("gaussian-splatting");

      data.entities.push({
        type: "splat",
        src: splatAttr.src,
        position: position,
        rotation: rotation,
        scale: scale,
        id: parent.id,
      });
    });

    // Capture tooltips (troika-text)
    const tooltips = scene.querySelectorAll("a-troika-text");
    tooltips.forEach((tooltip) => {
      data.tooltips.push({
        id: tooltip.getAttribute("id"),
        position: tooltip.getAttribute("position"),
        rotation: tooltip.getAttribute("rotation"),
        value: tooltip.getAttribute("value"),
        color: tooltip.getAttribute("color"),
        align: tooltip.getAttribute("align"),
        fillOpacity: tooltip.getAttribute("fill-opacity"),
        font: tooltip.getAttribute("font"),
        fontSize: tooltip.getAttribute("font-size"),
        letterSpacing: tooltip.getAttribute("letter-spacing"),
        lineHeight: tooltip.getAttribute("line-height"),
        maxWidth: tooltip.getAttribute("max-width"),
      });
    });

    // Capture all camera recordings
    const cameraEntity = document.querySelector("[camera-movement-recorder]");
    if (cameraEntity && cameraEntity.components["camera-movement-recorder"]) {
      const allRecordings =
        cameraEntity.components["camera-movement-recorder"].allRecordings || [];
      data.cameraRecordings = allRecordings;
      data.selectedRecording =
        cameraEntity.components[
          "camera-movement-recorder"
        ].selectedRecordingIndex;
    }

    // Capture scroll animation text slides
    const textSlides = [];
    document.querySelectorAll(".text-input-row").forEach((row) => {
      const editorContainer = row.querySelector(".quill-editor-container");
      const quill = editorContainer ? editorContainer.quillInstance : null;
      const textContent = quill ? quill.root.innerHTML : "";

      textSlides.push({
        text: textContent,
        frameNumber: row.querySelector(".frameNumber").value,
        durationFrames: row.querySelector(".durationFrames").value,
      });
    });

    // Get selected recording for scrollytelling
    const recordingSelect = document.getElementById("recording-select-scroll");
    const selectedScrollRecording = recordingSelect
      ? recordingSelect.value
      : null;

    data.scrollAnimation = {
      slides: textSlides,
      direction:
        document.getElementById("direction-select")?.value ||
        "bottom-to-center",
      speed: document.getElementById("speed-slider")?.value || 1,
      selectedRecording: selectedScrollRecording,
    };

    // Capture post-processing effects
    const postProcessing = scene.getAttribute("post-processing");
    if (postProcessing) {
      data.effects = {
        effect: postProcessing.effect || "none",
      };
    }

    // Capture sky color
    const sky = scene.querySelector("a-sky");
    if (sky) {
      data.sky = {
        color: sky.getAttribute("color") || "#000000",
      };
    }

    // Capture grid state
    const grid = scene.querySelector("a-grid");
    data.grid = {
      enabled: !!grid,
    };

    // Capture Gaussian Splat effects
    const splatEntity = scene.querySelector("[gaussian-splatting]");
    if (splatEntity && splatEntity.components["gaussian-splatting"]) {
      const comp = splatEntity.components["gaussian-splatting"];
      data.splatEffects = {
        colorEffect: document.getElementById("colorEffect")?.value || "0",
        singleColor: document.getElementById("singleColor")?.value || "#FF0000",
        displayRadius: document.getElementById("displayRadius")?.value || "1.0",
      };
    }

    // Capture Article Structure
    if (typeof articleStructure !== "undefined") {
      data.articleStructure = JSON.parse(JSON.stringify(articleStructure));
    }

    // Capture Annotations
    if (typeof annotationsList !== "undefined") {
      data.annotations = JSON.parse(JSON.stringify(annotationsList));
    }

    // Capture Hotspots
    if (typeof hotspotsList !== "undefined") {
      data.hotspots = JSON.parse(JSON.stringify(hotspotsList));
    }

    // Capture Videos
    if (typeof videosList !== "undefined") {
      data.videos = JSON.parse(JSON.stringify(videosList));
    }

    // Capture Audio
    if (typeof audiosList !== "undefined") {
      data.audio = JSON.parse(JSON.stringify(audiosList));
    }

    // Capture Camera Speed
    const cameraSpeedSlider = document.getElementById("camera-speed");
    if (cameraSpeedSlider) {
      data.cameraSpeed = cameraSpeedSlider.value;
    }
    // Capture Scrollytelling overlay settings
    data.scrollOverlaySettings = {
      bgColor: document.getElementById("overlay-bg-color")?.value || "#ffffff",
      bgOpacity: document.getElementById("overlay-bg-opacity")?.value || "95",
      width: document.getElementById("overlay-width-slider")?.value || "80",
    };

    return data;
  }

  async saveSceneWithName(projectName) {
    const sceneData = this.captureSceneData();

    try {
      const response = await fetch("/api/project/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          data: sceneData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        this.currentProjectId = result.id;
        this.showStatus(
          `Project "${projectName}" saved successfully!`,
          "success",
        );
        this.loadProjectList();
      } else {
        this.showStatus(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      this.showStatus("Failed to save project", "error");
    }
  }

  async loadProjectList() {
    try {
      const response = await fetch("/api/projects");
      const projects = await response.json();

      this.projectListElement.innerHTML = "";

      if (projects.length === 0) {
        this.projectListElement.innerHTML =
          '<p style="color: #666;">No saved projects yet</p>';
        return;
      }

      projects.forEach((project) => {
        const item = document.createElement("div");
        item.className = "project-list-item";
        item.dataset.projectId = project.id;

        const date = new Date(project.updated_at);
        const dateStr = date.toLocaleString();

        item.innerHTML = `
    <div style="flex: 1; cursor: pointer;" class="project-click-area">
        <div class="project-name">${project.name}</div>
        <div class="project-date">Version ${project.id} - ${dateStr}</div>
    </div>
`;

        // Click on the text area to select project
        const clickArea = item.querySelector(".project-click-area");
        clickArea.addEventListener("click", () => {
          document.querySelectorAll(".project-list-item").forEach((el) => {
            el.classList.remove("selected");
          });
          item.classList.add("selected");
          this.currentProjectId = project.id;
        });

        this.projectListElement.appendChild(item);
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
      this.showStatus("Failed to load project list", "error");
    }
  }

  async loadSelectedScene() {
    if (!this.currentProjectId) {
      showNotification("Please select a project to load", "warning");
      return;
    }

    try {
      const response = await fetch(`/api/project/${this.currentProjectId}`);
      const project = await response.json();

      if (response.ok) {
        this.restoreScene(project.data);
        showNotification(`Loaded "${project.name}"`, "success");
      } else {
        showNotification(`Error: ${project.error}`, "error");
      }
    } catch (error) {
      console.error("Load error:", error);
      showNotification("Failed to load project", "error");
    }
  }

  restoreScene(data) {
    const scene = document.querySelector("a-scene");

    // Clear existing entities (except camera and sky)
    const toRemove = [];
    scene
      .querySelectorAll("[gltf-model], [gaussian-splatting], a-troika-text")
      .forEach((el) => {
        toRemove.push(el.parentElement.id ? el.parentElement : el);
      });
    toRemove.forEach((el) => el.remove());

    // Restore 3D models
    if (data.entities) {
      let splatEntityId = 0;
      data.entities.forEach((entity) => {
        if (entity.type === "gltf") {
          const model = document.createElement("a-entity");
          model.setAttribute("gltf-model", entity.src);
          model.setAttribute("position", entity.position);
          model.setAttribute("rotation", entity.rotation);
          model.setAttribute("scale", entity.scale);
          scene.appendChild(model);
        } else if (entity.type === "splat") {
          splatEntityId++;
          const modelContainer = document.createElement("a-entity");
          modelContainer.id = entity.id || `splat${splatEntityId}`;
          modelContainer.setAttribute("geometry", {
            primitive: "box",
            width: 5,
            height: 5,
            depth: 5,
          });
          modelContainer.setAttribute("material", {
            color: "white",
            wireframe: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1,
            visible: false,
          });
          modelContainer.setAttribute("position", entity.position);
          modelContainer.setAttribute("rotation", entity.rotation);

          const splatEntity = document.createElement("a-entity");
          splatEntity.setAttribute("gaussian-splatting", `src: ${entity.src};`);

          modelContainer.appendChild(splatEntity);
          scene.appendChild(modelContainer);
        }
      });
    }

    // Restore tooltips
    if (data.tooltips) {
      data.tooltips.forEach((tooltip) => {
        const newText = document.createElement("a-troika-text");
        Object.keys(tooltip).forEach((key) => {
          if (tooltip[key]) {
            newText.setAttribute(key, tooltip[key]);
          }
        });
        scene.appendChild(newText);
      });
      tooltipCount = data.tooltips.length;
    }

    // Restore camera recordings
    const cameraEntity = document.querySelector("[camera-movement-recorder]");
    if (
      data.cameraRecordings &&
      cameraEntity &&
      cameraEntity.components["camera-movement-recorder"]
    ) {
      cameraEntity.components["camera-movement-recorder"].allRecordings =
        data.cameraRecordings;
      cameraEntity.components[
        "camera-movement-recorder"
      ].selectedRecordingIndex = data.selectedRecording || 0;

      // Update the recording selector UI
      cameraEntity.components[
        "camera-movement-recorder"
      ].updateRecordingSelector();

      // Update scrollytelling recording selector
      const scrollEntity = document.querySelector("[scroll-animator]");
      if (scrollEntity && scrollEntity.components["scroll-animator"]) {
        scrollEntity.components["scroll-animator"].updateRecordingSelector();
      }
    }

    // Restore scroll animation
    if (data.scrollAnimation) {
      const container = document.querySelector(".text-inputs-container");
      container.innerHTML = "";

      data.scrollAnimation.slides.forEach((slide, index) => {
        const editorId = "editor-" + Date.now() + "-" + index;
        const newTextInput = document.createElement("div");
        newTextInput.className = "text-input-row";
        newTextInput.innerHTML = `
                    <label class="slideTitle">Slide: ${index + 1}</label>
                    <input type="number" class="frameNumber" placeholder="Frame number..." value="${slide.frameNumber}">
                    <input type="number" class="durationFrames" placeholder="Duration in frames..." min="1" value="${slide.durationFrames}">
                    <div class="quill-editor-container">
                        <div id="${editorId}" class="scrollableText"></div>
                    </div>
                    <button class="delete-slide-button">Delete</button>
                `;
        container.appendChild(newTextInput);

        // Initialize Quill editor
        const quill = new Quill("#" + editorId, {
          theme: "snow",
          placeholder: "Enter text...",
          modules: {
            toolbar: [
              ["bold", "italic", "underline"],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ["image"],
              ["clean"],
            ],
          },
        });

        // Set the content from saved data
        quill.root.innerHTML = slide.text || "";

        // Store quill instance
        newTextInput.querySelector(".quill-editor-container").quillInstance =
          quill;

        const deleteButton = newTextInput.querySelector(".delete-slide-button");
        deleteButton.addEventListener("click", () => {
          container.removeChild(newTextInput);
          const slides = container.querySelectorAll(".text-input-row");
          slides.forEach((slide, idx) => {
            slide.querySelector(".slideTitle").textContent =
              `Slide: ${idx + 1}`;
          });
        });
      });

      if (document.getElementById("direction-select")) {
        document.getElementById("direction-select").value =
          data.scrollAnimation.direction;
      }
      if (document.getElementById("speed-slider")) {
        document.getElementById("speed-slider").value =
          data.scrollAnimation.speed;
        document.querySelector(".speed-value").textContent =
          data.scrollAnimation.speed;
      }

      // Restore selected recording for scrollytelling
      if (
        data.scrollAnimation.selectedRecording !== null &&
        data.scrollAnimation.selectedRecording !== undefined
      ) {
        const scrollEntity = document.querySelector("[scroll-animator]");
        if (scrollEntity && scrollEntity.components["scroll-animator"]) {
          // Update the recording selector and load the animation
          scrollEntity.components["scroll-animator"].updateRecordingSelector();
          setTimeout(() => {
            const recordingSelect = document.getElementById(
              "recording-select-scroll",
            );
            if (recordingSelect) {
              recordingSelect.value = data.scrollAnimation.selectedRecording;
              scrollEntity.components["scroll-animator"].loadRecording(
                data.scrollAnimation.selectedRecording,
              );
            }
          }, 100);
        }
      }
    }

    // Restore effects
    if (data.effects && data.effects.effect) {
      scene.setAttribute("post-processing", "effect", data.effects.effect);
      if (document.getElementById("effect-select")) {
        document.getElementById("effect-select").value = data.effects.effect;
      }
    }

    // Restore sky
    if (data.sky && data.sky.color) {
      const sky = scene.querySelector("a-sky");
      if (sky) {
        sky.setAttribute("color", data.sky.color);
      }
    }

    // Restore grid
    const existingGrid = scene.querySelector("a-grid");
    if (data.grid && data.grid.enabled && !existingGrid) {
      const gridElement = document.createElement("a-grid");
      gridElement.setAttribute("position", "0 -0.1 0");
      scene.appendChild(gridElement);
    } else if (!data.grid || !data.grid.enabled) {
      if (existingGrid) {
        existingGrid.remove();
      }
    }

    // Restore Gaussian Splat effects
    if (data.splatEffects) {
      if (document.getElementById("colorEffect")) {
        document.getElementById("colorEffect").value =
          data.splatEffects.colorEffect;
      }
      if (document.getElementById("singleColor")) {
        document.getElementById("singleColor").value =
          data.splatEffects.singleColor;
      }
      if (document.getElementById("displayRadius")) {
        document.getElementById("displayRadius").value =
          data.splatEffects.displayRadius;
        document.getElementById("displayRadiusValue").textContent =
          data.splatEffects.displayRadius;
      }
    }

    // Restore Article Structure
    if (data.articleStructure && typeof articleStructure !== "undefined") {
      articleStructure.sections = data.articleStructure.sections || [];
      articleStructure.currentEditIndex = -1;
      updateSectionsList();
    }

    // Restore Annotations
    if (data.annotations && typeof annotationsList !== "undefined") {
      // Clear existing annotations from scene
      const scene = document.querySelector("a-scene");
      scene
        .querySelectorAll('[id^="annotation-"]')
        .forEach((el) => el.remove());

      // Restore annotations list
      annotationsList = JSON.parse(JSON.stringify(data.annotations));

      // Recreate annotations in scene
      annotationsList.forEach((annotation) => {
        const container = document.createElement("a-entity");
        container.setAttribute("id", annotation.id);
        container.setAttribute("position", "0 1.6 -2");
        container.setAttribute("rotation", "0 0 0");

        const newText = document.createElement("a-troika-text");
        newText.setAttribute("color", "#2d3748");
        newText.setAttribute("value", annotation.text);
        newText.setAttribute("align", "center");
        newText.setAttribute("fill-opacity", "1");
        newText.setAttribute("font-size", annotation.fontSize);
        newText.setAttribute("line-height", "1.2");
        newText.setAttribute("max-width", annotation.maxWidth);
        newText.setAttribute("position", "0 0 0");
        newText.setAttribute("anchor", "center");
        newText.setAttribute("baseline", "center");
        newText.setAttribute("white-space", "normal");
        container.appendChild(newText);

        const background = document.createElement("a-plane");
        background.setAttribute("class", "annotation-background");
        background.setAttribute("color", annotation.bgColor);
        background.setAttribute("opacity", "0.9");
        background.setAttribute("position", "0 0 -0.01");
        background.setAttribute("width", annotation.maxWidth + 0.2);
        background.setAttribute("height", annotation.fontSize * 2);
        container.appendChild(background);

        scene.appendChild(container);
      });

      // Update UI
      if (typeof updateAnnotationsList === "function") {
        updateAnnotationsList();
      }
    }

    // Restore Hotspots
    if (data.hotspots && typeof hotspotsList !== "undefined") {
      hotspotsList = JSON.parse(JSON.stringify(data.hotspots));
      if (typeof updateHotspotsList === "function") {
        updateHotspotsList();
      }
    }

    // Restore Videos
    if (data.videos && typeof videosList !== "undefined") {
      videosList = JSON.parse(JSON.stringify(data.videos));
      if (typeof updateVideosList === "function") {
        updateVideosList();
      }
    }

    // Restore Audio
    if (data.audio && typeof audiosList !== "undefined") {
      audiosList = JSON.parse(JSON.stringify(data.audio));
      if (typeof updateAudioFilesList === "function") {
        updateAudioFilesList();
      }
    }

    // Restore Camera Speed
    if (data.cameraSpeed) {
      const cameraSpeedSlider = document.getElementById("camera-speed");
      const cameraSpeedValue = document.getElementById("camera-speed-value");
      const wasdEntity = document.querySelector("a-entity[wasd-controls]");
      if (cameraSpeedSlider && cameraSpeedValue) {
        cameraSpeedSlider.value = data.cameraSpeed;
        cameraSpeedValue.textContent = data.cameraSpeed;
        if (wasdEntity) {
          wasdEntity.setAttribute(
            "wasd-controls",
            "acceleration",
            data.cameraSpeed,
          );
        }
      }
    }

    // Restore Scrollytelling overlay settings
    if (data.scrollOverlaySettings) {
      if (document.getElementById("overlay-bg-color")) {
        document.getElementById("overlay-bg-color").value =
          data.scrollOverlaySettings.bgColor;
      }
      if (document.getElementById("overlay-bg-opacity")) {
        document.getElementById("overlay-bg-opacity").value =
          data.scrollOverlaySettings.bgOpacity;
      }
      if (document.getElementById("overlay-width-slider")) {
        document.getElementById("overlay-width-slider").value =
          data.scrollOverlaySettings.width;
        document.getElementById("overlay-width-value").textContent =
          data.scrollOverlaySettings.width;
      }

      // Update the scroll-animator component settings if available
      const scrollEntity = document.querySelector("[scroll-animator]");
      if (scrollEntity && scrollEntity.components["scroll-animator"]) {
        const comp = scrollEntity.components["scroll-animator"];
        comp.overlayBgColor = data.scrollOverlaySettings.bgColor;
        comp.overlayBgOpacity =
          parseInt(data.scrollOverlaySettings.bgOpacity) / 100;
        comp.overlayWidth = parseInt(data.scrollOverlaySettings.width);
      }
    }

    // Reinitialize Editor after a delay
    setTimeout(() => {
      if (typeof Editor !== "undefined") {
        new Editor();
      }
    }, 500);
  }

  async deleteSelectedProjects() {
    if (!this.currentProjectId) {
      showNotification("Please select a project to delete", "warning");
      return;
    }

    try {
      const response = await fetch(`/api/project/${this.currentProjectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        this.showStatus("Project deleted successfully", "success");
        this.currentProjectId = null;
        this.loadProjectList();
      } else {
        this.showStatus("Failed to delete project", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      this.showStatus("Failed to delete project", "error");
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const sceneManager = new SceneManager();
  sceneManager.init();
});
