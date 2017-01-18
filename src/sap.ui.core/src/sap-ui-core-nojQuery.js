/*!
 * ${copyright}
 */

(function(aScriptIncludes) {

	"use strict";

	//extract base URL from script tag
	var aScripts = document.getElementsByTagName("script"),
		i,sSrc,mMatch,sBaseUrl,bCoreRequired = false;

	for (i = 0; i < aScripts.length; i++) {
		sSrc = aScripts[i].getAttribute("src");
		if (sSrc) {
			mMatch = sSrc.match(/(.*\/)sap-ui-core(?:-nojQuery)?\.js$/i);
			if (mMatch) {
				sBaseUrl = mMatch[1];
				break;
			}
		}
	}

	if (sBaseUrl == null) {
		throw new Error("sap-ui-core-nojQuery.js: could not identify script tag!");
	}

	for (i = 0; i < aScriptIncludes.length; i++) {
		sSrc = aScriptIncludes[i];
		if ( sSrc.indexOf("raw:") === 0 ) {
			sSrc = sBaseUrl + sSrc.slice(4);
			document.write("<script src=\"" + sSrc + "\"></script>");
		} else if ( sSrc.indexOf("require:") === 0 ) {
			sSrc = sSrc.slice(8);
			bCoreRequired = bCoreRequired || sSrc === "sap.ui.core.Core";
			document.write("<script>jQuery.sap.require(\"" + sSrc + "\");</script>");
		}
	}
	if ( bCoreRequired ) {
		document.write("<script>sap.ui.getCore().boot && sap.ui.getCore().boot();</script>");
	}
}([
	"raw:sap/ui/Device.js",
	"raw:sap/ui/thirdparty/URI.js",
	"raw:sap/ui/thirdparty/es6-promise.js",
	"raw:jquery.sap.global.js",
	"require:sap.ui.core.Core"
]));
