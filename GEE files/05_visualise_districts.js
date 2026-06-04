/**
 * 05_visualise_districts.js
 *
 * Visualises the district boundaries and nighttime lights layer
 * in the GEE map interface for visual QA before extraction.
 *
 * Run this script first to confirm the district asset loaded
 * correctly and the nightlights layer looks reasonable.
 */

var districts = ee.FeatureCollection(
  'projects/nightlights-498219/assets/district'
);

// Inspect first feature attributes
print('First district:', districts.first());
print('Total districts:', districts.size());

// Visualise district boundaries
Map.centerObject(districts, 5);
Map.addLayer(districts, {color: 'red'}, 'Districts');

// Overlay nightlights for visual check
var lights = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filterDate('2021-01-01', '2021-12-31')
  .mean()
  .select('avg_rad');

Map.addLayer(
  lights,
  {min: 0, max: 60, palette: ['000000', 'ffffff']},
  'Nightlights 2021'
);
