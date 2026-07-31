import type { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const SITE_URL = "https://www.golanwiki.com";
const CONTACT_EMAIL = "support@golanwiki.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  const titles: Record<string, string> = {
    en: "Cookie Policy | Golan Wiki",
    he: "מדיניות עוגיות | Golan Wiki",
    ar: "سياسة ملفات تعريف الارتباط | Golan Wiki",
  };

  const descs: Record<string, string> = {
    en: "Read how Golan Wiki uses cookies and similar technologies.",
    he: "קראו כיצד Golan Wiki משתמש בעוגיות ובטכנולוגיות דומות.",
    ar: "اقرأ كيف يستخدم Golan Wiki ملفات تعريف الارتباط والتقنيات المشابهة.",
  };

  return {
    title: titles[lang] ?? titles.en,
    description: descs[lang] ?? descs.en,
    alternates: {
      canonical: `${SITE_URL}/${lang}/cookie-policy`,
    },
  };
}

function EnContent() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="This page explains what cookies are, which cookies we use, and how you can control them."
      lastUpdated="Last updated: May 11, 2026"
      icon="🍪"
      sections={[
        {
          heading: "1. What Are Cookies?",
          content: (
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They allow the Website to remember information about your
              visit, such as keeping you logged in or remembering your preferred
              language.
            </p>
          ),
        },
        {
          heading: "2. Essential Cookies",
          content: (
            <>
              <p>
                Essential cookies are needed for the Website to work properly.
                Without them, core features may not function.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Session / authentication cookies:</strong> keep you
                  logged in to your account.
                </li>
                <li>
                  <strong>Security cookies:</strong> help protect the Website
                  and your account from unauthorized access.
                </li>
                <li>
                  <strong>Language preference cookies:</strong> remember your
                  selected language, such as English, Hebrew, or Arabic.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. Analytics Cookies",
          content: (
            <>
              <p>
                We may use analytics cookies or similar technologies to
                understand how visitors use the Website and to improve the user
                experience.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>PostHog:</strong> may track page views, clicks, and
                  usage patterns. We try to limit personal information where
                  possible.
                </li>
                <li>
                  <strong>Vercel Analytics:</strong> may provide aggregated
                  traffic and performance data.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "4. Performance Cookies",
          content: (
            <p>
              Performance cookies and similar technologies help us understand
              page loading times, technical errors, and general performance. This
              information is used to improve the Website.
            </p>
          ),
        },
        {
          heading: "5. Third-Party Cookies",
          content: (
            <>
              <p>
                Some third-party services used by the Website may set or use
                cookies or similar technologies.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Cloudinary:</strong> may use cookies or similar
                  technologies to help deliver and optimize images.
                </li>
                <li>
                  <strong>PostHog:</strong> may use analytics cookies or similar
                  technologies to measure usage.
                </li>
                <li>
                  <strong>Vercel:</strong> may use technical or performance data
                  to provide hosting, deployment, and analytics services.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. How to Control Cookies",
          content: (
            <>
              <p>
                You can control, block, or delete cookies through your browser
                settings. The exact steps depend on the browser you use.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Chrome:</strong> Settings → Privacy and security →
                  Cookies and other site data.
                </li>
                <li>
                  <strong>Firefox:</strong> Settings → Privacy & Security.
                </li>
                <li>
                  <strong>Safari:</strong> Settings / Preferences → Privacy.
                </li>
                <li>
                  <strong>Edge:</strong> Settings → Cookies and site
                  permissions.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "7. What Happens If You Disable Cookies?",
          content: (
            <>
              <p>
                If you disable cookies, some parts of the Website may stop
                working correctly.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>You may not stay logged in to your account.</li>
                <li>Your language preference may not be saved.</li>
                <li>Favorites and account-based features may not work correctly.</li>
                <li>Some security or performance features may be limited.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "8. Changes to This Policy",
          content: (
            <p>
              We may update this Cookie Policy from time to time. When we update
              it, we will change the “Last updated” date at the top of this
              page.
            </p>
          ),
        },
        {
          heading: "9. Contact",
          content: (
            <p>
              For questions about this Cookie Policy, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-brand-blue hover:text-brand-blue-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}

function HeContent() {
  return (
    <LegalPageLayout
      title="מדיניות עוגיות"
      subtitle="עמוד זה מסביר מהן עוגיות, באילו עוגיות אנו משתמשים וכיצד ניתן לשלוט בהן."
      lastUpdated="עודכן לאחרונה: 11 במאי 2026"
      icon="🍪"
      sections={[
        {
          heading: "1. מהן עוגיות?",
          content: (
            <p>
              עוגיות הן קבצי טקסט קטנים הנשמרים במכשיר שלכם כאשר אתם מבקרים
              באתר אינטרנט. הן מאפשרות לאתר לזכור מידע על הביקור שלכם, כגון
              שמירה על התחברות לחשבון או זכירת השפה המועדפת עליכם.
            </p>
          ),
        },
        {
          heading: "2. עוגיות חיוניות",
          content: (
            <>
              <p>
                עוגיות חיוניות נדרשות כדי שהאתר יעבוד בצורה תקינה. בלעדיהן,
                תכונות בסיסיות באתר עלולות לא לפעול.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>עוגיות התחברות / אימות:</strong> שומרות אתכם מחוברים
                  לחשבון.
                </li>
                <li>
                  <strong>עוגיות אבטחה:</strong> מסייעות בהגנה על האתר ועל
                  החשבון שלכם מפני גישה בלתי מורשית.
                </li>
                <li>
                  <strong>עוגיות העדפת שפה:</strong> זוכרות את השפה שבחרתם,
                  כגון עברית, ערבית או אנגלית.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. עוגיות אנליטיקה",
          content: (
            <>
              <p>
                אנו עשויים להשתמש בעוגיות אנליטיקה או בטכנולוגיות דומות כדי
                להבין כיצד מבקרים משתמשים באתר ולשפר את חוויית המשתמש.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>PostHog:</strong> עשוי לעקוב אחר צפיות בעמודים,
                  לחיצות ודפוסי שימוש. אנו משתדלים לצמצם מידע אישי ככל האפשר.
                </li>
                <li>
                  <strong>Vercel Analytics:</strong> עשוי לספק נתוני תנועה
                  וביצועים מצטברים.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "4. עוגיות ביצועים",
          content: (
            <p>
              עוגיות ביצועים וטכנולוגיות דומות עוזרות לנו להבין זמני טעינת
              עמודים, שגיאות טכניות וביצועים כלליים. מידע זה משמש לשיפור האתר.
            </p>
          ),
        },
        {
          heading: "5. עוגיות צד שלישי",
          content: (
            <>
              <p>
                חלק משירותי הצד השלישי שבהם האתר משתמש עשויים להגדיר או להשתמש
                בעוגיות או בטכנולוגיות דומות.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Cloudinary:</strong> עשוי להשתמש בעוגיות או
                  בטכנולוגיות דומות כדי לסייע באספקת תמונות ובאופטימיזציה שלהן.
                </li>
                <li>
                  <strong>PostHog:</strong> עשוי להשתמש בעוגיות אנליטיקה או
                  בטכנולוגיות דומות למדידת שימוש.
                </li>
                <li>
                  <strong>Vercel:</strong> עשוי להשתמש בנתונים טכניים או נתוני
                  ביצועים לצורך שירותי אחסון, פריסה ואנליטיקה.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. כיצד ניתן לשלוט בעוגיות",
          content: (
            <>
              <p>
                ניתן לשלוט בעוגיות, לחסום אותן או למחוק אותן דרך הגדרות
                הדפדפן. השלבים המדויקים תלויים בדפדפן שבו אתם משתמשים.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Chrome:</strong> הגדרות ← פרטיות ואבטחה ← עוגיות
                  ונתוני אתר אחרים.
                </li>
                <li>
                  <strong>Firefox:</strong> הגדרות ← פרטיות ואבטחה.
                </li>
                <li>
                  <strong>Safari:</strong> הגדרות / העדפות ← פרטיות.
                </li>
                <li>
                  <strong>Edge:</strong> הגדרות ← קובצי Cookie והרשאות אתר.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "7. מה יקרה אם תשביתו עוגיות?",
          content: (
            <>
              <p>אם תשביתו עוגיות, חלקים מסוימים באתר עלולים לא לעבוד כראוי.</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>ייתכן שלא תישארו מחוברים לחשבון.</li>
                <li>ייתכן שהעדפת השפה שלכם לא תישמר.</li>
                <li>ייתכן שמועדפים ותכונות המבוססות על חשבון לא יעבדו כראוי.</li>
                <li>חלק מתכונות האבטחה או הביצועים עשויות להיות מוגבלות.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "8. שינויים במדיניות זו",
          content: (
            <p>
              אנו עשויים לעדכן מדיניות עוגיות זו מעת לעת. בעת עדכון המדיניות,
              נשנה את תאריך “עודכן לאחרונה” בראש העמוד.
            </p>
          ),
        },
        {
          heading: "9. צור קשר",
          content: (
            <p>
              לשאלות בנושא מדיניות עוגיות זו, ניתן ליצור איתנו קשר בכתובת{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-brand-blue hover:text-brand-blue-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}

function ArContent() {
  return (
    <LegalPageLayout
      title="سياسة ملفات تعريف الارتباط"
      subtitle="توضح هذه الصفحة ما هي ملفات تعريف الارتباط، وأيها نستخدم، وكيف يمكنك التحكم بها."
      lastUpdated="آخر تحديث: 11 مايو 2026"
      icon="🍪"
      sections={[
        {
          heading: "1. ما هي ملفات تعريف الارتباط؟",
          content: (
            <p>
              ملفات تعريف الارتباط، أو Cookies، هي ملفات نصية صغيرة تُخزّن على
              جهازك عند زيارة موقع ويب. تتيح للموقع تذكر معلومات عن زيارتك، مثل
              إبقائك مسجلاً الدخول أو تذكر لغتك المفضلة.
            </p>
          ),
        },
        {
          heading: "2. ملفات تعريف الارتباط الأساسية",
          content: (
            <>
              <p>
                هذه الملفات ضرورية لعمل الموقع بشكل صحيح. بدونها قد لا تعمل
                الميزات الأساسية.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>ملفات الجلسة / المصادقة:</strong> تبقيك مسجلاً الدخول
                  إلى حسابك.
                </li>
                <li>
                  <strong>ملفات الأمان:</strong> تساعد على حماية الموقع وحسابك
                  من الوصول غير المصرح به.
                </li>
                <li>
                  <strong>ملفات تفضيل اللغة:</strong> تتذكر اللغة التي اخترتها،
                  مثل العربية أو العبرية أو الإنجليزية.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. ملفات تعريف الارتباط التحليلية",
          content: (
            <>
              <p>
                قد نستخدم ملفات تعريف ارتباط تحليلية أو تقنيات مشابهة لفهم كيفية
                استخدام الزوار للموقع وتحسين تجربة المستخدم.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>PostHog:</strong> قد يتتبع مشاهدات الصفحات والنقرات
                  وأنماط الاستخدام. نحاول تقليل المعلومات الشخصية قدر الإمكان.
                </li>
                <li>
                  <strong>Vercel Analytics:</strong> قد يوفر بيانات حركة مرور
                  وأداء مجمّعة.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "4. ملفات تعريف الارتباط للأداء",
          content: (
            <p>
              تساعدنا ملفات الأداء والتقنيات المشابهة على فهم أوقات تحميل
              الصفحات والأخطاء التقنية والأداء العام. تُستخدم هذه المعلومات
              لتحسين الموقع.
            </p>
          ),
        },
        {
          heading: "5. ملفات تعريف ارتباط الطرف الثالث",
          content: (
            <>
              <p>
                قد تقوم بعض خدمات الطرف الثالث المستخدمة في الموقع بتعيين أو
                استخدام ملفات تعريف ارتباط أو تقنيات مشابهة.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Cloudinary:</strong> قد تستخدم ملفات تعريف ارتباط أو
                  تقنيات مشابهة للمساعدة في تسليم الصور وتحسينها.
                </li>
                <li>
                  <strong>PostHog:</strong> قد تستخدم ملفات تعريف ارتباط تحليلية
                  أو تقنيات مشابهة لقياس الاستخدام.
                </li>
                <li>
                  <strong>Vercel:</strong> قد تستخدم بيانات تقنية أو بيانات أداء
                  لتوفير خدمات الاستضافة والنشر والتحليلات.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. كيفية التحكم في ملفات تعريف الارتباط",
          content: (
            <>
              <p>
                يمكنك التحكم في ملفات تعريف الارتباط أو حظرها أو حذفها من خلال
                إعدادات المتصفح. تختلف الخطوات الدقيقة حسب المتصفح الذي تستخدمه.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Chrome:</strong> الإعدادات ← الخصوصية والأمان ← ملفات
                  تعريف الارتباط وبيانات المواقع الأخرى.
                </li>
                <li>
                  <strong>Firefox:</strong> الإعدادات ← الخصوصية والأمان.
                </li>
                <li>
                  <strong>Safari:</strong> الإعدادات / التفضيلات ← الخصوصية.
                </li>
                <li>
                  <strong>Edge:</strong> الإعدادات ← ملفات تعريف الارتباط
                  وأذونات الموقع.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "7. ما الذي سيتأثر عند تعطيل ملفات الارتباط؟",
          content: (
            <>
              <p>
                إذا قمت بتعطيل ملفات تعريف الارتباط، فقد لا تعمل بعض أجزاء
                الموقع بشكل صحيح.
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>قد لا تتمكن من البقاء مسجلاً الدخول إلى حسابك.</li>
                <li>قد لا يتم حفظ تفضيل اللغة.</li>
                <li>قد لا تعمل المفضلات والميزات المرتبطة بالحساب بشكل صحيح.</li>
                <li>قد تكون بعض ميزات الأمان أو الأداء محدودة.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "8. التغييرات على هذه السياسة",
          content: (
            <p>
              قد نقوم بتحديث سياسة ملفات تعريف الارتباط هذه من وقت لآخر. عند
              تحديثها، سنقوم بتغيير تاريخ “آخر تحديث” في أعلى الصفحة.
            </p>
          ),
        },
        {
          heading: "9. التواصل",
          content: (
            <p>
              للاستفسارات المتعلقة بسياسة ملفات تعريف الارتباط هذه، يمكنك
              التواصل معنا عبر{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-brand-blue hover:text-brand-blue-hover hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (lang === "he") return <HeContent />;
  if (lang === "ar") return <ArContent />;

  return <EnContent />;
}
