"""Original temporary car-wash location cue. No stock samples or API calls."""
import os,subprocess,wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
sr=48000;n=sr*12;t=np.arange(n)/sr
rng=np.random.default_rng(20260909)
freq=np.fft.rfftfreq(n,1/sr)
channels=[]
for phase in (0,.7):
    noise=rng.normal(size=n)
    spectrum=np.fft.rfft(noise)
    spectrum*=((freq/280)**2/(1+(freq/280)**2))/(1+(freq/6200)**6)
    hiss=np.fft.irfft(spectrum,n)
    envelope=.55+.16*np.sin(2*np.pi*.24*t+phase)+.08*np.sin(2*np.pi*.61*t)
    motor=.05*np.sin(2*np.pi*92*t)+.02*np.sin(2*np.pi*184*t)
    channels.append((hiss*.13*envelope+motor)*np.minimum(1,t/.15)*np.minimum(1,(12-t)/.3))
data=np.column_stack(channels);out=ROOT/'public/film-rd/audio/director-carwash.wav'
with wave.open(str(out),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
subprocess.run([os.environ.get('FFMPEG','ffmpeg'),'-y','-v','error','-i',str(out),'-c:a','libvorbis','-q:a','5',str(out.with_suffix('.ogg'))],check=True)
print(out.with_suffix('.ogg'))
