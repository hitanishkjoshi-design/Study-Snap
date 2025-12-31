
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, Star, HelpCircle, Filter, ChevronDown, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { getModelSolutions } from '../services/geminiService';

interface QuestionBankProps {
  availableSubjects: string[];
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ availableSubjects }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [solution, setSolution] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);

  const questions = [
    { text: "Explain the ACID properties of database transactions with examples.", subject: "DBMS", marks: 10 },
    { text: "Compare and contrast Link State vs Distance Vector Routing protocols.", subject: "Computer Networks", marks: 10 },
    { text: "Explain the concept of Virtual Memory and Demand Paging.", subject: "Operating Systems", marks: 15 },
    { text: "Discuss the Software Development Life Cycle (SDLC) models.", subject: "Software Engineering", marks: 10 },
    { text: "Differentiate between Prim's and Kruskal's Algorithm for MST.", subject: "ADS", marks: 10 },
    { text: "Evaluate the line integral of F around the given curve C.", subject: "Maths II", marks: 15 },
    { text: "Explain Time Complexity and Space Complexity with examples.", subject: "ADS", marks: 10 },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredQuestions = useMemo(() => {
    if (selectedSubject === 'All') return questions;
    return questions.filter(q => q.subject === selectedSubject);
  }, [selectedSubject]);

  const handleFetchSolution = async (q: string) => {
    setSelectedQuestion(q);
    setLoading(true);
    setSolution(null);
    try {
      const sol = await getModelSolutions(q);
      setSolution(sol);
      // Smooth scroll to solution on mobile
      setTimeout(() => {
        solutionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = ['All', ...availableSubjects];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-left">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-nirma-blue" />
            Important Questions Repository
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Curated high-probability questions and model solutions.</p>
        </div>

        {/* Custom Modern Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between min-w-[180px] px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:border-nirma-blue dark:hover:border-nirma-blue transition-all group"
          >
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${isDropdownOpen ? 'text-nirma-blue' : 'text-gray-400'}`} />
              <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{selectedSubject}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full min-w-[200px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {subjectOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedSubject(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                    selectedSubject === option 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-nirma-blue font-bold' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {option}
                  {selectedSubject === option && <Check size={14} />}
                </button>
              ))}
              {availableSubjects.length === 0 && selectedSubject === 'All' && (
                <div className="px-4 py-2 text-[10px] text-gray-400 uppercase font-bold tracking-tight border-t border-gray-50 dark:border-slate-700 mt-1 pt-3">
                  Upload docs to unlock subjects
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">
            {selectedSubject === 'All' ? 'Trending Questions' : `${selectedSubject} Questions`}
          </h2>
          <div className="space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, i) => (
                <div 
                  key={i} 
                  onClick={() => handleFetchSolution(q.text)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedQuestion === q.text 
                    ? 'border-nirma-blue bg-blue-50 dark:bg-blue-900/30 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50' 
                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-nirma-blue dark:hover:border-nirma-blue hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-nirma-orange bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-lg uppercase tracking-tight">
                      {q.subject}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{q.marks} Marks</span>
                  </div>
                  <p className="text-gray-800 dark:text-slate-200 font-semibold leading-relaxed">{q.text}</p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                <HelpCircle className="w-10 h-10 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">No questions found for this subject in the repository.</p>
              </div>
            )}
          </div>
        </div>

        <div ref={solutionRef} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 p-8 min-h-[500px] lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-nirma-blue border-t-transparent"></div>
                {/* Fixed: Added missing Sparkles icon import from lucide-react */}
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-nirma-orange animate-pulse" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">Analyzing Syllabus Patterns...</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Generating a perfect-score solution via Gemini 3 Pro</p>
              </div>
            </div>
          ) : solution ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 pb-6 border-b border-gray-50 dark:border-slate-800">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
                  <Star className="text-nirma-orange w-6 h-6 fill-nirma-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-xl dark:text-white leading-tight">Model Solution</h3>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Nirma Standard Evaluated</p>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-nirma-blue"></div>
                    <h4 className="text-xs font-bold text-nirma-blue dark:text-blue-400 uppercase tracking-widest">Introduction</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-50 dark:border-blue-900/20">{solution.intro}</p>
                </section>
                
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-nirma-blue"></div>
                    <h4 className="text-xs font-bold text-nirma-blue dark:text-blue-400 uppercase tracking-widest">Master Solution Body</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed px-2">{solution.body}</p>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-nirma-blue"></div>
                    <h4 className="text-xs font-bold text-nirma-blue dark:text-blue-400 uppercase tracking-widest">Conclusion</h4>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed italic border-l-4 border-gray-100 dark:border-slate-800 pl-4 py-1">{solution.conclusion}</p>
                </section>

                <section className="pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">High-Impact Tech Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {solution.keywords.map((kw: string, i: number) => (
                      <span key={i} className="bg-white dark:bg-slate-800 text-nirma-blue dark:text-blue-300 px-4 py-1.5 rounded-xl text-xs font-bold border border-gray-100 dark:border-slate-700 shadow-sm hover:scale-105 transition-transform cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-600">
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-full mb-6">
                <HelpCircle className="w-12 h-12 opacity-30" />
              </div>
              <h4 className="text-lg font-bold text-gray-700 dark:text-slate-300 mb-2">Ready to Study?</h4>
              <p className="max-w-[240px] text-sm text-gray-500 dark:text-slate-500 leading-relaxed">Select any high-probability question on the left to see the AI-generated model solution.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
