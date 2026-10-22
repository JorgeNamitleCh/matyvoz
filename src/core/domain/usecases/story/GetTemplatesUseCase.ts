import { STORY_TEMPLATES, StoryTemplate } from '../../templates/storyTemplates';

/** Plantillas de historias sociales disponibles (incluidas en la app). */
export class GetTemplatesUseCase {
  execute(): StoryTemplate[] {
    return STORY_TEMPLATES;
  }
}
