param location string
param tags object
param accountName string
param skuName string

resource openAIAccount 'Microsoft.CognitiveServices/accounts@2026-09-01' = {
  name: accountName
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: skuName
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: accountName
    disableLocalAuth: true
    publicNetworkAccess: 'Enabled'
  }
}

output accountId string = openAIAccount.id
output endpoint string = openAIAccount.properties.endpoint
