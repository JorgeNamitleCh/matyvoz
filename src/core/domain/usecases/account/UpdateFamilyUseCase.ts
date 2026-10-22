import { Family } from '../../entities';
import { IAuthRepository } from '../../repositories';
import { ValidationError } from '../../../errors/AppError';

export class UpdateFamilyUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(id: string, data: Pick<Family, 'name' | 'role'>): Promise<Family> {
    const name = data.name.trim();
    if (!name) throw new ValidationError('Escribe tu nombre.');
    return this.authRepository.updateFamily(id, { name, role: data.role });
  }
}
