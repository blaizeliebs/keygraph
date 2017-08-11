class Config {

  // TODO: pull from windo.env
  static GOOGL_API_KEY = window.env.GOOGLE_API_KEY || false;
  static LANGUAGE = 'en';
  static API = {
    PROTOCOL: window.env.API_PROTOCOL || 'http',
    DOMAIN: window.env.API_DOMAIN || 'localhost',
    PORT: window.env.API_PORT || false,
    ENDPOINT: window.env.API_ENDPOINT || 'api',
    WS_PORT: window.env.API_WS_PORT || '8005',
  };

  static getApi() {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/${this.API.ENDPOINT}`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/${this.API.ENDPOINT}`
  }

  static getUrl() {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}`
  }

  static getDefaultsUrl() {
    return `/public/images/defaults`
  }

  static getLoginURL() {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/auth/login`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/auth/login`
  }

  static getLogoutURL() {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/auth/logout`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/auth/logout`
  }

  static tokenValidateURL(token) {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/auth/validate/${token}`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/auth/validate/${token}`
  }

  static tokenResetURL(token) {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/auth/reset/${token}`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/auth/reset/${token}`
  }

  static tokenRegisterURL(token) {
    if (!this.API.PORT) {
      return `${this.API.PROTOCOL}://${this.API.DOMAIN}/auth/register/${token}`
    }
    return `${this.API.PROTOCOL}://${this.API.DOMAIN}:${this.API.PORT}/auth/register/${token}`
  }

};

export default Config
