
import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle, Zap } from 'lucide-react';
import { Button } from './Button';
import { evaluateHandwrittenAnswer } from '../services/geminiService';
import { GradingResult } from '../types';

interface ScannerProps {
  vaultContext?: string;
}

export const Scanner: React.FC<ScannerProps> = ({ vaultContext = "" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please grant camera permissions to scan your answers.");
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  const handleEvaluate = async () => {
    if (!capturedImage) return;
    setLoading(true);
    try {
      const evalResult = await evaluateHandwrittenAnswer(capturedImage, vaultContext);
      setResult(evalResult);
    } catch (err) {
      console.error(err);
      alert("Error evaluating image. Please ensure your API key is correct.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    startCamera();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6 text-left">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Camera className="text-nirma-blue" />
          Scan-to-Score
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Snap a photo of your handwritten answer for instant grading using Nirma patterns.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
        {!capturedImage ? (
          <div className="relative aspect-[3/4] bg-black flex items-center justify-center">
            {isCameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                  <button 
                    onClick={capture}
                    className="w-16 h-16 rounded-full border-4 border-white bg-nirma-orange flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white/50" />
                  </button>
                </div>
              </>
            ) : (
              <Button onClick={startCamera}>Open Camera</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row min-h-[500px]">
            <div className="w-full md:w-1/2 p-4 border-r border-gray-100 dark:border-slate-800">
              <img src={capturedImage} alt="Captured" className="w-full rounded-lg shadow-sm" />
              {!result && (
                <div className="mt-4 flex gap-2">
                  <Button variant="accent" fullWidth onClick={handleEvaluate} isLoading={loading}>
                    <Zap className="w-4 h-4" /> Evaluate Answer
                  </Button>
                  <Button variant="ghost" onClick={reset}>Retake</Button>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 bg-gray-50 dark:bg-slate-800/50 overflow-y-auto max-h-[600px]">
              {result ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">The AI Evaluator</h2>
                    <div className="bg-nirma-orange text-white px-4 py-1 rounded-full text-lg font-bold shadow-sm">
                      Score: {result.score}/10
                    </div>
                  </div>

                  <section>
                    <h3 className="text-sm font-semibold text-nirma-blue dark:text-blue-400 uppercase tracking-wider mb-2 text-left">Transcription</h3>
                    <p className="text-gray-700 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 text-sm text-left">"{result.transcription}"</p>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-nirma-blue dark:text-blue-400 uppercase tracking-wider mb-2 text-left">The Gap Analysis</h3>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-nirma-orange p-3 rounded-r-lg text-left">
                      <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{result.gapAnalysis}</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-nirma-blue dark:text-blue-400 uppercase tracking-wider mb-2 text-left">Key Concepts Covered</h3>
                    <ul className="space-y-1 text-left">
                      {result.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-nirma-blue dark:text-blue-400 uppercase tracking-wider mb-2 text-left">Nirma Exam Tips</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 text-left">{result.tips}</p>
                  </section>

                  <Button variant="outline" fullWidth onClick={reset}>
                    <RefreshCw className="w-4 h-4" /> Start New Scan
                  </Button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-600">
                  <Zap className="w-12 h-12 mb-4 opacity-20" />
                  <p>Click "Evaluate Answer" to get your score based on vault context</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
