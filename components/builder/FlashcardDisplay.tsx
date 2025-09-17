
import React, { useState } from 'react';
import type { Flashcard as FlashcardType } from '../../types';

const FlippableFlashcard: React.FC<{ card: FlashcardType }> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-40 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            {/* Front */}
            <div className="absolute w-full h-full bg-gray-800 border border-gray-600 rounded-lg p-4 flex items-center justify-center text-center [backface-visibility:hidden]">
                <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Question</div>
                    <p className="font-semibold text-gray-200">{card.question}</p>
                </div>
            </div>
            {/* Back */}
            <div className="absolute w-full h-full bg-indigo-900/50 border border-indigo-700 rounded-lg p-4 flex items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div>
                    <div className="text-xs font-semibold text-indigo-300 mb-2 uppercase tracking-wider">Answer</div>
                    <p className="font-semibold text-indigo-200">{card.answer}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export const FlashcardDisplay: React.FC<{ cards: FlashcardType[], topic: string }> = ({ cards, topic }) => (
    <div className="bg-transparent">
        <h3 className="text-2xl font-bold mb-1 text-gray-200">Flashcards</h3>
        <p className="text-gray-400 mb-6">Topic: <span className="font-medium text-gray-300">{topic}</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <FlippableFlashcard key={index} card={card} />
            ))}
        </div>
    </div>
);