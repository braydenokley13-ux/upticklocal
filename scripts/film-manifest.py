"""Writes the lab's render ledger from what exists on disk."""
import glob, json, os, time
out = "public/film-rd/renders"
m = {}
for id in ("Hero1", "Hero2", "Hero3", "Hero4", "Hero5"):
    video = os.path.join(out, f"{id}.mp4")
    if not os.path.exists(video):
        continue
    stills = sorted(glob.glob(os.path.join(out, "stills", f"{id}-*.png")))
    m[id] = {
        "video": f"/film-rd/renders/{id}.mp4",
        "contact": f"/film-rd/renders/{id}-contact.png" if os.path.exists(os.path.join(out, f"{id}-contact.png")) else None,
        "stills": [f"/film-rd/renders/stills/{os.path.basename(s)}" for s in stills],
        "renderedAt": time.strftime("%Y-%m-%d %H:%M", time.localtime(os.path.getmtime(video))),
        "bytes": os.path.getsize(video),
    }
json.dump(m, open(os.path.join(out, "manifest.json"), "w"), indent=2)
print("manifest:", list(m))
