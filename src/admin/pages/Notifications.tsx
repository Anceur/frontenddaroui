import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, ShoppingCart, Package, Info, Table, RefreshCw, Filter } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, type Notification } from '../../shared/api/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'medium' | 'low'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Get all notifications for admin (pass all=true)
      const allNotifications = await getNotifications(false);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={20} />;
      case 'alert':
        return <AlertCircle size={20} />;
      case 'ingredient':
        return <Package size={20} />;
      case 'table':
        return <Table size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Critical';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return priority;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'critical') return notif.priority === 'critical';
    if (filter === 'medium') return notif.priority === 'medium';
    if (filter === 'low') return notif.priority === 'low';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.is_read).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="text-[var(--color-primary)]" size={28} />
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">Manage and view all system notifications</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCheck size={18} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Total Notifications</div>
            <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Unread</div>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Critical Alerts</div>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-gray-600" />
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          {(['all', 'unread', 'critical', 'medium', 'low'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No notifications found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter !== 'all' ? `Try changing the filter to see more notifications.` : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    notification.priority === 'critical' ? 'bg-red-100 text-red-600' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-gray-900 ${
                            !notification.is_read ? 'font-bold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded border ${getPriorityColor(notification.priority)}`}>
                            {getPriorityLabel(notification.priority)}
                          </span>
                          <span>{notification.time_ago}</span>
                          {notification.related_order && (
                            <span>Order #{notification.related_order}</span>
                          )}
                          {notification.related_offline_order && (
                            <span>Table Order #{notification.related_offline_order}</span>
                          )}
                          {notification.related_ingredient && (
                            <span>Ingredient #{notification.related_ingredient}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

