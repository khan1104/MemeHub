import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  X,
  Circle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { usePost } from "@/hooks/post";
import { useUsers } from "@/hooks/user";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetType: string;
  id: string;
};

const ReportModal = ({ isOpen, onClose, targetType, id }: ReportModalProps) => {
  const {
    report: postReport,
    error: postError,
    loading: postLoading,
  } = usePost();
  const { ReportUser, error: userError, loading: userLoading } = useUsers();

  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  // Hook errors ko merge kar lete hain
  const apiError = postError || userError;
  const isLoading = postLoading || userLoading;

  const resetState = () => {
    setStep(1);
    setSelectedReason("");
    setDescription("");
  };

  useEffect(() => {
    if (isOpen) {
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
    "Legal issue",
  ];

  const handleNext = () => setStep(2);
  const handleBack = () => {
    if (step === 3) setStep(2);
    else setStep(1);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (targetType === "Post") {
      await postReport(id, selectedReason, description);
    } else {
      await ReportUser(id, selectedReason, description);
    }
    // API call ke baad humesha Step 3 par bhejo
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[400px] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="flex items-center">
            {(step === 2 || (step === 3 && apiError)) && (
              <button
                onClick={handleBack}
                className="p-1 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-lg font-medium ml-1">
              {step === 3
                ? apiError
                  ? "Error"
                  : "Report Sent"
                : `${targetType} Report`}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto min-h-[300px] flex flex-col">
          {step === 1 && (
            <>
              <h3 className="text-xl font-bold mb-2">What's going on?</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                We'll check for all Community Guidelines, so don't worry about
                making the perfect choice.
              </p>
              <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    {selectedReason === reason ? (
                      <CheckCircle2 size={22} className="text-blue-500" />
                    ) : (
                      <Circle
                        size={22}
                        className="text-gray-500 group-hover:text-gray-300"
                      />
                    )}
                    <span className="text-[15px] font-normal">{reason}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-xl font-bold mb-2">Want to tell us more?</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Sharing a few details can help us understand the issue.
              </p>
              <textarea
                autoFocus
                placeholder="Add details..."
                className="w-full bg-transparent border border-gray-200 rounded-lg p-3 min-h-[180px] text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(114,64,232,0.2)] transition-colors resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}

          {/* ✅ Step 3: SUCCESS OR ERROR SCREEN */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center animate-in zoom-in-95">
              {apiError ? (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-4">
                    <AlertCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-red-600">
                    Submission Failed
                  </h3>
                  <p className="text-sm text-gray-500 px-4 mb-4">{apiError}</p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Thanks for reporting
                  </h3>
                  <p className="text-sm text-gray-400 px-4">
                    Your report helps us keep the community safe.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-5 flex justify-center border-t border-gray-50 mt-auto">
          {step === 1 && (
            <button
              disabled={!selectedReason}
              onClick={handleNext}
              className={`w-full py-2.5 rounded-full font-bold text-sm transition-all ${
                selectedReason
                  ? "bg-primary text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Reporting..." : "Report"}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleClose}
              className={`w-full py-2.5 rounded-full font-bold text-sm transition-colors text-white ${
                apiError
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-900 hover:bg-black"
              }`}
            >
              {apiError ? "Ok" : "Done"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
