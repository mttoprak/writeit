# WriteIt Uygulamasını Hostlama Rehberi

Bu rehber, uygulamanızı **Frontend için Netlify** ve **Backend için Render** kullanarak nasıl ücretsiz bir şekilde yayınlayacağınızı anlatır.

## 1. Hazırlık

Projenizde gerekli kod değişiklikleri yapıldı:
- **Backend:** Port numarası dinamik hale getirildi (`process.env.PORT`).
- **Frontend:** API adresi environment variable (`VITE_API_URL`) üzerinden alınacak şekilde ayarlandı.
- **Frontend (Netlify):** Netlify'da sayfa yenilemelerinde 404 hatası almamak için `client/public/_redirects` dosyası oluşturuldu.

Kodlarınızı GitHub'a yüklediğinizden emin olun (Frontend ve Backend aynı repoda olabilir).

---

## 2. Backend'i Hostlama (Render.com)

Backend servisiniz Node.js ve Express kullanıyor. Render bu tür servisler için harika ve ücretsiz bir seçenektir.

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
    *   **Instance Type:** Free
5.  **Environment Variables** bölümüne gidin ve şunları ekleyin:
    *   `MONGO_URI`: (MongoDB Atlas bağlantı adresiniz - `.env` dosyanızdaki değer)
    *   `JWT_SECRET`: (Gizli anahtarınız - `.env` dosyanızdaki değer)
    *   `CLIENT_URL`: (Frontend URL'inizi buraya daha sonra ekleyebilirsiniz veya `*` yapabilirsiniz, şimdilik boş bırakabilir veya Netlify URL'ini alınca güncelleyebilirsiniz. Kodda `origin: true` olduğu için sorun olmayacaktır.)
6.  **"Create Web Service"** butonuna tıklayın.

Render backend'inizi derleyip başlatacaktır. İşlem bittiğinde size `https://writeit-api.onrender.com` gibi bir URL verecektir. **Bu URL'i kopyalayın.**

*Not: Render ücretsiz planında servis kullanılmadığında uyku moduna geçer, bu yüzden ilk istekte açılması 30-60 saniye sürebilir.*

---

## 3. Frontend'i Hostlama (Netlify)

Frontend React ve Vite kullanıyor. Netlify, statik siteler ve SPA'lar için mükemmel ve ücretsiz bir servistir.

1.  [Netlify.com](https://www.netlify.com/) adresine gidin ve GitHub hesabınızla giriş yapın.
2.  **"Add new site"** butonuna tıklayın ve **"Import an existing project"** seçeneğini seçin.
3.  **GitHub**'ı seçin ve reponuzu bulun.
4.  **Site settings** ekranında şu ayarları yapın:
    *   **Base directory:** `client` (Frontend dosyalarınız burada olduğu için).
    *   **Build command:** `npm run build` (Otomatik gelmeli).
    *   **Publish directory:** `dist` (Vite varsayılan olarak buraya çıktı verir).
5.  **"Environment variables"** (veya "Advanced" -> "New Variable") butonuna tıklayın ve şunu ekleyin:
    *   **Key:** `VITE_API_URL`
    *   **Value:** Render'dan aldığınız Backend URL'i + `/api` (Örn: `https://writeit-api.onrender.com/api`)
        *   *Önemli: Kodunuzda `baseURL` ayarı `.../api` ile biten bir adres beklediği için sonuna `/api` eklemeyi unutmayın.*
6.  **"Deploy site"** butonuna tıklayın.

Netlify frontend'inizi derleyip yayınlayacaktır. Size `https://random-name-123456.netlify.app` gibi bir URL verecektir. İsterseniz "Site settings" -> "Change site name" kısmından bu ismi değiştirebilirsiniz (örn: `writeit-app.netlify.app`).

*Not: Eğer `client/public/_redirects` dosyası oluşturmadıysanız, Netlify ayarlarından "Build & deploy" -> "Post processing" kısmında "Enable SPA mode" seçeneğini aktif edin.*

---

## 4. Son Kontroller

1.  Netlify tarafından verilen Frontend URL'ine gidin.
2.  Kayıt olmayı ve giriş yapmayı deneyin.
3.  Post oluşturmayı ve görüntülemeyi deneyin.

Eğer "Network Error" veya CORS hatası alırsanız:
- Backend (`api/index.js`) dosyasındaki CORS ayarlarını kontrol edin.
- `VITE_API_URL`'in doğru girildiğinden emin olun (sonunda `/api` olup olmadığına dikkat edin).
- Render'daki backend servisinin "Live" olduğundan emin olun.

Tebrikler! Uygulamanız Netlify ve Render üzerinde yayında. 🚀
