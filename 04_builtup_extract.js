/**
 * 04_builtup_extract.js
 *
 * Extracts mean built-up area fraction for all Indian districts
 * using Google Dynamic World V1 (10 m land use classification).
 *
 * The 'built' band gives the probability of each pixel being
 * built-up; district mean approximates the built-up fraction.
 *
 * Resolution: 10 m | Year: 2021
 */

var districts = ee.FeatureCollection(
  'projects/nightlights-498219/assets/district'
);

var dw = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
  .filterDate('2021-01-01', '2021-12-31');

var built = dw.select('built').mean();

var districtBuilt = built.reduceRegions({
  collection: districts,
  reducer: ee.Reducer.mean(),
  scale: 10
});

print('Preview:', districtBuilt.limit(5));

Export.table.toDrive({
  collection: districtBuilt,
  description: 'district_builtup',
  fileFormat: 'CSV'
});
