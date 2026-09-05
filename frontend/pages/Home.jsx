import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCog,
  FileText,
  Files,
  History,
  MessageCircle,
  Sparkles,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

import studyAnimation from "./Study.svg";
import offeduLogo from "./logo.png";

/* =========================================================
   FEATURES
========================================================= */

const features = [
  {
    title: "AI Chat",
    description:
      "Ask Gemma questions, discuss concepts and learn through conversation.",
    path: "/chat",
    icon: MessageCircle,
    accent: "#7dd3c0",
    soft: "rgba(125,211,192,0.12)",
  },
  {
    title: "Explain",
    description:
      "Turn difficult topics into clear and easy-to-understand explanations.",
    path: "/explain",
    icon: Brain,
    accent: "#a5b4fc",
    soft: "rgba(165,180,252,0.12)",
  },
  {
    title: "Quiz",
    description:
      "Practice your knowledge with AI-generated quizzes and instant results.",
    path: "/quiz",
    icon: Zap,
    accent: "#f6c978",
    soft: "rgba(246,201,120,0.12)",
  },
  {
    title: "Test Paper",
    description:
      "Generate structured short and long answer practice papers.",
    path: "/test-paper",
    icon: FileText,
    accent: "#86d6ad",
    soft: "rgba(134,214,173,0.12)",
  },
  {
    title: "Study Plan",
    description:
      "Create a focused study schedule based on your subjects and goals.",
    path: "/study-plan",
    icon: CalendarDays,
    accent: "#93b7d8",
    soft: "rgba(147,183,216,0.12)",
  },
  {
    title: "Documents",
    description:
      "Keep your subjects, notes and study material organized in one place.",
    path: "/documents",
    icon: Files,
    accent: "#d0a9d9",
    soft: "rgba(208,169,217,0.12)",
  },
  {
    title: "File Tools",
    description:
      "Work with your study files using useful conversion and management tools.",
    path: "/file-tools",
    icon: Wrench,
    accent: "#e0ad8a",
    soft: "rgba(224,173,138,0.12)",
  },
];

/* =========================================================
   HISTORY
========================================================= */

const defaultHistory = [];

/* =========================================================
   CAROUSEL POSITION
========================================================= */

function getRelativePosition(
  index,
  activeIndex,
  total,
) {
  let position = index - activeIndex;

  if (position > total / 2) {
    position -= total;
  }

  if (position < -total / 2) {
    position += total;
  }

  return position;
}

/* =========================================================
   HISTORY TIME
========================================================= */

function formatHistoryTime(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const difference =
    now.getTime() - date.getTime();

  if (difference < 60 * 1000) {
    return "Just now";
  }

  if (difference < 60 * 60 * 1000) {
    const minutes = Math.floor(
      difference / (60 * 1000),
    );

    return `${minutes} min ago`;
  }

  if (difference < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(
      difference / (60 * 60 * 1000),
    );

    return `${hours} hr ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   NORMALIZE HISTORY
========================================================= */

function normalizeHistoryItem(item, index) {
  return {
    id:
      item?.id ||
      item?.timestamp ||
      item?.createdAt ||
      `history-${index}`,

    fileName:
      item?.fileName ||
      item?.name ||
      item?.file ||
      item?.filename ||
      "Study file",

    operation:
      item?.operation ||
      item?.action ||
      item?.type ||
      "File operation",

    status:
      item?.status ||
      "Completed",

    timestamp:
      item?.timestamp ||
      item?.createdAt ||
      item?.date ||
      new Date().toISOString(),
  };
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isCarouselPaused, setIsCarouselPaused] =
    useState(false);

  const [history, setHistory] =
    useState(defaultHistory);

  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const pointerDown = useRef(false);

  /* =======================================================
     LOAD HISTORY FROM DOCUMENTS
     
     Documents stores uploaded files inside:
     sessionStorage -> "offsedu_subjects"
     
     Home reads those files and displays them
     automatically in Recent Operations.
  ======================================================== */

  useEffect(() => {
    const loadHistory = () => {
      try {
        const storedSubjects =
          localStorage.getItem("offsedu_subjects");

        if (!storedSubjects) {
          setHistory([]);
          return;
        }

        const parsedSubjects =
          JSON.parse(storedSubjects);

        if (!Array.isArray(parsedSubjects)) {
          setHistory([]);
          return;
        }

        const uploadedFiles = [];

        parsedSubjects.forEach((subject) => {
          if (!Array.isArray(subject?.files)) {
            return;
          }

          subject.files.forEach((file) => {
            uploadedFiles.push({
              id: file.id,
              fileName: file.name,
              operation: "Uploaded",
              status: "Completed",
              timestamp:
                file.uploadedAt ||
                new Date().toISOString(),
            });
          });
        });

        uploadedFiles.sort((a, b) => {
          const dateA = new Date(
            a.timestamp,
          ).getTime();

          const dateB = new Date(
            b.timestamp,
          ).getTime();

          return dateB - dateA;
        });

        setHistory(
          uploadedFiles
            .slice(0, 8)
            .map(normalizeHistoryItem),
        );
      } catch {
        setHistory([]);
      }
    };

    loadHistory();

    window.addEventListener(
      "offedu-documents-updated",
      loadHistory,
    );

    return () => {
      window.removeEventListener(
        "offedu-documents-updated",
        loadHistory,
      );
    };
  }, []);

  /* =======================================================
     AUTO CAROUSEL
  ======================================================== */

  useEffect(() => {
    if (isCarouselPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (current + 1) % features.length,
      );
    }, 3200);

    return () => {
      window.clearInterval(timer);
    };
  }, [isCarouselPaused]);

  /* =======================================================
     CAROUSEL CONTROLS
  ======================================================== */

  const moveLeft = () => {
    setActiveIndex(
      (current) =>
        (current - 1 + features.length) %
        features.length,
    );
  };

  const moveRight = () => {
    setActiveIndex(
      (current) =>
        (current + 1) % features.length,
    );
  };

  const selectFeature = (index) => {
    setActiveIndex(index);
  };

  /* =======================================================
     SWIPE
  ======================================================== */

  const handlePointerDown = (event) => {
    pointerDown.current = true;

    pointerStartX.current =
      event.clientX;

    pointerStartY.current =
      event.clientY;
  };

  const handlePointerUp = (event) => {
    if (!pointerDown.current) {
      return;
    }

    pointerDown.current = false;

    const deltaX =
      event.clientX -
      pointerStartX.current;

    const deltaY =
      event.clientY -
      pointerStartY.current;

    if (Math.abs(deltaX) < 45) {
      return;
    }

    if (
      Math.abs(deltaX) <
      Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) {
      moveRight();
    } else {
      moveLeft();
    }
  };

  const handlePointerCancel = () => {
    pointerDown.current = false;
  };

  /* =======================================================
     CLEAR HISTORY
  ======================================================== */

  const clearHistory = () => {
    setHistory([]);
  };

  const activeFeature = useMemo(
    () => features[activeIndex],
    [activeIndex],
  );

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 72% 18%, rgba(126,169,152,0.10), transparent 30%), radial-gradient(circle at 12% 42%, rgba(92,130,116,0.08), transparent 28%), linear-gradient(135deg, #07100d 0%, #0a1713 42%, #08110f 100%)",
          }}
        />

        <div
          className="absolute left-[8%] top-[18%] h-72 w-72 rounded-full blur-[130px]"
          style={{
            background:
              "rgba(112,166,143,0.07)",
          }}
        />

        <div
          className="absolute right-[5%] top-[8%] h-96 w-96 rounded-full blur-[150px]"
          style={{
            background:
              "rgba(109,148,135,0.06)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize:
              "72px 72px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.025] px-5 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-8 sm:py-10 lg:min-h-[440px] lg:px-12">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-[110px]"
            style={{
              background:
                "rgba(126,169,152,0.10)",
            }}
          />

          <div
            className="pointer-events-none absolute right-[25%] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full blur-[120px]"
            style={{
              background:
                "rgba(142,183,168,0.06)",
            }}
          />

          <div className="relative grid min-h-[390px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}

            <div className="relative z-10 max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_35px_rgba(0,0,0,0.25)]">
                  <img
                    src={offeduLogo}
                    alt="OFFEDU"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-white">
                    OFFEDU
                  </p>

                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#8ea39a]">
                    Offline AI Study Environment
                  </p>
                </div>
              </div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8fb8a8]/15 bg-[#8fb8a8]/[0.06] px-3 py-1.5">
                <Sparkles
                  size={13}
                  className="text-[#a9cabc]"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#b4c7bf]">
                  Learn Anywhere · Offline
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#f1f5f2] sm:text-5xl lg:text-6xl">
                Your Study.
                <span className="mt-1 block bg-gradient-to-r from-[#b7d0c5] via-[#8fb8a8] to-[#6f8f83] bg-clip-text text-transparent">
                  Reimagined.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#9eb0a8] sm:text-base">
                Learn, understand, practice and
                organize your study material with
                your own offline AI learning
                environment.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/chat"
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#8fb8a8]/20 bg-[#8fb8a8]/[0.10] px-5 py-3 text-xs font-semibold text-[#d7e5df] shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-[#8fb8a8]/35 hover:bg-[#8fb8a8]/[0.16]"
                >
                  Start Learning

                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/documents"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-xs font-semibold text-[#b9c8c2] transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
                >
                  <Files size={15} />
                  Your Documents
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-[#657a72]">
                <span>Gemma</span>

                <span className="h-1 w-1 rounded-full bg-[#6f8f83]" />

                <span>Ollama</span>

                <span className="h-1 w-1 rounded-full bg-[#6f8f83]" />

                <span>Private</span>

                <span className="h-1 w-1 rounded-full bg-[#6f8f83]" />

                <span>Offline</span>
              </div>
            </div>

            {/* RIGHT — SVG */}

            <div className="relative flex min-h-[300px] items-center justify-center lg:min-h-[390px]">
              <div
                className="absolute h-[310px] w-[310px] rounded-full blur-[80px] sm:h-[370px] sm:w-[370px]"
                style={{
                  background:
                    "radial-gradient(circle, rgba(126,169,152,0.12), transparent 68%)",
                }}
              />

              <div className="relative w-full max-w-[500px] animate-[offeduFloat_6s_ease-in-out_infinite]">
                <img
                  src={studyAnimation}
                  alt="OFFEDU learning animation"
                  className="relative z-10 h-auto w-full object-contain drop-shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
                />
              </div>

              <div className="absolute left-[4%] top-[15%] hidden rounded-2xl border border-white/[0.08] bg-[#0d1b17]/80 px-3 py-2 backdrop-blur-xl sm:block">
                <div className="flex items-center gap-2">
                  <Brain
                    size={14}
                    className="text-[#a7c4b8]"
                  />

                  <span className="text-[9px] font-medium text-[#c1d1ca]">
                    AI Powered
                  </span>
                </div>
              </div>

              <div className="absolute bottom-[12%] right-[4%] hidden rounded-2xl border border-white/[0.08] bg-[#0d1b17]/80 px-3 py-2 backdrop-blur-xl sm:block">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className="text-[#9ebbb0]"
                  />

                  <span className="text-[9px] font-medium text-[#c1d1ca]">
                    Learn Offline
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ====================================================== */}

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#70867c]">
                Your learning environment
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#edf3f0] sm:text-3xl">
                Everything you need to study.
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-6 text-[#81958d]">
                Explore the tools inside OFFEDU.
                Hover to pause the carousel or swipe
                to move through your study tools.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={moveLeft}
                aria-label="Previous feature"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#9aada5] transition hover:border-[#8fb8a8]/25 hover:bg-[#8fb8a8]/[0.07] hover:text-[#d8e5df]"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={moveRight}
                aria-label="Next feature"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#9aada5] transition hover:border-[#8fb8a8]/25 hover:bg-[#8fb8a8]/[0.07] hover:text-[#d8e5df]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* =================================================
              3D CAROUSEL
          ================================================== */}

          <div
            className="relative h-[430px] w-full select-none overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#09130f]/65 py-6 sm:h-[450px]"
            onMouseEnter={() =>
              setIsCarouselPaused(true)
            }
            onMouseLeave={() =>
              setIsCarouselPaused(false)
            }
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            style={{
              perspective: "1400px",
              touchAction: "pan-y",
            }}
          >
            {/* Ambient glow */}

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(126,169,152,0.09), transparent 68%)",
              }}
            />

            {/* 3D depth rings */}

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.025]"
              style={{
                transform:
                  "translate(-50%, -50%) rotateX(65deg)",
              }}
            />

            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#8fb8a8]/[0.04]"
              style={{
                transform:
                  "translate(-50%, -50%) rotateY(55deg)",
              }}
            />

            {/* CARDS */}

            <div
              className="absolute left-1/2 top-1/2 h-[315px] w-[280px] -translate-x-1/2 -translate-y-1/2 sm:h-[330px] sm:w-[310px]"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {features.map(
                (feature, index) => {
                  const Icon = feature.icon;

                  const position =
                    getRelativePosition(
                      index,
                      activeIndex,
                      features.length,
                    );

                  const visible =
                    Math.abs(position) <= 2;

                  let translateX = 0;
                  let translateZ = 180;
                  let rotateY = 0;
                  let scale = 1;
                  let opacity = 1;

                  if (position === 0) {
                    translateX = 0;
                    translateZ = 190;
                    rotateY = 0;
                    scale = 1;
                    opacity = 1;
                  } else if (position === -1) {
                    translateX = -235;
                    translateZ = 25;
                    rotateY = 24;
                    scale = 0.84;
                    opacity = 0.78;
                  } else if (position === 1) {
                    translateX = 235;
                    translateZ = 25;
                    rotateY = -24;
                    scale = 0.84;
                    opacity = 0.78;
                  } else if (position === -2) {
                    translateX = -415;
                    translateZ = -110;
                    rotateY = 38;
                    scale = 0.66;
                    opacity = 0.34;
                  } else if (position === 2) {
                    translateX = 415;
                    translateZ = -110;
                    rotateY = -38;
                    scale = 0.66;
                    opacity = 0.34;
                  } else {
                    translateZ = -260;
                    scale = 0.45;
                    opacity = 0;
                  }

                  return (
                    <div
                      key={feature.title}
                      className="absolute left-1/2 top-1/2 h-full w-full"
                      style={{
                        transformStyle:
                          "preserve-3d",

                        transform: `
                          translate(-50%, -50%)
                          translate3d(${translateX}px, 0, ${translateZ}px)
                          rotateY(${rotateY}deg)
                          scale(${scale})
                        `,

                        opacity,

                        zIndex:
                          20 - Math.abs(position),

                        pointerEvents: visible
                          ? "auto"
                          : "none",

                        transition:
                          "transform 750ms cubic-bezier(.2,.8,.2,1), opacity 500ms ease",
                      }}
                    >
                      <Link
                        to={feature.path}
                        draggable={false}
                        onClick={(event) => {
                          if (
                            Math.abs(
                              pointerStartX.current -
                                event.clientX,
                            ) > 45
                          ) {
                            event.preventDefault();
                          }

                          selectFeature(index);
                        }}
                        className="group block h-full w-full"
                        aria-label={`Open ${feature.title}`}
                      >
                        {/* Depth shadow */}

                        <div
                          className="absolute inset-0 rounded-[30px] blur-xl"
                          style={{
                            background:
                              feature.soft,

                            transform:
                              "translateZ(-45px)",

                            opacity:
                              position === 0
                                ? 0.9
                                : 0.45,
                          }}
                        />

                        {/* Main card */}

                        <div
                          className="relative flex h-full flex-col overflow-hidden rounded-[30px] border bg-[#0d1b17]/95 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.40)] backdrop-blur-xl transition duration-300 group-hover:border-white/[0.14]"
                          style={{
                            borderColor:
                              position === 0
                                ? `${feature.accent}45`
                                : "rgba(255,255,255,0.07)",

                            transformStyle:
                              "preserve-3d",
                          }}
                        >
                          {/* Glow */}

                          <div
                            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[65px]"
                            style={{
                              background:
                                feature.accent,

                              opacity:
                                position === 0
                                  ? 0.12
                                  : 0.06,
                            }}
                          />

                          {/* Bottom line */}

                          <div
                            className="pointer-events-none absolute inset-x-5 bottom-0 h-px"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${feature.accent}55, transparent)`,
                            }}
                          />

                          {/* Icon */}

                          <div className="relative z-10 flex items-start justify-between">
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                              style={{
                                borderColor:
                                  `${feature.accent}35`,

                                background:
                                  feature.soft,

                                boxShadow:
                                  position === 0
                                    ? `0 0 35px ${feature.accent}18`
                                    : "none",

                                transform:
                                  position === 0
                                    ? "translateZ(28px)"
                                    : "translateZ(12px)",
                              }}
                            >
                              <Icon
                                size={26}
                                strokeWidth={1.6}
                                style={{
                                  color:
                                    feature.accent,
                                }}
                              />
                            </div>

                            <span
                              className="rounded-full border px-2.5 py-1 text-[8px] uppercase tracking-[0.18em]"
                              style={{
                                color:
                                  feature.accent,

                                borderColor:
                                  `${feature.accent}30`,

                                background:
                                  feature.soft,
                              }}
                            >
                              {position === 0
                                ? "Open"
                                : "Explore"}
                            </span>
                          </div>

                          {/* Content */}

                          <div
                            className="relative z-10 mt-auto"
                            style={{
                              transform:
                                position === 0
                                  ? "translateZ(22px)"
                                  : "translateZ(10px)",
                            }}
                          >
                            <p
                              className="text-[10px] font-medium uppercase tracking-[0.18em]"
                              style={{
                                color:
                                  feature.accent,
                              }}
                            >
                              OFFEDU MODULE
                            </p>

                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#edf3f0]">
                              {feature.title}
                            </h3>

                            <p className="mt-3 min-h-[60px] text-xs leading-6 text-[#8fa29a]">
                              {
                                feature.description
                              }
                            </p>

                            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                              <span className="text-[9px] uppercase tracking-[0.15em] text-[#657971]">
                                Click to open
                              </span>

                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-full border transition-transform group-hover:translate-x-1"
                                style={{
                                  color:
                                    feature.accent,

                                  borderColor:
                                    `${feature.accent}30`,

                                  background:
                                    feature.soft,
                                }}
                              >
                                <ArrowRight
                                  size={14}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                },
              )}
            </div>

            {/* Side fades */}

            <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-24 bg-gradient-to-r from-[#09130f] to-transparent" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-24 bg-gradient-to-l from-[#09130f] to-transparent" />

            {/* Mobile controls */}

            <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={moveLeft}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1714]/90 text-[#9aada5] backdrop-blur-xl"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="rounded-xl border border-white/[0.06] bg-[#0b1714]/90 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-[#71857d] backdrop-blur-xl">
                Swipe
              </div>

              <button
                type="button"
                onClick={moveRight}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1714]/90 text-[#9aada5] backdrop-blur-xl"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dots */}

          <div className="mt-5 flex items-center justify-center gap-2">
            {features.map(
              (feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  aria-label={`Show ${feature.title}`}
                  onClick={() =>
                    selectFeature(index)
                  }
                  className="group flex h-5 items-center justify-center"
                >
                  <span
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width:
                        activeIndex === index
                          ? 24
                          : 6,

                      background:
                        activeIndex === index
                          ? feature.accent
                          : "rgba(255,255,255,0.16)",

                      boxShadow:
                        activeIndex === index
                          ? `0 0 12px ${feature.accent}55`
                          : "none",
                    }}
                  />
                </button>
              ),
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.17em] text-[#63766e]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCarouselPaused
                  ? "bg-[#b7d0c5]"
                  : "animate-pulse bg-[#789b8d]"
              }`}
            />

            {isCarouselPaused
              ? "Carousel paused"
              : "Auto exploring"}
          </div>
        </section>

        {/* =====================================================
            ACTIVE FEATURE
        ====================================================== */}

        <section className="mt-8">
          <Link
            to={activeFeature.path}
            className="group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl transition hover:border-white/[0.10] hover:bg-white/[0.035] sm:flex-row sm:items-center"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{
                borderColor:
                  `${activeFeature.accent}30`,

                background:
                  activeFeature.soft,
              }}
            >
              <activeFeature.icon
                size={19}
                style={{
                  color:
                    activeFeature.accent,
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#687b73]">
                Currently exploring
              </p>

              <p className="mt-1 text-sm font-semibold text-[#e5ede9]">
                {activeFeature.title}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#7f928a]">
                {
                  activeFeature.description
                }
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-medium text-[#8fa79c] transition group-hover:text-[#c5d7cf]">
              Open

              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>
        </section>

        {/* =====================================================
            FILE HISTORY
        ====================================================== */}

        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History
                  size={16}
                  className="text-[#8fb8a8]"
                />

                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#70867c]">
                  File activity
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#edf3f0]">
                Recent operations
              </h2>

              <p className="mt-2 text-xs text-[#81958d]">
                Your recent file conversions,
                uploads and other operations appear
                here.
              </p>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="hidden items-center gap-2 rounded-xl border border-red-300/10 bg-red-400/[0.04] px-3 py-2 text-[10px] font-medium text-red-200/70 transition hover:border-red-300/20 hover:bg-red-400/[0.07] hover:text-red-200 sm:flex"
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#0b1714]/70 backdrop-blur-xl">
            {history.length === 0 ? (
              <div className="flex min-h-[230px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8fb8a8]/10 bg-[#8fb8a8]/[0.05]">
                  <FileCog
                    size={25}
                    strokeWidth={1.4}
                    className="text-[#78998b]"
                  />

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#0b1714] bg-[#8fb8a8]/20">
                    <Clock3
                      size={10}
                      className="text-[#aac7ba]"
                    />
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-semibold text-[#dce7e2]">
                  No file activity yet
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-[#748880]">
                  Upload, convert or manage a study
                  file and your recent operation will
                  appear here.
                </p>

                <Link
                  to="/file-tools"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#8fb8a8]/15 bg-[#8fb8a8]/[0.06] px-4 py-2.5 text-[10px] font-semibold text-[#b5c9c1] transition hover:border-[#8fb8a8]/25 hover:bg-[#8fb8a8]/[0.10]"
                >
                  <Wrench size={13} />
                  Open File Tools
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/[0.05]">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8fb8a8]/10 bg-[#8fb8a8]/[0.05]">
                        <FileText
                          size={17}
                          className="text-[#8eaa9e]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#dce7e2]">
                          {item.fileName}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-[#71847c]">
                          <span>
                            {item.operation}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-[#52655d]" />

                          <span>
                            {formatHistoryTime(
                              item.timestamp,
                            )}
                          </span>
                        </div>
                      </div>

                      <span className="hidden rounded-full border border-[#8fb8a8]/10 bg-[#8fb8a8]/[0.04] px-2.5 py-1 text-[8px] uppercase tracking-[0.15em] text-[#8ba69a] sm:block">
                        {item.status}
                      </span>

                      <ArrowRight
                        size={14}
                        className="text-[#52645d] transition-all group-hover:translate-x-1 group-hover:text-[#9db5aa]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#5f736a]">
                    Showing recent activity
                  </p>

                  <button
                    type="button"
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 text-[9px] text-red-200/55 transition hover:text-red-200"
                  >
                    <Trash2 size={11} />
                    Clear history
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* =====================================================
            QUICK START
        ====================================================== */}

        <section className="mt-14">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#70867c]">
              Quick access
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#edf3f0]">
              Start studying
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <QuickCard
              icon={MessageCircle}
              title="Ask Gemma"
              description="Start an AI study conversation."
              path="/chat"
            />

            <QuickCard
              icon={Brain}
              title="Explain a Topic"
              description="Make difficult concepts easier."
              path="/explain"
            />

            <QuickCard
              icon={CalendarDays}
              title="Create Study Plan"
              description="Build your personalized schedule."
              path="/study-plan"
            />
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8fb8a8] shadow-[0_0_10px_rgba(143,184,168,0.5)]" />

            <span className="text-[9px] uppercase tracking-[0.2em] text-[#687b73]">
              OFFEDU · Local AI · Gemma · Ollama
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-[#8fb8a8] shadow-[0_0_10px_rgba(143,184,168,0.5)]" />
          </div>
        </div>
      </main>

      {/* =======================================================
          LOCAL ANIMATION
      ======================================================== */}

      <style>{`
        @keyframes offeduFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -10px, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   QUICK CARD
========================================================= */

function QuickCard({
  icon: Icon,
  title,
  description,
  path,
}) {
  return (
    <Link
      to={path}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#8fb8a8]/15 hover:bg-white/[0.035]"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#8fb8a8]/[0.04] blur-2xl transition duration-500 group-hover:bg-[#8fb8a8]/[0.08]" />

      <div className="relative flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8fb8a8]/10 bg-[#8fb8a8]/[0.05]">
          <Icon
            size={19}
            strokeWidth={1.6}
            className="text-[#91afa2]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#dce6e2] transition group-hover:text-white">
            {title}
          </p>

          <p className="mt-1 text-[10px] leading-5 text-[#748880]">
            {description}
          </p>
        </div>

        <ArrowRight
          size={14}
          className="shrink-0 text-[#596c64] transition-all group-hover:translate-x-1 group-hover:text-[#a6beb3]"
        />
      </div>
    </Link>
  );
}

export default Home;