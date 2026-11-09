const en = {
  "errors.event.required":
    "Event details are required for events & exhibitions",
  "errors.event.start_required": "Event start date is required",
  "errors.event.end_before_start":
    "Event end date must be on or after the start date",
  "errors.body.required": "Body content is required",
  "errors.title.required": "Title is required",
  "errors.venue.required": "Event venue is required",
  "errors.companies.load_failed": "Could not load companies",
  "errors.network":
    "Cannot reach the API (network/CORS). Check NEXT_PUBLIC_API_URL and that FRONTEND_ORIGINS includes this site origin.",
  "errors.code.UNAUTHENTICATED": "Invalid email or password",
  "errors.code.CSRF_INVALID": "Session expired. Please refresh and try again.",
  "errors.code.FORBIDDEN": "You do not have permission for this action",
  "errors.code.CONFLICT":
    "A record with the same unique value already exists",
  "errors.code.NOT_FOUND": "Record not found",
  "errors.code.RATE_LIMITED": "Too many attempts. Please wait and try again.",
  "errors.fallback": "Something went wrong",
  "errors.payload.invalid_message": "Invalid message payload",
  "errors.payload.invalid_download": "Invalid download payload",
  "errors.download.file_required": "A PDF file is required",
  "errors.download.restore_failed": "Failed to restore download",
  "errors.company.not_found": "Company not found",
  "errors.company.name_max": "Company name cannot exceed 100 characters",
  "errors.company.short_code_max":
    "Short name / code cannot exceed 12 characters",
  "errors.company.certification_invalid":
    "One or more certifications are not in the Certificates module",
  "errors.page.section_unknown": "Unknown page section",
  "errors.page.section_invalid": "Invalid section payload",
  "errors.page.sections_required": "Sections object is required",
  "errors.page.introductory_heading_required": "Introductory heading is required",
  "errors.page.section_removed": "This section has been removed from the page catalog",
  "errors.page.our_values_max_cards": "Our Values section cannot have more than 4 cards",
  "errors.page.saudi_manufacturing_max_features": "Saudi Manufacturing section cannot have more than 4 features",
  "errors.url.invalid": "Invalid URL format",
  "errors.mobile.invalid": "Mobile number must contain between 9 and 12 digits (0-9 only)",
  "errors.slug.in_use": "This slug is already in use. Please enter a unique slug.",
  "errors.slug.required": "Slug is required",
  "errors.file.required": "File is required",
  "errors.application.consent_required": "Data-processing consent is required",
  "errors.job.has_applications": "Cannot purge job while applications are linked",
  "errors.job.not_found": "Job not found",
  "errors.industry.not_found": "Industry not found",
  "errors.order.duplicate_ids": "Duplicate ids are not allowed in order list",
  "errors.order.invalid_ids": "One or more ids are invalid",
  "errors.order.required": "Ids are required",
  "errors.payload.invalid_seo": "Invalid SEO payload",
  "errors.seo.url_slug_format": "URL slug must start with /",
  "errors.payload.invalid_settings": "Invalid settings payload",
  "errors.html.not_allowed": "HTML tags are not allowed in this field",
};

const ar = {
  "errors.event.required": "تفاصيل الفعالية مطلوبة لأقسام الفعاليات والمعارض",
  "errors.event.start_required": "تاريخ بداية الفعالية مطلوب",
  "errors.event.end_before_start":
    "تاريخ نهاية الفعالية يجب أن يكون في نفس يوم البداية أو بعده",
  "errors.body.required": "محتوى المقال مطلوب",
  "errors.title.required": "العنوان مطلوب",
  "errors.venue.required": "مكان الفعالية مطلوب",
  "errors.companies.load_failed": "تعذّر تحميل الشركات",
  "errors.network":
    "تعذّر الاتصال بالـ API. تحقق من NEXT_PUBLIC_API_URL وإضافة أصل الواجهة في FRONTEND_ORIGINS.",
  "errors.code.UNAUTHENTICATED": "البريد أو كلمة المرور غير صحيحة",
  "errors.code.CSRF_INVALID": "انتهت الجلسة. حدّث الصفحة ثم حاول مرة أخرى.",
  "errors.code.FORBIDDEN": "ليس لديك صلاحية لهذا الإجراء",
  "errors.code.CONFLICT": "يوجد سجل بنفس القيمة الفريدة بالفعل",
  "errors.code.NOT_FOUND": "السجل غير موجود",
  "errors.code.RATE_LIMITED": "محاولات كثيرة. انتظر ثم حاول مرة أخرى.",
  "errors.fallback": "حدث خطأ ما",
  "errors.payload.invalid_message": "بيانات الرسالة غير صالحة",
  "errors.payload.invalid_download": "بيانات ملف التحميل غير صالحة",
  "errors.download.file_required": "ملف PDF مطلوب",
  "errors.download.restore_failed": "تعذّر استعادة ملف التحميل",
  "errors.company.not_found": "الشركة غير موجودة",
  "errors.company.name_max": "لا يمكن أن يتجاوز اسم الشركة 100 حرفًا",
  "errors.company.short_code_max":
    "لا يمكن أن يتجاوز الاسم المختصر / الرمز 12 حرفًا",
  "errors.company.certification_invalid":
    "واحد أو أكثر من الاعتمادات غير موجود في وحدة الشهادات",
  "errors.page.section_unknown": "قسم الصفحة غير معروف",
  "errors.page.section_invalid": "بيانات القسم غير صالحة",
  "errors.page.sections_required": "كائن الأقسام مطلوب",
  "errors.page.introductory_heading_required": "العنوان التمهيدي مطلوب",
  "errors.page.section_removed": "تمت إزالة هذا القسم من فهرس الصفحة",
  "errors.page.our_values_max_cards": "قسم قيمنا لا يمكن أن يحتوي على أكثر من 4 بطاقات",
  "errors.page.saudi_manufacturing_max_features": "قسم التصنيع والتوطين السعودي لا يمكن أن يحتوي على أكثر من 4 ميزات",
  "errors.url.invalid": "صيغة الرابط غير صالحة",
  "errors.mobile.invalid": "رقم الجوال يجب أن يتكون من 9 إلى 12 رقمًا فقط",
  "errors.slug.in_use": "هذا الرابط التعريفي مستخدم بالفعل. يرجى إدخال رابط تعريفي فريد.",
  "errors.slug.required": "الرابط التعريفي مطلوب",
  "errors.file.required": "الملف مطلوب",
  "errors.application.consent_required": "الموافقة على معالجة البيانات مطلوبة",
  "errors.job.has_applications": "لا يمكن حذف الوظيفة نهائيًا لوجود طلبات توظيف مرتبطة بها",
  "errors.job.not_found": "الوظيفة غير موجودة",
  "errors.industry.not_found": "القطاع غير موجود",
  "errors.order.duplicate_ids": "غير مسموح بتكرار المعرفات في قائمة الترتيب",
  "errors.order.invalid_ids": "واحد أو أكثر من المعرفات غير صالحة",
  "errors.order.required": "المعرفات مطلوبة",
  "errors.payload.invalid_seo": "بيانات تحسين محركات البحث غير صالحة",
  "errors.seo.url_slug_format": "مسار الرابط يجب أن يبدأ بـ /",
  "errors.payload.invalid_settings": "بيانات الإعدادات غير صالحة",
  "errors.html.not_allowed": "وسوم HTML غير مسموح بها في هذا الحقل",
};

const catalogs = { en, ar };

/** Translate a UI/error key for the current or given locale. */
export function te(key, locale = "en") {
  const lang = locale === "ar" ? "ar" : "en";
  return catalogs[lang][key] || catalogs.en[key] || key;
}
