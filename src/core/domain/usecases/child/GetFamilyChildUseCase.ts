import { Child } from '../../entities';
import { IChildRepository } from '../../repositories';

/** Perfil de la persona que acompaña la familia (hoy la app maneja uno por cuenta). */
export class GetFamilyChildUseCase {
  constructor(private readonly childRepository: IChildRepository) {}

  async execute(familyId: string): Promise<Child | null> {
    const children = await this.childRepository.getByFamilyId(familyId);
    return children[0] ?? null;
  }
}
