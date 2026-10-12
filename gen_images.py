"""Generate Jejakara site images via nanaAI muse-image (OpenAI-compatible). Idempotent: skips existing outputs."""
import base64, json, os, sys, urllib.request, concurrent.futures as cf

BASE = "https://nana.mwcs.dev/api/v1/images/generations"
TOKEN = open(os.path.join(os.path.dirname(__file__), "token.txt")).read().strip()
RAW = os.path.join(os.path.dirname(__file__), "assets", "img", "raw")
OUT = os.path.join(os.path.dirname(__file__), "assets", "img")
os.makedirs(RAW, exist_ok=True)

STYLE = ("editorial luxury still-life photography, medium format film look, soft directional daylight, "
         "muted warm neutral palette, matte finish, fine film grain, restrained composition, "
         "no text, no watermark, no logo")

JOBS = [
    # name, size, prompt
    ("hero-1", "1024x1536",
     "dark atelier still life: raw vegetable-tanned leather hides, hand-carved teak shoe lasts and wood shavings "
     "arranged on a dark stone slab against a black wall, deep shadows, single shaft of daylight from the right, " + STYLE),
    ("hero-2", "1024x1536",
     "a pair of handmade tan leather clogs with carved wooden soles standing on a pale concrete floor, "
     "long soft shadow, cropped at the ankle, person wearing them, dark background, " + STYLE),
    ("craft-1", "1536x1024",
     "close-up of an artisan's hands carving a wooden shoe sole with a chisel on a workbench, "
     "wood curls, warm side light, shallow depth of field, dark workshop, " + STYLE),
    ("story-1", "1536x1024",
     "wide interior of a small shoemaking atelier: workbench, hanging leather tools, stacks of leather and "
     "finished shoes on wooden shelves, dusty daylight through a tall window, quiet atmosphere, " + STYLE),
    # 7 tahap proses (kartu Proses di PDP; tahap 07 = craft-1.png yang sudah ada)
    ("s1", "1024x1024",
     "artisan's hands lifting and inspecting a large vegetable-tanned leather hide over a wooden rail in a "
     "dark workshop, checking the surface for flaws, warm side light, " + STYLE),
    ("s2", "1024x1024",
     "close-up of hands cutting a shoe pattern from vegetable-tanned leather with a sharp knife around a "
     "cardboard template on a wooden cutting table, " + STYLE),
    ("s3", "1024x1024",
     "close-up of hands guiding a leather shoe upper through an industrial sewing machine, waxed thread "
     "line forming, dark workshop, warm side light, " + STYLE),
    ("s4", "1024x1024",
     "hands pulling a leather shoe upper tight over a wooden shoe last with lasting pliers, nails on the "
     "workbench, dark workshop, " + STYLE),
    ("s5", "1024x1024",
     "hands attaching a carved wooden sole to a leather shoe upper with a small hammer on a workbench, "
     "dark workshop, warm side light, " + STYLE),
    ("s6", "1024x1024",
     "hands buffing a finished leather shoe with a soft cloth, oil tin nearby, warm sheen on the leather, "
     "dark workshop, " + STYLE),
    ("p1a", "1024x1536", "single handmade clog with carved polished teak sole and natural tan leather upper, "
     "standing on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p1b", "1024x1536", "the same handmade tan leather clog with wooden sole seen from above at an angle, "
     "on a pale plaster surface, warm off-white studio background, " + STYLE),
    ("p1c", "1024x1536", "extreme detail macro of hand-stitched tan leather and carved wood grain of a clog heel, "
     "warm off-white background, " + STYLE),
    ("p2a", "1024x1536", "single handmade woven leather sandal in cognac brown, flat woven strap, "
     "on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p2b", "1024x1536", "the same woven cognac leather sandal seen from the side, on a pale plaster surface, "
     "warm off-white studio background, " + STYLE),
    ("p2c", "1024x1536", "extreme detail macro of woven leather straps of a sandal, cognac brown texture, "
     "warm off-white background, " + STYLE),
    ("p3a", "1024x1536", "single handmade dark brown leather ankle boot with clean silhouette, "
     "on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p3b", "1024x1536", "the same dark brown leather ankle boot seen three-quarter from behind, "
     "on a pale plaster surface, warm off-white studio background, " + STYLE),
    ("p3c", "1024x1536", "extreme detail macro of polished dark brown leather boot shaft and stitched welt, "
     "warm off-white background, " + STYLE),
    ("p4a", "1024x1536", "single handmade black leather penny loafer, minimal, "
     "on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p4b", "1024x1536", "the same black leather penny loafer seen from above, on a pale plaster surface, "
     "warm off-white studio background, " + STYLE),
    ("p4c", "1024x1536", "extreme detail macro of black calfskin grain and the stitched band of a loafer, "
     "warm off-white background, " + STYLE),
    ("p5a", "1024x1536", "single minimal low-top sneaker in off-white canvas and natural gum sole, handmade, "
     "on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p5b", "1024x1536", "the same off-white canvas sneaker seen from the side, on a pale plaster surface, "
     "warm off-white studio background, " + STYLE),
    ("p5c", "1024x1536", "extreme detail macro of off-white canvas weave and gum rubber sole edge of a sneaker, "
     "warm off-white background, " + STYLE),
    ("p6a", "1024x1536", "single handmade burgundy leather heeled sandal with thin straps and sculpted heel, "
     "on a pale plaster plinth, seamless warm off-white studio background, " + STYLE),
    ("p6b", "1024x1536", "the same burgundy leather heeled sandal seen from the side, on a pale plaster surface, "
     "warm off-white studio background, " + STYLE),
    ("p6c", "1024x1536", "extreme detail macro of deep burgundy leather strap and polished heel of a sandal, "
     "warm off-white background, " + STYLE),
    # on-model: kaki dipotong di bawah lutut, tanpa wajah
    ("p1m", "1024x1536", "person wearing the handmade tan leather clogs with carved wooden soles, framed from "
     "knee down, standing on pale concrete floor, dark neutral background, editorial fashion lookbook, "
     "muted trousers cuff, " + STYLE),
    ("p2m", "1024x1536", "person wearing the woven cognac leather sandals, framed from calf down, one foot "
     "stepping forward on pale concrete, dark neutral background, editorial fashion lookbook, " + STYLE),
    ("p3m", "1024x1536", "person wearing the dark brown leather ankle boots with tailored trousers cropped "
     "above the ankle, framed from knee down, walking stance on pale concrete, dark neutral background, "
     "editorial fashion lookbook, " + STYLE),
    ("p4m", "1024x1536", "person wearing the black leather penny loafers with tailored trousers, framed from "
     "calf down, standing on pale concrete, dark neutral background, editorial fashion lookbook, " + STYLE),
    ("p5m", "1024x1536", "person wearing the off-white canvas sneakers with rolled jeans, framed from calf "
     "down, one foot forward on pale concrete, dark neutral background, editorial fashion lookbook, " + STYLE),
    ("p6m", "1024x1536", "person wearing the burgundy heeled leather sandals, framed from calf down, standing "
     "pose on pale concrete, dark neutral background, editorial fashion lookbook, " + STYLE),
]

def gen(job):
    name, size, prompt = job
    out = os.path.join(OUT, name + ".png")
    if os.path.exists(out) and os.path.getsize(out) > 10000:
        return name, "skip"
    body = json.dumps({"model": "muse-image", "prompt": prompt, "n": 1, "size": size}).encode()
    req = urllib.request.Request(BASE, data=body, method="POST",
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            d = json.load(r)
        item = d["data"][0]
        if item.get("b64_json"):
            raw = base64.b64decode(item["b64_json"])
        else:
            with urllib.request.urlopen(item["url"], timeout=120) as r2:
                raw = r2.read()
        with open(out, "wb") as f:
            f.write(raw)
        return name, f"ok {len(raw)//1024}KB"
    except Exception as e:
        return name, f"ERR {e}"

with cf.ThreadPoolExecutor(max_workers=4) as ex:
    for name, status in ex.map(gen, JOBS):
        print(name, status, flush=True)
print("DONE")
