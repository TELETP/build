# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
    pkgs.nodePackages.pnpm
    pkgs.bun
    # Add build essentials
    pkgs.gnumake
    pkgs.gcc
    pkgs.python3
    # Add additional tools that might be needed
    pkgs.pkg-config
    pkgs.libudev-zero
  ];
  
  # Sets environment variables in the workspace
  env = {
    # Ensure node-gyp can find Python
    PYTHON = "${pkgs.python3}/bin/python3";
    # Ensure native builds can find make
    MAKE = "${pkgs.gnumake}/bin/make";
  };
  
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # TypeScript support
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
    ];
    
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [
          "src/app/page.tsx"
          "src/app/layout.tsx"
        ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
      onStart = {
        check-env = "node -v && python3 -V && make -v";
      };
    };
    
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
