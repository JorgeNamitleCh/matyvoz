import { Word } from '../../entities';
import { IWordRepository } from '../../repositories';

export class SaveWordUseCase {
  constructor(private readonly repo: IWordRepository) {}

  execute(word: Word): Promise<void> {
    return this.repo.save(word);
  }
}
