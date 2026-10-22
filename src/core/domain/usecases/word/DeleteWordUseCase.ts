import { IWordRepository } from '../../repositories';

export class DeleteWordUseCase {
  constructor(private readonly repo: IWordRepository) {}

  execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
