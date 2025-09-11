# .claude - Configuration for Algerian PWA Multi-Tenant Supermarket Platform
# Project: Local super market with messaging, notifications, listings

# Project Context
project_name: "DzMarket - Algerian Local Marketplace PWA"
description: "Local super market PWA for Algeria with listings (for sale, rent, jobs, services), messaging, and notifications"
tech_stack: ["React", "TypeScript", "PWA", "Supabase", "Docker", "TailwindCSS", "Vite"]

# Permissions - Full development control
permissions:
  files:
    - allow: "**/*"  # Full file system access
    - deny: ".env.production"  # Protect production secrets
  
  commands:
    - allow: "docker*"  # Full Docker control
    - allow: "npm*"     # Package management
    - allow: "yarn*"    # Alternative package manager
    - allow: "pnpm*"    # Alternative package manager
    - allow: "git*"     # Version control
    - allow: "supabase*"  # Supabase CLI
    - allow: "code*"    # VS Code integration
    - deny: "rm -rf /"  # Prevent system damage
    - deny: "sudo rm*"  # Prevent dangerous operations

  network:
    - allow: "localhost:*"    # Local development
    - allow: "127.0.0.1:*"    # Local development
    - allow: "*.supabase.co"  # Supabase services
    - allow: "registry.npmjs.org"  # NPM registry
    - allow: "github.com"     # Git operations
    - allow: "docker.io"      # Docker Hub
    - allow: "gcr.io"         # Google Container Registry

# Custom MCPs (Model Context Protocols)
mcps:
  supabase:
    description: "Supabase database and auth management"
    commands:
      - "supabase init"
      - "supabase start"
      - "supabase db reset"
      - "supabase migration new"
      - "supabase db push"
      - "supabase gen types typescript"
    
  docker:
    description: "Docker container management for development"
    commands:
      - "docker-compose up -d"
      - "docker-compose down"
      - "docker-compose logs"
      - "docker-compose build"
      - "docker system prune"
    
  pwa:
    description: "PWA development and manifest generation"
    commands:
      - "npm run build"
      - "npm run preview"
      - "npx vite-pwa generate"
    
  algerian_locale:
    description: "Algerian localization utilities"
    supported_languages: ["ar-DZ", "fr-DZ"]
    currency: "DZD"
    regions: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif"]

# Auto-initialization commands
init:
  - name: "Setup Development Environment"
    commands:
      - "docker --version"
      - "node --version"
      - "npm --version"
      - "supabase --version"
  
  - name: "Initialize Project Structure"
    commands:
      - "npm create vite@latest . -- --template react-ts"
      - "npm install"
      - "npm install @supabase/supabase-js"
      - "npm install -D tailwindcss postcss autoprefixer"
      - "npm install @types/node"
      - "npx tailwindcss init -p"
  
  - name: "Setup PWA"
    commands:
      - "npm install -D vite-plugin-pwa"
      - "npm install -D workbox-window"
  
  - name: "Setup Supabase"
    commands:
      - "supabase init"
      - "supabase start"

# Run configurations
run:
  dev:
    description: "Start development server with all services"
    commands:
      - "docker-compose up -d"
      - "supabase start"
      - "npm run dev"
    ports: [3000, 54321, 54322, 54323, 54324]
  
  build:
    description: "Build for production"
    commands:
      - "npm run build"
      - "npm run preview"
  
  db:
    description: "Database operations"
    commands:
      - "supabase db start"
      - "supabase studio"
  
  docker:
    description: "Docker operations"
    commands:
      - "docker-compose up -d"
      - "docker-compose logs -f"

# Auto-generation templates
generate:
  component:
    template: "src/components/{{name}}/{{name}}.tsx"
    imports: ["React", "useState", "useEffect"]
    
  page:
    template: "src/pages/{{name}}/{{name}}.tsx"
    imports: ["React", "useRouter", "Helmet"]
    
  hook:
    template: "src/hooks/use{{name}}.ts"
    imports: ["useState", "useEffect", "useCallback"]
    
  api:
    template: "src/services/{{name}}.ts"
    imports: ["supabase"]
    
  type:
    template: "src/types/{{name}}.ts"
    
  migration:
    command: "supabase migration new {{name}}"
    
  docker_service:
    template: "docker/{{name}}/Dockerfile"

# Project-specific commands
commands:
  setup_database:
    description: "Setup Supabase database with super market schema"
    steps:
      - "Create users profile table"
      - "Create listings table (Categories, Products)"
      - "Create messages table"
      - "Create notifications table"
      - "Setup RLS policies"
      - "Create indexes for performance"
  
  generate_types:
    description: "Generate TypeScript types from Supabase"
    command: "supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts"
  
  setup_pwa:
    description: "Configure PWA manifest and service worker"
    steps:
      - "Generate PWA manifest"
      - "Configure service worker"
      - "Setup offline functionality"
      - "Add push notification support"
  
  deploy_staging:
    description: "Deploy to staging environment"
    commands:
      - "docker build -t xxxxxxxx"
      - "docker-compose -f docker-compose.staging.yml up -d"
  
  backup_db:
    description: "Backup Supabase database"
    command: "supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql"

# Environment variables template
env_template:
  development:
    VITE_SUPABASE_URL: "http://localhost:54321"
    VITE_SUPABASE_ANON_KEY: "your_anon_key"
    VITE_APP_NAME: "Supermarket"
    VITE_APP_VERSION: "1.0.0"
    VITE_ALGERIAN_REGIONS: "I have a const for Algerian wilayas"
    VITE_DEFAULT_CURRENCY: "DZD"
    VITE_DEFAULT_LOCALE: "ar-DZ"
  
  production:
    VITE_SUPABASE_URL: "https://your-project.supabase.co"
    VITE_SUPABASE_ANON_KEY: "your_production_anon_key"

# Dependencies management
dependencies:
  core:
    - "@supabase/supabase-js"
    - "react"
    - "react-dom"
    - "react-router-dom"
    - "typescript"
  
  ui:
    - "tailwindcss"
    - "@headlessui/react"
    - "@heroicons/react"
    - "lucide-react"
  
  pwa:
    - "vite-plugin-pwa"
    - "workbox-window"
  
  utils:
    - "date-fns"
    - "clsx"
    - "react-hook-form"
    - "@hookform/resolvers/yup"
    - "yup"
  
  dev:
    - "@types/react"
    - "@types/react-dom"
    - "@types/node"
    - "vite"
    - "eslint"
    - "prettier"

# File watchers for auto-regeneration
watch:
  - path: "src/types/supabase.ts"
    on_change: "npm run type-check"
  
  - path: "supabase/migrations/*.sql"
    on_change: "supabase db reset"
  
  - path: "docker-compose.yml"
    on_change: "docker-compose up -d"

# Algerian super market specific configurations
super market:
  categories:
     
  regions:
    - "Adrar" - "Chlef" - "Laghouat" - "Oum El Bouaghi"
    - "Batna" - "Béjaïa" - "Biskra" - "Béchar"
    - "Blida" - "Bouira" - "Tamanrasset" - "Tébessa"
    - "Tlemcen" - "Tiaret" - "Tizi Ouzou" - "Algiers"
    - "Djelfa" - "Jijel" - "Sétif" - "Saïda"
    - "Skikda" - "Sidi Bel Abbès" - "Annaba" - "Guelma"
    - "Constantine" - "Médéa" - "Mostaganem" - "M'Sila"
    - "Mascara" - "Ouargla" - "Oran" - "El Bayadh"
    - "Illizi" - "Bordj Bou Arréridj" - "Boumerdès" - "El Tarf"
    - "Tindouf" - "Tissemsilt" - "El Oued" - "Khenchela"
    - "Souk Ahras" - "Tipaza" - "Mila" - "Aïn Defla"
    - "Naâma" - "Aïn Témouchent" - "Ghardaïa" - "Relizane"

# Security configurations
security:
  cors:
    origins: ["http://localhost:3000", "https://yourdomain.dz"]
    I actually want to use chrome for this project
  
  rls_policies:
    - "Users can only see their own profile data"
    - "Messages are only visible to  receiver"
    - "Order confirmations/status are visible to all authenticated users"

# Performance optimizations
performance:
  lazy_loading: true
  code_splitting: true
  service_worker_caching: true
  
  indexes:
    - "Orders(category, region, created_at)"
    - "messages(conversation_id, created_at)"
    - "notifications(user_id, read, created_at)"

# Monitoring and analytics
monitoring:
  error_tracking: "sentry"
  analytics: "google_analytics"
  performance: "web_vitals"
  database: "supabase_metrics"

# More info about the project 
extra references:
  please read C:\Users\rdjer\grocery-pwa-platform\ReqSpec.md for requirements specifications