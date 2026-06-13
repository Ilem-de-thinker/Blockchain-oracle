import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';
import certificatesApi, { EarnedCertificate } from '../../../src/api/certificates';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../src/hooks/useToast';
import { Award, Download, Mail, Search, RefreshCcw, Trophy, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { cn } from '@/lib/utils';

interface CertificatesPageProps {
  user: User | null;
}

const CertificatesPage: React.FC<CertificatesPageProps> = ({ user }) => {
  const { error: toastError, info: toastInfo, success: toastSuccess } = useToast();
  const [certificates, setCertificates] = useState<EarnedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendEmailByDefault, setSendEmailByDefault] = useState(false);
  const [downloadingEnrollmentId, setDownloadingEnrollmentId] = useState<number | null>(null);

  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await certificatesApi.getMyCertificates();
      setCertificates(response.results);
    } catch (err) {
      toastError('Failed to load your certificates.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleDownload = async (id: number) => {
    try {
      setDownloadingEnrollmentId(id);
      toastInfo(sendEmailByDefault ? 'Generating certificate and emailing a copy...' : 'Generating certificate...');
      await certificatesApi.downloadEnrollmentCertificate(id, { sendEmail: sendEmailByDefault });
      if (sendEmailByDefault) {
        toastSuccess('Certificate downloaded and email delivery requested.');
      }
    } catch (err) {
      toastError('Failed to download certificate.');
    } finally {
      setDownloadingEnrollmentId(null);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const title = cert.course_title || '';
    const tutor = cert.tutor_name || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || tutor.toLowerCase().includes(query);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="animate-spin h-8 w-8 text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">Certificates</h1>
          <p className="text-[10px] sm:text-xs text-text-muted">Your earned achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[10px] font-medium text-text-muted">
            <input
              type="checkbox"
              checked={sendEmailByDefault}
              onChange={(e) => setSendEmailByDefault(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <Mail className="h-3.5 w-3.5" />
            Email copy
          </label>
          <Button variant="ghost" size="sm" onClick={loadCertificates} className="h-8 px-2 text-[10px] sm:text-xs">
            <RefreshCcw className={cn("h-3 w-3 sm:mr-1.5", loading && "animate-spin")} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase">Total</p>
            <p className="text-sm sm:text-lg font-black text-text">{certificates.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 shadow-md hover:shadow-xl">
        <div className="relative">
          <Input
            placeholder="Search course or tutor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-[11px] sm:text-xs bg-surface-alt/50 border-border focus:ring-1 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCertificates.map((cert) => (
            <div key={cert.id} className="bg-surface rounded-xl border border-border shadow-md hover:shadow-xl overflow-hidden flex flex-col group hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between px-4 pt-4 pb-2">
                <Badge variant="success" className="text-[8px] font-bold uppercase px-1.5 py-0.5">Verified</Badge>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-text-secondary">#{cert.id}</span>
                  <Award className="h-5 w-5 text-amber-400/60" />
                </div>
              </div>
              
              <div className="px-4 pb-4 flex-1 flex flex-col">
                <h3 className="text-xs sm:text-sm font-bold text-text line-clamp-2 leading-snug mb-1">
                  {cert.course_title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-text-muted mb-1">
                  <span>Issued {formatDate(cert.issued_at)}</span>
                </div>
                {cert.tutor_name && <p className="text-[9px] text-text-muted mb-3">Tutor: {cert.tutor_name}</p>}

                <div className="flex gap-2 mt-auto pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-[10px] font-bold gap-1"
                    onClick={() => handleDownload(cert.id)}
                    disabled={downloadingEnrollmentId === cert.id}
                  >
                    <Download className="h-3 w-3" /> {downloadingEnrollmentId === cert.id ? 'Generating...' : 'Download'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px]" asChild>
                    <Link to={`/dashboard/enrollment/${cert.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border opacity-60">
          <Award className="h-10 w-10 mx-auto text-text-muted mb-2" />
          <p className="text-xs font-medium">No certificates found</p>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
