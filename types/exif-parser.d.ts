declare module 'exif-parser' {
  interface ExifTags {
    Make?: string;
    Model?: string;
    DateTimeOriginal?: number;
    GPSLatitude?: number;
    GPSLongitude?: number;
    Orientation?: number;
  }
  interface ExifParseResult {
    tags: ExifTags;
  }
  interface ExifParserInstance {
    parse(): ExifParseResult;
  }
  const ExifParser: {
    create(buffer: Buffer | Uint8Array): ExifParserInstance;
  };
  export default ExifParser;
}
