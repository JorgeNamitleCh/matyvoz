/**
 * Datos legales y de soporte que piden App Store y Google Play.
 * Las páginas viven en matyvoz.com (fuente: carpeta `web/public/` del repo;
 * copia en Firebase Hosting con `firebase deploy --only hosting`).
 */
const SITE = 'https://matyvoz.com';

export const LEGAL = {
  responsible: 'Jorge Namitle Chimalhua',
  supportEmail: 'soporte@matyvoz.com',
  privacyUrl: `${SITE}/privacidad`,
  termsUrl: `${SITE}/terminos`,
  deleteAccountUrl: `${SITE}/eliminar-cuenta`,
  supportUrl: `${SITE}/soporte`,
};
