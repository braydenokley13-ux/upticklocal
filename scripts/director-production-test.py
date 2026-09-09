#!/usr/bin/env python3
"""Exercise corrupted, stale and conflicting resumable shards without rendering."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('p',Path(__file__).with_name('director-production.py'))
P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)
class ShardSafety(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.path=Path(self.temp.name)
  self.record={'sourceHash':'current'};self.png=self.path/'0000.png';self.png.write_bytes(b'fixture frame')
  self.payload={'sourceHash':'current','lane':'proxy','shot':'station','settings':P.PLAN['lanes']['proxy'],'fps':24,'files':{'0':P.digest(self.png)}}
  self.write()
 def write(self,name='shard-0000-0000.json'):(self.path/name).write_text(json.dumps(self.payload))
 def check(self):return P.validate_shards(self.path,self.record,'proxy','station')
 def test_valid_resume(self):self.assertEqual(self.check(),{0:P.digest(self.png)})
 def test_corrupt_pixels_rejected(self):
  self.png.write_bytes(b'changed pixels')
  with self.assertRaises(AssertionError):self.check()
 def test_missing_pixels_rejected(self):
  self.png.unlink()
  with self.assertRaises(AssertionError):self.check()
 def test_stale_source_rejected(self):
  self.payload['sourceHash']='old';self.write()
  with self.assertRaises(AssertionError):self.check()
 def test_other_lane_rejected(self):
  self.payload['lane']='final';self.write()
  with self.assertRaises(AssertionError):self.check()
 def test_conflicting_overlap_rejected(self):
  self.payload['files']['0']='different';self.write('shard-0000-0001.json')
  with self.assertRaises(AssertionError):self.check()
 def test_out_of_range_rejected(self):
  self.payload['files']={'120':P.digest(self.png)};self.write()
  with self.assertRaises(AssertionError):self.check()
 def test_unapproved_lock_rejected(self):
  with self.assertRaises(RuntimeError):P.verify_lock(self.record)
if __name__=='__main__':unittest.main()
