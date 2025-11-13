// Exportar todos los servicios desde un solo punto
export { default as authService } from './auth.service';
export { default as profilesService } from './profiles.service';
export { default as casesService } from './cases.service';
export { default as apiClient } from './config';

// Exportar tipos
export type {
  SignUpRequest,
  SignInRequest,
  UserResource,
  AuthenticatedUserResource,
} from './auth.service';

export type {
  CreateLawyerRequest,
  LawyerResource,
  CreateClientRequest,
  ClientResource,
  LawyerSpecialtyResource,
} from './profiles.service';

export type {
  CreateCaseRequest,
  CaseResource,
  SubmitApplicationRequest,
  ApplicationResource,
  InviteLawyerRequest,
  InvitationResource,
  CreateCommentRequest,
  CommentResource,
} from './cases.service';

