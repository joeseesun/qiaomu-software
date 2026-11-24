import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import sharp from 'sharp';
import { createSoftwareServer } from '../server.mjs';

test('catalog backfills public posters, counts each poster once, supports filters and updates on withdrawal', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'software-catalog-'));
  const filename = join(dir, 'legacy.sqlite');
  const legacy = new DatabaseSync(filename);
  legacy.exec(`
    CREATE TABLE shares (
      id TEXT PRIMARY KEY, owner_hash TEXT NOT NULL, digest TEXT NOT NULL,
      name TEXT NOT NULL, title TEXT NOT NULL, visibility TEXT NOT NULL,
      apps TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
      image BLOB NOT NULL, thumbnail BLOB NOT NULL, created INTEGER NOT NULL
    );
  `);
  const legacyId = 'a'.repeat(24);
  legacy.prepare('INSERT INTO shares VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(legacyId, '', '', '旧署名', '迁移前海报', 'public',
      JSON.stringify([{name:'Obsidian', group:'写作'}]), 320, 180, Buffer.alloc(0), Buffer.alloc(0), Date.now());
  legacy.close();

  const server = createSoftwareServer({path: filename});
  server.listen(0, '127.0.0.1');
  await once(server,'listening');
  t.after(async () => {
    await new Promise(resolve=>server.close(resolve));
    rmSync(dir, {recursive:true,force:true});
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  const picture = await sharp({create:{width:320,height:180,channels:3,background:'#3366bc'}}).png().toBuffer();
  const html = path => fetch(base+path).then(r=>r.text());
  const lookup = (app, category) => '/posters?app=' + encodeURIComponent(app) + (category ? '&category=' + encodeURIComponent(category) : '');
  const put = async (title, visibility, apps) => {
    const response = await fetch(base+'/api/v1/shares',{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'QA',title,visibility,apps,image:picture.toString('base64')}),
    });
    assert.equal(response.status,201);
    return response.json();
  };

  const listed = await put('公开测试海报','public',[
    {name:'Obsidian',group:'写作'}, {name:'obsidian',group:'写作'},
    {name:'Obsidian',group:'开发'}, {name:'独家工具',group:'效率'},
  ]);
  const unlisted = await put('链接测试海报','link',[
    {name:'Obsidian',group:'开发'}, {name:'隐蔽工具',group:'不公开分类'},
  ]);

  const listing = await html('/apps');
  assert.match(listing,/Obsidian/);
  assert.match(listing,/独家工具/);
  assert.match(listing,/href="\/apps\/obsidian"/);
  assert.doesNotMatch(listing,/隐蔽工具|不公开分类/);
  assert.match(await html('/apps?q=obsidian'),/Obsidian/);
  assert.doesNotMatch(await html('/apps?category='+encodeURIComponent('开发')),/独家工具/);
  assert.match(await html(lookup('Obsidian')),new RegExp('/s/'+legacyId));
  const filteredGallery = await html(lookup('Obsidian','开发'));
  assert.match(filteredGallery,new RegExp('/s/'+listed.id));
  assert.doesNotMatch(filteredGallery,new RegExp('/s/'+legacyId+'|/s/'+unlisted.id));
  assert.doesNotMatch(await html(lookup('Obsid')),new RegExp('/s/'+listed.id));

  const index = new DatabaseSync(filename,{readOnly:true});
  try {
    const count = () => index.prepare("SELECT COUNT(DISTINCT share_id) AS n FROM app_mentions WHERE app_key='obsidian'").get().n;
    assert.equal(count(),2);
    assert.equal(index.prepare('SELECT COUNT(*) AS n FROM app_mentions WHERE share_id=? AND app_key=?').get(listed.id,'obsidian').n,2);
    assert.equal(index.prepare('SELECT COUNT(*) AS n FROM app_mentions WHERE share_id=?').get(unlisted.id).n,0);
    const remove = await fetch(base+'/api/v1/shares/'+listed.id,
      {method:'DELETE',headers:{authorization:'Bearer '+listed.removeToken}});
    assert.equal(remove.status,204);
    assert.equal(count(),1);
    assert.doesNotMatch(await html('/apps?q='+encodeURIComponent('独家工具')),/\/apps\/%E7%8B%AC/);
    assert.equal((await fetch(base+'/apps/'+encodeURIComponent('独家工具'))).status,404);
  } finally { index.close(); }
});
