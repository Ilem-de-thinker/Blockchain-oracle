import apiClient from './client';

export interface EarnedCertificate {
  id: number;
  certificate_id: string;
  course: number;
  course_title: string;
  course_thumbnail?: string;
  tutor_name?: string;
  issued_at: string;
}

export interface CertificateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EarnedCertificate[];
}

export interface VerifyCertificateResponse {
  id: number;
  certificate_id: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
    description?: string;
  };
  issued_at: string;
}

const normalizeEarnedCertificate = (raw: any): EarnedCertificate => ({
  id: raw?.id,
  certificate_id: raw?.certificate_id ?? '',
  course: Number(raw?.course ?? 0),
  course_title: raw?.course_title ?? '',
  course_thumbnail: raw?.course_thumbnail,
  tutor_name: raw?.tutor_name,
  issued_at: raw?.issued_at ?? '',
});

const normalizeCertificateListResponse = (data: unknown): CertificateListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.map(normalizeEarnedCertificate),
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as { count?: number; next?: string | null; previous?: string | null; results?: any[]; items?: any[] };
    const array = Array.isArray(obj.results) ? obj.results : Array.isArray(obj.items) ? obj.items : [];
    const results = array.map(normalizeEarnedCertificate);
    return {
      count: typeof obj.count === 'number' ? obj.count : results.length,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      results,
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

const extractFilename = (contentDisposition?: string | null, fallback = 'certificate.pdf') => {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] || fallback;
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const certificatesApi = {
  getMyCertificates: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<CertificateListResponse> => {
    const response = await apiClient.get('/api/certificates/', { params });
    return normalizeCertificateListResponse(response.data);
  },

  downloadEnrollmentCertificate: async (
    enrollmentId: number,
    options?: { sendEmail?: boolean; filename?: string }
  ): Promise<void> => {
    const response = await apiClient.get(`/api/enrollments/${enrollmentId}/certificate/`, {
      params: options?.sendEmail ? { send_email: true } : undefined,
      responseType: 'blob',
    });

    const contentDisposition =
      typeof response.headers?.get === 'function'
        ? response.headers.get('content-disposition')
        : response.headers?.['content-disposition'];

    const filename = options?.filename || extractFilename(contentDisposition, `certificate-enrollment-${enrollmentId}.pdf`);
    triggerBlobDownload(new Blob([response.data], { type: 'application/pdf' }), filename);
  },

  verifyCertificate: async (certificateNumber: string): Promise<VerifyCertificateResponse> => {
    const response = await apiClient.get(`/api/certificates/verify/${certificateNumber}/`);
    return response.data;
  },

  getCertificate: async (id: number): Promise<EarnedCertificate> => {
    const response = await apiClient.get(`/api/certificates/${id}/`);
    return normalizeEarnedCertificate(response.data);
  },
};

export default certificatesApi;
