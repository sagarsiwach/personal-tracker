/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_87452151")

  // update collection data
  unmarshal({
    "name": "Mantras"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_87452151")

  // update collection data
  unmarshal({
    "name": "mantras"
  }, collection)

  return app.save(collection)
})
