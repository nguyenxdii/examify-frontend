import React from "react";
import logo from "../../assets/synde_logo.svg";

export default function ExamPrintTemplate({ exam, questions, options }) {
  // Generate a random 3-digit code for the exam
  const randomCode = Math.floor(100 + Math.random() * 900);

  return (
    <div id="exam-print-template" className="hidden print:block print-container p-8 font-serif text-black bg-white min-h-screen">
      {/* Header Layout */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        {/* Left Column */}
        <div className="w-1/2 space-y-3">
          <div className="text-sm">
            <span className="font-bold">Họ và tên thí sinh:</span> ............................................................................
          </div>
          <div className="text-sm">
            <span className="font-bold">Mã số sinh viên/Học sinh:</span> ............................................................
          </div>
          <div className="text-sm">
            <span className="font-bold">Lớp / Phòng thi:</span> ............................................................................
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col items-end space-y-2">
          <div className="text-sm">
            <span className="font-bold uppercase">Môn thi:</span> {exam.subject || "........................"}
          </div>
          <div className="text-sm">
            <span className="font-bold uppercase">Thời gian làm bài:</span> {exam.duration || "..."} phút
          </div>
          <div className="mt-2 border-2 border-black px-4 py-2 font-black text-xl">
            MÃ ĐỀ: {randomCode}
          </div>
        </div>
      </div>

      {/* Exam Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight">{exam.title}</h1>
        {exam.description && options.showNote && (
          <p className="text-sm italic mt-2">({exam.description})</p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id || idx} className="question-block break-inside-avoid">
            <div className="flex gap-2 mb-2">
              <span className="font-bold">Câu {idx + 1}:</span>
              <div className="flex-1 font-medium leading-relaxed">{q.content}</div>
            </div>

            {/* Choices */}
            {Array.isArray(q.choices) && q.choices.length > 0 && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-8">
                {q.choices.map((choice, cIdx) => {
                  const isCorrect = !options.hideAnswers && q.correctAnswers?.includes(choice.key);
                  return (
                    <div key={cIdx} className="flex items-start gap-2 text-sm">
                      <span className={`font-bold ${isCorrect ? 'underline decoration-2' : ''}`}>{choice.key}.</span>
                      <span className={isCorrect ? 'font-bold' : ''}>{choice.content}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Essay Area */}
            {q.type === "essay" && (
              <div className="mt-4 ml-8 space-y-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-b border-dotted border-gray-400 h-1"></div>
                ))}
              </div>
            )}

            {/* Explanation */}
            {options.showExplanations && q.explanation && (
              <div className="mt-3 ml-8 p-3 bg-gray-100 rounded text-xs italic border-l-4 border-gray-300">
                <span className="font-bold not-italic">Hướng dẫn:</span> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center opacity-70 italic text-[10px]">
        <div>
          {options.showBranding ? (
            <span>Chúc các bạn làm bài thi thật tốt! — SynDe Examify</span>
          ) : (
            <span>Hệ thống thi cử trực tuyến SynDe</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span>Created by SynDe</span>
          <img src={logo} alt="Logo" className="h-4 w-auto grayscale" />
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #exam-print-template, #exam-print-template * {
            visibility: visible;
          }
          #exam-print-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          .question-block {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}} />
    </div>
  );
}
