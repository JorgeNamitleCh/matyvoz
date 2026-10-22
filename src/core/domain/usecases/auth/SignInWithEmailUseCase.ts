import { Family } from '../../entities';
import { IAuthRepository } from '../../repositories';

export class SignInWithEmailUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Family> {
    return this.authRepository.signInWithEmail(email, password);
  }
}
