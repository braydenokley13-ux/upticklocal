import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const a=JSON.parse(readFileSync('film/data/acquisition.json','utf8'));
const plan=JSON.parse(readFileSync('film/render/acquisition-shots.json','utf8'));
const physical=new Map(plan.shots.map(s=>[s.id,s.frames]));
for(const act of a.acts) {
  if(['proof','closing'].includes(act.id)) continue;
  const expected=act.end-act.start;
  assert.equal(act.id==='network'?physical.get('network-lube')+physical.get('network-tire')+physical.get('network'):physical.get(act.id),expected,`${act.id} plate/edit duration mismatch`);
}
assert.equal(a.acts.at(-1).end,1608);
for(const name of ['external','pass','route','approach','first','redeemed','permission','friday','return-approach','second','paid','network-lube','network-tire','network']) assert(physical.has(name));
const file=process.argv[2];
if(file){
  assert(existsSync(file));
  const result=spawnSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const data=JSON.parse(result.stdout);const video=data.streams.find(s=>s.codec_type==='video');
  assert.equal(video.width,1920);assert.equal(video.height,1080);assert.equal(video.r_frame_rate,'24/1');
  assert.equal(Number(video.nb_read_frames),1608);
  assert(data.streams.some(s=>s.codec_type==='audio'),'Master has no audio stream');
  assert(Math.abs(Number(data.format.duration)-67)<.1);
}
console.log(file?'PASS: master technical properties; no creative judgment implied':'PASS: full edit and every physical shot have matching frame budgets');
