import { Word } from '../../entities';
import { IWordRepository } from '../../repositories';
import { DEFAULT_WORDS } from '../../templates/defaultWords';

/**
 * Palabras de la familia. La primera vez (sin palabras) guarda el glosario
 * inicial, con ids prefijados por familia para no chocar entre familias.
 */
export class GetWordsByFamilyUseCase {
  constructor(private readonly wordRepository: IWordRepository) {}

  async execute(familyId: string): Promise<Word[]> {
    const words = await this.wordRepository.getByFamilyId(familyId);
    if (words.length > 0) return words;
    const now = new Date();
    const seeded: Word[] = DEFAULT_WORDS.map(d => ({
      id: `${familyId}_w_${d.key}`,
      familyId,
      label: d.label,
      category: d.category,
      iconKey: d.iconKey,
      syllables: d.syllables,
      variants: d.variants ?? [],
      description: '',
      createdAt: now,
    }));
    await this.wordRepository.saveMany(seeded);
    return seeded;
  }
}
