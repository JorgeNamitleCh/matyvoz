import { IAuthRepository } from '../../repositories';
import { ValidationError } from '../../../errors/AppError';

export class DeleteAccountUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /** `password` solo se usa (y se exige) en cuentas de correo y contraseña. */
  async execute(password?: string): Promise<void> {
    if (this.authRepository.getSignInMethod() === 'password' && !password) {
      throw new ValidationError('Escribe tu contraseña para confirmar.');
    }
    return this.authRepository.deleteAccount(password);
  }
}
