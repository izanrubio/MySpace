import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={48} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={48} />;
      default:
        return <FiAlertCircle className="text-blue-500" size={48} />;
    }
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
            {getIcon()}
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
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
