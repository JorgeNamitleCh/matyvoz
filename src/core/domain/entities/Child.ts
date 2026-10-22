export type SupportType = 'pictograms' | 'realPhotos' | 'both' | 'noImage';
export type Neurodivergence = 'ASD' | 'ADHD' | 'SLD' | 'DS' | 'other';
export type CommunicationType = 'verbal' | 'mixed' | 'nonverbal';
export type Sensitivity = 'sounds' | 'lights' | 'textures' | 'crowds' | 'changes';

export interface Child {
  id: string;
  familyId: string;
  name: string;
  age: number;
  supportType: SupportType;
  neurodivergence: Neurodivergence[];
  communicationType: CommunicationType;
  sensitivities: Sensitivity[];
  minimalAnimations: boolean;
}
