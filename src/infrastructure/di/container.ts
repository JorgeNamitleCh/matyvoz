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
import { FirebaseAuthRepository } from '../../data/repositories/FirebaseAuthRepository';
import { FirebaseChildRepository } from '../../data/repositories/FirebaseChildRepository';

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

import { SignInWithEmailUseCase } from '../../core/domain/usecases/auth/SignInWithEmailUseCase';
import { RegisterFamilyUseCase } from '../../core/domain/usecases/auth/RegisterFamilyUseCase';
import { SignOutUseCase } from '../../core/domain/usecases/auth/SignOutUseCase';
import { SendPasswordResetUseCase } from '../../core/domain/usecases/auth/SendPasswordResetUseCase';
import { UpdateFamilyUseCase } from '../../core/domain/usecases/account/UpdateFamilyUseCase';
import { DeleteAccountUseCase } from '../../core/domain/usecases/account/DeleteAccountUseCase';
import { GetSignInMethodUseCase } from '../../core/domain/usecases/account/GetSignInMethodUseCase';

import { GetFamilyChildUseCase } from '../../core/domain/usecases/child/GetFamilyChildUseCase';
import { SaveChildUseCase } from '../../core/domain/usecases/child/SaveChildUseCase';

const catalogRepo = new FirebaseCatalogRepository();
const dayRepo = new FirebaseDayActivityRepository();
const storyRepo = new FirebaseStoryRepository();
const wordRepo = new FirebaseWordRepository();
const authRepo = new FirebaseAuthRepository();
const childRepo = new FirebaseChildRepository();

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

export const accountUseCases = {
  signIn: new SignInWithEmailUseCase(authRepo),
  register: new RegisterFamilyUseCase(authRepo),
  signOut: new SignOutUseCase(authRepo),
  sendPasswordReset: new SendPasswordResetUseCase(authRepo),
  updateFamily: new UpdateFamilyUseCase(authRepo),
  deleteAccount: new DeleteAccountUseCase(authRepo),
  getSignInMethod: new GetSignInMethodUseCase(authRepo),
};

export const childUseCases = {
  getForFamily: new GetFamilyChildUseCase(childRepo),
  save: new SaveChildUseCase(childRepo),
};
