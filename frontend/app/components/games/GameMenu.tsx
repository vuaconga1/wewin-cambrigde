"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import type {
  GameKey,
  WordItem,
} from "@/types/games";
import { DEFAULT_ENABLED_GAMES, type WordAudioContext } from "@/types/games";
import { bookTypeFromPathname } from "@/app/utils/playWordAudio";
import {
  useGameSeasonTheme,
} from "@/app/components/games/forest-background";
import {
  Volume2,
  Mic,
  Brain,
  ListOrdered,
  Shuffle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const FlipCardGame = dynamic(
  () =>
    import("@/app/components/games/FlipCardGame").then(
      (m) => m.FlipCardGame
    ),
  { ssr: false }
);

const PronunciationGame = dynamic(
  () =>
    import("@/app/components/games/PronunciationGame").then(
      (m) => m.PronunciationGame
    ),
  { ssr: false }
);

const MemoryGame = dynamic(
  () => import("@/app/components/games/MemoryGame").then((m) => m.MemoryGame),
  { ssr: false }
);

const WordOrderingGame = dynamic(
  () =>
    import("@/app/components/games/WordOrderingGame").then(
      (m) => m.WordOrderingGame
    ),
  { ssr: false }
);

const WordScrambleGame = dynamic(
  () =>
    import("@/app/components/games/WordScrambleGame").then(
      (m) => m.WordScrambleGame
    ),
  { ssr: false }
);

type GameMenuProps = {
  title: string;
  description?: string;
  words: WordItem[];
  autoAudio?: boolean;
  enabledGames?: GameKey[];
  orderingTitle?: string;
  scrambleTitle?: string;
  orderingShowScore?: boolean;
  scrambleShowScore?: boolean;
  onGameComplete?: (game: GameKey, score?: number) => void;
  slug?: string;
  bookType?: string;
  partId?: string;
  allowNavigation?: boolean;
  activeView?: GameType | "menu";
  onChangeView?: (view: GameType | "menu") => void;
  onChooseOtherGame?: () => void;
  progress?: Record<GameKey, boolean>;
  scores?: Record<GameKey, number>;
};

type GameType = GameKey;

type GameCard = {
  type: GameType;
  title: string;
  description: string;
  icon: ReactNode;
  accentClass: string;
  iconWrapClass: string;
  progressKey: GameKey;
};

export function GameMenu({
  title,
  description,
  words,
  autoAudio = true,
  enabledGames,
  orderingTitle,
  scrambleTitle,
  orderingShowScore,
  scrambleShowScore,
  onGameComplete,
  slug,
  bookType: bookTypeProp,
  partId,
  allowNavigation = true,
  activeView,
  onChangeView,
  onChooseOtherGame,
  progress = {} as Record<GameKey, boolean>,
  scores = {} as Record<GameKey, number>,
}: GameMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const bookType = bookTypeProp ?? bookTypeFromPathname(pathname);
  const audioContext = useMemo<WordAudioContext | undefined>(
    () => (bookType && slug ? { bookType, gameSlug: slug } : undefined),
    [bookType, slug],
  );
  const [isPending, startTransition] = useTransition();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 408, height: 504 });
  const { ui: menuUi } = useGameSeasonTheme("menu");

  useEffect(() => {
    const updateCardSize = () => {
      const w = window.innerWidth;
      if (w >= 768) {
        setCardSize({ width: 408, height: 504 });
      } else if (w < 400) {
        setCardSize({ width: 220, height: 280 });
      } else if (w < 640) {
        setCardSize({ width: 260, height: 330 });
      } else {
        setCardSize({ width: 320, height: 400 });
      }
    };

    updateCardSize();
    window.addEventListener("resize", updateCardSize);
    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  // Xác định game từ URL nếu có dạng .../[slug]/[game]
  const { pathSegments, urlGame } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const gameFromUrl: GameType | "menu" =
      lastSegment === "flip" ||
      lastSegment === "speak" ||
      lastSegment === "memory" ||
      lastSegment === "ordering" ||
      lastSegment === "scramble"
        ? (lastSegment as GameType)
        : "menu";

    return { pathSegments: segments, urlGame: gameFromUrl };
  }, [pathname]);

  // Local state nếu component không được điều khiển từ bên ngoài
  const [internalView, setInternalView] = useState<GameType | "menu">(urlGame);

  const currentView = activeView ?? internalView;
  const setView = onChangeView ?? setInternalView;

  const gamesToShow = useMemo(
    () => ((enabledGames ?? DEFAULT_ENABLED_GAMES).filter((game) => game !== "matching")) as GameKey[],
    [enabledGames]
  );

  const goToMenu = useCallback(() => {
    if (onChooseOtherGame) {
      onChooseOtherGame();
      return;
    }

    setView("menu");
  }, [onChooseOtherGame, setView]);

  // Đồng bộ view khi URL đổi (back/forward)
  useEffect(() => {
    setInternalView(urlGame);
  }, [urlGame]);

  const flipCardConfig = useMemo(
    () => ({
      title: "Flip Card Game",
      words,
      autoAudio,
      audioContext,
    }),
    [audioContext, autoAudio, words]
  );

  const pronunciationConfig = useMemo(
    () => ({
      title: "Pronunciation Game",
      words,
      audioContext,
    }),
    [audioContext, words]
  );

  const memoryConfig = useMemo(
    () => ({
      title: "Memory Game",
      words,
      showScore: true,
      audioContext,
    }),
    [audioContext, words]
  );

  const orderingConfig = useMemo(
    () => ({
      title: orderingTitle ?? `${title} - Word Ordering`,
      words,
      showScore: orderingShowScore ?? true,
    }),
    [orderingTitle, orderingShowScore, title, words],
  );

  const scrambleConfig = useMemo(
    () => ({
      title: scrambleTitle ?? `${title} - Word Scramble`,
      words,
      showScore: scrambleShowScore ?? true,
    }),
    [scrambleTitle, scrambleShowScore, title, words],
  );

  const gameCards = useMemo<GameCard[]>(
    () => [
      {
        type: "flip",
        title: "Flip Card Game",
        description: "Lật thẻ và nghe từ vựng",
        icon: <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />,
        accentClass:
          "bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 border-sky-400 shadow-sky-400/50 text-white",
        iconWrapClass:
          "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-400/40 text-white",
        progressKey: "flip",
      },
      {
        type: "speak",
        title: "Pronunciation Game",
        description: "Phát âm từ vựng qua micro",
        icon: <Mic className="w-6 h-6 sm:w-7 sm:h-7" />,
        accentClass:
          "bg-gradient-to-br from-green-400 via-emerald-500 to-lime-500 border-emerald-400 shadow-emerald-400/50 text-white",
        iconWrapClass:
          "bg-gradient-to-br from-green-500 to-emerald-600 shadow-emerald-400/40 text-white",
        progressKey: "speak",
      },
      {
        type: "memory",
        title: "Memory Game",
        description: "Lật hình tìm cặp đôi giống nhau",
        icon: <Brain className="w-6 h-6 sm:w-7 sm:h-7" />,
        accentClass:
          "bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 border-rose-400 shadow-rose-400/50 text-white",
        iconWrapClass:
          "bg-gradient-to-br from-orange-400 to-rose-500 shadow-rose-400/40 text-white",
        progressKey: "memory",
      },
      {
        type: "ordering",
        title: "Word Ordering",
        description: "Ghép các từ thành câu hoàn chỉnh",
        icon: <ListOrdered className="w-6 h-6 sm:w-7 sm:h-7" />,
        accentClass:
          "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-amber-400 shadow-amber-400/50 text-white",
        iconWrapClass:
          "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-400/40 text-white",
        progressKey: "ordering",
      },
      {
        type: "scramble",
        title: "Word Scramble",
        description: "",
        icon: <Shuffle className="w-6 h-6 sm:w-7 sm:h-7" />,
        accentClass:
          "bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600 border-pink-400 shadow-pink-400/50 text-white",
        iconWrapClass:
          "bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-pink-400/40 text-white",
        progressKey: "scramble",
      },
    ],
    []
  );

  const visibleGameCards = useMemo(
    () => gameCards.filter((card) => gamesToShow.includes(card.type)),
    [gameCards, gamesToShow]
  );

  useEffect(() => {
    if (activeCardIndex >= visibleGameCards.length) {
      setActiveCardIndex(0);
    }
  }, [activeCardIndex, visibleGameCards.length]);

  const moveCard = useCallback(
    (direction: -1 | 1) => {
      if (!visibleGameCards.length) return;
      setActiveCardIndex((current) => {
        const next = (current + direction + visibleGameCards.length) % visibleGameCards.length;
        return next;
      });
    },
    [visibleGameCards.length]
  );

  const openGame = useCallback(
    (gameType: GameType) => {
      if (!gamesToShow.includes(gameType)) return;

      // Nếu có slug → điều hướng kèm part (nếu có) để đồng bộ với UnitGameScreen
      if (allowNavigation && slug) {
        const slugIndex = pathSegments.findIndex((seg) => seg === slug);
        if (slugIndex >= 0) {
          const base = "/" + pathSegments.slice(0, slugIndex).join("/");
          const partSegment = partId ? `/${partId}` : "";
          const targetUrl = `${base}/${slug}${partSegment}/${gameType}`;

          if (pathname !== targetUrl) {
            router.prefetch(targetUrl);
            startTransition(() => {
              setView(gameType);
              router.push(targetUrl);
            });
            return;
          }
        }
      }

      // Nếu không có slug hoặc không xác định được base, chỉ set view tại chỗ
      setView(gameType);
    },
    [
      allowNavigation,
      gamesToShow,
      partId,
      pathname,
      pathSegments,
      router,
      setView,
      slug,
      startTransition,
    ]
  );

  const selectCard = useCallback(
    (cardType: GameType, position: "left" | "center" | "right") => {
      if (position === "center") {
        openGame(cardType);
        return;
      }

      const targetIndex = visibleGameCards.findIndex((card) => card.type === cardType);
      if (targetIndex >= 0) {
        setActiveCardIndex(targetIndex);
      }
    },
    [openGame, visibleGameCards]
  );

  const stackedCards = useMemo(() => {
    const total = visibleGameCards.length;

    if (total === 0) return [];

    if (total === 1) {
      return [
        {
          card: visibleGameCards[0],
          position: "center" as const,
        },
      ];
    }

    const leftIndex = (activeCardIndex - 1 + total) % total;
    const rightIndex = (activeCardIndex + 1) % total;

    return [
      {
        card: visibleGameCards[leftIndex],
        position: "left" as const,
      },
      {
        card: visibleGameCards[activeCardIndex],
        position: "center" as const,
      },
      {
        card: visibleGameCards[rightIndex],
        position: "right" as const,
      },
    ];
  }, [activeCardIndex, visibleGameCards]);

  const renderStackedCard = useCallback(
    (slot: { card: GameCard; position: "left" | "center" | "right" }) => {
      const isCenter = slot.position === "center";
      const isLeft = slot.position === "left";
      const isRight = slot.position === "right";
      const score = scores[slot.card.progressKey] || 0;
      const progressDone = progress[slot.card.progressKey];

      const isSide = slot.position === "left" || slot.position === "right";
      const isDesktop = cardSize.width >= 408;
      const hideOnMobile = isSide && !isDesktop;

      const positionStyles =
        slot.position === "left"
          ? {
              left: "50%",
              top: "50%",
              transform: isDesktop
                ? "translate(-122%, -50%) scale(0.82) rotate(-6deg)"
                : "translate(-118%, -50%) scale(0.78) rotate(-6deg)",
              zIndex: 10,
              opacity: 0.72,
            }
          : slot.position === "right"
            ? {
                left: "50%",
                top: "50%",
                transform: isDesktop
                  ? "translate(22%, -50%) scale(0.82) rotate(6deg)"
                  : "translate(18%, -50%) scale(0.78) rotate(6deg)",
                zIndex: 10,
                opacity: 0.72,
              }
            : {
                left: "50%",
                top: "50%",
                transform: isDesktop
                  ? "translate(-50%, -50%) scale(1.01)"
                  : "translate(-50%, -50%) scale(1)",
                zIndex: 30,
                opacity: 1,
              };

      if (hideOnMobile) return null;

      const hasImageBg =
        slot.card.type === "scramble" ||
        slot.card.type === "speak" ||
        slot.card.type === "memory" ||
        slot.card.type === "ordering" ||
        slot.card.type === "flip";

      return (
        <button
          key={`${slot.position}-${slot.card.type}`}
          type="button"
          onClick={() => selectCard(slot.card.type, slot.position)}
          className={`group absolute overflow-hidden rounded-2xl md:rounded-[2rem] border bg-gradient-to-br text-center cursor-pointer transition-[transform,opacity,filter,box-shadow] duration-500 ease-out will-change-transform hover:scale-[1.02] ${
            slot.card.type === "flip"
              ? "bg-emerald-400 border-emerald-300"
              : slot.card.type === "scramble"
              ? "bg-[url('/assets/wordscramble.png')] bg-cover bg-center bg-no-repeat"
              : slot.card.type === "speak"
              ? "bg-[url('/assets/pronunciation.png')] bg-cover bg-center bg-no-repeat"
              : slot.card.type === "memory"
              ? "bg-[url('/assets/memory.png')] bg-cover bg-center bg-no-repeat"
              : slot.card.type === "ordering"
              ? "bg-[url('/assets/wordordering.png')] bg-cover bg-center bg-no-repeat"
              : slot.card.accentClass
          } ${
            isCenter
              ? "shadow-2xl ring-4 ring-white/70"
              : "shadow-xl hover:shadow-2xl"
          }`}
          style={{ width: cardSize.width, height: cardSize.height, ...positionStyles }}
        >
          {slot.card.type === "flip" && (
            <img
              src="/assets/flipcard.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}

          {progressDone && (
            <span className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200 shadow-xs animate-fadeIn">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{score > 0 ? `${score}đ` : "Xong"}</span>
            </span>
          )}

          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 sm:px-8 py-6 sm:py-8">
            {!hasImageBg ? (
              <>
                <div
                  className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${slot.card.iconWrapClass} ${
                    isCenter ? "w-16 h-16 sm:w-20 sm:h-20 mb-4" : "w-14 h-14 sm:w-16 sm:h-16 mb-3"
                  } shadow-md transition-transform duration-300 ${
                    isCenter ? "group-hover:scale-110" : "group-hover:scale-105"
                  }`}
                >
                  {slot.card.icon}
                </div>

                <div
                  className={`font-extrabold text-black transition-colors mb-1 ${
                    isCenter ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {slot.card.title}
                </div>

                <div
                  className={`font-medium text-black max-w-[90%] ${
                    isCenter ? "text-sm sm:text-base" : "text-[10px] sm:text-xs"
                  }`}
                >
                  {slot.card.description}
                </div>

                <div
                  className={`mt-4 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    isCenter
                      ? "border-black/15 text-black/80"
                      : "border-black/10 text-black/65"
                  }`}
                >
                  {isLeft ? "Preview" : isRight ? "Next" : "Play now"}
                </div>
              </>
            ) : null}
          </div>
        </button>
      );
    },
        [progress, scores, selectCard, cardSize]
  );

  if (currentView !== "menu") {
    return (
      <div className="w-full min-h-screen bg-transparent py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
        <div className="w-full text-black max-w-5xl mx-auto">
          {currentView === "flip" && (
            <FlipCardGame
              {...flipCardConfig}
              onComplete={(score) => onGameComplete?.("flip", score)}
              onChooseOtherGame={goToMenu}
            />
          )}
          {currentView === "speak" && (
            <PronunciationGame
              {...pronunciationConfig}
              onComplete={(score) => onGameComplete?.("speak", score)}
              onChooseOtherGame={goToMenu}
            />
          )}
          {currentView === "memory" && (
            <MemoryGame
              {...memoryConfig}
              onComplete={(score) => onGameComplete?.("memory", score)}
              onChooseOtherGame={goToMenu}
            />
          )}
          {currentView === "ordering" && (
            <WordOrderingGame
              {...orderingConfig}
              onComplete={(score) => onGameComplete?.("ordering", score)}
              onChooseOtherGame={goToMenu}
            />
          )}
          {currentView === "scramble" && (
            <WordScrambleGame
              {...scrambleConfig}
              onComplete={(score) => onGameComplete?.("scramble", score)}
              onChooseOtherGame={goToMenu}
            />
          )}
        </div>
      </div>
    );
  }

  const isDesktop = cardSize.width >= 408;
  const carouselHeight = isDesktop ? 580 : cardSize.height + 40;

  return (
    <div className="min-h-screen bg-transparent px-3 sm:px-4 py-6 md:py-10 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 md:mb-6">
          {description && (
            <p className="text-lg md:text-3xl text-black font-medium">
              {description}
            </p>
          )}
        </div>

        <div
          className={`relative mx-auto mt-2 md:mt-4 w-full max-w-6xl ${isDesktop ? "h-[460px] sm:h-[540px] md:h-[580px]" : ""}`}
          style={isDesktop ? undefined : { height: carouselHeight }}
        >
          {visibleGameCards.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveCard(-1)}
                className={`absolute -left-2 md:left-0 lg:left-2 top-1/2 -translate-y-1/2 z-40 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-105 ${menuUi.secondaryBtn || "border-white/40 bg-white/80 hover:bg-white"}`}
                aria-label="Qua card trước"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                type="button"
                onClick={() => moveCard(1)}
                className={`absolute -right-2 md:right-0 lg:right-2 top-1/2 -translate-y-1/2 z-40 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-105 ${menuUi.secondaryBtn || "border-white/40 bg-white/80 hover:bg-white"}`}
                aria-label="Qua card tiếp theo"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </>
          )}

          <div className="relative h-full w-full overflow-hidden">
            {stackedCards.length > 0 ? (
              stackedCards.map((slot) => renderStackedCard(slot))
            ) : (
              <div className="flex h-full items-center justify-center text-black/70 font-medium">
                Không có game khả dụng.
              </div>
            )}
          </div>
        </div>

        {visibleGameCards.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {visibleGameCards.map((card, index) => (
              <button
                key={card.type}
                type="button"
                onClick={() => setActiveCardIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeCardIndex
                    ? `w-8 ${menuUi.progressFill}`
                    : `${menuUi.progressTrack} w-2.5 hover:opacity-80`
                }`}
                aria-label={`Chọn ${card.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

