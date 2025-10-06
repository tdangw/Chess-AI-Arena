import React from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 font-sans">
      <div className="bg-[#1E293B] w-full max-w-xs rounded-2xl p-6 text-white border-2 border-gray-700 shadow-lg text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-2 text-yellow-400">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="w-full bg-slate-600 text-white py-2 rounded-lg font-bold text-base hover:bg-slate-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold text-base hover:bg-red-500 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
