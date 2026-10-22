import { TimerSession } from '../../entities';
import { ITimerRepository } from '../../repositories';

export class StartTimerUseCase {
  constructor(private readonly timerRepository: ITimerRepository) {}

  async execute(childId: string, durationMinutes: number, linkedActivityId?: string): Promise<TimerSession> {
    return this.timerRepository.create({
      childId,
      durationMinutes,
      startedAt: new Date(),
      linkedActivityId,
    });
  }
}
