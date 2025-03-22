module.exports = ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-project-id"
    }
  },
  web: {
    bundler: "metro"
  },
  plugins: [
    ...config.plugins || [],
    [
      "expo-build-properties",
      {
        "web": {
          "browserRedirectURL": true
        }
      }
    ]
  ],
  scheme: "massetracker"
});