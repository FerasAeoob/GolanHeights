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
    en: "Privacy Policy | Golan Heights Guide",
    he: "מדיניות פרטיות | מדריך הגולן",
    ar: "سياسة الخصوصية | دليل الجولان",
  };

  const descs: Record<string, string> = {
    en: "Read how Golan Heights Guide collects, uses, stores, and protects personal information.",
    he: "קראו כיצד מדריך הגולן אוסף, משתמש, שומר ומגן על מידע אישי.",
    ar: "اقرأ كيف يجمع دليل الجولان المعلومات الشخصية ويستخدمها ويحفظها ويحميها.",
  };

  return {
    title: titles[lang] ?? titles.en,
    description: descs[lang] ?? descs.en,
    alternates: {
      canonical: `${SITE_URL}/${lang}/privacy-policy`,
    },
  };
}

function EnContent() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="This policy explains what information we collect, how we use it, and what choices you have."
      lastUpdated="Last updated: May 11, 2026"
      icon="🔒"
      sections={[
        {
          heading: "1. Who We Are",
          content: (
            <p>
              Golan Heights Guide, also known as Golan Wiki, is a local tourism
              and discovery platform available at <strong>www.golanwiki.com</strong>.
              For privacy questions, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
        {
          heading: "2. Information We Collect",
          content: (
            <>
              <p>We may collect the following types of information:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Account data:</strong> name, email address, and
                  securely hashed password.
                </li>
                <li>
                  <strong>Profile data:</strong> optional phone number and
                  profile image.
                </li>
                <li>
                  <strong>User activity:</strong> favorites, comments, reviews,
                  ratings, saved places, and similar interactions.
                </li>
                <li>
                  <strong>Business data:</strong> business name, description,
                  address, contact details, links, images, and listing
                  information.
                </li>
                <li>
                  <strong>Images:</strong> uploaded profile images, place
                  images, or business images, which may be stored using
                  Cloudinary.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type,
                  device type, language preference, pages visited, and general
                  usage data.
                </li>
                <li>
                  <strong>Analytics data:</strong> page views, clicks, and
                  performance events through tools such as PostHog and/or Vercel
                  Analytics.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. Cookies",
          content: (
            <p>
              We use cookies and similar technologies to keep you logged in,
              remember language preferences, improve security, understand site
              usage, and improve performance. For more details, please read our
              Cookie Policy.
            </p>
          ),
        },
        {
          heading: "4. How We Use Your Information",
          content: (
            <>
              <p>We use your information to:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Create and manage your account.</li>
                <li>Keep you logged in and protect your account.</li>
                <li>Save your favorite places.</li>
                <li>Display comments, reviews, ratings, and public content.</li>
                <li>Publish and manage place listings and business listings.</li>
                <li>Operate, improve, secure, and maintain the Website.</li>
                <li>Analyze website usage and performance.</li>
                <li>Respond to support requests or messages from you.</li>
                <li>Prevent spam, fraud, abuse, and unauthorized access.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "5. Public Content",
          content: (
            <p>
              Comments, reviews, ratings, business listings, and some profile
              information may be visible to other users. Your displayed name may
              appear next to content you submit. Do not include sensitive or
              private information in public posts.
            </p>
          ),
        },
        {
          heading: "6. Third-Party Services",
          content: (
            <>
              <p>
                We may use trusted third-party services to operate and improve
                the Website, including:
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Vercel</strong> — hosting and deployment.
                </li>
                <li>
                  <strong>MongoDB</strong> — database storage.
                </li>
                <li>
                  <strong>Cloudinary</strong> — image hosting and image
                  processing.
                </li>
                <li>
                  <strong>PostHog / Vercel Analytics</strong> — analytics and
                  performance measurement.
                </li>
                <li>
                  <strong>Email service providers</strong> — if used later for
                  account confirmation, password reset, or support emails.
                </li>
              </ul>

              <p className="mt-2">
                These services may process limited information only as needed to
                provide their services to us.
              </p>
            </>
          ),
        },
        {
          heading: "7. Data Retention",
          content: (
            <p>
              We keep personal information only as long as needed to operate the
              Website, provide services, maintain security, comply with legal
              obligations, resolve disputes, and enforce our terms. If you ask us
              to delete your account or personal information, we will remove it
              within a reasonable time, unless we need to keep certain
              information for legal, security, fraud-prevention, backup, or
              legitimate operational reasons.
            </p>
          ),
        },
        {
          heading: "8. Your Rights",
          content: (
            <>
              <p>Depending on applicable law, you may have the right to:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Request access to your personal information.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your personal information.</li>
                <li>Object to certain uses of your information.</li>
                <li>Request a copy of your information.</li>
              </ul>

              <p className="mt-2">
                To make a privacy request, contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . We may need to verify your identity before processing your
                request.
              </p>
            </>
          ),
        },
        {
          heading: "9. Children’s Privacy",
          content: (
            <p>
              The Website is not intended for children under the age of 13. We do
              not knowingly collect personal information from children under 13.
              If you believe a child has provided us with personal information,
              contact us and we will take reasonable steps to remove it.
            </p>
          ),
        },
        {
          heading: "10. Security",
          content: (
            <p>
              We use reasonable technical and organizational measures to protect
              personal information, including secure password hashing and secure
              authentication cookies where appropriate. However, no website,
              server, or internet transmission is completely secure, so we cannot
              guarantee absolute security.
            </p>
          ),
        },
        {
          heading: "11. We Do Not Sell Your Data",
          content: (
            <p>
              We do not sell or rent your personal information to third parties.
            </p>
          ),
        },
        {
          heading: "12. International Users",
          content: (
            <p>
              The Website is operated from Israel. If you access the Website from
              another country, your information may be processed in Israel or in
              other countries where our service providers operate. These
              countries may have different data protection laws than your
              country.
            </p>
          ),
        },
        {
          heading: "13. Changes to This Policy",
          content: (
            <p>
              We may update this Privacy Policy from time to time. When we update
              it, we will change the “Last updated” date at the top of this
              page. Continued use of the Website after changes are posted means
              you accept the updated policy.
            </p>
          ),
        },
        {
          heading: "14. Contact",
          content: (
            <p>
              For questions or requests about this Privacy Policy, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
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
      title="מדיניות פרטיות"
      subtitle="מדיניות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו ומהן האפשרויות שלכם."
      lastUpdated="עודכן לאחרונה: 11 במאי 2026"
      icon="🔒"
      sections={[
        {
          heading: "1. מי אנחנו",
          content: (
            <p>
              מדריך הגולן, הידוע גם בשם Golan Wiki, הוא פלטפורמת תיירות וגילוי
              מקומית הזמינה בכתובת <strong>www.golanwiki.com</strong>. לשאלות
              בנושא פרטיות ניתן ליצור איתנו קשר בכתובת{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
        {
          heading: "2. המידע שאנו אוספים",
          content: (
            <>
              <p>אנו עשויים לאסוף את סוגי המידע הבאים:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>נתוני חשבון:</strong> שם, כתובת אימייל וסיסמה
                  המאוחסנת בצורה מאובטחת ומוצפנת באמצעות גיבוב.
                </li>
                <li>
                  <strong>נתוני פרופיל:</strong> מספר טלפון אופציונלי ותמונת
                  פרופיל.
                </li>
                <li>
                  <strong>פעילות משתמש:</strong> מועדפים, תגובות, ביקורות,
                  דירוגים, מקומות שמורים ואינטראקציות דומות.
                </li>
                <li>
                  <strong>נתוני עסקים:</strong> שם העסק, תיאור, כתובת, פרטי
                  קשר, קישורים, תמונות ופרטי רישום.
                </li>
                <li>
                  <strong>תמונות:</strong> תמונות פרופיל, תמונות מקומות או
                  תמונות עסקים שהועלו, אשר עשויות להישמר באמצעות Cloudinary.
                </li>
                <li>
                  <strong>נתונים טכניים:</strong> כתובת IP, סוג דפדפן, סוג
                  מכשיר, העדפת שפה, עמודים שנצפו ונתוני שימוש כלליים.
                </li>
                <li>
                  <strong>נתוני אנליטיקה:</strong> צפיות בעמודים, לחיצות
                  ואירועי ביצועים באמצעות כלים כגון PostHog ו/או Vercel
                  Analytics.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. עוגיות",
          content: (
            <p>
              אנו משתמשים בעוגיות ובטכנולוגיות דומות כדי להשאיר אתכם מחוברים,
              לזכור העדפות שפה, לשפר אבטחה, להבין את השימוש באתר ולשפר ביצועים.
              לפרטים נוספים, אנא קראו את מדיניות העוגיות שלנו.
            </p>
          ),
        },
        {
          heading: "4. כיצד אנו משתמשים במידע שלכם",
          content: (
            <>
              <p>אנו משתמשים במידע שלכם כדי:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>ליצור ולנהל את החשבון שלכם.</li>
                <li>להשאיר אתכם מחוברים ולהגן על החשבון שלכם.</li>
                <li>לשמור את המקומות המועדפים עליכם.</li>
                <li>להציג תגובות, ביקורות, דירוגים ותוכן ציבורי.</li>
                <li>לפרסם ולנהל רישומי מקומות ורישומי עסקים.</li>
                <li>להפעיל, לשפר, לאבטח ולתחזק את האתר.</li>
                <li>לנתח שימוש וביצועי אתר.</li>
                <li>להשיב לפניות תמיכה או הודעות מכם.</li>
                <li>למנוע ספאם, הונאה, שימוש לרעה וגישה בלתי מורשית.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "5. תוכן ציבורי",
          content: (
            <p>
              תגובות, ביקורות, דירוגים, רישומי עסקים וחלק מפרטי הפרופיל עשויים
              להיות גלויים למשתמשים אחרים. השם המוצג שלכם עשוי להופיע לצד תוכן
              שתפרסמו. אין לכלול מידע רגיש או פרטי בפרסומים ציבוריים.
            </p>
          ),
        },
        {
          heading: "6. שירותי צד שלישי",
          content: (
            <>
              <p>
                אנו עשויים להשתמש בשירותי צד שלישי מהימנים כדי להפעיל ולשפר את
                האתר, כולל:
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Vercel</strong> — אחסון ופריסה.
                </li>
                <li>
                  <strong>MongoDB</strong> — אחסון מסד נתונים.
                </li>
                <li>
                  <strong>Cloudinary</strong> — אחסון ועיבוד תמונות.
                </li>
                <li>
                  <strong>PostHog / Vercel Analytics</strong> — אנליטיקה ומדידת
                  ביצועים.
                </li>
                <li>
                  <strong>ספקי שירותי אימייל</strong> — אם ישמשו בעתיד לאימות
                  חשבון, איפוס סיסמה או הודעות תמיכה.
                </li>
              </ul>

              <p className="mt-2">
                שירותים אלו עשויים לעבד מידע מוגבל רק ככל שנדרש כדי לספק לנו את
                השירותים שלהם.
              </p>
            </>
          ),
        },
        {
          heading: "7. שמירת מידע",
          content: (
            <p>
              אנו שומרים מידע אישי רק כל עוד הוא נדרש להפעלת האתר, מתן השירותים,
              שמירה על אבטחה, עמידה בחובות חוקיות, פתרון מחלוקות ואכיפת התנאים
              שלנו. אם תבקשו למחוק את החשבון או המידע האישי שלכם, נסיר אותו תוך
              זמן סביר, אלא אם עלינו לשמור מידע מסוים מסיבות משפטיות, אבטחה,
              מניעת הונאה, גיבוי או צרכים תפעוליים לגיטימיים.
            </p>
          ),
        },
        {
          heading: "8. הזכויות שלכם",
          content: (
            <>
              <p>בהתאם לדין החל, ייתכן שיש לכם זכות:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>לבקש גישה למידע האישי שלכם.</li>
                <li>לבקש תיקון של מידע שאינו מדויק.</li>
                <li>לבקש מחיקה של המידע האישי שלכם.</li>
                <li>להתנגד לשימושים מסוימים במידע שלכם.</li>
                <li>לבקש עותק של המידע שלכם.</li>
              </ul>

              <p className="mt-2">
                להגשת בקשת פרטיות, צרו איתנו קשר בכתובת{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . ייתכן שנצטרך לאמת את זהותכם לפני טיפול בבקשה.
              </p>
            </>
          ),
        },
        {
          heading: "9. פרטיות ילדים",
          content: (
            <p>
              האתר אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין מידע
              אישי מילדים מתחת לגיל 13. אם אתם סבורים שילד מסר לנו מידע אישי,
              צרו איתנו קשר וננקוט צעדים סבירים להסרתו.
            </p>
          ),
        },
        {
          heading: "10. אבטחה",
          content: (
            <p>
              אנו משתמשים באמצעים טכניים וארגוניים סבירים להגנה על מידע אישי,
              כולל גיבוב מאובטח של סיסמאות ועוגיות אימות מאובטחות כאשר הדבר
              מתאים. עם זאת, שום אתר, שרת או העברת מידע באינטרנט אינם מאובטחים
              לחלוטין, ולכן איננו יכולים להבטיח אבטחה מוחלטת.
            </p>
          ),
        },
        {
          heading: "11. איננו מוכרים את המידע שלכם",
          content: (
            <p>איננו מוכרים או משכירים את המידע האישי שלכם לצדדים שלישיים.</p>
          ),
        },
        {
          heading: "12. משתמשים בינלאומיים",
          content: (
            <p>
              האתר מופעל מישראל. אם אתם ניגשים לאתר ממדינה אחרת, ייתכן שהמידע
              שלכם יעובד בישראל או במדינות אחרות שבהן פועלים ספקי השירותים
              שלנו. במדינות אלו עשויים לחול דיני הגנת מידע שונים מאלו שבמדינתכם.
            </p>
          ),
        },
        {
          heading: "13. שינויים במדיניות זו",
          content: (
            <p>
              אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. בעת עדכון המדיניות,
              נשנה את תאריך “עודכן לאחרונה” בראש העמוד. המשך שימוש באתר לאחר
              פרסום השינויים מהווה הסכמה למדיניות המעודכנת.
            </p>
          ),
        },
        {
          heading: "14. צור קשר",
          content: (
            <p>
              לשאלות או בקשות בנושא מדיניות פרטיות זו, ניתן ליצור איתנו קשר
              בכתובת{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
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
      title="سياسة الخصوصية"
      subtitle="توضح هذه السياسة ما هي المعلومات التي نجمعها، وكيف نستخدمها، وما الخيارات المتاحة لك."
      lastUpdated="آخر تحديث: 11 مايو 2026"
      icon="🔒"
      sections={[
        {
          heading: "1. من نحن",
          content: (
            <p>
              دليل الجولان، المعروف أيضاً باسم Golan Wiki، هو منصة سياحية
              واكتشافية محلية متاحة على <strong>www.golanwiki.com</strong>.
              للاستفسارات المتعلقة بالخصوصية، يمكنك التواصل معنا عبر{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ),
        },
        {
          heading: "2. المعلومات التي نجمعها",
          content: (
            <>
              <p>قد نجمع الأنواع التالية من المعلومات:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني،
                  وكلمة المرور المخزنة بشكل آمن بعد تشفيرها/تجزئتها.
                </li>
                <li>
                  <strong>بيانات الملف الشخصي:</strong> رقم الهاتف الاختياري
                  وصورة الملف الشخصي.
                </li>
                <li>
                  <strong>نشاط المستخدم:</strong> الأماكن المفضلة، التعليقات،
                  المراجعات، التقييمات، الأماكن المحفوظة والتفاعلات المشابهة.
                </li>
                <li>
                  <strong>بيانات الأعمال:</strong> اسم النشاط التجاري، الوصف،
                  العنوان، معلومات الاتصال، الروابط، الصور ومعلومات القائمة.
                </li>
                <li>
                  <strong>الصور:</strong> صور الملف الشخصي أو صور الأماكن أو
                  صور الأعمال التي يتم رفعها، وقد يتم تخزينها باستخدام
                  Cloudinary.
                </li>
                <li>
                  <strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفح، نوع
                  الجهاز، تفضيل اللغة، الصفحات التي تمت زيارتها وبيانات الاستخدام
                  العامة.
                </li>
                <li>
                  <strong>بيانات التحليلات:</strong> مشاهدات الصفحات، النقرات
                  وأحداث الأداء من خلال أدوات مثل PostHog و/أو Vercel
                  Analytics.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "3. ملفات تعريف الارتباط",
          content: (
            <p>
              نستخدم ملفات تعريف الارتباط وتقنيات مشابهة للحفاظ على جلسة تسجيل
              الدخول، تذكّر تفضيلات اللغة، تحسين الأمان، فهم استخدام الموقع
              وتحسين الأداء. لمزيد من التفاصيل، يرجى قراءة سياسة ملفات تعريف
              الارتباط الخاصة بنا.
            </p>
          ),
        },
        {
          heading: "4. كيف نستخدم معلوماتك",
          content: (
            <>
              <p>نستخدم معلوماتك من أجل:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>إنشاء حسابك وإدارته.</li>
                <li>إبقائك مسجلاً الدخول وحماية حسابك.</li>
                <li>حفظ الأماكن المفضلة لديك.</li>
                <li>عرض التعليقات والمراجعات والتقييمات والمحتوى العام.</li>
                <li>نشر وإدارة قوائم الأماكن وقوائم الأعمال.</li>
                <li>تشغيل الموقع وتحسينه وتأمينه وصيانته.</li>
                <li>تحليل استخدام الموقع وأدائه.</li>
                <li>الرد على طلبات الدعم أو الرسائل التي ترسلها.</li>
                <li>منع الرسائل المزعجة والاحتيال وإساءة الاستخدام والوصول غير المصرح به.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "5. المحتوى العام",
          content: (
            <p>
              قد تكون التعليقات والمراجعات والتقييمات وقوائم الأعمال وبعض
              معلومات الملف الشخصي مرئية للمستخدمين الآخرين. قد يظهر اسمك
              المعروض بجانب المحتوى الذي تقدمه. لا تُدرج معلومات حساسة أو خاصة
              في المنشورات العامة.
            </p>
          ),
        },
        {
          heading: "6. خدمات الطرف الثالث",
          content: (
            <>
              <p>
                قد نستخدم خدمات طرف ثالث موثوقة لتشغيل الموقع وتحسينه، بما في
                ذلك:
              </p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Vercel</strong> — الاستضافة والنشر.
                </li>
                <li>
                  <strong>MongoDB</strong> — تخزين قاعدة البيانات.
                </li>
                <li>
                  <strong>Cloudinary</strong> — استضافة الصور ومعالجتها.
                </li>
                <li>
                  <strong>PostHog / Vercel Analytics</strong> — التحليلات وقياس
                  الأداء.
                </li>
                <li>
                  <strong>مزودو خدمات البريد الإلكتروني</strong> — إذا تم
                  استخدامهم لاحقاً لتأكيد الحساب، إعادة تعيين كلمة المرور أو
                  رسائل الدعم.
                </li>
              </ul>

              <p className="mt-2">
                قد تعالج هذه الخدمات معلومات محدودة فقط بالقدر اللازم لتقديم
                خدماتها لنا.
              </p>
            </>
          ),
        },
        {
          heading: "7. الاحتفاظ بالبيانات",
          content: (
            <p>
              نحتفظ بالمعلومات الشخصية فقط طالما كان ذلك ضرورياً لتشغيل الموقع،
              تقديم الخدمات، الحفاظ على الأمان، الالتزام بالمتطلبات القانونية،
              حل النزاعات وتطبيق شروطنا. إذا طلبت حذف حسابك أو معلوماتك الشخصية،
              سنقوم بإزالتها خلال وقت معقول، ما لم نكن بحاجة إلى الاحتفاظ ببعض
              المعلومات لأسباب قانونية أو أمنية أو لمنع الاحتيال أو للنسخ
              الاحتياطي أو لأسباب تشغيلية مشروعة.
            </p>
          ),
        },
        {
          heading: "8. حقوقك",
          content: (
            <>
              <p>وفقاً للقانون المعمول به، قد يكون لك الحق في:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>طلب الوصول إلى معلوماتك الشخصية.</li>
                <li>طلب تصحيح المعلومات غير الدقيقة.</li>
                <li>طلب حذف معلوماتك الشخصية.</li>
                <li>الاعتراض على استخدامات معينة لمعلوماتك.</li>
                <li>طلب نسخة من معلوماتك.</li>
              </ul>

              <p className="mt-2">
                لتقديم طلب متعلق بالخصوصية، تواصل معنا عبر{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
                . قد نحتاج إلى التحقق من هويتك قبل معالجة طلبك.
              </p>
            </>
          ),
        },
        {
          heading: "9. خصوصية الأطفال",
          content: (
            <p>
              الموقع غير مخصص للأطفال دون سن 13 عاماً. نحن لا نجمع عن قصد
              معلومات شخصية من الأطفال دون 13 عاماً. إذا كنت تعتقد أن طفلاً قدم
              لنا معلومات شخصية، تواصل معنا وسنتخذ خطوات معقولة لإزالتها.
            </p>
          ),
        },
        {
          heading: "10. الأمان",
          content: (
            <p>
              نستخدم إجراءات تقنية وتنظيمية معقولة لحماية المعلومات الشخصية، بما
              في ذلك تخزين كلمات المرور بطريقة آمنة واستخدام ملفات تعريف ارتباط
              آمنة للمصادقة عند الحاجة. ومع ذلك، لا يوجد موقع أو خادم أو نقل
              بيانات عبر الإنترنت آمن بشكل كامل، لذلك لا يمكننا ضمان الأمان
              المطلق.
            </p>
          ),
        },
        {
          heading: "11. لا نبيع بياناتك",
          content: (
            <p>نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي طرف ثالث.</p>
          ),
        },
        {
          heading: "12. المستخدمون الدوليون",
          content: (
            <p>
              يتم تشغيل الموقع من إسرائيل. إذا وصلت إلى الموقع من دولة أخرى،
              فقد تتم معالجة معلوماتك في إسرائيل أو في دول أخرى يعمل فيها مزودو
              الخدمات لدينا. قد تكون قوانين حماية البيانات في هذه الدول مختلفة
              عن قوانين بلدك.
            </p>
          ),
        },
        {
          heading: "13. التغييرات على هذه السياسة",
          content: (
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. عند تحديثها، سنقوم
              بتغيير تاريخ “آخر تحديث” في أعلى الصفحة. استمرارك في استخدام
              الموقع بعد نشر التغييرات يعني موافقتك على السياسة المحدّثة.
            </p>
          ),
        },
        {
          heading: "14. التواصل",
          content: (
            <p>
              للأسئلة أو الطلبات المتعلقة بسياسة الخصوصية هذه، يمكنك التواصل
              معنا عبر{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
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

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (lang === "he") return <HeContent />;
  if (lang === "ar") return <ArContent />;

  return <EnContent />;
}