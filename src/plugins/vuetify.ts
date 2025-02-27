/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VFileUpload } from 'vuetify/labs/components'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VFileUpload,
  },
  theme: {
    defaultTheme: 'dark',
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
