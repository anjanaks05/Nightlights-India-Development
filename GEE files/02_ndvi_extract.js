/**
 * 02_ndvi_extract.js
 *
 * Extracts mean NDVI (Normalised Difference Vegetation Index)
 * for all Indian districts using MODIS MOD13Q1.
 *
 * Higher NDVI = more vegetation cover.
 * Resolution: 250 m | Year: 2021
 */

var districts = ee.FeatureCollection(
  'projects/nightlights-498219/assets/district'
);

var ndvi = ee.ImageCollection('MODIS/061/MOD13Q1')
  .filterDate('2021-01-01', '2021-12-31')
  .select('NDVI')
  .mean();

var districtNdvi = ndvi.reduceRegions({
  collection: districts,
  reducer: ee.Reducer.mean(),
  scale: 250
});

print('Preview:', districtNdvi.limit(5));

Export.table.toDrive({
  collection: districtNdvi,
  description: 'district_ndvi_2021',
  fileFormat: 'CSV'
});
