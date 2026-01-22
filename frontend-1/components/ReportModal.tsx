import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Circle, CheckCircle2 } from 'lucide-react';


type ReportModalProps = {
  isOpen: boolean
  onClose: () => void
  targetType:string
}


const ReportModal = ({ isOpen, onClose, targetType }:ReportModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  // ✅ RESET FUNCTION
  const resetState = async() => {
    setStep(1);
    setSelectedReason('');
    setDescription('');
  };

  // ✅ reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reasons = [
    "Sexual content",
    "Violent or repulsive content",
    "Hateful or abusive content",
    "Harassment or bullying",
    "Harmful or dangerous acts",
    "Spam or misleading",
    "Legal issue"
  ];

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = () => {
    console.log({ targetType, selectedReason, description });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      {/* 🔥 ONLY HEIGHT ADDED */}
      <div className="bg-white w-full max-w-[400px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {step === 2 ? (
              <button
                onClick={handleBack}
                className="p-1 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : null}

            <h2 className="text-lg font-medium">{targetType} Report</h2>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">

          {step === 1 ? (
            <>
              <h3 className="text-xl font-bold mb-2">
                What's going on?
              </h3>

              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                We'll check for all Community Guidelines, so don't worry about making the perfect choice.
              </p>

              {/* ✅ SCROLL ADDED ONLY HERE */}
              <div className="space-y-1 max-h-[260px] overflow-y-auto hover-scrollbar">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    {selectedReason === reason ? (
                      <CheckCircle2 size={22} className="text-blue-500" />
                    ) : (
                      <Circle
                        size={22}
                        className="text-gray-500 group-hover:text-gray-300"
                      />
                    )}

                    <span className="text-[15px] font-normal">
                      {reason}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">
                Want to tell us more? It's optional
              </h3>

              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Sharing a few details can help us understand the issue. Please don't include personal info.
              </p>

              <textarea
                autoFocus
                placeholder="Add details..."
                className="w-full bg-transparent border border-white/20 rounded-lg p-3 min-h-[180px] text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)] transition-colors"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}

        </div>

        {/* Action Button */}
        <div className="p-5 flex justify-center">
          {step === 1 ? (
            <button
              disabled={!selectedReason}
              onClick={handleNext}
              className={`w-full py-2.5 rounded-full font-bold text-sm transition-all ${
                selectedReason
                  ? "bg-primary text-white hover:bg-purple-700"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors"
            >
              Report
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReportModal;
