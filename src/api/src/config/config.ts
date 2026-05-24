export interface Configuration {
  smsVerificationEnabled: boolean;
}

const local: Configuration = {
  smsVerificationEnabled: false,
};

const prod: Configuration = {
  smsVerificationEnabled: true,
};

export const config = (): Configuration => {
  const isStaging = process.env.NODE_ENV === 'staging';
  const isProduction = process.env.NODE_ENV === 'production';

  // TODO: if appconfig, then return it
  if (isStaging || isProduction) {
    return prod;
  }

  return local;
};
