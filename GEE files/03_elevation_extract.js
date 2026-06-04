/**
 * 03_elevation_extract.js
 *
 * Extracts mean elevation (metres above sea level) for all Indian
 * districts from the SRTM 30m Digital Elevation Model.
 *
 * Resolution: 30 m
 */

var districts = ee.FeatureCollection(
  'projects/nightlights-498219/assets/district'
);

var elevation = ee.Image('USGS/SRTMGL1_003');

var districtElev = elevation.reduceRegions({
  collection: districts,
  reducer: ee.Reducer.mean(),
  scale: 30
});

print('Preview:', districtElev.limit(5));

Export.table.toDrive({
  collection: districtElev,
  description: 'district_elevation',
  fileFormat: 'CSV'
});
