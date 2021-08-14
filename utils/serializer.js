class Serializer {
    static encode(message) {
      return JSON.stringify(message);
    }
  
    static decode(message) {
      let decoded;
  
      try {
        decoded = JSON.parse(message);
      } catch (e) {
        console.error('[Serializer]', `Could not decode message: ${message}`);
      }
      return decoded;
    }
}

module.exports = Serializer;
  