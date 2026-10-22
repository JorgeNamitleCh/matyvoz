/**
 * Composition root: aquí (y solo aquí, fuera de las screens existentes) se
 * conectan las implementaciones de Firebase con los use cases. Los stores
 * importan los use cases desde este archivo — nunca de `data/`.
 * Para cambiar de backend, se reemplazan los repositorios en este archivo.
 */
import { FirebaseCatalogRepository } from '../../data/repositories/FirebaseCatalogRepository';
import { FirebaseDayActivityRepository } from '../../data/repositories/FirebaseDayActivityRepository';
import { FirebaseStoryRepository } from '../../data/repositories/FirebaseStoryRepository';
import { FirebaseWordRepository } from '../../data/repositories/FirebaseWordRepository';

import { GetCatalogUseCase } from '../../core/domain/usecases/catalog/GetCatalogUseCase';
import { SaveCatalogCategoryUseCase } from '../../core/domain/usecases/catalog/SaveCatalogCategoryUseCase';
import { SaveCatalogItemUseCase } from '../../core/domain/usecases/catalog/SaveCatalogItemUseCase';
import { UpdateCatalogItemUseCase } from '../../core/domain/usecases/catalog/UpdateCatalogItemUseCase';
import { DeleteCatalogItemUseCase } from '../../core/domain/usecases/catalog/DeleteCatalogItemUseCase';

import { GetDayActivitiesUseCase } from '../../core/domain/usecases/day/GetDayActivitiesUseCase';
import { AddDayActivityUseCase } from '../../core/domain/usecases/day/AddDayActivityUseCase';
import { UpdateDayActivityUseCase } from '../../core/domain/usecases/day/UpdateDayActivityUseCase';
import { DeleteDayActivityUseCase } from '../../core/domain/usecases/day/DeleteDayActivityUseCase';

import { GetStoriesUseCase } from '../../core/domain/usecases/story/GetStoriesUseCase';
import { SaveStoryUseCase } from '../../core/domain/usecases/story/SaveStoryUseCase';
import { UpdateStoryUseCase } from '../../core/domain/usecases/story/UpdateStoryUseCase';
import { DeleteStoryUseCase } from '../../core/domain/usecases/story/DeleteStoryUseCase';

import { GetWordsByFamilyUseCase } from '../../core/domain/usecases/word/GetWordsByFamilyUseCase';
import { SaveWordUseCase } from '../../core/domain/usecases/word/SaveWordUseCase';
import { DeleteWordUseCase } from '../../core/domain/usecases/word/DeleteWordUseCase';

const catalogRepo = new FirebaseCatalogRepository();
const dayRepo = new FirebaseDayActivityRepository();
const storyRepo = new FirebaseStoryRepository();
const wordRepo = new FirebaseWordRepository();

export const catalogUseCases = {
  get: new GetCatalogUseCase(catalogRepo),
  saveCategory: new SaveCatalogCategoryUseCase(catalogRepo),
  saveItem: new SaveCatalogItemUseCase(catalogRepo),
  updateItem: new UpdateCatalogItemUseCase(catalogRepo),
  deleteItem: new DeleteCatalogItemUseCase(catalogRepo),
};

export const dayUseCases = {
  get: new GetDayActivitiesUseCase(dayRepo),
  add: new AddDayActivityUseCase(dayRepo),
  update: new UpdateDayActivityUseCase(dayRepo),
  delete: new DeleteDayActivityUseCase(dayRepo),
};

export const storyUseCases = {
  get: new GetStoriesUseCase(storyRepo),
  save: new SaveStoryUseCase(storyRepo),
  update: new UpdateStoryUseCase(storyRepo),
  delete: new DeleteStoryUseCase(storyRepo),
};

export const wordUseCases = {
  get: new GetWordsByFamilyUseCase(wordRepo),
  save: new SaveWordUseCase(wordRepo),
  delete: new DeleteWordUseCase(wordRepo),
};
