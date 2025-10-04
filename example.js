var Keys = Plugins.use("rust.nostr.sdk.Keys");
if (Keys) {
	var newKey = Keys.generate();
	var sk = newKey.secretKey();
	var pk = newKey.publicKey();

	var skHex = sk.toHex();
	var pkHex = pk.toHex();

	var nsec = sk.toBech32();
	var npub = pk.toBech32();

	var skeys = Keys.parse(nsec);
	var SecretKey = Plugins.use("rust.nostr.sdk.SecretKey");
	var secretKey = SecretKey.parse(skHex);

	var message =
		"===== 🔐 Generated Key Pair =====" +
		"\n🧷 Private Key (hex): " + skHex +
		"\n🧷 Public Key (hex): " + pkHex +
		"\n🔒 NSEC (Private Bech32): " + nsec +
		"\n🔓 NPUB (Public Bech32): " + npub +
		"\n=================================" +
		"\n✅ Parsed from NSEC:" +
		"\n➡️ Secret Key (hex): " + skeys.secretKey().toHex() +
		"\n➡️ Public Key (hex): " + skeys.publicKey().toHex() +
		"\n✅ Parsed from Secret Key (hex): " + secretKey.toBech32();

	print(message);
	Plugins.unload();
}
