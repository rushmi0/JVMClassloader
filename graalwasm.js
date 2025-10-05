
var HostAccess = Java.type("org.graalvm.polyglot.HostAccess");
var Context = Java.type("org.graalvm.polyglot.Context");
var Source = Java.type("org.graalvm.polyglot.Source");
var URL = Java.type("java.net.URL");

var context = Context.newBuilder("wasm")
    .allowHostAccess(HostAccess.ALL)
    .allowHostClassLookup(function(className) { return true; })
    .build();


/*
  ;; wat2wasm add-two.wat -o build/add-two.wasm
  (module
    (func (export "addTwo") (param i32 i32) (result i32)
      local.get 0
      local.get 1
      i32.add
    )
  )
*/
var simple = Source.newBuilder("wasm", new URL("file:///C:/talon/graalwasm/build/add-two.wasm")).build();

var simpleModule = context.eval(simple);
var addTwo = simpleModule.getMember("addTwo");

var result = addTwo.execute(40, 2);
print("addTwo(40, 2) = " + result.asInt());

/*
    ;;  wat2wasm factorial.wat -o build/factorial.wasm
    (module
      (
        func $fac (export "fac") (param f64) (result f64)
        local.get 0
        f64.const 1
        f64.lt
        if (result f64)
          f64.const 1
        else
          local.get 0
          local.get 0
          f64.const 1
          f64.sub
          call $fac
          f64.mul
        end
       )
    )
*/
var factoria = Source.newBuilder("wasm",  new URL("file:///C:/talon/graalwasm/build/factorial.wasm")).build();
var facModule = context.eval(factoria);

var fac = facModule.getMember("fac");

for (var i = 1; i <= 15; i++) {
  var res = fac.execute(i + 0.0);
  print("fac(" + i + ") = " + res.asDouble());
}
