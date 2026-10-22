import { Child } from '../../entities';
import { IChildRepository } from '../../repositories';

export class CreateChildUseCase {
  constructor(private readonly childRepository: IChildRepository) {}

  async execute(data: Omit<Child, 'id'>): Promise<Child> {
    return this.childRepository.create(data);
  }
}
