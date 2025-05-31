import { motion } from "framer-motion";
import { useState } from "react";

export default function Flashcard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
    >
      <motion.div
        className={`absolute w-full h-full rounded-xl shadow-md p-6 bg-white text-gray-800 text-xl font-semibold transition-transform duration-700 transform ${isFlipped ? "rotate-y-180" : ""}`}
      >
        <div className={`absolute w-full h-full backface-hidden ${isFlipped ? "hidden" : "block"}`}>
          {card.question}
        </div>
        <div className={`absolute w-full h-full rotate-y-180 backface-hidden ${isFlipped ? "block" : "hidden"}`}>
          {card.answer}
        </div>
      </motion.div>
    </div>
  );
}