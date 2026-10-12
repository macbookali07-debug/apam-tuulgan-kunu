const API_URL = 'https://api.github.com';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'macbookali07-debug';
  const repo = process.env.GITHUB_REPO || 'apam-tuulgan-kunu';
  const branch = process.env.GITHUB_BRANCH || 'main';

  // GET: бардык куттуктоолорду кайтаруу (текшерүү/диагностика үчүн)
  if (req.method === 'GET') {
    if (!token) {
      return res.status(503).json({ error: 'Серверге GitHub токен орнотула элек.' });
    }
    try {
      const url = `${API_URL}/repos/${owner}/${repo}/contents/wishes.json`;
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      };
      const fileResponse = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
      if (!fileResponse.ok) {
        const detail = await fileResponse.text();
        console.error('GitHub read failed:', fileResponse.status, detail);
        return res.status(502).json({ error: 'Куттуктоолор файлын окуй алган жок. GitHub уруксаттарын текшериңиз.' });
      }
      const file = await fileResponse.json();
      const wishes = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      return res.status(200).json(wishes);
    } catch (error) {
      console.error('Wish read failed:', error);
      return res.status(500).json({ error: 'Куттуктоолорду окууда ката кетти.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Бул сурам колдоого алынбайт.' });
  }

  if (!token) {
    return res.status(503).json({ error: 'Серверге GitHub токен орнотула элек.' });
  }

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!name || !message || name.length > 80 || message.length > 2000) {
    return res.status(400).json({ error: 'Аты 1–80, куттуктоо 1–2000 белги болушу керек.' });
  }

  const url = `${API_URL}/repos/${owner}/${repo}/contents/wishes.json`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  try {
    const fileResponse = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
    let wishes = [];
    let sha;

    if (fileResponse.ok) {
      const file = await fileResponse.json();
      sha = file.sha;
      wishes = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      if (!Array.isArray(wishes)) throw new Error('wishes.json массив болушу керек.');
    } else if (fileResponse.status !== 404) {
      const detail = await fileResponse.text();
      console.error('GitHub read failed:', fileResponse.status, detail);
      return res.status(502).json({ error: 'Куттуктоолор файлын окуй алган жок. GitHub уруксаттарын текшериңиз.' });
    }

    wishes.unshift({ name, message, date: new Date().toISOString() });
    const content = Buffer.from(`${JSON.stringify(wishes, null, 2)}\n`, 'utf8').toString('base64');
    const saveResponse = await fetch(url, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Жаңы куттуктоо: ${name}`,
        content,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!saveResponse.ok) {
      const detail = await saveResponse.text();
      console.error('GitHub write failed:', saveResponse.status, detail);
      const conflict = saveResponse.status === 409 || saveResponse.status === 422;
      return res.status(conflict ? 409 : 502).json({
        error: conflict
          ? 'Бир убакта башка куттуктоо сакталды. Баракты жаңыртып, кайра жөнөтүңүз.'
          : 'GitHub файлды сактаган жок. Токендин уруксатын жана репозиторийди текшериңиз.'
      });
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Wish submission failed:', error);
    return res.status(500).json({ error: 'Куттуктоону сактоодо ката кетти. Кайра аракет кылыңыз.' });
  }
};
