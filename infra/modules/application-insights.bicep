param location string
param tags object
param appInsightsName string
param workspaceResourceId string

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    IngestionMode: 'LogAnalytics'
    WorkspaceResourceId: workspaceResourceId
  }
}

output connectionString string = appInsights.properties.ConnectionString
output appInsightsId string = appInsights.id
