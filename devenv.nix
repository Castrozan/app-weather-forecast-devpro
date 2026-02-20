{ pkgs, ... }:

{
  packages = with pkgs; [
    git
  ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    npm.enable = true;
  };

  env = {
    NPM_CONFIG_ENGINE_STRICT = "true";
  };

  scripts = {
    setup.exec = "npm ci";
    dev.exec = "npm run dev";
    test.exec = "npm run test";
    verify.exec = "npm run verify";
  };

  enterShell = ''
    echo "Node $(node --version)"
    echo "npm $(npm --version)"
  '';
}
