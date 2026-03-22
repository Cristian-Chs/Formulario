"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllResponses, getQuestions, addQuestion, updateQuestion, deleteQuestion } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "cristian.adrian.chirinos2@gmail.com"; 

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"respuestas" | "preguntas">("respuestas");
  const [responses, setResponses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Questions
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [qTitle, setQTitle] = useState("");
  const [qType, setQType] = useState<"text" | "multiple" | "scale">("text");
  const [qOptions, setQOptions] = useState("");
  const [qCorrectAnswer, setQCorrectAnswer] = useState("");
  const [qOrder, setQOrder] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resData, qData] = await Promise.all([
        getAllResponses(),
        getQuestions()
      ]);
      setResponses(resData);
      setQuestions(qData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingQuestion(null);
    setQTitle("");
    setQType("text");
    setQOptions("");
    setQCorrectAnswer("");
    setQOrder(questions.length + 1);
    setShowModal(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQTitle(q.title);
    setQType(q.type);
    setQOptions(q.options ? q.options.join(", ") : "");
    setQCorrectAnswer(q.correctAnswer || "");
    setQOrder(q.order);
    setShowModal(true);
  };

  const handleSaveQuestion = async () => {
    const data = {
      title: qTitle,
      type: qType,
      options: qType === "multiple" ? qOptions.split(",").map(s => s.trim()).filter(Boolean) : [],
      correctAnswer: qType === "scale" ? (qCorrectAnswer ? Number(qCorrectAnswer) : "") : qCorrectAnswer.trim(),
      order: Number(qOrder)
    };

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, data);
      } else {
        await addQuestion(data);
      }
      setShowModal(false);
      fetchAllData();
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar pregunta?")) {
      await deleteQuestion(id);
      fetchAllData();
    }
  };

  // Helper para verificar si la respuesta es correcta
  const isCorrect = (question: any, answer: any) => {
    if (!question.correctAnswer) return null; // No hay respuesta correcta definida
    // Convert to string for safe comparison (text vs number matching)
    return String(question.correctAnswer).toLowerCase() === String(answer).toLowerCase();
  };

  if (authLoading) return <div className="p-10 text-white flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div></div>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-red-500 uppercase italic">Acceso Denegado</h1>
          <p className="text-gray-400">No tienes permisos para ver esta página.</p>
          <a href="/" className="inline-block mt-4 text-brand-primary font-bold underline">Volver al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">Panel de <span className="text-brand-primary">Control</span></h1>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
              Administración del {activeTab === "respuestas" ? "Cuestionario" : "Gestor de Preguntas"}
            </p>
          </div>
          <button 
            onClick={fetchAllData} 
            className="px-6 py-3 bg-brand-primary text-white hover:scale-105 active:scale-95 rounded-xl text-sm font-black transition-all shadow-glow"
          >
            ACTUALIZAR DATOS
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab("respuestas")}
            className={`px-6 py-3 font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === "respuestas" 
              ? "text-brand-primary border-b-2 border-brand-primary" 
              : "text-gray-500 hover:text-white"
            }`}
          >
            Respuestas ({responses.length})
          </button>
          <button 
            onClick={() => setActiveTab("preguntas")}
            className={`px-6 py-3 font-black text-sm uppercase tracking-widest transition-all ${
              activeTab === "preguntas" 
              ? "text-brand-primary border-b-2 border-brand-primary" 
              : "text-gray-500 hover:text-white"
            }`}
          >
            Preguntas ({questions.length})
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1,2,3].map(n => <div key={n} className="h-40 bg-surface-800 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* RESPUESTAS TAB */}
            {activeTab === "respuestas" && (
              <motion.div 
                key="respuestas"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid gap-6"
              >
                {responses.map((res) => {
                  // Calcular nota si hay preguntas con correctAnswers (opcional)
                  let score = 0;
                  let totalEvaluable = 0;
                  questions.forEach(q => {
                    if (q.correctAnswer) {
                      totalEvaluable++;
                      if (isCorrect(q, res.responses[q.id])) score++;
                    }
                  });

                  return (
                    <div key={res.id} className="bg-surface-800 border border-white/5 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-white/5 gap-4">
                        <div className="flex items-center gap-4">
                          <img src={res.userProfile?.photo} className="w-12 h-12 rounded-full border-2 border-brand-primary" alt="" />
                          <div>
                            <h3 className="font-black text-lg leading-tight uppercase italic">{res.userProfile?.name}</h3>
                            <p className="text-xs text-brand-primary font-bold">{res.userProfile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {totalEvaluable > 0 && (
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Puntuación</p>
                              <p className={`text-xl font-black ${score === totalEvaluable ? 'text-green-500' : 'text-brand-primary'}`}>
                                {score}/{totalEvaluable}
                              </p>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Fecha</p>
                            <p className="text-xs font-bold text-gray-300">
                              {res.createdAt?.toDate ? res.createdAt.toDate().toLocaleString() : "Reciente"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {questions.map((q) => {
                          const answer = res.responses[q.id];
                          if (answer === undefined) return null;
                          
                          const correct = isCorrect(q, answer);
                          
                          return (
                            <div key={q.id} className={`p-4 rounded-2xl border ${
                                correct === true ? 'bg-green-500/10 border-green-500/20' : 
                                correct === false ? 'bg-red-500/10 border-red-500/20' : 
                                'bg-surface-700/50 border-white/5'
                              }`}>
                              <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider mb-2 leading-tight flex justify-between">
                                {q.title}
                                {correct === true && <span className="text-green-500 ml-2">✓</span>}
                                {correct === false && <span className="text-red-500 ml-2">✗</span>}
                              </p>
                              <p className="text-sm font-bold text-white mb-2">{answer}</p>
                              
                              {correct === false && q.correctAnswer && (
                                <p className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded inline-block">
                                  Respuesta esperada: {q.correctAnswer}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {responses.length === 0 && <p className="text-center text-gray-500 p-10 font-bold uppercase tracking-widest">No hay respuestas aún.</p>}
              </motion.div>
            )}

            {/* PREGUNTAS TAB */}
            {activeTab === "preguntas" && (
              <motion.div 
                key="preguntas"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-end">
                  <button 
                    onClick={openNewModal}
                    className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    + Nueva Pregunta
                  </button>
                </div>

                <div className="grid gap-4">
                  {questions.map((q) => (
                    <div key={q.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-surface-800 p-6 rounded-2xl border border-white/5 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center font-black text-brand-primary text-xs">
                            {q.order}
                          </span>
                          <h3 className="font-black text-lg text-white">{q.title}</h3>
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                            Tipo: {q.type}
                          </span>
                          {q.type === "multiple" && (
                            <span className="px-3 py-1 rounded-full bg-surface-700 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                              {q.options?.length} Opciones
                            </span>
                          )}
                          {q.correctAnswer && (
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
                              Respuesta Correta: {q.correctAnswer}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(q)} className="px-4 py-2 bg-surface-700 text-white font-bold text-xs rounded-lg hover:bg-surface-600">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="px-4 py-2 bg-red-500/10 text-red-500 font-bold text-xs rounded-lg border border-red-500/20 hover:bg-red-500/20">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && <p className="text-center text-gray-500 p-10 font-bold uppercase tracking-widest">No hay preguntas creadas.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal / Formulario de Preguntas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-800 w-full max-w-lg rounded-3xl p-8 border border-white/10 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black italic uppercase text-slate-800">
              {editingQuestion ? "Editar Pregunta" : "Nueva Pregunta"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Título de la Pregunta</label>
                <input type="text" value={qTitle} onChange={(e) => setQTitle(e.target.value)} className="w-full bg-surface-700 p-4 rounded-xl border border-slate-300 text-slate-800 outline-none focus:border-brand-primary placeholder:text-slate-400" placeholder="Pregunta" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tipo de Respuesta</label>
                  <select value={qType} onChange={(e) => setQType(e.target.value as any)} className="w-full bg-surface-700 p-4 rounded-xl border border-slate-300 text-slate-800 outline-none focus:border-brand-primary appearance-none">
                    <option value="text">Texto Libre</option>
                    <option value="multiple">Selección Múltiple</option>
                    <option value="scale">Escala del 1 al 10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Orden de Aparición</label>
                  <input type="number" value={qOrder} onChange={(e) => setQOrder(Number(e.target.value))} className="w-full bg-surface-700 p-4 rounded-xl border border-slate-300 text-slate-800 outline-none focus:border-brand-primary" />
                </div>
              </div>

              {qType === "multiple" && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Opciones <span className="lowercase font-normal tracking-normal text-slate-400">(separadas por comas)</span></label>
                  <input type="text" value={qOptions} onChange={(e) => setQOptions(e.target.value)} className="w-full bg-surface-700 p-4 rounded-xl border border-slate-300 text-slate-800 outline-none focus:border-brand-primary placeholder:text-slate-400" placeholder="Pregunta Multiple " />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Respuesta Correcta <span className="lowercase font-normal tracking-normal text-brand-primary">(Opcional)</span></label>
                <input 
                  type={qType === "scale" ? "number" : "text"}
                  min={qType === "scale" ? "1" : undefined}
                  max={qType === "scale" ? "10" : undefined}
                  value={qCorrectAnswer} 
                  onChange={(e) => setQCorrectAnswer(e.target.value)} 
                  className="w-full bg-surface-700 p-4 rounded-xl border border-slate-300 text-slate-800 outline-none focus:border-brand-primary placeholder:text-slate-400" 
                  placeholder={qType === "multiple" ? "Debe coincidir EXACTAMENTE con una opción" : qType === "scale" ? "Número del 1 al 10" : ""} 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-600 bg-slate-200 rounded-2xl hover:bg-slate-300 transition-colors uppercase text-xs tracking-widest">
                Cancelar
              </button>
              <button disabled={!qTitle} onClick={handleSaveQuestion} className="flex-1 py-4 font-black text-white bg-brand-primary rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 shadow-glow uppercase text-xs tracking-widest">
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
