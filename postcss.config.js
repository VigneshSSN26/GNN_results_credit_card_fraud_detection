import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss-load-config').Config} */
export default {
<<<<<<< HEAD
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
=======
  plugins: [tailwindcss, autoprefixer],
};
>>>>>>> 5922ef0bf2236683f73d3c0c471a84c1eeed6e68
