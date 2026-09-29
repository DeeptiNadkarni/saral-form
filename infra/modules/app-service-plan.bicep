param location string
param tags object
param appServicePlanName string
param skuName string
param skuTier string
param skuCapacity int

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: skuName
    tier: skuTier
    size: skuName
    capacity: skuCapacity
  }
  properties: {
    reserved: true
  }
}

output appServicePlanId string = appServicePlan.id
