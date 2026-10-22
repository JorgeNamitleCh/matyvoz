import { Family } from '../../entities';
import { IAuthRepository } from '../../repositories';

export class RegisterFamilyUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(name: string, email: string, password: string, role?: string): Promise<Family> {
    return this.authRepository.register(name, email, password, role);
  }
}
