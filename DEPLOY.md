# Deploy FE — static export على cPanel

الـ FE أصلاً `output: "export"` → مفيش Node App للفرونت.  
ارفع محتويات `out/` على **document root** بتاع:

`http://tamimidash.gamal.inspire-sa.com`

(ده نفس أصل `FRONTEND_ORIGINS` في الـ BE.)

## 1) Build + archive (Docker زي اللوكال)

```bash
cd frontend
docker compose --profile tools run --rm npm run build:deploy
```

يقرأ `.env.cpanel` ويبني بـ:

`NEXT_PUBLIC_API_URL=https://tamimiapi.gamal.inspire-sa.com/api/v1/admin`

(لازم HTTPS — الدومين عليه SSL؛ `http://` من صفحة `https://` = mixed content / CORS.)

الناتج: `tamimi-fe-deploy.tar.gz` (محتوى `out/` + `.htaccess`)

## 2) ارفع على الصب دومين

1. cPanel → **Domains / Subdomains** → جيب مسار المجلد بتاع `tamimidash`  
   (غالباً زي `public_html/tamimidash` أو root مخصص للـ subdomain)
2. ارفع وفك الـ archive **جوّه document root** (الملفات تبقى في الجذر مش في فولدر `out`):

```bash
cd ~/public_html/tamimidash   # غيّر للمسار الحقيقي
tar -xzf tamimi-fe-deploy.tar.gz
```

بعد الفك لازم تشوف: `index.html` + مجلدات الصفحات + `.htaccess`

**ما تحتاجش:** Node App / NPM Install / `node_modules`

## 3) تأكد الـ BE جاهز للكوكيز/CORS

في `.env` بتاع الـ API (ارفع `.env.cpanel` المحدّث كـ `.env`):

```env
FRONTEND_ORIGINS=https://tamimidash.gamal.inspire-sa.com,http://tamimidash.gamal.inspire-sa.com
APP_URL=https://tamimiapi.gamal.inspire-sa.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_PARTITIONED=false
```

Restart الـ API بعد أي تغيير.

الـ FE (بعد الرفع):

- Dashboard: `https://tamimidash.gamal.inspire-sa.com/`
- Login: `https://tamimidash.gamal.inspire-sa.com/login/`

## 4) تحديث لاحق

```bash
cd frontend
docker compose --profile tools run --rm npm run build:deploy
```

ارفع الـ archive تاني → فك فوق نفس document root.
