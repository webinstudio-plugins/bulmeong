// node infra/api/index.test.mjs — runs the handler against a fake DynamoDB (needs the AWS SDK only for its command classes:
// run where @aws-sdk/lib-dynamodb resolves, e.g. CloudShell or after `npm i --no-save @aws-sdk/lib-dynamodb @aws-sdk/client-dynamodb`).
import assert from 'node:assert/strict';
import { makeHandler } from './index.mjs';

const calls = [];
const send = async cmd => {
  calls.push(cmd.constructor.name);
  const i = cmd.input;
  if (cmd.constructor.name === 'GetCommand') return { Item: { total: 7, r_work_0: 3 } };
  if (cmd.constructor.name === 'QueryCommand') {
    if (i.Select === 'COUNT') return { Count: 2 };
    if (i.ExpressionAttributeValues[':p'] === 'egg') return { Items: [{ sk: 'egg_42', first: 'kim', at: 'x', count: 2 }] };
    return { Items: [{ sk: '100#a', itemType: 'wood', rk: '', nick: 'lee', sid: 'mysid123' }, { sk: '101#b', itemType: 'stock', rk: 'stock.0', nick: '', sid: 'other123' }] };
  }
  if (cmd.constructor.name === 'UpdateCommand') {
    return i.Key.pk === 'egg' ? { Attributes: { first: 'kim', at: 'x', count: 3 } } : { Attributes: { total: 8 } };
  }
  return {};
};
const h = makeHandler(send, 't', () => 1_000_000_000_000);
const get = (q, ip = '1.1.1.1') => h({ requestContext: { http: { method: 'GET', sourceIp: ip } }, rawPath: '/state', queryStringParameters: q });
const post = (path, body, ip = '1.1.1.1') => h({ requestContext: { http: { method: 'POST', sourceIp: ip } }, rawPath: path, body: JSON.stringify(body) });

let r = await get({ sid: 'mysid123' });
assert.equal(r.statusCode, 200);
let b = JSON.parse(r.body);
assert.deepEqual([b.total, b.online, b.rankings['work.0'], b.eggs.egg_42.first], [7, 2, 3, 'kim']);
assert.deepEqual(b.feed.map(f => f.mine), [true, false]);
assert.ok(!('sid' in b.feed[0]), 'other visitors\' session ids are never returned');

assert.equal((await get({ sid: 'x' })).statusCode, 400);
assert.equal((await post('/burn', { sid: 'mysid123', itemType: 'note-with-text' })).statusCode, 400);
assert.equal((await post('/burn', { sid: 'mysid123', itemType: 'wood', rk: 'work.9' })).statusCode, 400);
r = await post('/burn', { sid: 'mysid123', itemType: 'stock', rk: 'stock.0', nick: '<b>hi</b>' });
assert.equal(JSON.parse(r.body).total, 8);
assert.equal((await post('/egg', { sid: 'mysid123', eggId: 'egg_nope' })).statusCode, 400);
assert.equal(JSON.parse((await post('/egg', { sid: 'mysid123', eggId: 'egg_42', nick: 'me' })).body).first, 'kim');

let last;
for (let i = 0; i < 25; i++) last = await get({ sid: 'mysid123' }, '9.9.9.9');
assert.equal(last.statusCode, 429, 'per-IP limit');
console.log('api tests ok', calls.length, 'db calls');
