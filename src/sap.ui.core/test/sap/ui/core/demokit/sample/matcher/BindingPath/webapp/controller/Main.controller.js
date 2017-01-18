sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("webapp.controller.Main", {
		onInit: function () {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		}
	});
});
