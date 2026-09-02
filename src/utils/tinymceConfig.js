// Shared TinyMCE config, used by every <Editor> in the project.
// Import getTinyMceInit() and spread it into the Editor's `init` prop so
// every editor gets the same base plugins/toolbar AND the same local-image
// embedding behavior (base64 data URL, no backend upload endpoint needed).
//
// Usage:
//   import { getTinyMceInit } from "../../utils/tinymceConfig";
//   <Editor
//     tinymceScriptSrc="/tinymce/tinymce.min.js"
//     value={content}
//     init={getTinyMceInit()}
//     onEditorChange={handleEditorChange}
//   />
//
// If a specific editor needs a different height/toolbar/plugin set, pass
// overrides: getTinyMceInit({ height: 300, toolbar: "bold italic" })

// Max dimensions + JPEG quality used when downscaling images before they're
// embedded as base64. Without this, a full-resolution phone photo (often
// several MB) turns into a multi-megabyte base64 string sitting inside the
// editor's content. Every keystroke afterward forces TinyMCE/React to
// re-process that huge string, which is what makes typing/dragging feel
// frozen after inserting an image. Downscaling keeps the embedded size small
// regardless of the original file.
const MAX_IMAGE_DIMENSION = 900;
const JPEG_QUALITY = 0.7;

const resizeImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const scale = MAX_IMAGE_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // PNGs with transparency need to stay PNG; everything else compresses
        // much smaller as JPEG.
        const isPng = file.type === "image/png";
        const dataUrl = isPng
          ? canvas.toDataURL("image/png")
          : canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

export const tinyMceImageFilePicker = (callback, value, meta) => {
  // Only handle image picks this way; let other file types (e.g. media,
  // if that plugin is added later) fall through untouched.
  if (meta.filetype !== "image") return;

  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.onchange = function () {
    const file = this.files[0];
    if (!file) return;

    resizeImageToDataUrl(file)
      .then((dataUrl) => {
        callback(dataUrl, { title: file.name });
      })
      .catch(() => {
        // Fall back to embedding the original file untouched if resizing
        // fails for any reason (e.g. an exotic image format canvas can't
        // decode), rather than silently doing nothing.
        const reader = new FileReader();
        reader.onload = () => callback(reader.result, { title: file.name });
        reader.readAsDataURL(file);
      });
  };
  input.click();
};

const DEFAULT_PLUGINS = [
  "advlist",
  "autolink",
  "link",
  "image",
  "lists",
  "charmap",
  "preview",
  "anchor",
  "pagebreak",
  "searchreplace",
  "wordcount",
  "visualblocks",
  "code",
  "fullscreen",
  "insertdatetime",
  "media",
  "table",
  "emoticons",
  "template",
  "help",
];

const DEFAULT_TOOLBAR =
  "undo redo | styles | bold italic | forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview media fullscreen | emoticons | help";

export const getTinyMceInit = (overrides = {}) => ({
  height: 500,
  menubar: false,
  plugins: DEFAULT_PLUGINS,
  toolbar: DEFAULT_TOOLBAR,
  file_picker_types: "image",
  file_picker_callback: tinyMceImageFilePicker,
  // Prevents the toolbar from detaching and "floating" mid-page while
  // scrolling through tall content (e.g. after a large embedded image).
  toolbar_sticky: false,
  // Drag-to-resize on embedded images is disabled on purpose: every mousemove
  // during a resize drag makes TinyMCE's undo manager snapshot the ENTIRE
  // editor content for its undo history. Once that content includes a large
  // base64 image, each of those snapshots means copying/diffing a huge
  // string many times per second, which freezes the browser during the drag
  // and leaves typing broken for a while afterward as it catches up.
  // To resize an image now, double-click it and set Width/Height in the
  // Insert/Edit Image dialog instead — that's a single clean update rather
  // than a continuous drag.
  object_resizing: false,
  // Since images can no longer be dragged smaller, keep them from
  // overflowing the editor by constraining to its width automatically.
  content_style: "img { max-width: 100%; height: auto; }",
  ...overrides,
});