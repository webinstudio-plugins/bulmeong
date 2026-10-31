// Bulmeong shared state: total burns, ranked preset words, recent presence, first discoverers of the secret flames,
// and a short feed of other visitors' throws. Lambda (Node 22, function URL) + DynamoDB table (pk, sk, ttl).
// Only preset ids, item types and a 14-character nickname travel here; nothing people write.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ITEMS = new Set(['scroll', 'resignation', 'stock', 'clock', 'wood']);
const RK = /^(work|stock|relation|zen)\.[0-4]$/;
const SID = /^[a-z0-9_]{6,40}$/i;
const EGGS = new Set(['egg_matrix', 'egg_bull', 'egg_fireworks', 'egg_lightning', 'egg_sakura', 'egg_konami', 'egg_blackhole',
  'egg_satoshi', 'egg_sword', 'egg_dragon', 'egg_pi', 'egg_42', 'egg_helloworld', 'egg_binary', 'egg_morse',
  'egg_prometheus', 'egg_schrodinger', 'egg_nirvana', 'egg_phoenix', 'egg_creator']);
const PRESENCE_S = 150; // a visitor counts as here for 150 s after their last poll (clients poll every 30 s)
const FEED_S = 600;

const nick = v => String(v || '').replace(/[\u0000-\u001f\u007f<>&"']/g, '').trim().slice(0, 14);
const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) });

export function makeHandler(send, table, clock = () => Date.now()) {
  const hits = new Map();
  // shortcut: per-IP limit only inside one warm instance (reserved concurrency keeps them few); a WAF would be the upgrade
  const limited = (ip, max) => {
    const key = `${ip}:${Math.floor(clock() / 60000)}`;
    const n = (hits.get(key) || 0) + 1;
    if (hits.size > 5000) hits.clear();
    hits.set(key, n);
    return n > max;
  };
  let shared = { at: 0, data: null }; // stats, presence count and eggs are re-read at most every 10 s per instance

  async function readShared(now) {
    if (shared.data && clock() - shared.at < 10000) return shared.data;
    const [stats, presence, eggs] = await Promise.all([
      send(new GetCommand({ TableName: table, Key: { pk: 'stats', sk: 'all' } })),
      send(new QueryCommand({ TableName: table, KeyConditionExpression: 'pk = :p', FilterExpression: '#t > :now',
        ExpressionAttributeNames: { '#t': 'ttl' }, ExpressionAttributeValues: { ':p': 'presence', ':now': now }, Select: 'COUNT' })),
      send(new QueryCommand({ TableName: table, KeyConditionExpression: 'pk = :p', ExpressionAttributeValues: { ':p': 'egg' } }))
    ]);
    const s = stats.Item || {};
    const rankings = Object.fromEntries(Object.entries(s).filter(([k]) => k.startsWith('r_')).map(([k, v]) => [k.slice(2).replace('_', '.'), Number(v)]));
    const eggMap = Object.fromEntries((eggs.Items || []).map(e => [e.sk, { first: e.first || '', at: e.at, count: Number(e.count) || 0 }]));
    shared = { at: clock(), data: { total: Number(s.total) || 0, online: presence.Count || 0, rankings, eggs: eggMap } };
    return shared.data;
  }

  return async event => {
    const method = event.requestContext?.http?.method;
    const path = event.rawPath || '/';
    const ip = event.requestContext?.http?.sourceIp || '?';
    if (method === 'OPTIONS') return { statusCode: 204 };
    if (limited(ip, method === 'GET' ? 20 : 30)) return json(429, { error: 'slow down' });
    let body = {};
    if (method === 'POST') {
      try {
        body = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : event.body || '{}');
      } catch {
        return json(400, { error: 'bad json' });
      }
    }
    const sid = String((method === 'GET' ? event.queryStringParameters?.sid : body.sid) || '');
    if (!SID.test(sid)) return json(400, { error: 'bad sid' });
    const now = Math.floor(clock() / 1000);

    if (method === 'GET' && path === '/state') {
      await send(new PutCommand({ TableName: table, Item: { pk: 'presence', sk: sid, ttl: now + PRESENCE_S } }));
      const since = Math.max(now - FEED_S, Number(event.queryStringParameters?.since) || 0);
      const [s, feed] = await Promise.all([
        readShared(now),
        send(new QueryCommand({ TableName: table, KeyConditionExpression: 'pk = :p AND sk > :s',
          ExpressionAttributeValues: { ':p': 'feed', ':s': String(since) }, Limit: 20 }))
      ]);
      const items = (feed.Items || []).map(f => ({ id: f.sk, itemType: f.itemType, rk: f.rk || '', nick: f.nick || '', mine: f.sid === sid }));
      return json(200, { now, ...s, online: Math.max(1, s.online), feed: items });
    }

    if (method === 'POST' && path === '/burn') {
      const itemType = String(body.itemType || '');
      const rk = String(body.rk || '');
      if (!ITEMS.has(itemType) || (rk && !RK.test(rk))) return json(400, { error: 'bad burn' });
      const names = { '#total': 'total' };
      let expr = 'ADD #total :one';
      if (rk) {
        names['#rk'] = `r_${rk.replace('.', '_')}`;
        expr += ', #rk :one';
      }
      const res = await send(new UpdateCommand({ TableName: table, Key: { pk: 'stats', sk: 'all' }, UpdateExpression: expr,
        ExpressionAttributeNames: names, ExpressionAttributeValues: { ':one': 1 }, ReturnValues: 'UPDATED_NEW' }));
      await send(new PutCommand({ TableName: table, Item: { pk: 'feed', sk: `${now}#${Math.random().toString(36).slice(2, 10)}`,
        itemType, rk, nick: nick(body.nick), sid, ttl: now + FEED_S } }));
      return json(200, { total: Number(res.Attributes?.total) || 0 });
    }

    if (method === 'POST' && path === '/egg') {
      const eggId = String(body.eggId || '');
      if (!EGGS.has(eggId)) return json(400, { error: 'bad egg' });
      const res = await send(new UpdateCommand({ TableName: table, Key: { pk: 'egg', sk: eggId },
        UpdateExpression: 'SET #f = if_not_exists(#f, :n), #a = if_not_exists(#a, :t) ADD #c :one',
        ExpressionAttributeNames: { '#f': 'first', '#a': 'at', '#c': 'count' },
        ExpressionAttributeValues: { ':n': nick(body.nick), ':t': new Date(clock()).toISOString(), ':one': 1 }, ReturnValues: 'ALL_NEW' }));
      const a = res.Attributes || {};
      return json(200, { first: a.first || '', at: a.at, count: Number(a.count) || 0 });
    }

    return json(404, { error: 'not found' });
  };
}

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const handler = makeHandler(cmd => db.send(cmd), process.env.TABLE || 'bulmeong');
