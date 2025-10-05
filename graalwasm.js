var HostAccess = Java.type("org.graalvm.polyglot.HostAccess");
var Context = Java.type("org.graalvm.polyglot.Context");
var Source = Java.type("org.graalvm.polyglot.Source");
var URL = Java.type("java.net.URL");

/*
  ;; wat2wasm add-two.wat -o add-two.wasm
  (module
    (func (export "addTwo") (param i32 i32) (result i32)
      local.get 0
      local.get 1
      i32.add
    )
  )
*/
var wasmUrl = new URL("file:///C:/app/graalwasm/add-two.wasm");

var context = Context.newBuilder("wasm")
    .allowHostAccess(HostAccess.ALL)
    .allowHostClassLookup(function(className) { return true; })
    .build();

var source = Source.newBuilder("wasm", wasmUrl).build();

var mainModule = context.eval(source);
var addTwo = mainModule.getMember("addTwo");

var result = addTwo.execute(40, 2);
print("addTwo(40, 2) = " + result.asInt());

