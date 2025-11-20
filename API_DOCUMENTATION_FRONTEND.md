# 📡 NewParties API Documentation - للفرونت إند

## 📋 جدول المحتويات
- [معلومات عامة](#معلومات-عامة)
- [المصادقة (Authentication)](#المصادقة-authentication)
- [Admin APIs](#admin-apis)
- [Manager APIs](#manager-apis)
- [Client APIs](#client-apis)
- [Scanner APIs](#scanner-apis)
- [Events APIs](#events-apis)
- [Invitations APIs](#invitations-apis)
- [Halls APIs](#halls-apis)
- [Services APIs](#services-apis)
- [Employees APIs](#employees-apis)
- [Financial APIs](#financial-apis)
- [نماذج البيانات](#نماذج-البيانات)
- [أكواد الأخطاء](#أكواد-الأخطاء)

---

## 🌐 معلومات عامة

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Headers المطلوبة
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

### نمط الاستجابة

#### النجاح (200-201)
```json
{
  "success": true,
  "message": "العملية نجحت",
  "data": { /* البيانات */ }
}
```

#### الخطأ (400-500)
```json
{
  "success": false,
  "error": "رسالة الخطأ",
  "errorCode": "ERROR_CODE",
  "errors": [/* تفاصيل الأخطاء */]
}
```

### Pagination
```json
{
  "data": [/* البيانات */],
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 100,
    "limit": 10
  }
}
```

---

## 🔐 المصادقة (Authentication)

### 1. تسجيل الدخول
```http
POST /auth/login
```

**Request Body:**
```json
{
  "phone": "0501234567",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "phone": "0501234567",
    "role": "client",
    "permissions": ["VIEW_OWN_EVENTS", "MANAGE_INVITATIONS"],
    "hallId": "507f1f77bcf86cd799439012"
  },
  "role": "client"
}
```

**Errors:**
- `400`: رقم الهاتف غير مسجل
- `400`: كلمة المرور غير صحيحة
- `400`: تم إلغاء تفعيل حسابك

---

### 2. إنشاء حساب جديد
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "أحمد محمد",
  "phone": "0501234567",
  "password": "123456",
  "role": "client",
  "hallId": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "message": "تم إنشاء الحساب بنجاح",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "phone": "0501234567",
    "role": "client",
    "permissions": ["VIEW_OWN_EVENTS", "MANAGE_INVITATIONS"],
    "hallId": "507f1f77bcf86cd799439012"
  }
}
```

**Validation:**
- `name`: 2-100 حرف
- `phone`: أرقام فقط
- `password`: 6 أحرف على الأقل
- `role`: admin, manager, client, scanner, supervisor

---

### 3. تسجيل الخروج
```http
GET /auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

### 4. الحصول على بيانات المستخدم الحالي
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد",
    "phone": "0501234567",
    "role": "client",
    "permissions": ["VIEW_OWN_EVENTS", "MANAGE_INVITATIONS"],
    "hallId": "507f1f77bcf86cd799439012",
    "isActive": true,
    "settings": {
      "language": "ar",
      "notifications": true
    }
  }
}
```

---

### 5. تحديث الملف الشخصي
```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "أحمد محمد الجديد",
  "phone": "0509876543",
  "settings": {
    "language": "ar",
    "notifications": true
  }
}
```

**Response (200):**
```json
{
  "message": "تم تحديث الملف الشخصي بنجاح",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "أحمد محمد الجديد",
    "phone": "0509876543",
    "role": "client",
    "settings": {
      "language": "ar",
      "notifications": true
    }
  }
}
```

---

## 👨‍💼 Admin APIs

### 1. لوحة التحكم
```http
GET /admin/dashboard
```

**Headers:**
```
Authorization: Bearer <access_token>
Role: admin
```

**Response (200):**
```json
{
  "title": "لوحة تحكم الأدمن",
  "stats": {
    "totalHalls": 10,
    "totalManagers": 15,
    "totalClients": 150,
    "totalEvents": 200,
    "activeEvents": 25,
    "totalRevenue": 500000
  }
}
```

---

### 2. قائمة الصالات
```http
GET /admin/halls?page=1&limit=10&search=keyword
```

**Query Parameters:**
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد العناصر (default: 10)
- `search`: كلمة البحث (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "قصر الأفراح",
      "location": "الرياض، حي النخيل",
      "capacity": 500,
      "maxEmployees": 20,
      "tables": 50,
      "chairs": 500,
      "defaultPrices": {
        "perPerson": 150,
        "hallRental": 5000
      },
      "description": "قصر فخم للأفراح",
      "amenities": ["موقف سيارات", "مكيفات", "إضاءة حديثة"],
      "generalManager": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "محمد أحمد",
        "phone": "0501234567"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

### 3. إضافة صالة جديدة
```http
POST /admin/halls
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```json
{
  "name": "قصر الأفراح",
  "location": "الرياض، حي النخيل",
  "capacity": 500,
  "maxEmployees": 20,
  "tables": 50,
  "chairs": 500,
  "defaultPrices": {
    "perPerson": 150,
    "hallRental": 5000
  },
  "description": "قصر فخم للأفراح",
  "amenities": ["موقف سيارات", "مكيفات", "إضاءة حديثة"],
  "managerName": "محمد أحمد",
  "managerPhone": "0501234567",
  "managerPassword": "123456",
  "images": [File, File, File]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة الصالة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "قصر الأفراح",
    "location": "الرياض، حي النخيل",
    "generalManager": "507f1f77bcf86cd799439013"
  }
}
```

**Validation:**
- `name`: 2-200 حرف (مطلوب)
- `location`: 5-500 حرف (مطلوب)
- `capacity`: رقم > 0 (مطلوب)
- `managerPhone`: أرقام فقط (مطلوب)
- `managerPassword`: 6 أحرف على الأقل (مطلوب)

---

### 4. تحديث صالة
```http
PUT /admin/halls/edit/:id
```

**Request Body:**
```json
{
  "name": "قصر الأفراح المحدث",
  "location": "الرياض، حي النخيل الجديد",
  "capacity": 600,
  "defaultPrices": {
    "perPerson": 200,
    "hallRental": 6000
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث الصالة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "قصر الأفراح المحدث"
  }
}
```

---

### 5. حذف صالة
```http
DELETE /admin/halls/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم حذف الصالة بنجاح"
}
```

---

### 6. قائمة المديرين
```http
GET /admin/managers
```

**Response (200):**
```json
{
  "managers": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "محمد أحمد",
      "phone": "0501234567",
      "role": "manager",
      "hallId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "قصر الأفراح"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7. إضافة مدير جديد
```http
POST /admin/managers/add
```

**Request Body:**
```json
{
  "name": "محمد أحمد",
  "phone": "0501234567",
  "password": "123456",
  "hallId": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة المدير بنجاح",
  "manager": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "محمد أحمد",
    "phone": "0501234567",
    "role": "manager",
    "hallId": "507f1f77bcf86cd799439012"
  }
}
```

---

### 8. قائمة الخدمات
```http
GET /admin/services?page=1&limit=10&category=catering
```

**Query Parameters:**
- `page`: رقم الصفحة
- `limit`: عدد العناصر
- `category`: الفئة (catering, decoration, photography, entertainment, other)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "خدمة الطعام الفاخرة",
      "category": "catering",
      "basePrice": 5000,
      "description": "وجبات فاخرة للمناسبات",
      "isActive": true,
      "createdBy": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "أحمد محمد"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

---

### 9. إضافة خدمة جديدة
```http
POST /admin/services
```

**Request Body:**
```json
{
  "name": "خدمة الطعام الفاخرة",
  "category": "catering",
  "basePrice": 5000,
  "description": "وجبات فاخرة للمناسبات"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة الخدمة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "خدمة الطعام الفاخرة",
    "category": "catering",
    "basePrice": 5000
  }
}
```

**Validation:**
- `name`: 2-200 حرف (مطلوب)
- `category`: catering, decoration, photography, entertainment, other (مطلوب)
- `basePrice`: رقم >= 0 (مطلوب)

---

### 10. الإحصائيات المفصلة
```http
GET /admin/reports
```

**Response (200):**
```json
{
  "stats": {
    "totalHalls": 10,
    "totalManagers": 15,
    "totalClients": 150,
    "totalEvents": 200,
    "totalRevenue": 500000,
    "monthlyRevenue": [
      { "month": "يناير", "revenue": 50000 },
      { "month": "فبراير", "revenue": 60000 }
    ],
    "eventsByType": {
      "wedding": 100,
      "birthday": 50,
      "corporate": 30
    }
  }
}
```

---

## 👔 Manager APIs

### 1. لوحة التحكم
```http
GET /manager/dashboard
```

**Headers:**
```
Authorization: Bearer <access_token>
Role: manager
```

**Response (200):**
```json
{
  "title": "لوحة تحكم المدير العام",
  "user": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "محمد أحمد",
    "role": "manager",
    "hallId": "507f1f77bcf86cd799439012"
  },
  "stats": {
    "totalEvents": 50,
    "todayEvents": 2,
    "activeEvents": 10,
    "clientsCount": 30,
    "eventsCount": 50,
    "completedEvents": 35,
    "cancelledEvents": 5,
    "scheduledEvents": 10,
    "hallInfo": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "قصر الأفراح",
      "capacity": 500
    }
  }
}
```

---

### 2. معلومات الصالة
```http
GET /manager/hall
```

**Response (200):**
```json
{
  "title": "إدارة معلومات الصالة",
  "hall": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "قصر الأفراح",
    "location": "الرياض، حي النخيل",
    "capacity": 500,
    "maxEmployees": 20,
    "tables": 50,
    "chairs": 500,
    "defaultPrices": {
      "perPerson": 150,
      "hallRental": 5000
    },
    "amenities": ["موقف سيارات", "مكيفات"]
  },
  "error": null
}
```

---

### 3. قائمة الفعاليات
```http
GET /manager/hall/events
```

**Response (200):**
```json
{
  "title": "إدارة الحفلات",
  "events": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "eventName": "حفل زفاف أحمد وفاطمة",
      "eventDate": "2024-12-25T00:00:00.000Z",
      "eventType": "wedding",
      "numOfPeople": 300,
      "status": "confirmed",
      "clientId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "أحمد محمد",
        "phone": "0501234567"
      },
      "templateId": {
        "_id": "507f1f77bcf86cd799439016",
        "name": "قالب الزفاف الذهبي",
        "imageUrl": "/uploads/templates/template1.jpg"
      }
    }
  ],
  "staffList": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "name": "خالد أحمد",
      "role": "scanner"
    }
  ],
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "قالب الزفاف الذهبي"
    }
  ],
  "error": null
}
```

---

### 4. إضافة فعالية جديدة
```http
POST /manager/hall/events
```

**Request Body:**
```json
{
  "eventName": "حفل زفاف أحمد وفاطمة",
  "eventDate": "2024-12-25",
  "eventType": "wedding",
  "numOfPeople": 300,
  "clientId": "507f1f77bcf86cd799439011",
  "templateId": "507f1f77bcf86cd799439016",
  "services": ["507f1f77bcf86cd799439014"],
  "employees": ["507f1f77bcf86cd799439017"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة المناسبة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "eventName": "حفل زفاف أحمد وفاطمة",
    "eventDate": "2024-12-25T00:00:00.000Z",
    "status": "pending"
  }
}
```

**Validation:**
- `eventName`: 2-200 حرف (مطلوب)
- `eventDate`: تاريخ صحيح (مطلوب)
- `eventType`: wedding, birthday, corporate, etc. (مطلوب)
- `numOfPeople`: رقم > 0 (مطلوب)
- `clientId`: معرف صحيح (مطلوب)

---

### 5. تحديث فعالية
```http
PUT /manager/events/:id
```

**Request Body:**
```json
{
  "eventName": "حفل زفاف محدث",
  "numOfPeople": 350,
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث الفعالية بنجاح"
}
```

---

### 6. حذف فعالية
```http
DELETE /manager/events/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم حذف الفعالية بنجاح"
}
```

---

### 7. قائمة العملاء
```http
GET /manager/clients
```

**Response (200):**
```json
{
  "clients": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "أحمد محمد",
      "phone": "0501234567",
      "role": "client",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 8. قائمة الموظفين
```http
GET /manager/staff
```

**Response (200):**
```json
{
  "title": "إدارة الموظفين",
  "staff": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "name": "خالد أحمد",
      "phone": "0501234567",
      "role": "scanner",
      "isActive": true
    }
  ]
}
```

---

### 9. إضافة موظف جديد
```http
POST /manager/staff/add
```

**Request Body:**
```json
{
  "name": "خالد أحمد",
  "phone": "0501234567",
  "password": "123456",
  "role": "scanner"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة الموظف بنجاح"
}
```

---

## 👤 Client APIs

### 1. لوحة التحكم
```http
GET /client/dashboard
```

**Headers:**
```
Authorization: Bearer <access_token>
Role: client
```

**Response (200):**
```json
{
  "title": "لوحة تحكم العميل",
  "event": {
    "_id": "507f1f77bcf86cd799439015",
    "eventName": "حفل زفاف أحمد وفاطمة",
    "eventDate": "2024-12-25T00:00:00.000Z",
    "numOfPeople": 300,
    "hallId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "قصر الأفراح",
      "location": "الرياض"
    }
  },
  "invitationsCount": 150
}
```

---

### 2. قائمة الدعوات
```http
GET /client/invitations
```

**Response (200):**
```json
{
  "invitations": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "guestName": "محمد علي",
      "numOfPeople": 5,
      "qrCode": "INV-1234567890",
      "status": "sent",
      "eventId": "507f1f77bcf86cd799439015",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. تفاصيل دعوة
```http
GET /client/show/:id
```

**Response (200):**
```json
{
  "title": "عرض الدعوة",
  "invitation": {
    "_id": "507f1f77bcf86cd799439018",
    "guestName": "محمد علي",
    "numOfPeople": 5,
    "qrCode": "INV-1234567890",
    "qrCodeImage": "/uploads/qr/INV-1234567890.png",
    "status": "sent",
    "eventId": {
      "_id": "507f1f77bcf86cd799439015",
      "eventName": "حفل زفاف أحمد وفاطمة",
      "eventDate": "2024-12-25T00:00:00.000Z",
      "hallId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "قصر الأفراح",
        "location": "الرياض"
      },
      "templateId": {
        "imageUrl": "/uploads/templates/template1.jpg"
      }
    }
  }
}
```

---

### 4. إضافة دعوة جديدة
```http
POST /client/invitations/add
```

**Request Body:**
```json
{
  "guestName": "محمد علي",
  "numOfPeople": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة الدعوة بنجاح",
  "invitation": {
    "_id": "507f1f77bcf86cd799439018",
    "guestName": "محمد علي",
    "numOfPeople": 5,
    "qrCode": "INV-1234567890",
    "qrCodeImage": "/uploads/qr/INV-1234567890.png"
  }
}
```

**Validation:**
- `guestName`: 2-100 حرف (مطلوب)
- `numOfPeople`: رقم > 0 (مطلوب)

**Errors:**
- `400`: تجاوز عدد الأشخاص المسموح به للمناسبة

---

### 5. تحديث دعوة
```http
PUT /client/invitations/edit/:id
```

**Request Body:**
```json
{
  "guestName": "محمد علي المحدث",
  "numOfPeople": 6
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم تحديث الدعوة بنجاح"
}
```

---

### 6. حذف دعوة
```http
GET /client/invitations/delete/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "تم حذف الدعوة بنجاح"
}
```

---

## 📱 Scanner APIs

### 1. لوحة التحكم
```http
GET /scanner/dashboard
```

**Headers:**
```
Authorization: Bearer <access_token>
Role: scanner
```

**Response (200):**
```json
{
  "welcome": "مرحباً خالد أحمد 👋",
  "status": "النظام متصل",
  "hall": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "قصر الأفراح"
  },
  "stats": {
    "totalScans": 150,
    "todayScans": 25,
    "attendedGuests": 120
  },
  "events": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "eventName": "حفل زفاف أحمد وفاطمة",
      "eventDate": "2024-12-25T00:00:00.000Z",
      "status": "confirmed"
    }
  ],
  "upcomingCount": 5,
  "title": "لوحة الماسح"
}
```

---

### 2. فحص QR Code
```http
GET /scanner/verify/:code
```

**Response (200):**
```json
{
  "success": true,
  "invitation": {
    "_id": "507f1f77bcf86cd799439018",
    "guestName": "محمد علي",
    "numOfPeople": 5,
    "qrCode": "INV-1234567890",
    "status": "attended",
    "eventId": {
      "eventName": "حفل زفاف أحمد وفاطمة",
      "eventDate": "2024-12-25T00:00:00.000Z"
    }
  },
  "message": "تم تسجيل الحضور بنجاح"
}
```

**Errors:**
- `404`: الدعوة غير موجودة
- `400`: تم تسجيل الحضور مسبقاً

---

### 3. قائمة دعوات الفعالية
```http
GET /scanner/events/:id/invitations
```

**Response (200):**
```json
{
  "invitations": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "guestName": "محمد علي",
      "numOfPeople": 5,
      "status": "attended",
      "qrCode": "INV-1234567890"
    }
  ]
}
```

---

## 💰 Financial APIs

### 1. لوحة التحكم المالية
```http
GET /api/financial/dashboard?hallId=507f1f77bcf86cd799439012
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 500000,
    "totalExpenses": 200000,
    "netProfit": 300000,
    "pendingPayments": 50000,
    "monthlyRevenue": [
      { "month": "يناير", "revenue": 50000 },
      { "month": "فبراير", "revenue": 60000 }
    ]
  }
}
```

---

### 2. قائمة المعاملات
```http
GET /api/financial/transactions?type=payment&startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**
- `type`: payment, refund, adjustment, expense, revenue
- `startDate`: تاريخ البداية
- `endDate`: تاريخ النهاية

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "type": "payment",
      "amount": 5000,
      "paymentMethod": "cash",
      "description": "دفعة مقدمة لحفل الزفاف",
      "eventId": "507f1f77bcf86cd799439015",
      "clientId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. إضافة معاملة جديدة
```http
POST /api/financial/transactions
```

**Request Body:**
```json
{
  "type": "payment",
  "amount": 5000,
  "paymentMethod": "cash",
  "description": "دفعة مقدمة لحفل الزفاف",
  "eventId": "507f1f77bcf86cd799439015",
  "clientId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "تم إضافة المعاملة بنجاح",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "type": "payment",
    "amount": 5000
  }
}
```

---

### 4. قائمة الفواتير
```http
GET /api/financial/invoices?status=paid
```

**Query Parameters:**
- `status`: draft, sent, viewed, paid, overdue, cancelled

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "invoiceNumber": "INV-2024-001",
      "type": "final",
      "status": "paid",
      "totalAmount": 50000,
      "paidAmount": 50000,
      "eventId": {
        "_id": "507f1f77bcf86cd799439015",
        "eventName": "حفل زفاف أحمد وفاطمة"
      },
      "dueDate": "2024-12-20T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📊 نماذج البيانات

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  phone: string;
  password: string; // hashed
  role: 'admin' | 'manager' | 'client' | 'scanner' | 'supervisor';
  permissions: string[];
  hallId?: string;
  isActive: boolean;
  settings: {
    language: 'ar' | 'en';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Hall Model
```typescript
interface Hall {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  maxEmployees: number;
  tables: number;
  chairs: number;
  defaultPrices: {
    perPerson: number;
    hallRental: number;
  };
  description: string;
  amenities: string[];
  images: string[];
  generalManager: string; // User ID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Event Model
```typescript
interface Event {
  _id: string;
  eventName: string;
  eventDate: Date;
  eventType: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'anniversary' | 'conference' | 'other';
  numOfPeople: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  hall: string; // Hall ID
  hallId: string; // Hall ID
  client: string; // User ID
  clientId: string; // User ID
  template: string; // Template ID
  templateId: string; // Template ID
  services: string[]; // Service IDs
  employees: string[]; // Employee IDs
  totalCost: number;
  paidAmount: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Invitation Model
```typescript
interface Invitation {
  _id: string;
  clientId: string; // User ID
  eventId: string; // Event ID
  guestName: string;
  numOfPeople: number;
  qrCode: string; // unique
  qrCodeImage: string; // path to QR image
  status: 'sent' | 'delivered' | 'opened' | 'attended';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  attendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Service Model
```typescript
interface Service {
  _id: string;
  name: string;
  category: 'catering' | 'decoration' | 'photography' | 'entertainment' | 'other';
  basePrice: number;
  description: string;
  isActive: boolean;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Employee Model
```typescript
interface Employee {
  _id: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  email?: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
  hallId: string; // Hall ID
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction Model
```typescript
interface Transaction {
  _id: string;
  type: 'payment' | 'refund' | 'adjustment' | 'expense' | 'revenue';
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'online_payment';
  description: string;
  eventId?: string; // Event ID
  clientId?: string; // User ID
  hallId: string; // Hall ID
  invoiceId?: string; // Invoice ID
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Invoice Model
```typescript
interface Invoice {
  _id: string;
  invoiceNumber: string; // unique
  type: 'deposit' | 'final' | 'adjustment';
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  eventId: string; // Event ID
  clientId: string; // User ID
  hallId: string; // Hall ID
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  notes: string;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚠️ أكواد الأخطاء

### Authentication Errors (401)
```json
{
  "errorCode": "UNAUTHORIZED",
  "error": "غير مصرح لك بالوصول"
}
```

```json
{
  "errorCode": "INVALID_TOKEN",
  "error": "التوكن غير صحيح"
}
```

```json
{
  "errorCode": "TOKEN_EXPIRED",
  "error": "انتهت صلاحية التوكن"
}
```

### Validation Errors (400)
```json
{
  "errorCode": "VALIDATION_ERROR",
  "error": "بيانات غير صحيحة",
  "errors": [
    {
      "field": "phone",
      "message": "رقم الهاتف غير صحيح"
    },
    {
      "field": "password",
      "message": "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
    }
  ]
}
```

### Permission Errors (403)
```json
{
  "errorCode": "FORBIDDEN",
  "error": "ليس لديك صلاحية للقيام بهذا الإجراء"
}
```

### Not Found Errors (404)
```json
{
  "errorCode": "NOT_FOUND",
  "error": "العنصر غير موجود"
}
```

### Server Errors (500)
```json
{
  "errorCode": "INTERNAL_SERVER_ERROR",
  "error": "حدث خطأ في الخادم"
}
```

### Business Logic Errors (400)
```json
{
  "errorCode": "CAPACITY_EXCEEDED",
  "error": "تجاوز عدد الأشخاص المسموح به للمناسبة"
}
```

```json
{
  "errorCode": "DUPLICATE_ENTRY",
  "error": "رقم الهاتف مسجل مسبقاً"
}
```

```json
{
  "errorCode": "ALREADY_ATTENDED",
  "error": "تم تسجيل الحضور مسبقاً"
}
```

---

## 🔒 الأدوار والصلاحيات

### Admin
**الصلاحيات:**
- إدارة جميع الصالات
- إدارة جميع المديرين
- إدارة جميع الخدمات
- عرض جميع الإحصائيات
- إدارة الشكاوى

**المسارات المتاحة:**
- `/admin/*`
- جميع المسارات الأخرى

---

### Manager
**الصلاحيات:**
- إدارة صالته فقط
- إدارة فعاليات صالته
- إدارة عملاء صالته
- إدارة موظفي صالته
- عرض إحصائيات صالته

**المسارات المتاحة:**
- `/manager/*`
- `/api/financial/*` (لصالته فقط)
- `/api/employees/*` (لصالته فقط)

---

### Client
**الصلاحيات:**
- عرض فعالياته فقط
- إدارة دعواته
- عرض تفاصيل حفلته
- إضافة شكاوى

**المسارات المتاحة:**
- `/client/*`
- `/invitations/*` (دعواته فقط)

---

### Scanner
**الصلاحيات:**
- فحص رموز QR
- عرض دعوات الفعاليات
- تسجيل الحضور

**المسارات المتاحة:**
- `/scanner/*`

---

### Supervisor
**الصلاحيات:**
- جميع صلاحيات Scanner
- عرض قائمة العملاء
- عرض تقارير الفحص

**المسارات المتاحة:**
- `/scanner/*`
- عرض إضافي للبيانات

---

## 📝 ملاحظات مهمة للفرونت إند

### 1. التوكنات (Tokens)
- **Access Token**: صالح لمدة 24 ساعة
- **Refresh Token**: صالح لمدة 7 أيام
- يتم إرسال التوكنات في الـ Cookies تلقائياً
- يجب إرسال Access Token في الـ Header: `Authorization: Bearer <token>`

### 2. التواريخ
- جميع التواريخ بصيغة ISO 8601: `2024-12-25T00:00:00.000Z`
- يجب تحويل التواريخ إلى الصيغة المحلية في الفرونت

### 3. الصور
- مسارات الصور نسبية: `/uploads/qr/INV-1234567890.png`
- يجب إضافة Base URL: `http://localhost:5000/uploads/qr/INV-1234567890.png`

### 4. Pagination
- الصفحة الافتراضية: 1
- الحد الافتراضي: 10
- الحد الأقصى: 100

### 5. البحث والفلترة
- استخدم Query Parameters: `?search=keyword&status=confirmed&page=1`
- البحث يدعم العربية والإنجليزية

### 6. رفع الملفات
- استخدم `FormData` لرفع الملفات
- الحد الأقصى لحجم الملف: 5MB
- الصيغ المدعومة: jpg, jpeg, png, gif

### 7. معالجة الأخطاء
```javascript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    // معالجة الخطأ
    console.error(result.error);
    if (result.errors) {
      // عرض أخطاء التحقق
      result.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
  } else {
    // النجاح
    console.log(result.data);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 8. مثال كامل - تسجيل الدخول
```javascript
async function login(phone, password) {
  try {
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password }),
      credentials: 'include' // لإرسال واستقبال الـ Cookies
    });

    const result = await response.json();

    if (response.ok) {
      // حفظ التوكن
      localStorage.setItem('accessToken', result.tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      // التوجيه حسب الدور
      switch (result.role) {
        case 'admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'manager':
          window.location.href = '/manager/dashboard';
          break;
        case 'client':
          window.location.href = '/client/dashboard';
          break;
        case 'scanner':
          window.location.href = '/scanner/dashboard';
          break;
      }
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('حدث خطأ في الاتصال');
  }
}
```

### 9. مثال - إضافة دعوة
```javascript
async function addInvitation(guestName, numOfPeople) {
  const token = localStorage.getItem('accessToken');

  try {
    const response = await fetch('http://localhost:5000/client/invitations/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ guestName, numOfPeople }),
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      alert('تم إضافة الدعوة بنجاح');
      // عرض رمز QR
      console.log('QR Code:', result.invitation.qrCodeImage);
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 10. مثال - رفع صورة
```javascript
async function uploadHallImages(hallData, images) {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();

  // إضافة البيانات
  Object.keys(hallData).forEach(key => {
    if (typeof hallData[key] === 'object') {
      formData.append(key, JSON.stringify(hallData[key]));
    } else {
      formData.append(key, hallData[key]);
    }
  });

  // إضافة الصور
  images.forEach(image => {
    formData.append('images', image);
  });

  try {
    const response = await fetch('http://localhost:5000/admin/halls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // لا تضع Content-Type عند استخدام FormData
      },
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      alert('تم إضافة الصالة بنجاح');
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🎯 خلاصة

هذا الملف يحتوي على:
- ✅ جميع الـ API Endpoints
- ✅ Request Bodies المطلوبة
- ✅ Response Formats
- ✅ نماذج البيانات (TypeScript Interfaces)
- ✅ أكواد الأخطاء
- ✅ الأدوار والصلاحيات
- ✅ أمثلة عملية بالـ JavaScript
- ✅ ملاحظات مهمة للتطوير

**استخدم هذا الملف كمرجع كامل لتطوير الفرونت إند! 🚀**

---

*تم إنشاء هذا الملف في 2025-10-23*
*آخر تحديث: 2025-10-23*
*الإصدار: 1.0.0*


