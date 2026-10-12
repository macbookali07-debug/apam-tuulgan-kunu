# Апамдын туулган күнүнө куттуктоо сайтын орнотуу

Сайт эки бөлүктөн турат: `index.html` куттуктоолорду көрсөтөт (GitHub Pages), `form.html` куттуктоо кабыл алат (Vercel). GitHub токени серверде гана сакталат.

## Биринчи жолу орнотуу

1. Репозиторийде `wishes.json` файлы бар экенин жана анын мазмуну `[]` экенин текшериңиз.
2. GitHub репозиторийин **public** кылыңыз. Көрүүчү бет куттуктоолорду GitHub'дан ачык окуйт.
3. GitHub Pages'ти `main` бутагындагы `/ (root)` папкасынан иштетиңиз. Башкы бет: `https://macbookali07-debug.github.io/apam-tuulgan-kunu/`.
4. Ушул репозиторийди Vercel'ге импорттоп, deploy кылыңыз. `vercel.json` форма менен API'ни чогуу чыгарат.
5. Vercel долбоорунда **Settings → Environment Variables** бөлүмүнө `GITHUB_TOKEN` кошуңуз. Анын мааниси — репозиторийдин `wishes.json` файлына **Contents: Read and write** укугу бар GitHub fine-grained token. Токенди HTML же GitHub'га эч качан жазбаңыз.
6. Vercel'де кайра deploy кылыңыз. Башкы GitHub Pages бетиндеги **Куттуктоо Жазуу** баскычы Vercel формасын ачат.

Кааласаңыз Vercel Environment Variables'ка `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` деп башка репозиторийди көрсөтсөңүз болот. Демейки маанилер: `macbookali07-debug`, `apam-tuulgan-kunu`, `main`.

## Текшерүү

- Vercel форма сайтында куттуктоо жөнөтүңүз. Ийгиликтүү болсо, форма башкы GitHub Pages бетине өтөт.
- GitHub'дагы `wishes.json` файлын караңыз: жаңы куттуктоо башына кошулушу керек.
- Бир мүнөткө чейин күтүңүз же башкы бетти жаңыртыңыз. Куттуктоо тизмеде чыгат.
- Сакталбаса, Vercel'дин **Deployments → Functions → `/api/wishes` → Logs** бөлүмүндөгү катаны караңыз. `GITHUB_TOKEN` коюлуп, туура репозиторийге жазуу уруксаты берилгенин текшериңиз. Эски жалпы ката чыкса, акыркы commit'ти Vercel'ге redeploy кылыңыз.
