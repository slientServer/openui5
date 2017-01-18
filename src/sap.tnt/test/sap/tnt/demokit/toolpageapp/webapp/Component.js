sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel, DeviceSupport) {
	"use strict";
	return UIComponent.extend("sap.ui.demo.toolpageapp.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();
			// set data model
			var oData = {
				recipient: {
					name: "World"
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);
		},

		getContentDensityClass: function () {
			if(!this._sContentDensityClass) {
				if(!sap.ui.Device.support.touch){
					this._sContentDensityClass="sapUiSizeCompact";
				}
				else{
					this._sContentDensityClass="sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});