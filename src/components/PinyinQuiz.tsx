import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw, Volume2, Sparkles, Award } from 'lucide-react';
import { SAMPLE_QUIZZES } from '../data/pinyinVocabData';
import { QuizQuestion } from '../types';
import { speakText } from '../utils/pinyinUtils';

interface PinyinQuizProps {
  speechRate: number;
}

export const PinyinQuiz: React.FC<PinyinQuizProps> = ({ speechRate }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZZES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);

      if (newStreak % 3 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Quiz Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>拼音知识闯关测试</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                读音与法则
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              通过多音字辨析、声调判断和拼音规则测试巩固学习成果。
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center space-x-3">
            <div className="text-center px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">得分</span>
              <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{score}</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">连胜</span>
              <span className="text-lg font-extrabold text-purple-700 dark:text-purple-300">🔥 {streak}</span>
            </div>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>题目 {currentIndex + 1} / {questions.length}</span>
            <span>{currentQ.type === 'polyphonic-context' ? '语境多音字' : '声韵母辨析'}</span>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h2>

            {currentQ.targetChar && (
              <div className="flex items-center space-x-3 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                <span className="text-4xl font-serif font-extrabold text-purple-700 dark:text-purple-300">
                  {currentQ.targetChar}
                </span>
                <button
                  onClick={() => speakText(currentQ.targetChar!, speechRate)}
                  className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctAnswer;

              let btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-purple-50 hover:border-purple-300';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>答案解析：</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div className="pt-2 text-right">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-2xs"
                >
                  {currentIndex + 1 < questions.length ? '下一题 →' : '查看最终成绩'}
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Quiz Finished Screen */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xs text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              恭喜完成拼音测试关卡！
            </h2>
            <p className="text-sm text-slate-500">
              您在此轮测试中答对了 <strong className="text-purple-600 text-lg">{score}</strong> / {questions.length} 题！
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleRestartQuiz}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新开始挑战</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
