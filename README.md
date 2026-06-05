# Can Satellite Data Predict Socioeconomic Development Across Indian Districts?

**Author:** Anjana K S (MA Economics, Azim Premji University)
**Tools:** Google Earth Engine · Python · scikit-learn · XGBoost · pandas · seaborn  

## What the project is about?

Nighttime lights are used widely by economists as a proxy for economic activity/deelopment.
But most of that work validates against GDP or poverty headcounts. 
Here, I used district-level wealth data aggregated from
~57,000 households surveyed in the NFHS-5 (India's national family health survey)
as the key variable, which I think is more granular than GDP 
(better variables can be used for stronger analyses).

I not only use nightlights, but also vegetation cover (NDVI), elevation,
and built-up area from GEE to see if the combination does better than lights alone.
In short, it does. But it is complicated, and has methodological concerns.

## Data

| Source | Extracted Data | Resolution |
|--------|-----------------|------------|
| NOAA VIIRS DNB Monthly V1 | Nighttime radiance (`avg_rad`), cloud-free coverage (`cf_cvg`) | 500 m |
| MODIS MOD13Q1 | NDVI — vegetation index | 250 m |
| USGS SRTM | Elevation (metres) | 30 m |
| Google Dynamic World V1 | Built-up area fraction | 10 m |
| NFHS-5 Couples Recode (2019–21) | Wealth, financial inclusion, literacy, urbanisation | Household-level, aggregated to district |

All satellite layers were extracted for every Indian district using `reduceRegions()`
in Google Earth Engine, then merged with NFHS-5 district aggregates via the
Census 2011 district ID (`pc11_d_id`). Final dataset covers **575 districts**.

Note that the NFHS-5 data is a pre-worked data. Variables such as financial inclusion of women 
are created by the author.

## Results

| Model | R² (test set) |
|-------|:---:|
| Linear Regression | 0.218 |
| XGBoost | 0.652 |
| **Random Forest** | **0.723** |
| Random Forest (without cf_cvg) | 0.471 |

The jump from linear (0.22) to Random Forest (0.72) tells that the
relationship between satellite signals and wealth isn't linear. 
There are interactions and thresholds that tree-based models pick up well.

**Feature importance (Random Forest):**

| Feature | Importance | What it is |
|---------|:----------:|-----------|
| `cf_cvg` | 0.489 | Cloud-free coverage (VIIRS data quality flag) |
| `avg_rad` | 0.239 | Nighttime light radiance |
| `ndvi` | 0.104 | Vegetation cover |
| `elevation` | 0.087 | Terrain elevation |
| `builtup` | 0.081 | Built-up area fraction |

`cf_cvg` which measures what fraction of observations in the monthly 
composite were cloud-free — came out as the single most important predictor, 
beating nightlights. This is a data quality variable, not a development signal. 
What's likely happening is geographic confounding, i.e., arid districts in 
Rajasthan and Gujarat have very high cloud-free coverage and also have distinct 
development patterns, so the model learns to use `cf_cvg` as a geographic proxy.

Removing it drops R² from 0.72 to 0.47. The 0.47 is what nightlights, vegetation, elevation, and built-up
area can do on their own, without the model relying on geography.

## How to reproduce

**Satellite data** — run scripts 01–04 in `GEE Files/` in the
[GEE Code Editor](https://code.earthengine.google.com). Each one exports
a CSV to your Google Drive. Run 05 first just to visually confirm
the district layer looks right.

**NFHS-5 data** — register at and download the Couples Recode (`IABCR7EDT.DTA`).

**Notebook** — open `notebooks/nightlights_ml.ipynb` in Google Colab,
mount your Drive, and update `DATA_DIR` in cell 2 to point to
wherever you stored the CSVs and DTA file.

## Context

This sits within a broader literature on satellite-based development proxies
(Henderson et al. 2012; Donaldson & Storeygard 2016). In this exercise, using household survey
wealth rather than GDP gives a more granular, household-grounded benchmark
for what "development" actually means at the district level.

The `cf_cvg` finding is something I'd want to explore further. One next step
would be to re-run the models defined by agro-climatic zone (to control
for the geography directly) and see whether the nightlights signal strengthens
once you're comparing districts within similar climatic regions.
