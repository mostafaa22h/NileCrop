# Nile Crop

مشروع زراعي بسيط يضم:
- اقتراح أفضل 3 محاصيل حسب المدينة
- فحص أولي لمرض النبات من الصورة

## تشغيل الباك
```powershell
cd "D:\New nile crop\smart-crop-backend"
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## تشغيل الفرونت
```powershell
cd "D:\New nile crop\nile-crop"
npm install
npm run dev
```

## ملفات لا تترفع على GitHub
- `node_modules`
- `venv`
- `dist`
- `uploads`
- ملفات الكاش

## اقتراح الرفع
اعملي `Repository` جديد واحد وارفعِي داخله:
- `nile-crop`
- `smart-crop-backend`
