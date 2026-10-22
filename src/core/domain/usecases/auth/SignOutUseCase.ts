import { IAuthRepository } from '../../repositories';

export class SignOutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.signOut();
  }
}
