targetScope = 'subscription'

@minLength(1)
@maxLength(64)
param environmentName string

@minLength(1)
param location string

param sessionId string
param deployedBy string
param createdAt string
@minLength(36)
param deployerObjectId string

param resourceGroupName string
param appServicePlanName string
param appServiceName string
param openAIAccountName string
param openAIDeploymentName string
param logAnalyticsName string
param appInsightsName string
param keyVaultName string
param appServicePlanSkuName string
param appServicePlanSkuTier string
param appServicePlanCapacity int
param openAIAccountSkuName string
param openAIDeploymentSkuName string
param openAIDeploymentCapacity int
param openAIModelName string
param openAIModelVersion string
param logAnalyticsSkuName string
param keyVaultSkuName string

var tags = {
  'app-onboard-skill': 'true'
  'app-onboard-session-id': sessionId
  'created-at': createdAt
  environment: environmentName
  'deployed-by': deployedBy
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module appServicePlan './modules/app-service-plan.bicep' = {
  name: 'app-service-plan'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    appServicePlanName: appServicePlanName
    skuName: appServicePlanSkuName
    skuTier: appServicePlanSkuTier
    skuCapacity: appServicePlanCapacity
  }
}

module logAnalytics './modules/log-analytics.bicep' = {
  name: 'log-analytics'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    workspaceName: logAnalyticsName
    skuName: logAnalyticsSkuName
  }
}

module appInsights './modules/application-insights.bicep' = {
  name: 'application-insights'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    appInsightsName: appInsightsName
    workspaceResourceId: logAnalytics.outputs.workspaceResourceId
  }
}

module keyVault './modules/key-vault.bicep' = {
  name: 'key-vault'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    keyVaultName: keyVaultName
    skuName: keyVaultSkuName
  }
}

module openAI './modules/openai.bicep' = {
  name: 'openai-account'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    accountName: openAIAccountName
    skuName: openAIAccountSkuName
  }
}

module openAIDeployment './modules/openai-deployment.bicep' = {
  name: 'openai-model-deployment'
  scope: resourceGroup
  params: {
    accountName: openAIAccountName
    deploymentName: openAIDeploymentName
    deploymentSkuName: openAIDeploymentSkuName
    deploymentCapacity: openAIDeploymentCapacity
    modelName: openAIModelName
    modelVersion: openAIModelVersion
    tags: tags
  }
  dependsOn: [
    openAI
  ]
}

module appService './modules/app-service.bicep' = {
  name: 'app-service'
  scope: resourceGroup
  params: {
    location: location
    tags: tags
    appServiceName: appServiceName
    appServicePlanId: appServicePlan.outputs.appServicePlanId
    openAIEndpoint: openAI.outputs.endpoint
    openAIDeploymentName: openAIDeploymentName
    applicationInsightsConnectionString: appInsights.outputs.connectionString
  }
  dependsOn: [
    openAIDeployment
  ]
}

module roleAssignments './modules/role-assignments.bicep' = {
  name: 'role-assignments'
  scope: resourceGroup
  params: {
    keyVaultName: keyVaultName
    openAIAccountName: openAIAccountName
    appPrincipalId: appService.outputs.principalId
    deployerObjectId: deployerObjectId
  }
  dependsOn: [
    keyVault
  ]
}

output resourceGroupName string = resourceGroup.name
output appServiceName string = appService.outputs.appServiceName
output appServiceHostname string = appService.outputs.defaultHostname
output openAIEndpoint string = openAI.outputs.endpoint
output keyVaultName string = keyVault.outputs.keyVaultName
