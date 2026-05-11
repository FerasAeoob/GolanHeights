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
    en: "Terms of Use | Golan Wiki",
    he: "תנאי שימוש | Golan Wiki",
    ar: "شروط الاستخدام | Golan Wiki",
  };

  const descs: Record<string, string> = {
    en: "Read the terms and conditions for using Golan Wiki.",
    he: "קראו את תנאי השימוש של Golan Wiki.",
    ar: "اقرأ شروط وأحكام استخدام Golan Wiki.",
  };

  return {
    title: titles[lang] ?? titles.en,
    description: descs[lang] ?? descs.en,
    alternates: {
      canonical: `${SITE_URL}/${lang}/terms-of-use`,
    },
  };
}

function EnContent() {
  return (
    <LegalPageLayout
      title="Terms of Use"
      subtitle="By using Golan Wiki, you agree to these terms. Please read them carefully."
      lastUpdated="Last updated: May 11, 2026"
      icon="📋"
      sections={[
        {
          heading: "1. Acceptance of Terms",
          content: (
            <p>
              By accessing or using <strong>www.golanwiki.com</strong> or any
              related page, feature, or service, you agree to be bound by these
              Terms of Use. If you do not agree, please stop using the Website.
            </p>
          ),
        },
        {
          heading: "2. Purpose of the Website",
          content: (
            <p>
              Golan Wiki is a local tourism and discovery platform for
              the Golan region. We help users discover places, restaurants,
              nature spots, viewpoints, activities, stays, and local businesses.
            </p>
          ),
        },
        {
          heading: "3. Accuracy of Information",
          content: (
            <>
              <p>
                Place listings, business information, opening hours, prices,
                photos, directions, availability, and other details on the
                Website may be inaccurate, outdated, incomplete, or changed
                without notice.
              </p>

              <p className="mt-2">
                Some information may come from public sources, business owners,
                users, or third parties. We try to provide useful information,
                but we do not guarantee that any information on the Website is
                accurate, complete, or current.
              </p>

              <p className="mt-2 font-medium text-zinc-800">
                You are solely responsible for verifying opening hours, prices,
                availability, safety conditions, directions, and any other
                important details before visiting any place or relying on any
                information from the Website.
              </p>
            </>
          ),
        },
        {
          heading: "4. User Accounts",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>You must provide accurate and current information when creating an account.</li>
              <li>You are responsible for keeping your password secure.</li>
              <li>You are responsible for any activity that happens through your account.</li>
              <li>You must not share your account with others or use another person’s account without permission.</li>
              <li>You must be at least 13 years old to use the Website.</li>
              <li>We may suspend or delete accounts that violate these Terms or misuse the Website.</li>
            </ul>
          ),
        },
        {
          heading: "5. User Responsibilities",
          content: (
            <>
              <p>When using the Website, you agree not to:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Post fake, misleading, offensive, or unlawful content.</li>
                <li>Post spam, unauthorized advertising, or abusive messages.</li>
                <li>Harass, threaten, abuse, or harm other users.</li>
                <li>Upload or share content that violates copyright, privacy rights, or other legal rights.</li>
                <li>Use the Website for any unlawful, harmful, or fraudulent purpose.</li>
                <li>Attempt to hack, disrupt, overload, scrape, or misuse the Website or its systems.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. Comments, Reviews, and Ratings",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>You are responsible for any comment, review, rating, or other content you submit.</li>
              <li>Reviews and ratings must be honest and based on a genuine experience.</li>
              <li>You must not post fake reviews, defamatory claims, personal attacks, hate speech, or misleading content.</li>
              <li>We may edit, hide, or remove content that violates these Terms, without prior notice.</li>
            </ul>
          ),
        },
        {
          heading: "7. Business Listings",
          content: (
            <p>
              Businesses listed on the Website are shown for informational
              purposes only. We do not guarantee the quality, safety, prices,
              availability, services, or products of any listed business.
              Business owners are responsible for the accuracy of the
              information they provide, including names, descriptions, images,
              opening hours, locations, prices, links, and contact details.
            </p>
          ),
        },
        {
          heading: "8. Submitted Content and Images",
          content: (
            <>
              <p>
                By submitting photos, text, business information, reviews, or
                other content to the Website, you confirm that you own the
                necessary rights or have legal permission to submit and publish
                that content.
              </p>

              <p className="mt-2">
                By submitting content, you grant Golan Wiki a
                non-exclusive, worldwide, royalty-free license to display, use,
                store, reproduce, resize, crop, compress, adapt, and technically
                modify that content as needed to operate and present the
                Website.
              </p>

              <p className="mt-2">
                This content may appear on place pages, cards, search results,
                business listings, promotional areas, or other parts of the
                Website related to the service.
              </p>
            </>
          ),
        },
        {
          heading: "9. Intellectual Property",
          content: (
            <>
              <p>
                The Website design, branding, logo, interface, original text,
                layout, and original visual elements are owned by Golan Heights
                Guide or its respective rights holders and may not be copied,
                reproduced, redistributed, or used commercially without prior
                permission.
              </p>

              <p className="mt-2">
                User-submitted content remains owned by its original owner, but
                may be used by the Website according to the license described in
                these Terms.
              </p>
            </>
          ),
        },
        {
          heading: "10. Service Availability",
          content: (
            <p>
              We do not guarantee that the Website will always be available,
              uninterrupted, secure, or error-free. The Website may be
              temporarily unavailable due to maintenance, updates, technical
              issues, security reasons, or circumstances beyond our control.
            </p>
          ),
        },
        {
          heading: "11. Limitation of Liability",
          content: (
            <p>
              To the maximum extent permitted by law, Golan Wiki and
              the people operating it are not liable for any direct, indirect,
              incidental, consequential, or special damages arising from your use
              of the Website, reliance on information found on the Website,
              visits to places, dealings with businesses, external links,
              user-submitted content, or service interruptions.
            </p>
          ),
        },
        {
          heading: "12. External Links",
          content: (
            <p>
              The Website may contain links to third-party websites, maps,
              booking pages, social media pages, or other external services. We
              are not responsible for the content, accuracy, privacy practices,
              terms, or actions of those third-party websites or services.
            </p>
          ),
        },
        {
          heading: "13. Changes to These Terms",
          content: (
            <p>
              We may update these Terms from time to time. When we update them,
              we will change the “Last updated” date at the top of this page.
              Continued use of the Website after changes are posted means you
              accept the updated Terms.
            </p>
          ),
        },
        {
          heading: "14. Governing Law",
          content: (
            <p>
              These Terms are governed by the applicable laws of Israel, unless
              mandatory law requires otherwise.
            </p>
          ),
        },
        {
          heading: "15. Contact",
          content: (
            <p>
              For questions about these Terms, contact us at{" "}
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
      title="תנאי שימוש"
      subtitle="בשימוש בGolan Wiki אתם מסכימים לתנאים אלו. אנא קראו אותם בעיון."
      lastUpdated="עודכן לאחרונה: 11 במאי 2026"
      icon="📋"
      sections={[
        {
          heading: "1. הסכמה לתנאים",
          content: (
            <p>
              בגישה אל <strong>www.golanwiki.com</strong> או בשימוש בכל עמוד,
              תכונה או שירות הקשורים לאתר, אתם מסכימים להיות כפופים לתנאי
              שימוש אלו. אם אינכם מסכימים לתנאים, אנא הפסיקו להשתמש באתר.
            </p>
          ),
        },
        {
          heading: "2. מטרת האתר",
          content: (
            <p>
              Golan Wiki הוא פלטפורמת תיירות וגילוי מקומית לאזור הגולן. אנו
              עוזרים למשתמשים לגלות מקומות, מסעדות, אתרי טבע, תצפיות,
              פעילויות, מקומות אירוח ועסקים מקומיים.
            </p>
          ),
        },
        {
          heading: "3. דיוק המידע",
          content: (
            <>
              <p>
                רישומי מקומות, מידע על עסקים, שעות פתיחה, מחירים, תמונות,
                הוראות הגעה, זמינות ופרטים נוספים באתר עשויים להיות לא
                מדויקים, מיושנים, חלקיים או להשתנות ללא הודעה מוקדמת.
              </p>

              <p className="mt-2">
                חלק מהמידע עשוי להגיע ממקורות ציבוריים, בעלי עסקים, משתמשים או
                צדדים שלישיים. אנו משתדלים לספק מידע שימושי, אך איננו מבטיחים
                שכל מידע באתר מדויק, מלא או עדכני.
              </p>

              <p className="mt-2 font-medium text-zinc-800">
                האחריות הבלעדית לבדוק שעות פתיחה, מחירים, זמינות, תנאי בטיחות,
                הוראות הגעה וכל פרט חשוב אחר לפני ביקור במקום או הסתמכות על
                מידע מהאתר היא שלכם בלבד.
              </p>
            </>
          ),
        },
        {
          heading: "4. חשבונות משתמש",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>יש לספק מידע מדויק ועדכני בעת יצירת חשבון.</li>
              <li>אתם אחראים לשמור על אבטחת הסיסמה שלכם.</li>
              <li>אתם אחראים לכל פעילות המתבצעת דרך החשבון שלכם.</li>
              <li>אין לשתף את החשבון עם אחרים או להשתמש בחשבון של אדם אחר ללא רשות.</li>
              <li>עליכם להיות בני 13 לפחות כדי להשתמש באתר.</li>
              <li>אנו רשאים להשעות או למחוק חשבונות שמפרים תנאים אלו או עושים שימוש לרעה באתר.</li>
            </ul>
          ),
        },
        {
          heading: "5. אחריות המשתמש",
          content: (
            <>
              <p>בעת השימוש באתר, אתם מסכימים שלא:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>לפרסם תוכן מזויף, מטעה, פוגעני או בלתי חוקי.</li>
                <li>לפרסם ספאם, פרסום לא מורשה או הודעות פוגעניות.</li>
                <li>להטריד, לאיים, לפגוע או להתעלל במשתמשים אחרים.</li>
                <li>להעלות או לשתף תוכן שמפר זכויות יוצרים, פרטיות או זכויות משפטיות אחרות.</li>
                <li>להשתמש באתר לכל מטרה בלתי חוקית, מזיקה או הונאתית.</li>
                <li>לנסות לפרוץ, לשבש, להעמיס, לגרד מידע או לעשות שימוש לרעה באתר או במערכותיו.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. תגובות, ביקורות ודירוגים",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>אתם אחראים לכל תגובה, ביקורת, דירוג או תוכן אחר שאתם מגישים.</li>
              <li>ביקורות ודירוגים חייבים להיות כנים ומבוססים על חוויה אמיתית.</li>
              <li>אין לפרסם ביקורות מזויפות, טענות משמיצות, התקפות אישיות, דברי שנאה או תוכן מטעה.</li>
              <li>אנו רשאים לערוך, להסתיר או להסיר תוכן שמפר תנאים אלו, ללא הודעה מוקדמת.</li>
            </ul>
          ),
        },
        {
          heading: "7. רישומי עסקים",
          content: (
            <p>
              עסקים המופיעים באתר מוצגים למטרות מידע בלבד. איננו מבטיחים את
              איכותם, בטיחותם, מחיריהם, זמינותם, שירותיהם או מוצריהם של עסקים
              אלו. בעלי עסקים אחראים לדיוק המידע שהם מספקים, כולל שמות,
              תיאורים, תמונות, שעות פתיחה, מיקומים, מחירים, קישורים ופרטי קשר.
            </p>
          ),
        },
        {
          heading: "8. תוכן ותמונות שנשלחו",
          content: (
            <>
              <p>
                בהגשת תמונות, טקסט, מידע עסקי, ביקורות או כל תוכן אחר לאתר,
                אתם מאשרים שיש לכם את הזכויות הנדרשות או הרשאה חוקית להגיש
                ולפרסם תוכן זה.
              </p>

              <p className="mt-2">
                בהגשת תוכן, אתם מעניקים לGolan Wiki רישיון לא בלעדי, עולמי
                וללא תמלוגים להציג, להשתמש, לאחסן, לשכפל, לשנות גודל, לחתוך,
                לדחוס, להתאים ולבצע שינויים טכניים בתוכן לפי הצורך לצורך
                הפעלת והצגת האתר.
              </p>

              <p className="mt-2">
                תוכן זה עשוי להופיע בעמודי מקומות, כרטיסים, תוצאות חיפוש,
                רישומי עסקים, אזורים שיווקיים או חלקים אחרים באתר הקשורים
                לשירות.
              </p>
            </>
          ),
        },
        {
          heading: "9. קניין רוחני",
          content: (
            <>
              <p>
                עיצוב האתר, המיתוג, הלוגו, הממשק, הטקסט המקורי, הפריסה
                והאלמנטים החזותיים המקוריים שייכים לGolan Wiki או לבעלי
                הזכויות המתאימים, ואין להעתיקם, לשכפלם, להפיצם מחדש או להשתמש
                בהם מסחרית ללא אישור מראש.
              </p>

              <p className="mt-2">
                תוכן שנשלח על ידי משתמשים נשאר בבעלות בעליו המקוריים, אך האתר
                רשאי להשתמש בו בהתאם לרישיון המתואר בתנאים אלו.
              </p>
            </>
          ),
        },
        {
          heading: "10. זמינות השירות",
          content: (
            <p>
              איננו מבטיחים שהאתר יהיה זמין תמיד, רציף, מאובטח או נקי משגיאות.
              האתר עשוי להיות בלתי זמין באופן זמני עקב תחזוקה, עדכונים, תקלות
              טכניות, סיבות אבטחה או נסיבות שאינן בשליטתנו.
            </p>
          ),
        },
        {
          heading: "11. הגבלת אחריות",
          content: (
            <p>
              במידה המרבית המותרת על פי דין, Golan Wiki והאנשים המפעילים אותו
              אינם אחראים לכל נזק ישיר, עקיף, מקרי, תוצאתי או מיוחד הנובע
              מהשימוש שלכם באתר, הסתמכות על מידע באתר, ביקור במקומות, התקשרות
              עם עסקים, קישורים חיצוניים, תוכן שנשלח על ידי משתמשים או הפסקות
              בשירות.
            </p>
          ),
        },
        {
          heading: "12. קישורים חיצוניים",
          content: (
            <p>
              האתר עשוי לכלול קישורים לאתרי צד שלישי, מפות, עמודי הזמנות,
              עמודי מדיה חברתית או שירותים חיצוניים אחרים. איננו אחראים
              לתוכן, לדיוק, למדיניות הפרטיות, לתנאים או לפעולות של אתרים או
              שירותים אלו.
            </p>
          ),
        },
        {
          heading: "13. שינויים בתנאים",
          content: (
            <p>
              אנו עשויים לעדכן תנאים אלו מעת לעת. בעת עדכון התנאים, נשנה את
              תאריך “עודכן לאחרונה” בראש העמוד. המשך שימוש באתר לאחר פרסום
              השינויים מהווה הסכמה לתנאים המעודכנים.
            </p>
          ),
        },
        {
          heading: "14. הדין החל",
          content: (
            <p>
              תנאים אלו כפופים לדינים החלים בישראל, אלא אם דין מחייב קובע אחרת.
            </p>
          ),
        },
        {
          heading: "15. צור קשר",
          content: (
            <p>
              לשאלות בנוגע לתנאים אלו, ניתן ליצור איתנו קשר בכתובת{" "}
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
      title="شروط الاستخدام"
      subtitle="باستخدام Golan Wiki، فأنت توافق على هذه الشروط. يرجى قراءتها بعناية."
      lastUpdated="آخر تحديث: 11 مايو 2026"
      icon="📋"
      sections={[
        {
          heading: "1. قبول الشروط",
          content: (
            <p>
              بالوصول إلى <strong>www.golanwiki.com</strong> أو استخدام أي صفحة
              أو ميزة أو خدمة مرتبطة بالموقع، فأنت توافق على الالتزام بشروط
              الاستخدام هذه. إذا كنت لا توافق على هذه الشروط، يرجى التوقف عن
              استخدام الموقع.
            </p>
          ),
        },
        {
          heading: "2. هدف الموقع",
          content: (
            <p>
              Golan Wiki هو منصة سياحية واكتشافية محلية لمنطقة الجولان. نساعد
              المستخدمين على اكتشاف الأماكن والمطاعم والمواقع الطبيعية
              والإطلالات والأنشطة وأماكن الإقامة والأعمال المحلية.
            </p>
          ),
        },
        {
          heading: "3. دقة المعلومات",
          content: (
            <>
              <p>
                قد تكون قوائم الأماكن، معلومات الأعمال، ساعات العمل، الأسعار،
                الصور، الاتجاهات، التوفر أو أي تفاصيل أخرى على الموقع غير دقيقة
                أو قديمة أو غير مكتملة أو قابلة للتغيير دون إشعار مسبق.
              </p>

              <p className="mt-2">
                قد يتم الحصول على بعض المعلومات من مصادر عامة، أصحاب أعمال،
                مستخدمين أو أطراف ثالثة. نحن نحاول تقديم معلومات مفيدة، لكننا
                لا نضمن أن تكون أي معلومات على الموقع دقيقة أو كاملة أو محدثة.
              </p>

              <p className="mt-2 font-medium text-zinc-800">
                أنت المسؤول الوحيد عن التحقق من ساعات العمل، الأسعار، التوفر،
                شروط السلامة، الاتجاهات وأي تفاصيل مهمة أخرى قبل زيارة أي مكان
                أو الاعتماد على أي معلومة من الموقع.
              </p>
            </>
          ),
        },
        {
          heading: "4. حسابات المستخدمين",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>يجب تقديم معلومات دقيقة ومحدثة عند إنشاء الحساب.</li>
              <li>أنت مسؤول عن الحفاظ على أمان كلمة مرورك.</li>
              <li>أنت مسؤول عن أي نشاط يتم من خلال حسابك.</li>
              <li>لا يجوز مشاركة حسابك مع الآخرين أو استخدام حساب شخص آخر دون إذن.</li>
              <li>يجب أن يكون عمرك 13 عاماً على الأقل لاستخدام الموقع.</li>
              <li>نحتفظ بحق تعليق أو حذف الحسابات التي تنتهك هذه الشروط أو تسيء استخدام الموقع.</li>
            </ul>
          ),
        },
        {
          heading: "5. مسؤوليات المستخدم",
          content: (
            <>
              <p>عند استخدام الموقع، فإنك توافق على عدم:</p>

              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>نشر محتوى مزيف أو مضلل أو مسيء أو غير قانوني.</li>
                <li>نشر رسائل مزعجة أو إعلانات غير مصرح بها أو رسائل مسيئة.</li>
                <li>مضايقة أو تهديد أو الإساءة إلى مستخدمين آخرين.</li>
                <li>رفع أو مشاركة محتوى ينتهك حقوق الملكية الفكرية أو الخصوصية أو أي حقوق قانونية أخرى.</li>
                <li>استخدام الموقع لأي غرض غير قانوني أو ضار أو احتيالي.</li>
                <li>محاولة اختراق الموقع أو تعطيله أو إرهاقه أو استخراج بياناته آلياً أو إساءة استخدام أنظمته.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. التعليقات والتقييمات",
          content: (
            <ul className="list-disc list-inside space-y-1">
              <li>أنت مسؤول عن أي تعليق أو مراجعة أو تقييم أو محتوى آخر تقدمه.</li>
              <li>يجب أن تكون المراجعات والتقييمات صادقة ومبنية على تجربة حقيقية.</li>
              <li>لا يجوز نشر تقييمات مزيفة أو ادعاءات تشهيرية أو هجمات شخصية أو خطاب كراهية أو محتوى مضلل.</li>
              <li>نحتفظ بحق تعديل أو إخفاء أو إزالة أي محتوى ينتهك هذه الشروط، دون إشعار مسبق.</li>
            </ul>
          ),
        },
        {
          heading: "7. قوائم الأعمال",
          content: (
            <p>
              الأعمال المدرجة في الموقع معروضة لأغراض إعلامية فقط. نحن لا نضمن
              جودة أو سلامة أو أسعار أو توفر أو خدمات أو منتجات أي عمل مدرج.
              أصحاب الأعمال مسؤولون عن دقة المعلومات التي يقدمونها، بما في ذلك
              الأسماء، الأوصاف، الصور، ساعات العمل، المواقع، الأسعار، الروابط
              ووسائل التواصل.
            </p>
          ),
        },
        {
          heading: "8. المحتوى والصور المقدّمة",
          content: (
            <>
              <p>
                عند تقديم صور أو نصوص أو معلومات أعمال أو مراجعات أو أي محتوى
                آخر للموقع، فإنك تؤكد أنك تملك الحقوق اللازمة لهذا المحتوى أو
                لديك إذن قانوني لتقديمه ونشره.
              </p>

              <p className="mt-2">
                بتقديمك للمحتوى، تمنح Golan Wiki ترخيصاً غير حصري، عالمياً،
                مجانياً، ودون مطالبة برسوم لعرض هذا المحتوى واستخدامه وتخزينه
                ونسخه وتغيير حجمه وقصه وضغطه وتكييفه وتعديله تقنياً عند الحاجة
                لتشغيل الموقع وعرضه بشكل مناسب.
              </p>

              <p className="mt-2">
                قد يظهر هذا المحتوى في صفحات الأماكن، البطاقات، نتائج البحث،
                قوائم الأعمال، المناطق الترويجية أو أي جزء آخر من الموقع متعلق
                بالخدمة.
              </p>
            </>
          ),
        },
        {
          heading: "9. الملكية الفكرية",
          content: (
            <>
              <p>
                تصميم الموقع، العلامة التجارية، الشعار، الواجهة، النصوص الأصلية،
                التخطيط والعناصر المرئية الأصلية مملوكة لGolan Wiki أو لأصحاب
                الحقوق المعنيين، ولا يجوز نسخها أو إعادة إنتاجها أو إعادة
                توزيعها أو استخدامها تجارياً دون إذن مسبق.
              </p>

              <p className="mt-2">
                المحتوى المقدّم من المستخدمين يبقى مملوكاً لصاحبه الأصلي، لكن
                يجوز للموقع استخدامه وفقاً للترخيص الموضح في هذه الشروط.
              </p>
            </>
          ),
        },
        {
          heading: "10. توفر الخدمة",
          content: (
            <p>
              لا نضمن أن يكون الموقع متاحاً دائماً أو مستمراً أو آمناً أو خالياً
              من الأخطاء. قد يكون الموقع غير متاح مؤقتاً بسبب الصيانة أو
              التحديثات أو الأعطال التقنية أو أسباب أمنية أو ظروف خارجة عن
              سيطرتنا.
            </p>
          ),
        },
        {
          heading: "11. تحديد المسؤولية",
          content: (
            <p>
              بالقدر الأقصى المسموح به قانوناً، لا يتحمل Golan Wiki أو
              القائمون عليه أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة أو
              عرضية أو تبعية أو خاصة تنشأ عن استخدامك للموقع أو اعتمادك على
              معلومات موجودة فيه أو زيارة أماكن أو التعامل مع أعمال تجارية أو
              استخدام روابط خارجية أو محتوى مقدم من المستخدمين أو انقطاع
              الخدمة.
            </p>
          ),
        },
        {
          heading: "12. الروابط الخارجية",
          content: (
            <p>
              قد يحتوي الموقع على روابط لمواقع طرف ثالث أو خرائط أو صفحات حجز
              أو صفحات تواصل اجتماعي أو خدمات خارجية أخرى. نحن لسنا مسؤولين عن
              محتوى تلك المواقع أو دقتها أو ممارسات الخصوصية أو الشروط أو
              التصرفات الخاصة بها.
            </p>
          ),
        },
        {
          heading: "13. التغييرات على هذه الشروط",
          content: (
            <p>
              قد نقوم بتحديث هذه الشروط من وقت لآخر. عند تحديثها، سنقوم بتغيير
              تاريخ “آخر تحديث” في أعلى الصفحة. استمرارك في استخدام الموقع بعد
              نشر التغييرات يعني موافقتك على الشروط المحدّثة.
            </p>
          ),
        },
        {
          heading: "14. القانون المعمول به",
          content: (
            <p>
              تخضع هذه الشروط للقوانين المعمول بها في إسرائيل، ما لم ينص قانون
              إلزامي على خلاف ذلك.
            </p>
          ),
        },
        {
          heading: "15. التواصل",
          content: (
            <p>
              للاستفسارات المتعلقة بهذه الشروط، يمكنك التواصل معنا عبر{" "}
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

export default async function TermsOfUsePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (lang === "he") return <HeContent />;
  if (lang === "ar") return <ArContent />;

  return <EnContent />;
}