# Can Satellite Data Predict Socioeconomic Development Across Indian Districts?

**Author:** Anjana K S | MA Economics, Azim Premji University  
**Tools:** Google Earth Engine · Python · scikit-learn · XGBoost · pandas · seaborn  
**Data year:** 2021

---

## What this is

I wanted to know whether satellite imagery alone — the kind that's freely available
to anyone with a Google account — could tell us something meaningful about how
developed a district in India is.

The idea isn't new. Economists have used nighttime lights as a proxy for economic
activity since at least the early 2000s. But most of that work validates against
GDP or poverty headcounts. Here, I used district-level wealth data aggregated from
~57,000 households surveyed in the NFHS-5 (India's national family health survey)
as the ground truth — which I think is a more grounded benchmark than GDP.

I also didn't stop at nightlights. I pulled in vegetation cover (NDVI), elevation,
and built-up area from GEE to see if the combination does better than lights alone.
Short answer: it does. Longer answer: it's complicated, and the most interesting
result is a methodological one (see below).

---

## Data

| Source | What I extracted | Resolution |
|--------|-----------------|------------|
| NOAA VIIRS DNB Monthly V1 | Nighttime radiance (`avg_rad`), cloud-free coverage (`cf_cvg`) | 500 m |
| MODIS MOD13Q1 | NDVI — vegetation index | 250 m |
| USGS SRTM | Elevation (metres) | 30 m |
| Google Dynamic World V1 | Built-up area fraction | 10 m |
| NFHS-5 Couples Recode (2019–21) | Wealth, financial inclusion, literacy, urbanisation | Household-level, aggregated to district |

All satellite layers were extracted for every Indian district using `reduceRegions()`
in Google Earth Engine, then merged with NFHS-5 district aggregates via the
Census 2011 district ID (`pc11_d_id`). Final dataset covers **575 districts**.

---

## Results

| Model | R² (test set) |
|-------|:---:|
| Linear Regression | 0.218 |
| XGBoost | 0.652 |
| **Random Forest** | **0.723** |
| Random Forest (without cf_cvg) | 0.471 |

The jump from linear (0.22) to Random Forest (0.72) tells you the
relationship between satellite signals and wealth isn't linear —
there are interactions and thresholds that tree-based models pick up well.

**Feature importance (Random Forest):**

| Feature | Importance | What it is |
|---------|:----------:|-----------|
| `cf_cvg` | 0.489 | Cloud-free coverage — a VIIRS data quality flag |
| `avg_rad` | 0.239 | Nighttime light radiance |
| `ndvi` | 0.104 | Vegetation cover |
| `elevation` | 0.087 | Terrain elevation |
| `builtup` | 0.081 | Built-up area fraction |

**The interesting finding:** `cf_cvg` — which measures what fraction of
observations in the monthly composite were cloud-free — came out as the
single most important predictor, beating nightlights. This is a data quality
variable, not a development signal. What's likely happening is geographic
confounding: arid districts in Rajasthan and Gujarat have very high
cloud-free coverage and also have distinct development patterns, so the
model learns to use `cf_cvg` as a geographic proxy.

Removing it drops R² from 0.72 to 0.47. That 0.47 is arguably the more
honest number — it's what nightlights, vegetation, elevation, and built-up
area can do on their own, without the model piggybacking on geography.
This kind of artifact is easy to miss if you don't interrogate your
feature importance, which is why I ran the robustness check.

---

## Repo structure

```
nightlights-india-development/
│
├── README.md
├── requirements.txt
│
├── gee_scripts/
│   ├── 01_nightlights_extract.js   ← VIIRS nightlights + cf_cvg
│   ├── 02_ndvi_extract.js          ← MODIS NDVI
│   ├── 03_elevation_extract.js     ← SRTM elevation
│   ├── 04_builtup_extract.js       ← Dynamic World built-up
│   └── 05_visualise_districts.js   ← Visual check in GEE before extraction
│
├── notebooks/
│   └── nightlights_ml.ipynb        ← Full pipeline: merge → EDA → models → SHAP
│
├── data/
│   └── README.md                   ← Where to get the data (not included here)
│
└── outputs/
    ├── correlation_heatmap.png
    ├── scatter_plots.png
    ├── model_comparison.png
    └── feature_importance.png
```

---

## How to reproduce

**Satellite data** — run scripts 01–04 in `gee_scripts/` in the
[GEE Code Editor](https://code.earthengine.google.com). Each one exports
a CSV to your Google Drive. Run 05 first just to visually confirm
the district layer looks right.

**NFHS-5 data** — register at [rchiips.org/nfhs](http://rchiips.org/nfhs)
and download the Couples Recode (`IABR7AFL.DTA`). See `data/README.md`
for the exact variables and cleaning steps used.

**Notebook** — open `notebooks/nightlights_ml.ipynb` in Google Colab,
mount your Drive, and update `DATA_DIR` in cell 2 to point to
wherever you stored the CSVs and DTA file.

---

## Context

This sits within a broader literature on satellite-based development proxies
(Henderson et al. 2012; Donaldson & Storeygard 2016). The main thing
I'd flag as different here is the ground truth — using household survey
wealth rather than GDP gives a more granular, household-grounded benchmark
for what "development" actually means at the district level.

The `cf_cvg` finding is something I'd want to explore further. One next step
would be to re-run the models stratified by agro-climatic zone (to control
for the geography directly) and see whether the nightlights signal strengthens
once you're comparing districts within similar climatic regions.
