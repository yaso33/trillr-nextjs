{ pkgs }:
{
  # We need to add nodejs and npm to our environment
  packages = [
    pkgs.nodejs,
    # Add system dependencies for Playwright
    pkgs.glib.out,
    pkgs.nss.out,
    pkgs.cups.lib,
    pkgs.dbus.lib,
    pkgs.xorg.libX11.out,
    pkgs.xorg.libXcomposite.out,
    pkgs.xorg.libXdamage.out,
    pkgs.xorg.libXext.out,
    pkgs.xorg.libXfixes.out,
    pkgs.xorg.libXrandr.out,
    pkgs.xorg.libXtst.out,
    pkgs.gconf,
    pkgs.alsa-lib.out,
    pkgs.pango.out,
    pkgs.cairo.out,
    pkgs.atk.out,
    pkgs.gtk3.out
  ];

  # We can also add a command to run on startup
  startup = {
    command = "npm install && npm run dev";
  };

  # And we can configure the preview
  previews = [
    {
      # We can give our preview a name
      name = "web-preview";
      # We can specify the port to preview
      port = 5000;
      # And we can specify the protocol
      protocol = "http";
      # We can also specify the type of preview
      type = "browser";
    }
  ];
}
