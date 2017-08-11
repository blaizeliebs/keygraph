let barPermissions = {
  BARS_READ: 'bars-read',
  BARS_WRITE: 'bars-write',
  BARS_ALL: 'bars-all',
  BARS_ONE: 'bars-one',
  BARS_COUNT: 'bars-count',
  BARS_ADD: 'bars-add',
  BARS_UPDATE: 'bars-update',
  BARS_REMOVE: 'bars-remove',
}

let beerPermissions = {
  BEERS_READ: 'beers-read',
  BEERS_WRITE: 'beers-write',
  BEERS_ALL: 'beers-all',
  BEERS_ONE: 'beers-one',
  BEERS_COUNT: 'beers-count',
  BEERS_ADD: 'beers-add',
  BEERS_UPDATE: 'beers-update',
  BEERS_REMOVE: 'beers-remove',
}

let breweryPermissions = {
  BREWERIES_READ: 'breweries-read',
  BREWERIES_WRITE: 'breweries-write',
  BREWERIES_ALL: 'breweries-all',
  BREWERIES_ONE: 'breweries-one',
  BREWERIES_COUNT: 'breweries-count',
  BREWERIES_ADD: 'breweries-add',
  BREWERIES_UPDATE: 'breweries-update',
  BREWERIES_REMOVE: 'breweries-remove',
}

let permissions = {
  ...barPermissions,
  ...beerPermissions,
  ...breweryPermissions,
}

export default permissions
