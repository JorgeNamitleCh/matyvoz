import { Child } from '../../entities';
import { IChildRepository } from '../../repositories';
import { ValidationError } from '../../../errors/AppError';

/** Crea el perfil si no tiene id, o lo actualiza si ya existe. */
export class SaveChildUseCase {
  constructor(private readonly childRepository: IChildRepository) {}

  async execute(child: Omit<Child, 'id'> & { id?: string }): Promise<Child> {
    const name = child.name.trim();
    if (!name) throw new ValidationError('Escribe el nombre.');
    if (!Number.isFinite(child.age) || child.age < 0 || child.age > 120) {
      throw new ValidationError('Escribe una edad válida.');
    }
    const { id, ...data } = child;
    const clean = { ...data, name };
    return id ? this.childRepository.update(id, clean) : this.childRepository.create(clean);
  }
}
