import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";

const SPRING = { type: "spring", bounce: 0, duration: 0.4 };

// Where a flick would come to rest, using scroll-style exponential decay.
const project = (velocity, rate = 0.998) =>
  ((velocity / 1000) * rate) / (1 - rate);

function useIsPhone() {
  const query = "(max-width: 639px)";
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return match;
}

// A modal surface: a bottom sheet you can drag or flick away on phones,
// a centered dialog on larger screens. Leaves the way it came in.
function Sheet({ open, onClose, title, children }) {
  const isPhone = useIsPhone();
  const dragControls = useDragControls();
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, onClose]);

  const hidden = isPhone ? { y: "100%" } : { opacity: 0, scale: 0.96 };
  const shown = isPhone ? { y: 0 } : { opacity: 1, scale: 1 };

  // Rendered at the body so it always sits above the page and the nav.
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="sheet-layer">
          <motion.div
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={SPRING}
            drag={isPhone ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            // Follows the finger 1:1 downward, rubber-bands upward.
            dragElastic={{ top: 0.08, bottom: 1 }}
            onDragEnd={(_, info) => {
              const height = sheetRef.current?.offsetHeight ?? 400;
              // Decide from where the gesture is heading, not where it stopped.
              if (info.offset.y + project(info.velocity.y) > height / 2) onClose();
            }}
          >
            <div
              className="sheet-header"
              onPointerDown={(e) => isPhone && dragControls.start(e)}
            >
              <div className="sheet-grabber" aria-hidden="true" />
              <h2>{title}</h2>
              <button
                type="button"
                className="icon-btn sheet-close"
                aria-label="Close"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    d="M5 5l14 14M19 5L5 19"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="sheet-body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default Sheet;
