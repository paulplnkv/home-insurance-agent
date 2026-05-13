# Photo set — Maria Chen hailstorm claim (rehearsal placeholders)

These 12 image files back the Damage Assessment agent (Task 6). They cover
the bucket spec from the PRD §"Source the 12 license-clean photo files":

- 3 unique hail-damaged roof photos (south slope, west slope, dented gutter)
- 3 near-duplicates of the south-slope view
- 2 photos with explicit scale references (coin, tape next to impact crater)
- 2 skylight + interior water damage photos
- 2 unrelated photos (neighbor's fence, parked car)

## License

Current files are sourced from [Lorem Picsum](https://picsum.photos),
which serves photos under [Unsplash's license](https://unsplash.com/license)
— free for commercial use, no attribution required, redistribution OK.
URLs are seeded for reproducibility (`https://picsum.photos/seed/<seed>/1024/768`).

## These are placeholders

Lorem Picsum returns real photos but they do not actually depict hail damage.
Before the conference rehearsal, replace each file with a real Pexels or
Unsplash photo that matches its ground-truth label in
[`lib/scenario/photos.ts`](../../lib/scenario/photos.ts). Keep the file names
stable so the manifest stays in sync.

Suggested Pexels search terms per slot:

| File                       | Search                              |
| -------------------------- | ----------------------------------- |
| `roof-south-1.jpg`         | "hail damage roof shingles"         |
| `roof-south-2.jpg`         | "hail damage asphalt roof"          |
| `roof-west-1.jpg`          | "damaged roof west slope"           |
| `gutter-1.jpg`             | "dented aluminum gutter"            |
| `roof-south-near-1..3.jpg` | duplicates / similar angles of south slope |
| `scale-coin-1.jpg`         | "hail impact coin scale roof"       |
| `scale-tape-1.jpg`         | "hail impact tape measure"          |
| `skylight-1.jpg`           | "damaged skylight"                  |
| `interior-water-1.jpg`     | "ceiling water damage stain"        |
| `neighbor-fence-1.jpg`     | "wooden fence backyard"             |
| `parked-car-1.jpg`         | "parked car driveway"               |

## Re-fetch the placeholders

If you want the same placeholder set as a fresh checkout:

```sh
cd public/photos
for f in roof-south-1:roof-south-1 roof-south-2:roof-south-slope-2 \
  roof-west-1:roof-west-slope gutter-1:dented-gutter \
  roof-south-near-1:south-slope-near-dup-1 \
  roof-south-near-2:south-slope-near-dup-2 \
  roof-south-near-3:south-slope-near-dup-3 \
  scale-coin-1:hail-impact-coin-scale \
  scale-tape-1:hail-impact-tape-scale \
  skylight-1:skylight-leak \
  interior-water-1:interior-water-damage \
  neighbor-fence-1:neighbor-fence parked-car-1:parked-car; do
  name="${f%%:*}"; seed="${f##*:}";
  curl -sSL -o "$name.jpg" "https://picsum.photos/seed/$seed/1024/768";
done
```
