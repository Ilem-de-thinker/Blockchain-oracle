import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { coursesApi } from '@/src/api/courses';
import apiClient from '@/src/api/client';
import certificatesApi from '@/src/api/certificates';
import { useToast } from '@/src/hooks/useToast';
import { 
  BookOpen, 
  Clock, 
  Award, 
  CreditCard, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Lock, 
  Info,
  RefreshCcw,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const EnrollmentDetailPage: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingBalance, setPayingBalance] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [sendCertificateEmail, setSendCertificateEmail] = useState(false);
  const [moduleAccess, setModuleAccess] = useState<any>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const toast = useToast();

  const loadEnrollment = useCallback(async (enrollmentId: number) => {
    try {
      setLoading(true);
      const data = await coursesApi.getEnrollment(enrollmentId);
      if (!data) throw new Error('Not found');

      const courseId = data.course?.id || data.course;

      // Load supplementary data in parallel
      const [accessRes, breakdownRes, progressRes, courseRes, modulesRes] = await Promise.allSettled([
        coursesApi.getModuleAccessStatus(enrollmentId),
        coursesApi.getPaymentBreakdown(enrollmentId),
        courseId ? apiClient.get(`/api/courses/${courseId}/progress/`).then(res => res.data) : Promise.reject('No course id'),
        courseId ? coursesApi.getCourse(courseId) : Promise.reject('No course id'),
        courseId ? coursesApi.getModules(courseId) : Promise.reject('No course id')
      ]);

      if (accessRes.status === 'fulfilled') setModuleAccess(accessRes.value);
      if (breakdownRes.status === 'fulfilled') setPaymentBreakdown(breakdownRes.value);
      if (progressRes.status === 'fulfilled') setCourseProgress(progressRes.value);

      // Merge data
      const fullEnrollment = { ...data };
      if (courseRes.status === 'fulfilled') {
        fullEnrollment.course = courseRes.value;
      }
      if (modulesRes.status === 'fulfilled' && (!fullEnrollment.course.modules || !fullEnrollment.course.modules.length)) {
        fullEnrollment.course.modules = modulesRes.value;
      }

      setEnrollment(fullEnrollment);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollment details.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!id) return;
    loadEnrollment(parseInt(id));
  }, [id, loadEnrollment]);

  const handlePayBalance = async () => {
    if (!enrollment) return;
    try {
      setPayingBalance(true);
      const result = await coursesApi.payBalance(enrollment.id);
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        toast.success('Payment initiated successfully!');
        loadEnrollment(enrollment.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setPayingBalance(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!enrollment) return;
    try {
      setDownloadingCertificate(true);
      await certificatesApi.downloadEnrollmentCertificate(enrollment.id, { sendEmail: sendCertificateEmail });
      toast.success(sendCertificateEmail ? 'Certificate downloaded and email delivery requested.' : 'Certificate downloaded.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate certificate');
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num);
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold text-text">Access Denied</h2>
        <p className="text-text-muted">{error || 'Enrollment not found or unauthorized.'}</p>
        <Button onClick={() => navigate('/dashboard/courses')} variant="outline" className="gap-2">
          <ArrowLeft size={16} /> Back to Courses
        </Button>
      </div>
    );
  }

  const course = enrollment.course;
  const progress = courseProgress?.progress_percentage ?? courseProgress?.overall_completion ?? enrollment.progress_percentage ?? enrollment.progress ?? 0;
  
  // Use a more robust set of fallbacks for financial data
  const totalAmount = Number(paymentBreakdown?.total_amount || enrollment.total_amount || enrollment.course_price || course?.total_amount || course?.price || 0);
  const paidAmount = Number(paymentBreakdown?.amount_paid || enrollment.amount_paid || 0);
  const balanceRemaining = Number(paymentBreakdown?.balance_remaining || enrollment.balance_remaining || 0);
  
  const isPaid = enrollment.is_completed || balanceRemaining <= 0 || (totalAmount > 0 && paidAmount >= totalAmount);
  const isAcademicDone = courseProgress?.is_course_completed || courseProgress?.is_completed || enrollment.is_course_completed || enrollment.completed || Number(progress) >= 100;
  const certificateEligible = Boolean(isPaid && isAcademicDone);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-md hover:shadow-xl">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">
            <Link to="/dashboard/courses" className="hover:text-primary transition-colors">Courses</Link>
            <ChevronRight size={10} />
            <span className="text-text">Details</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight truncate">{course?.title || 'Course Details'}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-2">
              {course?.category || 'General'}
            </Badge>
            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
              <Calendar size={12} /> {formatDate(enrollment.enrolled_at)}
            </span>
            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
              <RefreshCcw size={12} /> ID: #{enrollment.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button asChild className="flex-1 md:flex-none h-11 rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/20">
            <Link to={`/dashboard/course/${course?.id}`}>
              <Play className="w-4 h-4 mr-2 fill-current" /> Resume
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={() => loadEnrollment(enrollment.id)} className="h-11 w-11 rounded-xl">
             <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-surface-alt/50 border border-border p-1 h-12 rounded-xl w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-surface data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="modules" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-surface data-[state=active]:shadow-sm">Modules</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-surface data-[state=active]:shadow-sm">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-md hover:shadow-xl">
                <div className="aspect-video relative overflow-hidden bg-surface-alt">
                   <img src={course?.thumbnail_url || '/Logo/logo.png'} alt="" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div className="space-y-1">
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Instructor</p>
                        <h4 className="text-white font-bold text-lg">{course?.tutor?.full_name || 'Expert Tutor'}</h4>
                      </div>
                   </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">About the Course</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{course?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                    {[
                      { label: 'Level', value: course?.level || 'N/A', icon: BarChart3, color: 'text-blue-500' },
                      { label: 'Modules', value: courseProgress?.modules?.length || '0', icon: BookOpen, color: 'text-purple-500' },
                      { label: 'Resources', value: courseProgress?.total_materials || '0', icon: FileText, color: 'text-emerald-500' },
                      { label: 'Price', value: formatAmount(totalAmount), icon: CreditCard, color: 'text-primary' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                           <item.icon size={12} className={item.color} />
                           <span className="text-xs font-bold text-text truncate">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-surface rounded-2xl border border-border p-6 shadow-md hover:shadow-xl">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Curriculum Progress</h3>
                     <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-2">
                        {courseProgress?.completed_materials || 0}/{courseProgress?.total_materials || 0} Materials
                     </Badge>
                  </div>

                  <div className="space-y-3">
                    {(enrollment.course?.modules?.length ? enrollment.course.modules : (courseProgress?.modules || moduleAccess?.modules || [])).map((mod: any, i: number) => {
                      const moduleId = mod.id || mod.module_id;
                      
                      // Find progress/access info for this specific module
                      const progMod = courseProgress?.modules?.find((m: any) => (m.module_id || m.id) === moduleId);
                      const accessMod = moduleAccess?.modules?.find((m: any) => (m.id || m.module_id) === moduleId);
                      
                      const isLocked = accessMod?.is_locked ?? mod.is_locked ?? false;
                      const isCompleted = progMod?.is_completed ?? mod.is_completed ?? false;
                      const total = progMod?.total_materials ?? mod.total_materials ?? 0;
                      const completed = progMod?.completed_materials ?? mod.completed_materials ?? 0;

                      return (
                        <div key={moduleId || i} className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          isLocked ? "bg-surface-alt/30 border-border/50 opacity-60" : "bg-surface border-border hover:border-primary/30"
                        )}>
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                              isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                              isLocked ? "bg-surface-alt border-border text-text-muted" : "bg-primary/5 border-primary/20 text-primary"
                            )}>
                              {isCompleted ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={18} /> : <span className="font-black text-xs">{i+1}</span>}
                            </div>
                            <div className="min-w-0">
                               <h4 className="text-sm font-bold text-text truncate">{mod.title || 'Module'}</h4>
                               {!isLocked && total > 0 && (
                                 <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-wide">
                                    {completed} / {total} COMPLETED
                                 </p>
                               )}
                               {isLocked && <p className="text-[10px] font-bold text-amber-600/80 mt-0.5 uppercase tracking-wide">LOCKED • {accessMod?.access_threshold || mod.access_threshold || 100}% PAYMENT REQUIRED</p>}
                            </div>
                          </div>
                          {!isLocked && (
                             <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <Link to={`/dashboard/course/${course?.id}`}><Play size={14} className="fill-current" /></Link>
                             </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-surface rounded-2xl border border-border p-6 shadow-md hover:shadow-xl">
                   <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Payment History</h3>
                  <div className="space-y-3">
                    {paymentBreakdown?.payments?.length > 0 ? (
                      paymentBreakdown.payments.map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-alt/30 border border-border/50">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
                              payment.status === 'PAID' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            )}>
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-text">{formatAmount(payment.amount)}</p>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                                {payment.paid_at ? `Paid on ${new Date(payment.paid_at).toLocaleDateString()}` : `Due on ${payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'TBD'}`}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2",
                            payment.status === 'PAID' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}>
                            {payment.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                         <CreditCard className="mx-auto h-10 w-10 text-text-muted/20 mb-3" />
                         <p className="text-xs font-bold text-text-muted italic uppercase">
                            {Number(totalAmount) === 0 ? 'Free Course • No Payments Required' : 'No payment records found'}
                         </p>
                      </div>
                    )}
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Progress Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-md hover:shadow-xl space-y-6">
             <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Course Progress</h3>
                 <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
               </div>
               <Progress value={progress} className="h-2 bg-surface-alt" indicatorClassName="bg-gradient-primary" />
             </div>

             <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                         <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-text">Completion Status</span>
                   </div>
                   <Badge className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                      (courseProgress?.is_course_completed || enrollment.is_course_completed) ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-muted"
                   )}>
                      {(courseProgress?.is_course_completed || enrollment.is_course_completed) ? 'PASSED' : 'ACTIVE'}
                   </Badge>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                         <CreditCard size={16} />
                      </div>
                      <span className="text-xs font-bold text-text">Payment Status</span>
                   </div>
                   <Badge className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                      balanceRemaining <= 0 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                   )}>
                      {balanceRemaining <= 0 ? 'PAID' : 'PENDING'}
                   </Badge>
                </div>
             </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-md hover:shadow-xl space-y-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                   <Award size={20} />
                </div>
                <h3 className="text-sm font-black text-text uppercase tracking-tight">Certification</h3>
             </div>
             
             {certificateEligible ? (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-text-secondary leading-relaxed">
                    Congratulations! You have successfully completed the curriculum and fulfilled all financial obligations.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={sendCertificateEmail}
                      onChange={(e) => setSendCertificateEmail(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-[10px] font-bold text-text-muted group-hover:text-text transition-colors uppercase tracking-widest">Email delivery</span>
                  </label>
                  <Button
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCertificate}
                    className="w-full h-11 rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/20"
                  >
                    {downloadingCertificate ? <RefreshCcw className="animate-spin mr-2" /> : <FileText className="mr-2" />}
                    Download PDF
                  </Button>
                </div>
             ) : (
                <div className="p-4 rounded-xl bg-surface-alt/50 border border-border/50 text-center space-y-2">
                   <Lock className="mx-auto h-5 w-5 text-text-muted opacity-30" />
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                      Complete all modules and pay full balance to unlock certificate
                   </p>
                </div>
             )}
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-md hover:shadow-xl space-y-6">
             <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Financial Summary</h3>
             
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-text-muted">Total Commitment</span>
                   <span className="text-sm font-black text-text">{formatAmount(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-text-muted">Paid to Date</span>
                   <span className="text-sm font-black text-emerald-500">{formatAmount(paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                   <span className="text-xs font-black text-text uppercase tracking-widest">Balance Due</span>
                   <span className="text-sm font-black text-amber-600">{formatAmount(balanceRemaining)}</span>
                </div>
             </div>

             {balanceRemaining > 0 && (
               <Button
                 onClick={handlePayBalance}
                 disabled={payingBalance}
                 className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 font-black uppercase tracking-widest text-[11px]"
               >
                 {payingBalance ? <RefreshCcw className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                 Clear Balance
               </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailPage;

