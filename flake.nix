{
  description = "A Nix-flake-based rust development environment for frederick";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self , nixpkgs ,... }: let
    system = "x86_64-linux";
  in {
    devShells."${system}".default = let
      pkgs = import nixpkgs {
        inherit system;
      };
    in pkgs.mkShell {
      packages = with pkgs; [
        nodejs
        typescript-language-server
          
      ];

      shellHook = ''
        echo "Node `${pkgs.nodejs}/bin/node --version`"
        echo "NPM `${pkgs.nodejs}/bin/npm --version`"
      '';
    };
  };
}
