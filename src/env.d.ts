interface ImportMetaEnv {
  NG_APP_EMAILJS_PUBLIC_KEY: string;
  NG_APP_EMAILJS_SERVICE_ID: string;
  NG_APP_EMAILJS_TEMPLATE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
