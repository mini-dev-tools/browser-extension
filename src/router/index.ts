import {
  createRouter,
  createWebHashHistory,
  createMemoryHistory,
  RouteRecordRaw
} from 'vue-router';



const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },

  {
    path: '/text-tools',
    name: 'text-tools',
    component: () => import('../views/TextTools.vue')
  },
  {
    path: '/password',
    name: 'password',
    component: () => import('../views/Password.vue')
  },
  {
    path: '/url-encode-decode',
    name: 'url-encode-decode',
    component: () => import('../views/UrlEncodeDecode.vue')
  },
  {
    path: '/hasher',
    name: 'hasher',
    component: () => import('../views/Hasher.vue')
  },
  {
    path: '/uuid',
    name: 'uuid',
    component: () => import('../views/Uuid.vue')
  },
  {
    path: '/button-generator',
    name: 'button-generator',
    component: () => import('../views/ButtonGenerator.vue')
  },
  {
    path: '/base64',
    name: 'base64',
    component: () => import('../views/Base64.vue')
  },
  {
    path: '/jwt',
    name: 'jwt',
    component: () => import('../views/JwtTool.vue')
  },
  {
    path: '/timestamp',
    name: 'timestamp',
    component: () => import('../views/TimestampConverter.vue')
  },

  {
    path: '/minify',
    name: 'minify',
    component: () => import('../views/Minify.vue')
  },
  {
    path: '/block-url',
    name: 'block-url',
    component: () => import('../views/BlockUrl.vue')
  },
  {
    path: '/window-resizer',
    name: 'window-resizer',
    component: () => import('../views/WindowResizer.vue')
  },
  {
    path: '/screenshot',
    name: 'screenshot',
    component: () => import('../views/Screenshot.vue')
  },

  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue')
  },
  {
    path: '/soon',
    name: 'soon',
    component: () => import('../views/ComingSoon.vue')
  },
  {
    path: '/material-colors',
    name: 'MaterialColors',
    component: () => import('../views/colors/MaterialColors.vue')
  },
  {
    path: '/color-shades',
    name: 'ColorShades',
    component: () => import('../views/colors/ColorShades.vue')
  },
  {
    path: '/palettes',
    name: 'Palettes',
    component: () => import('../views/colors/Palettes.vue')
  },
  {
    path: '/contrast-ratio-checker',
    name: 'ContrastRatioChecker',
    component: () => import('../views/colors/ContrastRatioChecker.vue')
  },
  {
    path: '/color-picker',
    name: 'ColorPicker',
    component: () => import('../views/colors/ColorPicker.vue')
  },
  {
    path: '/gradient-generator',
    name: 'GradientGenerator',
    component: () => import('../views/colors/GradientGenerator.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/quick-files',
    name: 'quick-files',
    component: () => import('../views/QuickFiles.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/DevTests.vue')
  },
  {
    path: '/script-injection',
    name: 'script-injection',
    component: () => import('../views/ScriptInjection.vue')
  },
  {
    path: '/swagger-viewer',
    name: 'swagger-viewer',
    component: () => import('../views/SwaggerViewer.vue')
  },
  {
    path: '/whatsapp-blur',
    name: 'whatsapp-blur',
    component: () => import('../views/WhatsAppBlur.vue')
  }
];

console.log(routes);
const router = createRouter({
  history: createWebHashHistory(), //createMemoryHistory(),
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 };
  },

  routes
});

export default router;
