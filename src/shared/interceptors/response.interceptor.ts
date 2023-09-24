import { ClassSerializerInterceptor } from '@nestjs/common';

export default class ResponseSerializerInterceptor extends ClassSerializerInterceptor {
  serialize(response, options) {
    if (response && response.data && typeof response.data === 'object') {
      if (this.responseDataIsAnEntityObject(response.data)) {
        response.data = this.transformToPlain(response.data, options);
      } else {
        for (const prop of Object.keys(response.data)) {
          this.serializeResponseArray(prop, response.data, options);
        }
      }
    }

    return response;
  }

  responseDataIsAnEntityObject(data) {
    // for now we will rely on the fact that an entity will always have an id property as part of it's response
    // this can be improved later
    // TIPS: Detect between the type class and the type object literal
    return (data || {}).hasOwnProperty('id');
  }

  serializeResponseArray(prop, responseData, options) {
    const values = responseData[prop];

    if (this.responseDataIsAnEntityObject(values)) {
      responseData[prop] = this.transformToPlain(values, options);
    } else if (Array.isArray(values)) {
      responseData[prop] = values.map((item) => this.transformToPlain(item, options));
    }
  }
}
