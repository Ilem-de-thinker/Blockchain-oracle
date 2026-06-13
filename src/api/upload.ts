import apiClient from './client';

export interface UploadResponse {
  message: string;
  urls: string[];
}

export const uploadApi = {
  /**
   * Upload single file to Cloudinary
   * @param file - File to upload
   * @returns Secure URL of uploaded file
   */
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await apiClient.post('/api/core/upload/', formData);

    const data = response.data as UploadResponse;
    return data.urls[0];
  },

  /**
   * Upload multiple files to Cloudinary
   * @param files - Array of files to upload
   * @returns Array of secure URLs
   */
  uploadFiles: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/api/core/upload/', formData);

    const data = response.data as UploadResponse;
    return data.urls;
  },

  /**
   * Upload profile picture
   * @param file - Profile picture file
   * @returns Secure URL of uploaded image
   */
  uploadProfilePicture: async (file: File): Promise<string> => {
    return uploadApi.uploadFile(file);
  },

  /**
   * Upload course thumbnail
   * @param file - Thumbnail file
   * @returns Secure URL of uploaded image
   */
  uploadThumbnail: async (file: File): Promise<string> => {
    return uploadApi.uploadFile(file);
  },

  /**
   * Upload course material (PDF, video, etc.)
   * @param file - Material file
   * @returns Secure URL of uploaded file
   */
  uploadMaterial: async (file: File): Promise<string> => {
    return uploadApi.uploadFile(file);
  },
};

export default uploadApi;
