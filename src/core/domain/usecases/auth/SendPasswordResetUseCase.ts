import { IAuthRepository } from '../../repositories';
import { ValidationError } from '../../../errors/AppError';

export class SendPasswordResetUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    const clean = email.trim();
    if (!clean) throw new ValidationError('Escribe tu correo.');
    return this.authRepository.sendPasswordReset(clean);
  }
}
