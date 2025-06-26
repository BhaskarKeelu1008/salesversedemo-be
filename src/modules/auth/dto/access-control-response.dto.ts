interface IModuleAccess {
  ModuleID: string;
  ModuleName: string;
  ModuleCode: string;
  Status: boolean;
}

export class AccessControlResponseDto {
  accessControl: IModuleAccess[];

  constructor(moduleAccess: IModuleAccess[]) {
    this.accessControl = moduleAccess;
  }
} 