import React, { useState, useEffect } from 'react';
import { notificationsApi, SendNotificationData } from '../../../src/api/notifications';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useToast } from '../../../src/hooks/useToast';
import { User } from '../../../types';
import { usersApi } from '../../../src/api/users';
import { coursesApi } from '../../../src/api/courses';

interface AdminSendNotificationsPageProps {}

const AdminSendNotificationsPage: React.FC<AdminSendNotificationsPageProps> = () => {
  const [formData, setFormData] = useLocalStorage<SendNotificationData>('admin_send_notification_data', {
    target: 'individual',
    title: '',
    message: '',
    recipient_id: undefined,
    course_id: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]); // Assuming a type for courses
  const toast = useToast();

  useEffect(() => {
    const fetchUsersAndCourses = async () => {
      try {
        const usersResponse = await usersApi.getUsers(1, 1000); // Fetch a reasonable number of users
        setAllUsers(usersResponse.results);

        const coursesResponse = await coursesApi.getCourses(); // Assuming getCourses returns all courses
        setAllCourses(coursesResponse.results);
      } catch (err) {
        console.error('Failed to fetch users or courses:', err);
        // Do not set global error, just log as it might not be critical for sending to specific targets
      }
    };
    fetchUsersAndCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof SendNotificationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: SendNotificationData = {
        target: formData.target,
        title: formData.title,
        message: formData.message,
      };

      if (formData.target === 'individual' && formData.recipient_id) {
        payload.recipient_id = formData.recipient_id;
      }
      if (formData.target === 'course' && formData.course_id) {
        payload.course_id = formData.course_id;
      }
      
      if (!payload.title || !payload.message) {
        setError('Title and Message are required.');
        setLoading(false);
        return;
      }

      if (formData.target === 'individual' && !formData.recipient_id) {
        setError('Recipient ID is required for individual target.');
        setLoading(false);
        return;
      }

      if (formData.target === 'course' && !formData.course_id) {
        setError('Course ID is required for course target.');
        setLoading(false);
        return;
      }

      const response = await notificationsApi.sendNotification(payload);
      toast.success(response.detail || 'Notification sent successfully!');
      setFormData({
        target: 'individual',
        title: '',
        message: '',
        recipient_id: undefined,
        course_id: undefined,
      });
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to send notification.');
      toast.error(getErrorMessage(err) || 'Failed to send notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send In-App Notification</CardTitle>
          <p className="text-sm text-muted-foreground">Send targeted notifications to users.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Group</Label>
              <Select onValueChange={(value: SendNotificationData['target']) => handleSelectChange('target', value)} value={formData.target}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">All Students</SelectItem>
                  <SelectItem value="tutors">All Tutors</SelectItem>
                  <SelectItem value="individual">Individual User</SelectItem>
                  <SelectItem value="course">Course Participants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="recipient_id">Recipient User</Label>
                <Select onValueChange={(value) => handleSelectChange('recipient_id', parseInt(value) as any)} value={formData.recipient_id?.toString() || ''}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                        {allUsers.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>{user.full_name} ({user.email})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            )}

            {formData.target === 'course' && (
              <div className="space-y-2">
                <Label htmlFor="course_id">Target Course</Label>
                <Select onValueChange={(value) => handleSelectChange('course_id', parseInt(value) as any)} value={formData.course_id?.toString() || ''}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                        {allCourses.map(course => (
                            <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Notification Title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Notification body content"
                rows={5}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSendNotificationsPage;