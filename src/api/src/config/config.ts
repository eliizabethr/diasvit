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
  // if appconfig, then return it
  return local;
};
