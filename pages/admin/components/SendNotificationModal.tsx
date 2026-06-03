import React, { useState } from 'react';
import { notificationsApi, SendNotificationData } from '../../../src/api/notifications';
import RichTextEditor from '../../../components/ui/rich-text-editor';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole: 'ADMIN' | 'SUPER_ADMIN' | 'TUTOR';
  initialData?: Partial<SendNotificationData>;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userRole,
  initialData,
}) => {
  const [formData, setFormData] = useState<SendNotificationData>({
    target: 'students',
    title: '',
    message: '',
    recipient_id: undefined,
    course_id: undefined,
    notification_type: 'general',
    ...initialData,
  });

  const isTutor = userRole === 'TUTOR';

  // Update form data when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        target: 'students',
        title: '',
        message: '',
        recipient_id: undefined,
        course_id: undefined,
        notification_type: 'general',
        ...initialData,
      });
    }
  }, [isOpen, initialData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.target === 'individual' && !formData.recipient_id) {
      setError('Recipient ID is required for individual target.');
      return;
    }
    if (formData.target === 'course' && !formData.course_id) {
      setError('Course ID is required for course target.');
      return;
    }

    try {
      setLoading(true);
      await notificationsApi.sendNotification(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-text">Send Notification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-text-secondary transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>{error}
            </div>
          )}

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <select
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="students">All Students</option>
              {!isTutor && <option value="tutors">All Tutors</option>}
              {!isTutor && <option value="all">All Users</option>}
              <option value="individual">Individual User</option>
              <option value="course">Course Students</option>
            </select>
            {isTutor && (
              <p className="text-xs text-text-muted mt-1">
                Tutors can only send notifications to students.
              </p>
            )}
          </div>

          {/* Individual Recipient ID */}
          {formData.target === 'individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient ID *
              </label>
              <input
                type="number"
                value={formData.recipient_id || ''}
                onChange={(e) => setFormData({ ...formData, recipient_id: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter user ID"
                required
              />
            </div>
          )}

          {/* Course ID */}
          {formData.target === 'course' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course ID *
              </label>
              <input
                type="number"
                value={formData.course_id || ''}
                onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter course ID"
                required
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Notification title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <RichTextEditor
              value={formData.message}
              onChange={(value) => setFormData({ ...formData, message: value })}
              placeholder="Notification message"
              minHeight="150px"
            />
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Type
            </label>
            <select
              value={formData.notification_type}
              onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="general">General / System</option>
              <option value="course_purchase">Course Purchase</option>
              <option value="enrollment">Enrollment</option>
              <option value="event">Event</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-gray-700 rounded-lg hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;
