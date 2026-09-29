param accountName string
param deploymentName string
param deploymentSkuName string
param deploymentCapacity int
param modelName string
param modelVersion string
param tags object

resource openAIAccount 'Microsoft.CognitiveServices/accounts@2026-09-01' existing = {
  name: accountName
}

resource modelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2026-09-01' = {
  parent: openAIAccount
  name: deploymentName
  tags: tags
  sku: {
    name: deploymentSkuName
    capacity: deploymentCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: modelName
      version: modelVersion
    }
    versionUpgradeOption: 'NoAutoUpgrade'
  }
}

output deploymentName string = modelDeployment.name
