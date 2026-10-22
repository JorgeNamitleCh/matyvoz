import { Child } from '../../entities';
import { IChildRepository } from '../../repositories';
import { NotFoundError } from '../../../errors/AppError';

export class GetChildUseCase {
  constructor(private readonly childRepository: IChildRepository) {}

  async execute(id: string): Promise<Child> {
    const child = await this.childRepository.getById(id);
    if (!child) throw new NotFoundError('Child', id);
    return child;
  }
}
