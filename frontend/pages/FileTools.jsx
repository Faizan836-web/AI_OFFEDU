import { useRef, useState } from "react";

import {
  Download,
  FileImage,
  FileOutput,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Presentation,
} from "lucide-react";

import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const tools = [
  {
    id: "compress",
    title: "Image Compressor",
    description:
      "Reduce image size while maintaining good quality.",
    icon: Minimize2,
    input: "image",
  },
  {
    id: "image-pdf",
    title: "Image to PDF",
    description:
      "Convert JPG, PNG or WEBP images into PDF files.",
    icon: FileOutput,
    input: "image",
  },
  {
    id: "pdf-image",
    title: "PDF to Image",
    description:
      "Convert PDF pages into downloadable images.",
    icon: FileImage,
    input: "pdf",
  },
  {
    id: "word-pdf",
    title: "Word to PDF",
    description:
      "Convert Word documents into PDF files.",
    icon: FileText,
    input: "word",
  },
  {
    id: "pdf-word",
    title: "PDF to Word",
    description:
      "Convert PDF text into an editable Word file.",
    icon: FileText,
    input: "pdf",
  },
  {
    id: "powerpoint-pdf",
    title: "PowerPoint to PDF",
    description:
      "Convert PowerPoint presentations into PDF files.",
    icon: Presentation,
    input: "powerpoint",
  },
  {
    id: "preview",
    title: "Image Preview",
    description:
      "Preview your image before processing.",
    icon: ImageIcon,
    input: "image",
  },
];

const acceptedTypes = {
  image: {
    extensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    label: "JPG · JPEG · PNG · WEBP",
  },

  pdf: {
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
    label: "PDF",
  },

  word: {
    extensions: [".doc", ".docx"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    label: "DOC · DOCX",
  },

  powerpoint: {
    extensions: [
      ".ppt",
      ".pptx",
    ],
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    label: "PPT · PPTX",
  },
};

function getExtension(fileName) {
  const index = fileName.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return fileName.slice(index).toLowerCase();
}

function removeExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTools() {
  const [selectedTool, setSelectedTool] =
    useState(null);

  const [file, setFile] = useState(null);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusType, setStatusType] =
    useState("success");

  const [resultUrl, setResultUrl] =
    useState("");

  const [resultName, setResultName] =
    useState("");

  const [resultMime, setResultMime] =
    useState("");

  const fileInputRef = useRef(null);

  const clearResult = () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    setResultUrl("");
    setResultName("");
    setResultMime("");
  };

  const resetTool = () => {
    clearResult();

    setFile(null);
    setStatusMessage("");
    setStatusType("success");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectTool = (tool) => {
    resetTool();
    setSelectedTool(tool);
  };

  const closeTool = () => {
    resetTool();
    setSelectedTool(null);
  };

  const showError = (message) => {
    setStatusType("error");
    setStatusMessage(message);
  };

  const showSuccess = (message) => {
    setStatusType("success");
    setStatusMessage(message);
  };

  const setOutput = (
    blob,
    name,
    mimeType = blob.type,
  ) => {
    clearResult();

    const url = URL.createObjectURL(blob);

    setResultUrl(url);
    setResultName(name);
    setResultMime(mimeType);
  };

  const handleFileSelect = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (
      !selectedFile ||
      !selectedTool
    ) {
      return;
    }

    const config =
      acceptedTypes[selectedTool.input];

    const extension = getExtension(
      selectedFile.name,
    );

    const extensionAllowed =
      config.extensions.includes(
        extension,
      );

    const mimeAllowed =
      !selectedFile.type ||
      config.mimeTypes.includes(
        selectedFile.type,
      );

    if (
      !extensionAllowed ||
      !mimeAllowed
    ) {
      alert(
        `Unsupported file type. Please upload: ${config.label.replaceAll(
          " · ",
          ", ",
        )}.`,
      );

      event.target.value = "";
      return;
    }

    clearResult();
    setStatusMessage("");
    setFile(selectedFile);
  };

  /* =========================
     IMAGE COMPRESSOR
  ========================= */

  const compressImage = () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    const image = new Image();

    const objectUrl =
      URL.createObjectURL(file);

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      const maxWidth = 1800;

      const scale = Math.min(
        1,
        maxWidth / image.width,
      );

      canvas.width = Math.round(
        image.width * scale,
      );

      canvas.height = Math.round(
        image.height * scale,
      );

      const context =
        canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(
          objectUrl,
        );

        setIsProcessing(false);

        showError(
          "Unable to process this image.",
        );

        return;
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(
            objectUrl,
          );

          if (!blob) {
            setIsProcessing(false);

            showError(
              "Compression failed.",
            );

            return;
          }

          setOutput(
            blob,
            `${removeExtension(
              file.name,
            )}-compressed.jpg`,
            "image/jpeg",
          );

          setIsProcessing(false);

          showSuccess(
            `Image compressed from ${formatFileSize(
              file.size,
            )} to ${formatFileSize(
              blob.size,
            )}.`,
          );
        },
        "image/jpeg",
        0.78,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(
        objectUrl,
      );

      setIsProcessing(false);

      showError(
        "Unable to read this image.",
      );
    };

    image.src = objectUrl;
  };

  /* =========================
     IMAGE PREVIEW
  ========================= */

  const previewImage = () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    clearResult();

    const url =
      URL.createObjectURL(file);

    setResultUrl(url);
    setResultName(file.name);
    setResultMime(file.type);

    showSuccess(
      "Image preview is ready.",
    );
  };

  /* =========================
     IMAGE TO PDF
  ========================= */

  const imageToPdf = async () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    try {
      const dataUrl =
        await fileToDataURL(file);

      const image =
        await loadImage(dataUrl);

      const orientation =
        image.width >= image.height
          ? "landscape"
          : "portrait";

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth =
        pageWidth - margin * 2;

      const availableHeight =
        pageHeight - margin * 2;

      const imageRatio =
        image.width / image.height;

      let width =
        availableWidth;

      let height =
        width / imageRatio;

      if (
        height >
        availableHeight
      ) {
        height =
          availableHeight;

        width =
          height * imageRatio;
      }

      const x =
        (pageWidth - width) / 2;

      const y =
        (pageHeight - height) / 2;

      const format =
        getExtension(file.name) ===
          ".png"
          ? "PNG"
          : "JPEG";

      pdf.addImage(
        dataUrl,
        format,
        x,
        y,
        width,
        height,
      );

      const pdfBlob =
        pdf.output("blob");

      setOutput(
        pdfBlob,
        `${removeExtension(
          file.name,
        )}.pdf`,
        "application/pdf",
      );

      showSuccess(
        "Image successfully converted to PDF.",
      );
    } catch (error) {
      console.error(error);

      showError(
        "Unable to convert the image to PDF.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     PDF TO IMAGE
  ========================= */

  const pdfToImage = async () => {
    if (!file) {
      alert("Please upload a PDF first.");
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    try {
      const buffer =
        await file.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: buffer,
        }).promise;

      const page =
        await pdf.getPage(1);

      const viewport =
        page.getViewport({
          scale: 2,
        });

      const canvas =
        document.createElement(
          "canvas",
        );

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Canvas unavailable",
        );
      }

      canvas.width =
        viewport.width;

      canvas.height =
        viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const blob =
        await canvasToBlob(
          canvas,
          "image/png",
        );

      setOutput(
        blob,
        `${removeExtension(
          file.name,
        )}-page-1.png`,
        "image/png",
      );

      showSuccess(
        `PDF converted successfully. Page 1 of ${pdf.numPages} is ready as an image.`,
      );
    } catch (error) {
      console.error(error);

      showError(
        "Unable to convert this PDF to an image.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     WORD TO PDF
  ========================= */

  const wordToPdf = async () => {
    if (!file) {
      alert("Please upload a Word file first.");
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    try {
      if (
        getExtension(file.name) ===
        ".doc"
      ) {
        throw new Error(
          "Legacy DOC files are not supported directly in the browser.",
        );
      }

      const arrayBuffer =
        await file.arrayBuffer();

      const result =
        await mammoth.convertToHtml({
          arrayBuffer,
        });

      const html =
        result.value;

      const text =
        htmlToPlainText(html);

      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const margin = 15;

      const usableWidth =
        pageWidth - margin * 2;

      const lines =
        pdf.splitTextToSize(
          text || " ",
          usableWidth,
        );

      let y = 18;

      pdf.setFont(
        "helvetica",
        "normal",
      );

      pdf.setFontSize(11);

      for (const line of lines) {
        if (y > 280) {
          pdf.addPage();
          y = 18;
        }

        pdf.text(
          line,
          margin,
          y,
        );

        y += 6;
      }

      const pdfBlob =
        pdf.output("blob");

      setOutput(
        pdfBlob,
        `${removeExtension(
          file.name,
        )}.pdf`,
        "application/pdf",
      );

      showSuccess(
        "Word document successfully converted to PDF.",
      );
    } catch (error) {
      console.error(error);

      showError(
        error.message?.includes(
          "Legacy DOC",
        )
          ? "Old .DOC files need a converter such as LibreOffice. DOCX files work directly in the browser."
          : "Unable to convert this Word document to PDF.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     PDF TO WORD
  ========================= */

  const pdfToWord = async () => {
    if (!file) {
      alert("Please upload a PDF first.");
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    try {
      const buffer =
        await file.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: buffer,
        }).promise;

      const paragraphs = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page =
          await pdf.getPage(
            pageNumber,
          );

        const content =
          await page.getTextContent();

        const pageText =
          content.items
            .map(
              (item) =>
                item.str || "",
            )
            .join(" ")
            .replace(
              /\s+/g,
              " ",
            )
            .trim();

        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text:
                  pageText ||
                  `Page ${pageNumber}`,
              }),
            ],
          }),
        );

        if (
          pageNumber <
          pdf.numPages
        ) {
          paragraphs.push(
            new Paragraph({
              text: "",
            }),
          );
        }
      }

      const document =
        new Document({
          sections: [
            {
              children:
                paragraphs,
            },
          ],
        });

      const blob =
        await Packer.toBlob(
          document,
        );

      setOutput(
        blob,
        `${removeExtension(
          file.name,
        )}.docx`,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      showSuccess(
        `PDF successfully converted to an editable Word document. ${pdf.numPages} page(s) processed.`,
      );
    } catch (error) {
      console.error(error);

      showError(
        "Unable to convert this PDF to Word.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     POWERPOINT TO PDF
  ========================= */

  const powerpointToPdf = async () => {
    if (!file) {
      alert(
        "Please upload a PowerPoint file first.",
      );
      return;
    }

    setIsProcessing(true);
    clearResult();
    setStatusMessage("");

    try {
      /*
        Browser-only JavaScript cannot faithfully
        render arbitrary PPT/PPTX slides into PDF.

        We intentionally do not create a fake output.
        This tool is reserved for the local converter
        layer/backend where LibreOffice or another
        presentation renderer can process the file.
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      );

      showError(
        "PowerPoint to PDF requires a presentation renderer such as LibreOffice. The frontend cannot reliably render PPT/PPTX files into PDF by itself.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* =========================
     PROCESS TOOL
  ========================= */

  const processTool = () => {
    if (!selectedTool) {
      return;
    }

    switch (selectedTool.id) {
      case "compress":
        compressImage();
        break;

      case "preview":
        previewImage();
        break;

      case "image-pdf":
        imageToPdf();
        break;

      case "pdf-image":
        pdfToImage();
        break;

      case "word-pdf":
        wordToPdf();
        break;

      case "pdf-word":
        pdfToWord();
        break;

      case "powerpoint-pdf":
        powerpointToPdf();
        break;

      default:
        break;
    }
  };

  /* =========================
     DOWNLOAD
  ========================= */

  const downloadResult = () => {
    if (!resultUrl) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = resultUrl;

    link.download =
      resultName ||
      "offedu-output";

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();
  };

  const isImageOutput =
    selectedTool?.id ===
      "preview" ||
    selectedTool?.id ===
      "compress" ||
    resultMime.startsWith(
      "image/",
    );

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-[#063b3b] via-[#06272d] to-[#03070b] px-4 py-6 sm:px-6 lg:px-8">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-20 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-3xl" />

        <div className="absolute right-[-120px] top-1/4 h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-400/10 text-teal-300">
              <FileOutput size={22} />
            </div>

            <div>
              <p className="text-sm font-medium text-teal-300">
                Local File Utilities
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                File Tools
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Compress, preview and convert
            your study files with simple
            local tools.
          </p>
        </div>

        {!selectedTool ? (
          <>
            {/* Tool grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() =>
                      selectTool(tool)
                    }
                    className="group rounded-3xl border border-white/10 bg-[#061214]/65 p-6 text-left shadow-xl shadow-black/10 backdrop-blur-xl transition hover:border-teal-300/20 hover:bg-[#071719]/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/10 text-teal-300 transition group-hover:bg-teal-400/15">
                        <Icon size={23} />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-[11px] text-slate-500">
                        {tool.input ===
                        "image"
                          ? "IMAGE"
                          : tool.input ===
                              "pdf"
                            ? "PDF"
                            : tool.input ===
                                "word"
                              ? "WORD"
                              : tool.input ===
                                  "powerpoint"
                                ? "PPT"
                                : "FILE"}
                      </span>
                    </div>

                    <h2 className="mt-6 text-lg font-semibold text-white">
                      {tool.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {tool.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-medium text-teal-300">
                      Open Tool

                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Local info */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#061214]/55 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                  <CheckCircle2 size={21} />
                </div>

                <div>
                  <h3 className="font-medium text-white">
                    Designed for local processing
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    OFFSEDU is being designed
                    around privacy-first local
                    workflows. File conversions
                    that are supported directly by
                    the browser are processed on
                    your device.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tool workspace */}
            <div className="mx-auto max-w-4xl">
              <button
                type="button"
                onClick={closeTool}
                className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-teal-300"
              >
                ← Back to File Tools
              </button>

              <div className="rounded-3xl border border-white/10 bg-[#061214]/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7">
                {/* Tool heading */}
                <div className="mb-7 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
                    <selectedTool.icon
                      size={23}
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedTool.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {
                        selectedTool.description
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeTool}
                    className="ml-auto rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <X size={19} />
                  </button>
                </div>

                {/* Upload area */}
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="w-full rounded-3xl border border-dashed border-teal-300/20 bg-teal-400/[0.035] p-8 text-center transition hover:border-teal-300/35 hover:bg-teal-400/[0.06] sm:p-12"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/15 bg-teal-400/10 text-teal-300">
                    <Upload size={27} />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-white">
                    {file
                      ? "Choose another file"
                      : "Upload your file"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {
                      acceptedTypes[
                        selectedTool.input
                      ].label
                    }
                  </p>

                  {file && (
                    <div className="mx-auto mt-5 max-w-lg rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="truncate text-sm font-medium text-teal-300">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {formatFileSize(
                          file.size,
                        )}
                      </p>
                    </div>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedTypes[
                    selectedTool.input
                  ].extensions.join(",")}
                  onChange={
                    handleFileSelect
                  }
                  className="hidden"
                />

                {/* Action */}
                <button
                  type="button"
                  onClick={processTool}
                  disabled={
                    !file ||
                    isProcessing
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500/90 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isProcessing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <selectedTool.icon
                        size={18}
                      />

                      {selectedTool.id ===
                      "preview"
                        ? "Preview Image"
                        : `Process ${selectedTool.title}`}
                    </>
                  )}
                </button>

                {/* Status */}
                {statusMessage && (
                  <div
                    className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
                      statusType ===
                      "error"
                        ? "border-red-400/15 bg-red-400/[0.04]"
                        : "border-teal-300/10 bg-teal-400/[0.04]"
                    }`}
                  >
                    <CheckCircle2
                      size={19}
                      className={`mt-0.5 shrink-0 ${
                        statusType ===
                        "error"
                          ? "text-red-300"
                          : "text-teal-300"
                      }`}
                    />

                    <p
                      className={`text-sm leading-6 ${
                        statusType ===
                        "error"
                          ? "text-red-200/70"
                          : "text-slate-400"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  </div>
                )}

                {/* Result */}
                {resultUrl && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/15 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">
                          Output
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-600">
                          {resultName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          downloadResult
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                      >
                        <Download
                          size={17}
                        />
                        Download
                      </button>
                    </div>

                    {isImageOutput ? (
                      <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
                        <img
                          src={resultUrl}
                          alt="Processed result"
                          className="max-h-[520px] max-w-full rounded-xl object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                        <div>
                          <FileOutput
                            size={36}
                            className="mx-auto text-teal-300"
                          />

                          <p className="mt-3 text-sm text-slate-500">
                            Your converted file
                            is ready.
                          </p>

                          <p className="mt-1 text-xs text-slate-700">
                            {resultName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tool note */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#061214]/50 p-4 backdrop-blur-xl">
                <div className="flex gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <p className="text-xs leading-5 text-slate-600">
                    Supported browser conversions
                    are processed locally on your
                    device. PowerPoint conversion
                    requires a presentation rendering
                    engine such as LibreOffice.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function fileToDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error(
            "Unable to read file.",
          ),
        );

      reader.readAsDataURL(file);
    },
  );
}

function loadImage(src) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Unable to load image.",
          ),
        );

      image.src = src;
    },
  );
}

function canvasToBlob(
  canvas,
  type,
) {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                "Unable to create image.",
              ),
            );
          }
        },
        type,
      );
    },
  );
}

function htmlToPlainText(html) {
  const container =
    document.createElement(
      "div",
    );

  container.innerHTML = html;

  return (
    container.innerText ||
    container.textContent ||
    ""
  )
    .replace(
      /\n{3,}/g,
      "\n\n",
    )
    .trim();
}

export default FileTools;