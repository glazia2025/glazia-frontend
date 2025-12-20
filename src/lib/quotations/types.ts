export interface SystemsResponse {
  systems: string[];
}

export interface SeriesResponse {
  series: string[];
}

export interface Description {
  name: string;
  handleTypes: string[];
  defaultHandleCount: number;
  baseRates: number[];
}

export interface DescriptionsResponse {
  descriptions: Description[];
}

export interface OptionWithRate {
  name: string;
  rate: number;
}

export interface HandleColor extends OptionWithRate {}

export interface HandleOption {
  name: string;
  colors: HandleColor[];
}

export interface OptionsResponse {
  colorFinishes: OptionWithRate[];
  meshTypes: OptionWithRate[];
  glassSpecs: OptionWithRate[];
  handleOptions: HandleOption[];
}
