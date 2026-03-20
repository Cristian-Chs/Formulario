"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { saveSurveyResponse, getQuestions, hasUserCompletedSurvey } from "@/lib/db";

interface Question {
  id: string; // ID de Firestore
  title: string;
  type: "text" | "multiple" | "scale";
  options?: string[];
  correctAnswer?: string | number;
  order: number;
}

export default function Survey() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  
  // Quiz State
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (user) {
      checkCompletion();
    }
  }, [user]);

  const checkCompletion = async () => {
    if (!user) return;
    try {
      const completed = await hasUserCompletedSurvey(user.uid);
      if (completed) {
        setAlreadyCompleted(true);
        setFetchingQuestions(false);
      } else {
        await fetchQuestions();
      }
    } catch (error) {
      console.error(error);
      await fetchQuestions(); // Fallback
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const currentQuestion = questions[step];
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      
      // Calculate Score
      let correctCount = 0;
      let evaluableCount = 0;
      
      questions.forEach((q) => {
        if (q.correctAnswer) {
          evaluableCount++;
          if (String(answers[q.id]).toLowerCase() === String(q.correctAnswer).toLowerCase()) {
            correctCount++;
          }
        }
      });
      
      setScore({ correct: correctCount, total: evaluableCount });

      try {
        if (user) {
          // Save score alongside respuestas
          await saveSurveyResponse(user.uid, user, answers);
        }
        setIsFinished(true);
        if (!(evaluableCount > 0 && correctCount / evaluableCount < 0.5)) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#0ea5e9", "#38bdf8", "#ffffff"]
          });
        }
      } catch (error) {
        alert("Error al guardar respuestas");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const setAnswer = (val: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: val });
  };

  if (fetchingQuestions) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="p-12 text-center bg-surface-800 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
          <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-black italic uppercase text-slate-800">Ya has participado</h2>
        <p className="text-slate-500 font-bold text-sm">
          Muchas gracias por tu tiempo, pero solo se permite realizar este análisis médico una vez por usuario.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center bg-surface-800 rounded-3xl border border-white/5">
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No hay preguntas disponibles.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-12 text-center bg-surface-800 rounded-3xl border border-white/5 shadow-2xl space-y-6"
      >
        <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-primary/30">
          <svg className="w-12 h-12 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-4xl font-black italic uppercase text-slate-800 tracking-tighter">
          {score.total > 0 && score.correct / score.total < 0.5 ? "Lo siento, pero buen intento" : "¡Completado!"}
        </h2>
        <p className="text-slate-500 font-bold">
          {score.total > 0 && score.correct / score.total < 0.5 ? "Revisa bien la información e inténtalo nuevamente." : "Tus respuestas han sido guardadas con éxito."}
        </p>
        
        {score.total > 0 && (
          <div className="p-6 bg-surface-700/50 rounded-2xl border border-white/5 mt-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Puntuación Final</p>
            <p className="text-5xl font-black text-brand-primary shadow-glow p-4">{score.correct} <span className="text-2xl text-gray-500">/ {score.total}</span></p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-surface-800 border border-white/5 p-8 shadow-2xl relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1.5 w-full bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-brand-primary shadow-glow shadow-brand-primary/50"
        />
      </div>

      <div className="mb-10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
        <span>Pregunta {step + 1} de {questions.length}</span>
        <span className="text-brand-primary">{Math.round(progress)}%</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[250px]"
        >
          <h2 className="text-3xl font-black text-slate-800 italic uppercase leading-tight">{currentQuestion.title}</h2>
          
          <div className="mt-10">
            {currentQuestion.type === "text" && (
              <input 
                type="text" 
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-surface-700 border border-slate-300 rounded-2xl p-4 text-slate-800 focus:border-brand-primary outline-none transition-colors"
              />
            )}

            {currentQuestion.type === "multiple" && (
              <div className="grid gap-3">
                {currentQuestion.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(opt)}
                    className={`p-4 rounded-2xl border text-left font-bold transition-all ${
                      answers[currentQuestion.id] === opt 
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary" 
                      : "border-slate-300 bg-surface-700 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "scale" && (
              <div className="flex justify-between gap-2 flex-wrap sm:flex-nowrap">
                {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setAnswer(num)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
                      answers[currentQuestion.id] === num 
                      ? "bg-brand-primary text-white shadow-glow" 
                      : "bg-surface-700 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
        <button 
          onClick={handleBack}
          disabled={step === 0}
          className="px-6 py-3 rounded-xl bg-surface-700 text-slate-600 font-bold disabled:opacity-30 hover:text-slate-900 transition-colors"
        >
          ATRÁS
        </button>
        <button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || loading}
          className="flex-1 py-3 bg-brand-primary text-white font-black rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
        >
          {loading ? "GUARDANDO..." : step === questions.length - 1 ? "FINALIZAR" : "SIGUIENTE"}
        </button>
      </div>
    </div>
  );
}
