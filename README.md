# גריל מע'אר — מערכת הזמנות

מערכת הזמנות Mobile-First לעסק גריל/שווארמה: אתר הזמנות ללקוח + מסך מטבח/ניהול בזמן אמת, כולל ניהול תפריט ומחירים.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: NestJS + WebSocket Gateway
- בשלב הבא: PostgreSQL/MongoDB אמיתי, Redis, ספק סליקה, SMS/WhatsApp אוטומטי, חשבוניות, מדפסת תרמית, אימות SMS/OTP ללקוח.

## מבנה תיקיות
```
apps/
  web/src/
    storefront/   — תפריט, הרכבת מנה, סל, Checkout, הצלחה (הלקוח)
    admin/        — כניסת ניהול, לוח הזמנות למטבח, ניהול תפריט/מחירים
    data/         — נתוני ברירת מחדל (fallback) לתפריט
    lib/          — קריאות API + WebSocket
    types.ts
  api/src/
    orders.*      — הזמנות + שידור WebSocket
    products.*    — תפריט (CRUD), נשמר לקובץ apps/api/data/products.json
    admin-key.guard.ts — הגנה בסיסית על פעולות ניהול
```

## הפעלה מקומית
```bash
npm install
cd apps/web && npm install
cd ../api && npm install
cd ../..
npm run dev
```
- Web: http://localhost:5173
- API: http://localhost:3000

## ניהול (Admin)
בתפריט הלקוח לוחצים על כפתור ☰ ומזינים את מפתח הניהול (בפיתוח: `dev-admin-key`, מוגדר במשתנה הסביבה `ADMIN_KEY` בצד השרת). במסך הניהול שתי לשוניות:
- **הזמנות** — לוח קנבן בזמן אמת (חדשות / בהכנה / מוכן), הדפסת פתק מטבח, כפתור עדכון WhatsApp.
- **ניהול תפריט** — הוספה, עריכה ומחיקה של מנות, מחירים ותמונות. לקוחות רואים את השינוי בטעינה הבאה של התפריט.
- **הגדרות** — דמי משלוח (ברירת מחדל 15 ₪). נגבים רק בהזמנה במשלוח, והשרת מחשב אותם בעצמו כך שאי אפשר לעקוף אותם. נשמר ב-apps/api/data/settings.json.

⚠️ ה-Admin Key הוא הגנה בסיסית בלבד (לא JWT/הרשאות משתמשים) — מספיק כדי שלקוחות לא יגיעו בטעות למסך הניהול, אך לפני production אמיתי מומלץ להחליף באימות מלא (ראו TODO למטה).

## Production TODO
1. לחבר DB אמיתי (PostgreSQL/MongoDB) במקום קובץ JSON/זיכרון.
2. להחליף את ה-Admin Key באימות משתמשים מלא (login, הרשאות, session).
3. להחליף payment mock ב-Grow/CardCom/YaadPay.
4. להוסיף SMS provider (019 / Twilio) לעדכון אוטומטי.
5. להוסיף API רשמי של WhatsApp Business אם רוצים שליחה אוטומטית (לא רק כפתור ידני).
6. להוסיף ספק חשבוניות ירוקות (Green Invoice וכו').
7. לחבר מדפסת ESC/POS דרך שירות מקומי/agent (כרגע ההדפסה היא חלון הדפסה רגיל של הדפדפן).
8. להוסיף Redis לתורים, rate limiting ו-pub/sub.
9. להוסיף Docker + CI/CD + SSL + monitoring.

לפרטי דומיין (grill-maghar.com) ואחסון production, ראו [DEPLOYMENT.md](DEPLOYMENT.md).
