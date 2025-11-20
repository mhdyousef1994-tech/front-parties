# 📝 سجل التغييرات (Changelog)

## [1.1.0] - 2025-10-23

### ✨ إضافات جديدة (New Features)

#### 🔐 Authentication APIs
- ✅ إضافة endpoint `/auth/me` للحصول على بيانات المستخدم الحالي
- ✅ تحديث `logout()` ليكون async ويستخدم GET بدلاً من POST
- ✅ تحديث `updateprofile()` لحفظ بيانات المستخدم المحدثة في localStorage

#### 👨‍💼 Admin APIs
- ✅ تحديث `deleteManager()` ليستخدم DELETE بدلاً من POST
- ✅ تحديث `deleteTemplate()` ليستخدم DELETE بدلاً من POST
- ✅ تحديث `addHall()` لدعم:
  - `capacity` - سعة الصالة
  - `maxEmployees` - الحد الأقصى للموظفين
  - `description` - وصف الصالة
  - `amenities` - المرافق المتاحة
  - `images` - صور الصالة (FormData)
- ✅ تحديث `editHall()` لدعم جميع الحقول الجديدة
- ✅ تحديث `listHalls()` لدعم query parameters (page, limit, search)
- ✅ إضافة دوال إدارة الشكاوى:
  - `listComplaints()` - قائمة الشكاوى مع pagination
  - `getComplaint()` - تفاصيل شكوى
  - `updateComplaintStatus()` - تحديث حالة الشكوى
  - `deleteComplaint()` - حذف شكوى
  - `addComplaintResponse()` - إضافة رد على الشكوى

#### 👔 Manager APIs
- ✅ تحديث `updateManagerHall()` ليستخدم PUT `/manager/hall` بدلاً من POST `/manager/halls`
- ✅ تحديث `deleteStaff()` ليستخدم DELETE بدلاً من GET
- ✅ تحديث `deleteTemplateManager()` ليستخدم DELETE بدلاً من POST
- ✅ إضافة دوال إدارة الشكاوى:
  - `listManagerComplaints()` - قائمة الشكاوى
  - `getManagerComplaint()` - تفاصيل شكوى
  - `updateManagerComplaintStatus()` - تحديث حالة
  - `addManagerComplaintResponse()` - إضافة رد

#### 👤 Client APIs
- ✅ تحديث `deleteInvitation()` ليستخدم DELETE بدلاً من GET
- ✅ إضافة دوال إدارة الشكاوى:
  - `listClientComplaints()` - قائمة الشكاوى
  - `getClientComplaint()` - تفاصيل شكوى
  - `addClientComplaint()` - إضافة شكوى جديدة
  - `updateClientComplaint()` - تحديث شكوى
  - `deleteClientComplaint()` - حذف شكوى

#### 🛠️ Services APIs (جديد)
- ✅ إنشاء ملف `src/api/services.js`
- ✅ `listServices()` - قائمة الخدمات مع فلترة وتصفح
- ✅ `addService()` - إضافة خدمة جديدة
- ✅ `updateService()` - تحديث خدمة
- ✅ `deleteService()` - حذف خدمة
- ✅ `toggleServiceStatus()` - تفعيل/إلغاء تفعيل
- ✅ `getService()` - تفاصيل خدمة
- ✅ `getServiceCategories()` - قائمة الفئات

#### 💰 Financial APIs (جديد)
- ✅ إنشاء ملف `src/api/financial.js`
- ✅ **المعاملات المالية:**
  - `getFinancialDashboard()` - لوحة التحكم المالية
  - `listTransactions()` - قائمة المعاملات
  - `addTransaction()` - إضافة معاملة
  - `updateTransaction()` - تحديث معاملة
  - `deleteTransaction()` - حذف معاملة
- ✅ **الفواتير:**
  - `listInvoices()` - قائمة الفواتير
  - `addInvoice()` - إضافة فاتورة
  - `updateInvoice()` - تحديث فاتورة
  - `deleteInvoice()` - حذف فاتورة
  - `getInvoice()` - تفاصيل فاتورة
  - `updateInvoiceStatus()` - تحديث حالة الفاتورة
  - `recordPayment()` - تسجيل دفعة
- ✅ دوال مساعدة للحصول على القوائم المنسدلة

#### 👥 Employees APIs (جديد)
- ✅ إنشاء ملف `src/api/employees.js`
- ✅ `listEmployees()` - قائمة الموظفين مع فلترة
- ✅ `getEmployee()` - تفاصيل موظف
- ✅ `addEmployee()` - إضافة موظف
- ✅ `updateEmployee()` - تحديث موظف
- ✅ `deleteEmployee()` - حذف موظف
- ✅ `toggleEmployeeStatus()` - تفعيل/إلغاء تفعيل
- ✅ `getEmployeeStats()` - إحصائيات الموظفين
- ✅ دوال مساعدة للأقسام والمناصب

### 🔧 تحسينات (Improvements)

#### 📡 API Client
- ✅ إضافة Response Interceptor لمعالجة الأخطاء بشكل أفضل
- ✅ معالجة تلقائية لأخطاء 401 (Unauthorized) مع إعادة توجيه للـ login
- ✅ معالجة أخطاء 403 (Forbidden)
- ✅ رسائل خطأ أفضل باللغة العربية
- ✅ إضافة Content-Type headers افتراضية

#### 🛠️ Utilities
- ✅ تحديث `src/utils/index.js` مع إضافة:
  - `formatDateTime()` - تنسيق التاريخ والوقت
  - `formatCurrency()` - تنسيق العملة
  - `formatNumber()` - تنسيق الأرقام
  - `truncate()` - اختصار النصوص
  - `capitalize()` - تكبير أول حرف
  - `formatPhone()` - تنسيق أرقام الهاتف
  - `getStatusLabel()` - ترجمة الحالات
  - `getEventTypeLabel()` - ترجمة أنواع الفعاليات
  - `getStatusColor()` - ألوان الحالات
  - `isValidPhone()` - التحقق من رقم الهاتف
  - `isValidEmail()` - التحقق من البريد الإلكتروني
  - `groupBy()` - تجميع المصفوفات
  - `sortBy()` - ترتيب المصفوفات
  - دوال localStorage محسنة

#### 📄 PDF Generation
- ✅ تحديث `src/utils/pdf.js` مع إضافة:
  - `exportNodeToPdf()` - محسّن مع خيارات إضافية
  - `generateInvitationPDF()` - توليد PDF للدعوات
  - `generateInvoicePDF()` - توليد PDF للفواتير
  - `exportToCSV()` - تصدير البيانات إلى CSV

#### 📦 API Exports
- ✅ إنشاء `src/api/index.js` لتصدير جميع API functions من مكان واحد
- ✅ تسهيل الاستيراد: `import { login, getAdminDashboard } from '@/api'`

### 🐛 إصلاحات (Bug Fixes)
- ✅ إصلاح HTTP methods لتطابق التوثيق الرسمي
- ✅ إصلاح endpoints paths
- ✅ إصلاح معالجة الأخطاء في جميع API calls

### 📚 التوثيق (Documentation)
- ✅ جميع التغييرات متوافقة مع `API_DOCUMENTATION_FRONTEND.md`
- ✅ إضافة تعليقات JSDoc لجميع الدوال الجديدة
- ✅ إنشاء ملف CHANGELOG.md

---

## [1.0.0] - 2024-XX-XX

### الإصدار الأولي
- ✅ نظام المصادقة (Authentication)
- ✅ لوحات التحكم (Admin, Manager, Client, Scanner)
- ✅ إدارة الصالات
- ✅ إدارة الفعاليات
- ✅ إدارة الدعوات
- ✅ فحص QR Code
- ✅ التقارير الأساسية

---

## 📋 ملاحظات الترقية (Upgrade Notes)

### من v1.0.0 إلى v1.1.0

#### تغييرات Breaking Changes
لا توجد تغييرات كاسرة (Breaking Changes). جميع التحديثات متوافقة مع الإصدار السابق.

#### تغييرات في API Calls
إذا كنت تستخدم الدوال التالية، يجب تحديث الكود:

```javascript
// قديم
await deleteInvitation(id) // كان يستخدم GET

// جديد
await deleteInvitation(id) // الآن يستخدم DELETE
```

```javascript
// قديم
await deleteManager(id) // كان يستخدم POST

// جديد
await deleteManager(id) // الآن يستخدم DELETE
```

#### استخدام الملفات الجديدة

```javascript
// استيراد Services APIs
import { listServices, addService } from './api/services'

// استيراد Financial APIs
import { getFinancialDashboard, listInvoices } from './api/financial'

// استيراد Employees APIs
import { listEmployees, addEmployee } from './api/employees'

// أو استيراد الكل من مكان واحد
import { 
  listServices, 
  getFinancialDashboard, 
  listEmployees 
} from './api'
```

#### استخدام Utilities الجديدة

```javascript
import { 
  formatCurrency, 
  formatPhone, 
  getStatusLabel,
  exportToCSV 
} from './utils'

// تنسيق العملة
const price = formatCurrency(50000) // "50,000 SYP"

// تنسيق رقم الهاتف
const phone = formatPhone('0912345678') // "0912 345 678"

// ترجمة الحالة
const status = getStatusLabel('confirmed') // "مؤكد"

// تصدير إلى CSV
exportToCSV(data, 'report.csv')
```

---

## 🚀 الخطوات القادمة (Roadmap)

### v1.2.0 (مخطط)
- [ ] إضافة Notifications System
- [ ] إضافة Real-time Updates (WebSockets)
- [ ] تحسين Performance
- [ ] إضافة Unit Tests
- [ ] إضافة Integration Tests

### v1.3.0 (مخطط)
- [ ] إضافة Multi-language Support
- [ ] إضافة Dark Mode
- [ ] تحسين Mobile Experience
- [ ] إضافة Offline Support

---

**آخر تحديث:** 2025-10-23  
**الإصدار الحالي:** 1.1.0

