import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-zinc-900/90' : 'bg-white'} backdrop-blur-xl border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-2xl max-w-md w-full shadow-2xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
              <FiAlertTriangle className={type === 'danger' ? 'text-red-500' : 'text-yellow-500'} size={24} />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-2.5 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} border rounded-lg ${isDark ? 'text-white' : 'text-gray-900'} font-medium transition-all`}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-2.5 ${type === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'} text-white rounded-lg font-medium shadow-lg transition-all`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
