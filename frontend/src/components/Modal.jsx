import { FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function Modal({ isOpen, onClose, title, children }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`${isDark ? 'bg-zinc-900/90' : 'bg-white'} backdrop-blur-xl border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
