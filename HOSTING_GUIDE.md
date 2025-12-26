# WriteIt Uygulamasını Hostlama Rehberi

Bu rehber, uygulamanızı **Frontend için Vercel** ve **Backend için Render** kullanarak nasıl ücretsiz bir şekilde yayınlayacağınızı anlatır.

## 1. Hazırlık

Projenizde gerekli kod değişiklikleri yapıldı:
- **Backend:** Port numarası dinamik hale getirildi (`process.env.PORT`).
- **Frontend:** API adresi environment variable (`VITE_API_URL`) üzerinden alınacak şekilde ayarlandı.
- **Frontend:** Vercel için `vercel.json` dosyası oluşturuldu (Sayfa yenilemelerinde 404 hatasını önlemek için).

Kodlarınızı GitHub'a yüklediğinizden emin olun (Frontend ve Backend aynı repoda olabilir).

---

## 2. Backend'i Hostlama (Render.com)

Backend servisiniz Node.js ve Express kullanıyor. Render bu tür servisler için harika bir seçenektir.

1.  [Render.com](https://render.com/) adresine gidin ve GitHub hesabınızla giriş yapın.
2.  **"New +"** butonuna tıklayın ve **"Web Service"** seçeneğini seçin.
3.  GitHub reponuzu bağlayın ve seçin.
4.  Aşağıdaki ayarları yapın:
    *   **Name:** `writeit-api` (veya istediğiniz bir isim)
    *   **Region:** Size en yakın olanı seçin (örn. Frankfurt).
    *   **Branch:** `main` (veya master).
    *   **Root Directory:** `api` (Çok önemli! Backend dosyalarınız `api` klasöründe olduğu için bunu belirtmelisiniz).
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
5.  **Environment Variables** bölümüne gidin ve şunları ekleyin:
    *   `MONGO_URI`: (MongoDB Atlas bağlantı adresiniz - `.env` dosyanızdaki değer)
    *   `JWT_SECRET`: (Gizli anahtarınız - `.env` dosyanızdaki değer)
6.  **"Create Web Service"** butonuna tıklayın.

Render backend'inizi derleyip başlatacaktır. İşlem bittiğinde size `https://writeit-api.onrender.com` gibi bir URL verecektir. **Bu URL'i kopyalayın.**

---

## 3. Frontend'i Hostlama (Vercel)

Frontend React ve Vite kullanıyor. Vercel bu yapı için en iyi seçenektir.

1.  [Vercel.com](https://vercel.com/) adresine gidin ve GitHub hesabınızla giriş yapın.
2.  **"Add New..."** -> **"Project"** seçeneğine tıklayın.
3.  GitHub reponuzu seçin ve **"Import"** deyin.
4.  **Configure Project** ekranında:
    *   **Framework Preset:** `Vite` (Otomatik seçilmeli).
    *   **Root Directory:** `Edit` butonuna basın ve `client` klasörünü seçin. (Çok önemli! Frontend dosyalarınız `client` klasöründe).
5.  **Environment Variables** bölümünü açın ve şunu ekleyin:
    *   **Name:** `VITE_API_URL`
    *   **Value:** Render'dan aldığınız Backend URL'i (örn: `https://writeit-api.onrender.com`)
        *   *Not: Sonunda `/api` eklemenize gerek yok, kodda zaten ekleniyor olabilir ama `client/src/services/api.js` dosyasını kontrol ederseniz `baseURL` kısmında `/api` olup olmadığına göre URL'i düzenleyin. Mevcut kodunuzda `/api` backend URL'ine dahil değilse, buraya `https://writeit-api.onrender.com` yazın. Eğer kodda `baseURL: import.meta.env.VITE_API_URL || ...` varsa ve backend route'larınız `/api` ile başlıyorsa, Vercel'e `https://writeit-api.onrender.com` verip kodda `/api` eklemesi yapmıyorsanız, URL'i `https://writeit-api.onrender.com/api` olarak girmeniz gerekebilir. Kodunuzu kontrol ettim, `client/src/services/api.js` dosyasında `baseURL` şu şekilde ayarlandı:*
        ```javascript
        baseURL: import.meta.env.VITE_API_URL || "http://localhost:8800/api",
        ```
        *Bu durumda Vercel'e vereceğiniz değerin sonunda `/api` OLMALIDIR. Örn: `https://writeit-api.onrender.com/api`*

6.  **"Deploy"** butonuna tıklayın.

Vercel frontend'inizi derleyip yayınlayacaktır. Size `https://writeit-app.vercel.app` gibi bir URL verecektir.

---

## 4. Son Kontroller

1.  Vercel tarafından verilen Frontend URL'ine gidin.
2.  Kayıt olmayı ve giriş yapmayı deneyin.
3.  Post oluşturmayı ve görüntülemeyi deneyin.

Eğer "Network Error" veya CORS hatası alırsanız:
- Backend (`api/index.js`) dosyasındaki CORS ayarlarını kontrol edin. Şu an `origin: true` olduğu için çalışması gerekir.
- `VITE_API_URL`'in doğru girildiğinden emin olun (sonunda `/api` olup olmadığına dikkat edin).

Tebrikler! Uygulamanız yayında. 🚀

