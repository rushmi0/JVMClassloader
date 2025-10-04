// openjdk 11.0.12 2021-07-20
// OpenJDK Runtime Environment GraalVM CE 21.2.0
// OpenJDK 64-Bit Server VM GraalVM CE 21.2.0

var Files = Java.type("java.nio.file.Files");
var Paths = Java.type("java.nio.file.Paths");
var Context = Java.type("org.graalvm.polyglot.Context");
var HostAccess = Java.type("org.graalvm.polyglot.HostAccess");
var HashMap = Java.type("java.util.HashMap");

var ctx = Context.newBuilder("js")
    .allowHostAccess(HostAccess.ALL)
    .allowHostClassLookup(function(className) { return true; })
    .build();
ctx.eval("js", "console.log('Hello from GraalJS!');");

ctx.getBindings("js").putMember("cache", new HashMap());


/*
  // main.js
  cache.put("a", 100); 
  cache.put("b", 200); 
  console.log(
     `JS from main.js:
      |    ${cache.get("a")}
      |    ${cache.get("b")}
     `
  );
  
  let _a = 3; 
  let _b = 2; 
  console.log(`sum: ${_a+_b}`);
*/
ctx.eval("js", Files.readString(Paths.get("C:/aa/graaljs/main.js")));

/*
  // sql_string.js
  let now = "GETDATE()";
  const query = `
      SELECT ${now}
  `;
  console.log(query);
*/
ctx.eval("js", Files.readString(Paths.get("C:/aa/graaljs/sql_string.js")));

// ดึงดึงตัวแปร query 
var query = ctx.getBindings("js").getMember("query").asString();
print(query);


// return 10
var val = ctx.eval("js", "10"); 
print(val.asInt());

// return object
var val2 = ctx.eval("js", "({num: 10})"); 
if (val2.hasMember("num")) {
    print(val2.getMember("num").asInt());
}

var val3 = ctx.eval("js", "let num = 10; num;");
print(val3.asInt());



var f = ctx.eval("js", "(function f(x, y) { return x + y; })");
var result = f.execute(19, 23);
print(result.asInt());

var v = ctx.eval("js",
            "var BigDecimal = Java.type('java.math.BigDecimal');" +
            "BigDecimal.valueOf(10).pow(20)")
        .asHostObject();
print(v);
