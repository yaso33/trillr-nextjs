import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

// Centralized translations
export const translations = {
  en: {
    // Header
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',

    // Hero Section
    heroTitle: 'The Space to Be You.',
    heroSubtitle:
      "Don’t just scroll — belong. Connect with the <em class='text-orange-400'>creators</em>, the <em class='text-orange-400'>thinkers</em>, and the community you’ve been looking for.",
    getStarted: 'Get Started',

    // Features Section
    whyTrillr: 'Why Trillr?',
    privacyFirst: 'Privacy First',
    privacyFirstDescription:
      'Your data is yours. We are committed to protecting your privacy and giving you full control over your digital footprint.',
    communityDriven: 'Community Driven',
    communityDrivenDescription:
      'Grow with a community that values authenticity. We build features to empower our users, not to profit at their expense.',
    innovativeTools: 'Innovative Tools',
    innovativeToolsDescription:
      'We provide simple, powerful tools for complex ideas, allowing you to express your creativity without any limits.',

    // Auth Form Section
    signUp: 'Sign Up',
    login: 'Login',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    signupSuccess: 'Account created successfully! Please check your email to verify your account.',
    anErrorOccurred: 'An error occurred. Please try again.',

    // Verification Page
    verificationRequest: 'Verification Request',
    getVerified: 'Get the blue verification badge',
    step: 'Step',
    of: 'of',
    getVerifiedOnTrillr: 'Get Verified on Trillr',
    verificationAuthentic: 'The verification badge confirms your account is authentic and notable',
    protectIdentity: 'Protect your identity from impersonation',
    increaseCredibility: 'Increase your credibility',
    buildTrust: 'Build trust with your audience',
    chooseCategory: 'Choose Your Category',
    bestDescribes: 'Select the category that best describes you',
    contentCreator: 'Content Creator',
    celebrity: 'Celebrity',
    brandBusiness: 'Brand/Business',
    influencer: 'Influencer',
    identityVerification: 'Identity Verification',
    uploadId: 'Upload an official identity document',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    idDocument: 'ID Document',
    clickToUpload: 'Click to upload file',
    idInstructions: "Passport, ID card, or driver's license",
    proofOfNotability: 'Proof of Notability',
    tellUsAboutYou: 'Tell us about yourself and your social links',
    aboutYou: 'About You',
    aboutYouPlaceholder: 'Write a brief description about yourself...',
    socialLinks: 'Social Links',
    reviewRequest: 'Review Request',
    reviewInfo: 'Review your information before submitting',
    name: 'Name',
    category: 'Category',
    documents: 'Documents',
    agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
    confirmInfo: 'I confirm that all information provided is true and accurate',
    previous: 'Previous',
    next: 'Next',
    submitRequest: 'Submit Request',
    submitting: 'Submitting...',
    requestSubmitted: 'Request Submitted!',
    requestReview: 'We will review your request within 3-5 business days',
    backToSettings: 'Back to Settings',
    requestSubmittedThanks:
      'Thank you for submitting your verification request. We will review your information and contact you within 3-5 business days.',

    // Footer
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    allRightsReserved: 'All Rights Reserved.',

    // Profile Card
    followers: 'Followers',
    following: 'Following',
    joined: 'Joined',
    viewProfile: 'View Profile',
    block: 'Block',
    report: 'Report',

    // Errors
    'error.unauthorized': 'Please sign in to continue',
    'error.network': 'Please check your internet connection and try again',
    'error.unexpected': 'An unexpected error occurred',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account preferences',
    'settings.notifications': 'Notifications',
    'settings.notifications.desc': 'Manage your notification preferences',
    'settings.likes': 'Likes',
    'settings.likes.desc': 'Get notified when someone likes your post',
    'settings.comments': 'Comments',
    'settings.comments.desc': 'Get notified when someone comments',
    'settings.followers': 'New Followers',
    'settings.followers.desc': 'Get notified when someone follows you',
    'settings.messages': 'Direct Messages',
    'settings.messages.desc': 'Get notified for new messages',
    'settings.privacy': 'Privacy & Security',
    'settings.privacy.desc': 'Control who can see your content',
    'settings.private': 'Private Account',
    'settings.private.desc': 'Only approved followers can see your posts',
    'settings.hideActivity': 'Hide Activity Status',
    'settings.hideActivity.desc': "Don't show when you're online",
    'settings.allowTags': 'Allow People to Tag You',
    'settings.allowTags.desc': 'Let others tag you in posts and stories',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.blocked': 'Blocked Users',
    'settings.help': 'Help & Support',
    'settings.signout': 'Sign Out',
    'settings.updated': 'Setting updated',
    'settings.privacyUpdated': 'Your privacy settings have been updated',
    'settings.comingSoon': 'Coming soon!',
    'settings.selectLanguage': 'Select Language',
    'settings.selectLanguage.desc': 'Choose your preferred language',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'common.enabled': 'enabled',
    'common.disabled': 'disabled',

    // Onboarding Tour
    'onboarding.welcome.title': 'Welcome to Trillr!',
    'onboarding.welcome.intro': 'Let us guide you through some of the key features.',
    'onboarding.sidebar.intro':
      'This is your navigation sidebar. Access your feed, communities, and more from here.',
    'onboarding.newPost.intro':
      'Click here to create a new post and share your thoughts with the world.',
    'onboarding.profile.intro': 'This is your profile. Customize it to express yourself.',
    'onboarding.done.title': 'All set!',
    'onboarding.done.intro': 'Enjoy your journey on Trillr. We are excited to have you!',
  },
  ar: {
    // Header
    about: 'حول',
    faq: 'الأسئلة الشائعة',
    contact: 'اتصل بنا',

    // Hero Section
    heroTitle: 'المساحة التي تعبر عنك.',
    heroSubtitle:
      "لا تتصفح فقط - بل انتمي. تواصل مع <em class='text-orange-400'>المبدعين</em> و<em class='text-orange-400'>المفكرين</em> والمجتمع الذي تبحث عنه.",
    getStarted: 'ابدأ الآن',

    // Features Section
    whyTrillr: 'لماذا Trillr؟',
    privacyFirst: 'الخصوصية أولاً',
    privacyFirstDescription:
      'بياناتك ملك لك. نحن ملتزمون بحماية خصوصيتك ومنحك التحكم الكامل في بصمتك الرقمية.',
    communityDriven: 'مجتمع متكامل',
    communityDrivenDescription:
      'انمو مع مجتمع يقدر الأصالة. نحن نبني الميزات لتمكين مستخدمينا، وليس للربح على حسابهم.',
    innovativeTools: 'أدوات مبتكرة',
    innovativeToolsDescription:
      'نقدم أدوات بسيطة وقوية للأفكار المعقدة، مما يتيح لك التعبير عن إبداعك بلا أي حدود.',

    // Auth Form Section
    signUp: 'إنشاء حساب',
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    createAccount: 'إنشاء حساب',
    signupSuccess: 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل حسابك.',
    anErrorOccurred: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',

    // Verification Page
    verificationRequest: 'طلب التوثيق',
    getVerified: 'احصل على علامة التوثيق الزرقاء',
    step: 'الخطوة',
    of: 'من',
    getVerifiedOnTrillr: 'كن موثقاً على Trillr',
    verificationAuthentic: 'علامة التوثيق تؤكد أن حسابك أصلي وموثوق',
    protectIdentity: 'حماية هويتك من الانتحال',
    increaseCredibility: 'زيادة مصداقيتك',
    buildTrust: 'بناء ثقة جمهورك',
    chooseCategory: 'اختر فئتك',
    bestDescribes: 'حدد الفئة التي تصفك بشكل أفضل',
    contentCreator: 'صانع محتوى',
    celebrity: 'شخصية مشهورة',
    brandBusiness: 'علامة تجارية',
    influencer: 'مؤثر',
    identityVerification: 'التحقق من الهوية',
    uploadId: 'أرفق وثيقة هوية رسمية',
    fullName: 'الاسم الكامل',
    enterFullName: 'أدخل اسمك الكامل',
    idDocument: 'وثيقة الهوية',
    clickToUpload: 'انقر لرفع الملف',
    idInstructions: 'جواز سفر، بطاقة هوية، أو رخصة قيادة',
    proofOfNotability: 'إثبات الشهرة',
    tellUsAboutYou: 'أخبرنا عن نفسك وروابطك الاجتماعية',
    aboutYou: 'نبذة عنك',
    aboutYouPlaceholder: 'اكتب نبذة مختصرة عنك وعن عملك...',
    socialLinks: 'الروابط الاجتماعية',
    reviewRequest: 'مراجعة الطلب',
    reviewInfo: 'راجع معلوماتك قبل الإرسال',
    name: 'الاسم',
    category: 'الفئة',
    documents: 'الوثائق',
    agreeToTerms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    confirmInfo: 'أؤكد أن جميع المعلومات المقدمة صحيحة ودقيقة',
    previous: 'السابق',
    next: 'التالي',
    submitRequest: 'إرسال الطلب',
    submitting: 'جاري الإرسال...',
    requestSubmitted: 'تم إرسال طلبك!',
    requestReview: 'سنراجع طلبك خلال 3-5 أيام عمل',
    backToSettings: 'العودة للإعدادات',
    requestSubmittedThanks:
      'شكراً لتقديم طلب التوثيق. سنراجع معلوماتك ونتواصل معك خلال 3-5 أيام عمل.',

    // Footer
    termsOfService: 'شروط الخدمة',
    privacyPolicy: 'سياسة الخصوصية',
    allRightsReserved: 'جميع الحقوق محفوظة.',

    // Profile Card
    followers: 'المتابعون',
    following: 'يتابع',
    joined: 'تاريخ الانضمام',
    viewProfile: 'عرض الملف الشخصي',
    block: 'حظر',
    report: 'إبلاغ',

    // Errors
    'error.unauthorized': 'يرجى تسجيل الدخول للمتابعة',
    'error.network': 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى',
    'error.unexpected': 'حدث خطأ غير متوقع',

    // Settings
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'إدارة تفضيلات حسابك',
    'settings.notifications': 'الإشعارات',
    'settings.notifications.desc': 'إدارة تفضيلات الإشعارات',
    'settings.likes': 'الإعجابات',
    'settings.likes.desc': 'احصل على إشعار عندما يعجب شخص ما بمنشورك',
    'settings.comments': 'التعليقات',
    'settings.comments.desc': 'احصل على إشعار عندما يعلق شخص ما',
    'settings.followers': 'المتابعين الجدد',
    'settings.followers.desc': 'احصل على إشعار عندما يتابعك شخص ما',
    'settings.messages': 'الرسائل المباشرة',
    'settings.messages.desc': 'احصل على إشعار للرسائل الجديدة',
    'settings.privacy': 'الخصوصية والأمان',
    'settings.privacy.desc': 'تحكم في من يمكنه رؤية محتواك',
    'settings.private': 'حساب خاص',
    'settings.private.desc': 'فقط المتابعين المعتمدين يمكنهم رؤية منشوراتك',
    'settings.hideActivity': 'إخفاء حالة النشاط',
    'settings.hideActivity.desc': 'لا تظهر متى تكون متصلاً',
    'settings.allowTags': 'السماح للأشخاص بالإشارة إليك',
    'settings.allowTags.desc': 'دع الآخرين يشيرون إليك في المنشورات والستوري',
    'settings.appearance': 'المظهر',
    'settings.language': 'اللغة',
    'settings.blocked': 'المستخدمين المحظورين',
    'settings.help': 'المساعدة والدعم',
    'settings.signout': 'تسجيل الخروج',
    'settings.updated': 'تم تحديث الإعداد',
    'settings.privacyUpdated': 'تم تحديث إعدادات الخصوصية الخاصة بك',
    'settings.comingSoon': 'قريباً!',
    'settings.selectLanguage': 'اختر اللغة',
    'settings.selectLanguage.desc': 'اختر لغتك المفضلة',
    'language.english': 'English',
    'language.arabic': 'العربية',
    'common.enabled': 'مفعّل',
    'common.disabled': 'معطّل',

    // Onboarding Tour
    'onboarding.welcome.title': 'مرحباً بك في Trillr!',
    'onboarding.welcome.intro': 'دعنا نرشدك عبر أبرز الميزات.',
    'onboarding.sidebar.intro':
      'هذا هو الشريط الجانبي للتنقل. يمكنك الوصول إلى آخر الأخبار، والمجتمعات، والمزيد من هنا.',
    'onboarding.newPost.intro': 'انقر هنا لإنشاء منشور جديد ومشاركة أفكارك مع العالم.',
    'onboarding.profile.intro': 'هذا هو ملفك الشخصي. قم بتخصيصه ليعبر عنك.',
    'onboarding.done.title': 'أنت جاهز الآن!',
    'onboarding.done.intro': 'استمتع برحلتك في Trillr. نحن متحمسون لوجودك معنا!',
  },
}

type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  t: (key: string) => string
}

const LANGUAGE_STORAGE_KEY = 'buzly_language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored === 'ar' || stored === 'en') {
        return stored
      }
    }
    return 'en'
  })

  const isRTL = language === 'ar'

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language, isRTL])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    const translation = translations[language][key] || translations.en[key] || key
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
