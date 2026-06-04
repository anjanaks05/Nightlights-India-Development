/**
 * 01_nightlights_extract.js
 *
 * Extracts mean nighttime light radiance and cloud-free coverage
 * for all Indian districts using VIIRS DNB Monthly V1.
 *
 * Output variables:
 *   avg_rad  — average nighttime radiance (nW/cm²/sr)
 *   cf_cvg   — cloud-free coverage fraction (0–1)
 *
 * Resolution: 500 m
 * Year: 2021 (monthly composites averaged)
 */

var districts = ee.FeatureCollection(
  'projects/nightlights-498219/assets/district'
);

var lights = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filterDate('2021-01-01', '2021-12-31')
  .mean();

var districtLights = lights.reduceRegions({
  collection: districts,
  reducer: ee.Reducer.mean(),
  scale: 500
});

// Preview first 5 rows in console
print('Preview:', districtLights.limit(5));

Export.table.toDrive({
  collection: districtLights,
  description: 'district_nightlights_2021',
  fileFormat: 'CSV'
});
