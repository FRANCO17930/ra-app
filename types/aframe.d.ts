export { };

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-entity': any;
            'a-assets': any;
            'a-camera': any;
            'a-video': any;
            'a-asset-item': any;
        }
    }
}
