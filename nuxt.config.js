// // See https://dev.to/themodernpk/deploy-nuxtjs-to-cpanel-2b51

// var fs = require('fs');
// var path = require('path');
//
// //Development Environment
// let ENV_DEV = true;
// let port = 3000;
// let host = 'localhost';
// let https = false;
//
// //Production Environment
// if (ENV_DEV == false) {
//   port = 3000; // make sure this port is open on your server you can do that via WHM or talk to you hosting company
//   host = 'myprogram.cc';
//   https = {
//     key: fs.readFileSync(path.resolve(__dirname,
//         './../../ssl/keys/bb571_876a9_94609928211ac9ce42d0662e381f653f.key')),
//     cert: fs.readFileSync(path.resolve(__dirname,
//         './../../ssl/certs/myprogram_cc_bb571_876a9_1663804799_f0274b110e839bffff8b2f75d4551572.crt'))
//   };
// }

module.exports = {
  mode: 'universal',
  target: 'static',
//   env: {
//
//   },
//   server: {
//     port: port,
//     host: host,
//     timing: false,
//     https: https
//   },

  /*
  ** Headers of the page
  */
  head: {
    title: 'nuxt-project',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
//     extend (config, { isDev, isClient }) {
//       if (isDev && isClient) {
//         config.module.rules.push({
//           enforce: 'pre',
//           test: /\.(js|vue)$/,
//           loader: 'eslint-loader',
//           exclude: /(node_modules)/
//         })
//       }
//     }
  }
}
