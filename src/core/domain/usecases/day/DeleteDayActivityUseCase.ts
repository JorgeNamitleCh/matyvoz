import { IDayActivityRepository } from '../../repositories';

export class DeleteDayActivityUseCase {
  constructor(private readonly repo: IDayActivityRepository) {}

  execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
