"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

interface ContactFormProps {
  lang: string;
  dict: any;
  initialReason?: string;
}

export default function ContactForm({ lang, dict }: ContactFormProps) {
  const t = dict.contactPage;

  if (!t) return null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    const formData = new FormData(e.currentTarget);
    const body = JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      reason: formData.get("reason"),
      message: formData.get("message"),
    });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form handled by React unmounting or condition
    } catch (err) {
      setApiError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">
          {lang === 'he' ? 'ההודעה נשלחה בהצלחה!' : lang === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message Sent Successfully!'}
        </h3>
        <p className="text-slate-600">
          {lang === 'he' ? 'תודה שפנית אלינו. נחזור אליך בהקדם.' : lang === 'ar' ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.' : 'Thank you for reaching out. We will get back to you as soon as possible.'}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-sm font-bold text-emerald-600 hover:text-emerald-500 underline"
        >
          {lang === 'he' ? 'שלח הודעה נוספת' : lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-bold text-slate-700 ps-1">
            {t.name}
          </label>
          <input
            required
            type="text"
            id="name"
            name="name"
            placeholder={t.namePlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 ps-1">
            {t.email}
          </label>
          <input
            required
            type="email"
            id="email"
            name="email"
            placeholder={t.emailPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-sm font-bold text-slate-700 ps-1">
          {t.subject}
        </label>
        <input
          required
          type="text"
          id="subject"
          name="subject"
          placeholder={t.subjectPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-2">
        <label htmlFor="reason" className="text-sm font-bold text-slate-700 ps-1">
          {t.reason}
        </label>
        <div className="relative">
          <select
            required
            id="reason"
            name="reason"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          >
            <option value="general">{t.reasons.general}</option>
            <option value="add">{t.reasons.add}</option>
            <option value="update">{t.reasons.update}</option>
            <option value="report">{t.reasons.report}</option>
            <option value="partnership">{t.reasons.partnership}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-bold text-slate-700 ps-1">
          {t.message}
        </label>
        <textarea
          required
          id="message"
          name="message"
          rows={5}
          placeholder={t.messagePlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none"
        ></textarea>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
          {apiError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-70"
      >
        {isSubmitting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            <span>{t.submit}</span>
          </>
        )}
      </button>

      {/* Form Note */}
      <p className="text-center text-[11px] text-slate-400">
        {lang === 'he'
          ? 'בלחיצה על "שלח הודעה", אתה מסכים למדיניות הפרטיות שלנו.'
          : lang === 'ar'
            ? 'بالنقر فوق "إرسال الرسالة"، فإنك توافق على سياسة الخصوصية الخاصة بنا.'
            : 'By clicking "Send Message", you agree to our Privacy Policy.'}
      </p>
    </form>
  );
}
