# Локалдык көрүү

Бул сайтта куттуктоолор `localStorage`'га сакталбайт. `index.html` өз API'бизден (`/api/wishes`) окуйт (иштебесе GitHub'дагы ачык `wishes.json` файлына кайтылат), ал эми `form.html` куттуктоону `/api/wishes` кызматына жөнөтөт. Ошондуктан HTML файлды түз ачканда (`file://`) форма жөнөтүлбөйт.

Толук иштетүү үчүн репозиторийди Vercel'ге deploy кылып, Vercel'де `GITHUB_TOKEN` Environment Variable орнотуңуз. Кадамдар `README.md` файлында.
