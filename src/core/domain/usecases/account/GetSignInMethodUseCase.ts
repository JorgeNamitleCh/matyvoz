import { IAuthRepository, SignInMethod } from '../../repositories';

export class GetSignInMethodUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(): SignInMethod | null {
    return this.authRepository.getSignInMethod();
  }
}
