// 매일 실행: Firebase에 저장된 구독 대상에게 웹푸시 발송
const webpush = require('web-push');
const DB = process.env.DB_URL;
webpush.setVapidDetails(
  'mailto:mychan0131@gmail.com',
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);
const APP_URL = 'https://pilot-victor.github.io/weekly-words/';

(async () => {
  const res = await fetch(`${DB}/pushSubs.json`);
  const subs = (await res.json()) || {};
  const ids = Object.keys(subs);
  const payload = JSON.stringify({
    title: '📚 주간 영어 표현',
    body: '오늘의 표현 3개 학습하고 완료 체크하세요 👉',
    url: APP_URL
  });
  let ok = 0, gone = 0;
  for (const id of ids) {
    const v = subs[id];
    if (!v || !v.sub) continue;
    try {
      await webpush.sendNotification(v.sub, payload);
      ok++;
    } catch (e) {
      console.log('fail', id, e.statusCode);
      if (e.statusCode === 404 || e.statusCode === 410) {
        await fetch(`${DB}/pushSubs/${id}.json`, { method: 'DELETE' });
        gone++;
      }
    }
  }
  console.log(`sent=${ok} removed=${gone} total=${ids.length}`);
})().catch(e => { console.error(e); process.exit(1); });
