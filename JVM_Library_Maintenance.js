var File = Java.type("java.io.File");
var URLClassLoader = Java.type("java.net.URLClassLoader");
var Thread = Java.type("java.lang.Thread");
var Class = Java.type("java.lang.Class");
var Paths = Java.type("java.nio.file.Paths");
var Files = Java.type("java.nio.file.Files");
var URL = Java.type("java.net.URL");

var System = Java.type("java.lang.System");


var Plugins = (function() {

  var loader = null;
  var repositories = [];
  var saveDirPath = null;

  function addRepository(url, localPath) {
    if (repositories.indexOf(url) === -1) {
      repositories.push(url);
    }

    if (localPath) {
      var saveDir = new File(localPath);
      if (!saveDir.exists()) {
        if (saveDir.mkdirs()) {
          TALON.getLogger().writeInfo("Created directory: " + saveDir.getAbsolutePath());
            saveDirPath = saveDir.getAbsolutePath();
            dependsOn("org.jetbrains.kotlin:kotlin-stdlib:2.2.10");
        } else {
          TALON.getLogger().writeError("Failed to create directory: " + saveDir.getAbsolutePath());
          return false;
        }
      } else if (!saveDir.isDirectory()) {
        TALON.getLogger().writeError("Path exists but is not a directory: " + saveDir.getAbsolutePath());
        return false;
      }

      saveDirPath = saveDir.getAbsolutePath();
    }
    return true;
  }

  function dependsOn(coord) {
    if (!saveDirPath) {
      TALON.getLogger().writeError("Please call addRepository() with a local path before dependsOn().");
      return false;
    }

    var parts = coord.split(":");
    if (parts.length !== 3) {
      TALON.getLogger().writeError("Invalid coordinate: " + coord);
      return false;
    }

    var group = parts[0];
    var artifact = parts[1];
    var version = parts[2];

    var groupPath = group.replace(/\./g, "/");
    var jarName = artifact + "-" + version + ".jar";

    var saveDir = new File(saveDirPath);
    if (!saveDir.exists()) {
      saveDir.mkdirs();
    }

    var destPath = Paths.get(saveDir.getAbsolutePath(), jarName);
    if (Files.exists(destPath)) {
      TALON.addMsg("📦 Already: " + jarName);
      return true;
    }

    for each(var repo in repositories) {
      var url = repo + "/" + groupPath + "/" + artifact + "/" + version + "/" + jarName;

      try {
        var input = new URL(url).openStream();
        Files.copy(input, destPath);
        input.close();
        TALON.getLogger().writeInfo("Saved to: " + destPath.toString());
        TALON.addMsg("✅ Saved: " + artifact);
        return true;
      } catch(e) {
        TALON.getLogger().writeError("Failed from: " + repo);
        TALON.addErrorMsg(">>  Failed from: " + repo);
      }
    }

    TALON.getLogger().writeError("All repositories failed for: " + coord);
    return false;
  }

  function load(dir) {
    var folder = new File(dir);
    if (!folder.exists() || !folder.isDirectory()) {
      TALON.getLogger().writeError("Not found: " + dir);
      return false;
    }

    var FileFilter = Java.type("java.io.FileFilter");
    var jars = folder.listFiles(new(Java.extend(FileFilter))({
      accept: function(f) {
        return f.getName().toLowerCase().endsWith(".jar");
      }
    }));

    if (!jars || jars.length === 0) {
      TALON.getLogger().writeError("No JARs in: " + dir);
      TALON.addErrorMsg(">> No JARs in: " + dir);
      return false;
    }

    try {
      var urls = [];
      for each(var jar in jars) {
        urls.push(jar.toURI().toURL());
        TALON.getLogger().writeInfo("JAR: " + jar.getName());
      }

      loader = new URLClassLoader(urls, Thread.currentThread().getContextClassLoader());
      Thread.currentThread().setContextClassLoader(loader);

      TALON.getLogger().writeInfo(">> Loaded " + urls.length + " JAR(s)");
      return true;
    } catch(e) {
      TALON.getLogger().writeError("Load failed: " + e.message);
      return false;
    }
  }

  function use(target) {
    if (!load("C:/talon/dependencies")) {
      TALON.getLogger().writeError(">>Loader not initialized.");
      return null;
    } else {
      try {

        var cls = Class.forName(target, true, loader);

        try {
          return cls.getField("Companion").get(null);
        } catch(e) {
          return cls.getDeclaredConstructor().newInstance();
        }
      } catch(e) {
        TALON.getLogger().writeError(">>Error loading class: " + target);
        TALON.getLogger().writeError(">> " + e.message);
        return null;
      }
    }
  }

  function unload() {
    try {
      if (loader && loader.close) {
        loader.close();
        System.gc();
        System.runFinalization();
      }
    } catch(e) {
      TALON.getLogger().writeError(">> Error closing loader: " + e.message);
    } finally {
      loader = null;
      System.gc();
      System.runFinalization();
      Thread.currentThread().setContextClassLoader(null);
      TALON.getLogger().writeInfo(">> Unloaded class loader");
    }
  }


  return {
    addRepository: addRepository,
    dependsOn: dependsOn,
    unload: unload,
    load: load,
    use: use,
  };

})();
