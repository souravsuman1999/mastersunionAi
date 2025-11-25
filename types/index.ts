export interface DesignConfig {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  headingFont: string
  bodyFont: string
  borderRadius: string
  shadow: boolean
}

export interface GenerateRequestBody {
  prompt: string
  config: DesignConfig
}

export interface GenerateResponseBody {
  html: string
}
