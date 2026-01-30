import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiTrash2, FiFolder } from 'react-icons/fi';
import { notifications as notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AlertModal from './AlertModal';

export default function NotificationBell() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const response = await notificationsAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationsAPI.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDropdown = () => {
        if (!showDropdown) {
            loadNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleAccept = async (notification) => {
        try {
            await notificationsAPI.accept(notification.id);
            loadNotifications();
            loadUnreadCount();
            // Navigate to the project
            if (notification.data?.projectId) {
                navigate(`/projects/${notification.data.projectId}`);
                setShowDropdown(false);
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setAlertModal({ 
                isOpen: true, 
                title: 'Error', 
                message: error.response?.data?.error || 'Error al aceptar la invitación', 
                type: 'error' 
            });
        }
    };

    const handleReject = async (notification) => {
        try {
            await notificationsAPI.reject(notification.id);
            loadNotifications();
            loadUnreadCount();
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        }
    };

    const handleMarkAsRead = async (notification) => {
        try {
            await notificationsAPI.markAsRead(notification.id);
            loadNotifications();
            loadUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (notification) => {
        try {
            await notificationsAPI.delete(notification.id);
            loadNotifications();
            loadUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            loadNotifications();
            loadUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggleDropdown}
                className={`relative p-3 rounded-xl ${isDark
                        ? 'bg-white/5 hover:bg-white/10 border-white/10'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                    } border transition-all`}
                title="Notificaciones"
            >
                <FiBell className={isDark ? 'text-gray-300' : 'text-gray-700'} size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    className={`absolute right-0 mt-3 w-[420px] ${isDark ? 'bg-zinc-900' : 'bg-white'
                        } border ${isDark ? 'border-zinc-800' : 'border-gray-200'
                        } rounded-2xl shadow-2xl z-50 max-h-[600px] flex flex-col overflow-hidden`}
                >
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Notificaciones
                                </h3>
                                {unreadCount > 0 && (
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                                        {unreadCount} sin leer
                                    </p>
                                )}
                            </div>
                            {notifications.some((n) => !n.read) && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg ${isDark
                                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                                            : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                        } transition-all`}
                                >
                                    Marcar todas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className={`p-4 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-100'} mb-4`}>
                                    <FiBell className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={32} />
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No tienes notificaciones
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                                    Te avisaremos cuando tengas algo nuevo
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'} last:border-b-0 ${!notification.read
                                            ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50/50')
                                            : ''
                                        } ${isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-50'} transition-all`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                                            <FiFolder className="text-white" size={18} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                                                        {notification.message}
                                                    </p>
                                                    {notification.project && (
                                                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                                                            }`}>
                                                            <FiFolder className={isDark ? 'text-blue-400' : 'text-blue-600'} size={12} />
                                                            <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                                {notification.project.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 shadow-lg shadow-blue-500/50"></div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {notification.type === 'project_invite' && !notification.read && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAccept(notification)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow"
                                                            >
                                                                <FiCheck size={14} />
                                                                Aceptar
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(notification)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 ${isDark
                                                                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                                                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                                                                    } text-xs font-medium rounded-lg transition-all`}
                                                            >
                                                                <FiX size={14} />
                                                                Rechazar
                                                            </button>
                                                        </>
                                                    )}
                                                    {!notification.read && notification.type !== 'project_invite' && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 ${isDark
                                                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                } text-xs font-medium rounded-lg transition-all`}
                                                        >
                                                            <FiCheck size={14} />
                                                            Marcar leída
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification)}
                                                        className={`p-1.5 ${isDark
                                                                ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400'
                                                                : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                                                            } rounded-lg transition-all`}
                                                        title="Eliminar"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* Date */}
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`}>
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
