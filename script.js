// The Pages demo uses local assets. Panel-ready files are in codepen/.
const ASSETS = {
  video: "./assets/tv.mp4",
  poster: "./assets/first-frame.jpg",
  glass: "./assets/glass.png",
  map: "./assets/glass-displacement-rg.png",
};

const TWEAKPANE_URL =
  window.GLASS_VIDEO_CONFIG?.paneModule ??
  "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

(async () => {
  document.documentElement.dataset.theme = "dark";
  const $ = (id) => document.getElementById(id);
  const video = $("video");
  const params = {
    effect: true,
    displacement: 35,
    glass: 0.6,
    speed: 1,
    muted: false,
    volume: 1,
  };
  let playbackButton;
  let restartButton;
  let ready = false;
  let requestingPlay = false;

  const reportError = (error) => {
    console.error(error);
    $("error").textContent = error instanceof Error ? error.message : String(error);
    $("error").hidden = false;
    $("status").textContent = "The video demo encountered an error.";
  };
  const preloadImage = async (url, name) => {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch (cause) {
      throw new Error(`Could not load ${name}. Check its asset URL.`, { cause });
    }
  };
  const mapDataUrl = async () => {
    const response = await fetch(ASSETS.map);
    if (!response.ok) throw new Error(`Displacement map request failed (${response.status}).`);
    const blob = await response.blob();
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read the displacement map.", { cause: reader.error }));
      reader.readAsDataURL(blob);
    });
    await preloadImage(data, "the displacement map");
    return data;
  };

  const updateBounds = () => {
    if (video.videoWidth && video.videoHeight) {
      $("video-stage").style.setProperty("--video-ratio", video.videoWidth / video.videoHeight);
    }
    const { width, height } = $("video-stage").getBoundingClientRect();
    for (const id of ["video-glass-warp", "displacement-image"]) {
      $(id).setAttribute("width", String(width));
      $(id).setAttribute("height", String(height));
    }
  };
  const updateEffect = () => {
    $("video-stage").dataset.effect = String(params.effect);
    $("displacement").setAttribute("scale", String(params.displacement));
    $("glass").style.opacity = String(params.glass);
    video.playbackRate = params.speed;
    video.muted = params.muted;
    video.volume = params.volume;
  };
  const updatePlayback = () => {
    $("play").hidden = !video.paused;
    $("play").disabled = !ready || requestingPlay;
    if (playbackButton) {
      playbackButton.title = video.paused ? "Play" : "Pause";
      playbackButton.disabled = !ready || requestingPlay;
    }
    if (restartButton) restartButton.disabled = !ready || requestingPlay;
  };
  const togglePlayback = async () => {
    if (!ready || requestingPlay) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    requestingPlay = true;
    $("error").hidden = true;
    updatePlayback();
    try {
      await video.play();
    } catch (cause) {
      reportError(new Error("Playback could not start. Try Play again and check the video URL and browser media permissions.", { cause }));
    } finally {
      requestingPlay = false;
      updatePlayback();
    }
  };
  $("play").addEventListener("click", togglePlayback);
  video.addEventListener("play", updatePlayback);
  video.addEventListener("pause", updatePlayback);
  video.addEventListener("loadedmetadata", updateBounds);
  video.addEventListener("error", () => {
    ready = false;
    updatePlayback();
    reportError(new Error(`Video could not load (media error ${video.error?.code ?? "unknown"}). Check the hosted MP4 URL and codec support.`));
  });

  video.poster = ASSETS.poster;
  video.src = ASSETS.video;
  video.load();

  try {
    const [{ Pane }, map] = await Promise.all([
      import(TWEAKPANE_URL),
      mapDataUrl(),
      preloadImage(ASSETS.poster, "the first-frame poster"),
      preloadImage(ASSETS.glass, "the glass overlay"),
    ]);
    $("displacement-image").setAttribute("href", map);
    $("glass").src = ASSETS.glass;
    await $("glass").decode();
    const observer = new ResizeObserver(updateBounds);
    observer.observe($("video-stage"));
    updateBounds();
    updateEffect();

    const pane = new Pane({
      title: "Glass video",
      container: $("pane"),
      expanded: !matchMedia("(max-width: 600px)").matches,
    });
    pane.addBinding(params, "effect", { label: "Enabled" });
    pane.addBinding(params, "displacement", { label: "Displacement", min: 0, max: 120, step: 1 });
    pane.addBinding(params, "glass", { label: "Glass", min: 0, max: 1, step: 0.01 });
    const playback = pane.addFolder({ title: "Playback", expanded: false });
    playback.addBinding(params, "speed", { label: "Speed", min: 0.25, max: 2, step: 0.25 });
    playback.addBinding(params, "muted", { label: "Muted" });
    playback.addBinding(params, "volume", { label: "Volume", min: 0, max: 1, step: 0.05 });
    pane.on("change", updateEffect);
    playbackButton = pane.addButton({ title: "Play" });
    playbackButton.on("click", togglePlayback);
    restartButton = pane.addButton({ title: "Reset to first frame" });
    restartButton.on("click", () => {
      video.pause();
      // Seeking requires metadata, but the extracted poster is available before it.
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0;
      $("status").textContent = "Paused on the first frame.";
      updatePlayback();
    });

    $("video-stage").dataset.ready = "true";
    ready = !video.error;
    updatePlayback();
    if (!video.error) {
      $("status").textContent = "First frame ready with glass applied. Press Play to start the looping video.";
      document.documentElement.dataset.ready = "true";
    }
  } catch (cause) {
    reportError(new Error("Could not initialize the glass demo. Check the texture URLs, CORS access for the map, and the Tweakpane module URL.", { cause }));
  }
})();
