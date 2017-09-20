// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDqYo6yCReyCfQ6l6X3Mf3Lja4EgSGqeA8',
    authDomain: 'power-stations.firebaseapp.com',
    databaseURL: 'https://power-stations.firebaseio.com',
    projectId: 'power-stations',
    storageBucket: '',
    messagingSenderId: '451204416866'
  },
  googleMapsKey: 'AIzaSyBaDpJZKlzAMUHxY3H9UXzwkbkZeLCTexc'
};
