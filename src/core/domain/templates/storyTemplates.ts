import { StoryCategory, StoryStepKind } from '../entities';

/**
 * Plantillas de historias sociales. Frases cortas, en primera persona y en
 * positivo (describen lo que va a pasar y qué puedo hacer). La familia las
 * personaliza después con sus propias fotos.
 */

export interface TemplateStep {
  kind: StoryStepKind;
  pictogramKey: string;
  text: string;
  support: string[];
}

export interface StoryTemplate {
  id: string;
  title: string;
  iconKey: string;
  kind: StoryStepKind;
  category: StoryCategory;
  steps: TemplateStep[];
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'tpl-dentista', title: 'Ir al dentista', iconKey: 'diente', kind: 'lugar', category: 'salud',
    steps: [
      { kind: 'lugar',   pictogramKey: 'dentista',  text: 'Hoy voy al dentista.',                   support: ['coche'] },
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Espero mi turno en la sala.',            support: ['esperar', 'tranquilo'] },
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Me siento en la silla.',                 support: ['persona', 'tranquilo'] },
      { kind: 'persona', pictogramKey: 'doctor',    text: 'La dentista me revisa los dientes.',     support: ['diente'] },
      { kind: 'accion',  pictogramKey: 'diente',    text: 'Abro la boca y cuento hasta 10.',        support: ['pulgar'] },
      { kind: 'emocion', pictogramKey: 'feliz',     text: '¡Lo hice muy bien! Ya me puedo ir.',     support: ['estrella'] },
    ],
  },
  {
    id: 'tpl-dormir', title: 'Hora de dormir', iconKey: 'dormir2', kind: 'tiempo', category: 'rutina',
    steps: [
      { kind: 'tiempo',  pictogramKey: 'luna',      text: 'Ya es de noche.',                        support: ['reloj'] },
      { kind: 'objeto',  pictogramKey: 'ropa',      text: 'Me pongo la pijama.',                    support: ['persona'] },
      { kind: 'accion',  pictogramKey: 'cepillo',   text: 'Me lavo los dientes.',                   support: ['agua'] },
      { kind: 'accion',  pictogramKey: 'leer',      text: 'Leemos un cuento.',                      support: ['feliz'] },
      { kind: 'tiempo',  pictogramKey: 'dormir2',   text: 'Me acuesto y cierro los ojos.',          support: ['tranquilo'] },
    ],
  },
  {
    id: 'tpl-cole', title: 'Primer día de cole', iconKey: 'cole', kind: 'lugar', category: 'social',
    steps: [
      { kind: 'tiempo',  pictogramKey: 'sol',       text: 'Hoy es mi primer día de cole.',          support: ['feliz'] },
      { kind: 'objeto',  pictogramKey: 'mochila',   text: 'Me pongo mi mochila.',                   support: ['persona'] },
      { kind: 'lugar',   pictogramKey: 'coche',     text: 'Vamos juntos a la escuela.',             support: ['cole'] },
      { kind: 'lugar',   pictogramKey: 'puerta',    text: 'Entro a mi salón.',                      support: ['cole'] },
      { kind: 'persona', pictogramKey: 'persona',   text: 'Conozco a mi maestra.',                  support: ['saludar'] },
      { kind: 'persona', pictogramKey: 'amigos',    text: 'Conozco a mis compañeros.',              support: ['saludar', 'feliz'] },
      { kind: 'accion',  pictogramKey: 'jugar',     text: 'Jugamos y aprendemos juntos.',           support: ['pintar'] },
      { kind: 'lugar',   pictogramKey: 'casa',      text: 'Al final me recogen y regreso a casa.',  support: ['feliz'] },
    ],
  },
  {
    id: 'tpl-cumple', title: 'Cumpleaños', iconKey: 'corazon', kind: 'emocion', category: 'social',
    steps: [
      { kind: 'lugar',   pictogramKey: 'casa',      text: 'Vamos a una fiesta de cumpleaños.',      support: ['cumple'] },
      { kind: 'persona', pictogramKey: 'saludar',   text: 'Saludo a mis amigos.',                   support: ['amigos'] },
      { kind: 'objeto',  pictogramKey: 'regalo',    text: 'Le doy su regalo.',                      support: ['feliz'] },
      { kind: 'accion',  pictogramKey: 'jugar',     text: 'Jugamos juntos.',                        support: ['globo'] },
      { kind: 'emocion', pictogramKey: 'oir',       text: 'Puede haber ruido. Si me molesta, lo digo.', support: ['tranquilo'] },
      { kind: 'comida',  pictogramKey: 'pastel',    text: 'Cantamos y comemos pastel.',             support: ['musica'] },
      { kind: 'emocion', pictogramKey: 'feliz',     text: 'Me despido y regresamos a casa.',        support: ['saludar'] },
    ],
  },
  {
    id: 'tpl-super', title: 'Ir al super', iconKey: 'coche', kind: 'objeto', category: 'rutina',
    steps: [
      { kind: 'lugar',   pictogramKey: 'super',     text: 'Vamos al súper.',                        support: ['coche'] },
      { kind: 'objeto',  pictogramKey: 'canasta',   text: 'Tomamos un carrito.',                    support: ['persona'] },
      { kind: 'comida',  pictogramKey: 'fruta',     text: 'Buscamos lo que está en la lista.',      support: ['menu'] },
      { kind: 'emocion', pictogramKey: 'tranquilo', text: 'Camino junto a mamá o papá.',            support: ['persona'] },
      { kind: 'objeto',  pictogramKey: 'dinero',    text: 'Pagamos en la caja.',                    support: ['esperar'] },
      { kind: 'lugar',   pictogramKey: 'casa',      text: 'Regresamos a casa.',                     support: ['feliz'] },
    ],
  },
  {
    id: 'tpl-pelo', title: 'Cortar el pelo', iconKey: 'persona', kind: 'persona', category: 'rutina',
    steps: [
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Voy a cortarme el pelo.',                support: ['tijeras'] },
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Me siento en la silla.',                 support: ['tranquilo'] },
      { kind: 'objeto',  pictogramKey: 'tijeras',   text: 'Oigo las tijeras. No duele.',            support: ['oir'] },
      { kind: 'objeto',  pictogramKey: 'espejo',    text: 'Me veo en el espejo.',                   support: ['feliz'] },
      { kind: 'emocion', pictogramKey: 'feliz',     text: '¡Listo! Me veo muy bien.',               support: ['estrella'] },
    ],
  },
  {
    id: 'tpl-vacuna', title: 'Vacunarse', iconKey: 'vacuna', kind: 'lugar', category: 'salud',
    steps: [
      { kind: 'lugar',   pictogramKey: 'medico',    text: 'Vamos al centro de salud.',              support: ['coche'] },
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Espero mi turno.',                       support: ['esperar'] },
      { kind: 'persona', pictogramKey: 'doctor',    text: 'La enfermera me saluda.',                support: ['saludar'] },
      { kind: 'accion',  pictogramKey: 'vacuna',    text: 'Siento un piquete rápido y respiro.',    support: ['tranquilo'] },
      { kind: 'objeto',  pictogramKey: 'curita',    text: 'Me ponen una curita.',                   support: ['pulgar'] },
      { kind: 'emocion', pictogramKey: 'feliz',     text: '¡Fui muy valiente!',                     support: ['estrella'] },
    ],
  },
  {
    id: 'tpl-banarse', title: 'Bañarse', iconKey: 'banar', kind: 'accion', category: 'rutina',
    steps: [
      { kind: 'objeto',  pictogramKey: 'ropa',      text: 'Me quito la ropa.',                      support: ['persona'] },
      { kind: 'accion',  pictogramKey: 'banar',     text: 'Entro a la regadera.',                   support: ['agua'] },
      { kind: 'accion',  pictogramKey: 'lavar',     text: 'Me enjabono todo el cuerpo.',            support: ['agua'] },
      { kind: 'accion',  pictogramKey: 'agua',      text: 'Me enjuago.',                            support: ['tranquilo'] },
      { kind: 'accion',  pictogramKey: 'secador',   text: 'Me seco con la toalla.',                 support: ['feliz'] },
    ],
  },
  {
    id: 'tpl-comer-fuera', title: 'Comer fuera', iconKey: 'comer', kind: 'accion', category: 'social',
    steps: [
      { kind: 'lugar',   pictogramKey: 'comer',     text: 'Vamos a comer a un restaurante.',        support: ['coche'] },
      { kind: 'lugar',   pictogramKey: 'silla',     text: 'Nos sentamos en una mesa.',              support: ['tranquilo'] },
      { kind: 'objeto',  pictogramKey: 'menu',      text: 'Elegimos qué vamos a comer.',            support: ['pregunta'] },
      { kind: 'tiempo',  pictogramKey: 'esperar',   text: 'Esperamos a que llegue la comida.',      support: ['pintar'] },
      { kind: 'comida',  pictogramKey: 'comer',     text: 'Comemos juntos.',                        support: ['feliz'] },
      { kind: 'objeto',  pictogramKey: 'dinero',    text: 'Pagamos la cuenta.',                     support: ['esperar'] },
      { kind: 'lugar',   pictogramKey: 'casa',      text: 'Regresamos a casa.',                     support: ['feliz'] },
    ],
  },
];
