import appJson from '../../../app.json';

export interface DeploymentTarget {
  readonly org: string;
  readonly project: string;
}

export interface AppConfig {
  readonly name: string;
  readonly externalId: string;
  readonly deployment?: DeploymentTarget;
}


export function getAppConfig(): AppConfig {
  const deployment = appJson.deployments?.[0];
  return {
    name: appJson.name,
    externalId: appJson.externalId,
    deployment: deployment ? { org: deployment.org, project: deployment.project } : undefined,
  };
}
